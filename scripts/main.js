document.addEventListener('DOMContentLoaded', function() {
    LoadData();
    loadAvatar();
    
    // Мобильное меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    const qrLoginBtn = document.querySelector('.auth-provider.qr');
    const qrModal = document.getElementById('qrModal');
    const closeQrModal = document.getElementById('closeQrModal');
    const qrCodeImage = document.getElementById('qrCodeImage');
    
    
    // Переменные для QR-логина
    let qrId = null;
    let qrPollingInterval = null;
    let qrExpireTime = null;

    if (qrLoginBtn) {
        qrLoginBtn.addEventListener('click', async function() {
            try {
                // Закрываем модальное окно авторизации
                if (authModal) {
                    authModal.style.display = 'none';
                }
                
                // Показываем загрузку
                qrCodeImage.src = '';
                qrModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Отправляем запрос к API - теперь ожидаем JSON
                const response = await fetch('https://192.168.0.103/api/auth/qrcode-show', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json' // Важно: запрашиваем JSON
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success) {
                        // Устанавливаем изображение из base64
                        qrCodeImage.src = data.qrCodeImage;
                        
                        // Сохраняем ID и время expiration
                        qrId = data.qrId;
                        qrExpireTime = Date.now() + (data.expiresIn * 1000); // конвертируем секунды в миллисекунды
                        
                        // Запускаем проверку статуса
                        startQrStatusPolling();
                    } else {
                        throw new Error(data.error || 'Ошибка при получении QR-кода');
                    }
                } else {
                    throw new Error('Ошибка при получении QR-кода');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showAlert('Не удалось получить QR-код. Попробуйте позже.', 'error');
                closeQrModal.click();
            }
        });
    }

    // Функция для опроса статуса QR-кода
    function startQrStatusPolling() {
        // Останавливаем предыдущий опрос если был
        if (qrPollingInterval) {
            clearInterval(qrPollingInterval);
        }
        
        // Создаем элемент для отображения таймера
        let timerElement = document.getElementById('qrTimer');
        if (!timerElement) {
            timerElement = document.createElement('div');
            timerElement.id = 'qrTimer';
            timerElement.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                z-index: 1000;
            `;
            qrModal.appendChild(timerElement);
        }
        
        // Запускаем таймер
        const updateTimer = () => {
            if (!qrExpireTime) return;
            
            const timeLeft = qrExpireTime - Date.now();
            if (timeLeft <= 0) {
                clearInterval(qrPollingInterval);
                showAlert('Время действия QR-кода истекло', 'error');
                closeQrModal.click();
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
        
        // Функция опроса статуса
        const checkQrStatus = async () => {
            if (!qrId) return;
            
            try {
                const response = await fetch(`https://192.168.0.103/api/auth/qr-status/${qrId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const statusData = await response.json();
                    
                    switch (statusData.status) {
                        case null:
                            // Успешный вход!
                            clearInterval(qrPollingInterval);
                            clearInterval(timerInterval);
                            showAlert('Вход выполнен успешно!', 'success');
                            window.location.href = '/Profile.html';
                            // Сохраняем данные пользователя
                            
                            
                            // Закрываем модальное окно
                            setTimeout(() => {
                                qrModal.style.display = 'none';
                                document.body.style.overflow = 'auto';
                                
                                // Обновляем интерфейс
                                LoadData();
                                loadAvatar();
                                
                                // Перенаправляем если нужно
                                if (!window.location.pathname.includes('Profile')) {
                                    window.location.href = '/Profile.html';
                                }
                            }, 1500);
                            break;
                            
                        case 'expired':
                            clearInterval(qrPollingInterval);
                            clearInterval(timerInterval);
                            showAlert('Время действия QR-кода истекло', 'error');
                            closeQrModal.click();
                            break;
                            
                        case 'pending':
                            // Продолжаем ждать - ничего не делаем
                            break;
                            
                        default:
                            console.log('Неизвестный статус:', statusData.status);
                            showAlert('Вход выполнен успешно!', 'success');
                            window.location.href = '/Profile.html';
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки статуса QR:', error);
                // Продолжаем опрос при ошибках сети
            }
        };
        
        // Запускаем опрос каждые 2 секунды
        checkQrStatus();
        qrPollingInterval = setInterval(checkQrStatus, 2000);
        
        // Очистка при закрытии модального окна
        const originalCloseHandler = closeQrModal.onclick;
        closeQrModal.onclick = function() {
            if (qrPollingInterval) {
                clearInterval(qrPollingInterval);
            }
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            if (timerElement && timerElement.parentNode) {
                timerElement.parentNode.removeChild(timerElement);
            }
            originalCloseHandler.call(this);
        };
    }

    if (closeQrModal) {
        closeQrModal.addEventListener('click', function() {
            // Останавливаем опрос при закрытии
            if (qrPollingInterval) {
                clearInterval(qrPollingInterval);
                qrPollingInterval = null;
            }
            
            qrModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Возвращаем модальное окно авторизации
            if (authModal) {
                authModal.style.display = 'block';
            }
        });
    }

    qrModal.addEventListener('click', function(e) {
        if (e.target === qrModal) {
            // Останавливаем опрос при закрытии
            if (qrPollingInterval) {
                clearInterval(qrPollingInterval);
                qrPollingInterval = null;
            }
            
            qrModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Возвращаем модальное окно авторизации
            if (authModal) {
                authModal.style.display = 'block';
            }
        }
    });

    // Остальной код без изменений...
    mobileMenuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        const icon = this.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    async function loadAvatar() {
        const avatarImg = document.getElementById('userAvatar');
        if (!avatarImg) return;

        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`https://192.168.0.103/api/user/showavatar?t=${timestamp}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (response.status === 403) {
                localStorage.removeItem('authToken');
                window.location.href = '/banned.html';
                return;
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            avatarImg.onload = function() {
                console.log('Аватар успешно загружен');
                URL.revokeObjectURL(this.src);
            };
            avatarImg.onerror = function() {
                console.error('Ошибка загрузки аватара');
                this.src = '/img/default-avatar.jpg';
            };
            avatarImg.src = objectUrl;

        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            avatarImg.src = '/img/default-avatar.jpg';
        }
    }

    async function LoadData() {
        const response = await fetch('https://192.168.0.103/api/user/usershow', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('authToken');
            return;
        }
        if (response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/banned.html';
            return;
        }

        if (response.ok) {
            const data = await response.json();
            updateProfileUI(data);
        }
    }

    function updateProfileUI(data) {
        if(data.role === "Admin") {
            const badge = document.querySelector(".admin-badge");
            badge.style.display = "flex";
        }
        
        const authButton = document.getElementById('auth-button');
        const profileContainer = document.querySelector('.profile-container');
        const usernameEl = document.querySelector('.profile-username');
        const emailEl = document.querySelector('.profile-email');
        const avatarEl = document.querySelector('.profile-avatar');
        
        const hasUserData = data && (data.userName || data.username || data.user?.name);
        
        if (!hasUserData) {
            console.log('Пользователь не авторизован');
            if (authButton) authButton.style.display = 'block';
            if (profileContainer) profileContainer.style.display = 'none';
            return;
        }
        
        const username = data?.userName || data?.username || data?.user?.name || 'Гость';
        const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
        const avatarUrl = data?.avatar || data?.user?.avatar || '/img/default-avatar.jpg';
        
        if (authButton) authButton.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'flex';
        
        if (usernameEl) usernameEl.textContent = username;
        if (emailEl) emailEl.textContent = email;
        
        if (avatarEl) {
            avatarEl.src = avatarUrl;
            avatarEl.alt = `Аватар ${username}`;
            avatarEl.style.width = '70px';
            avatarEl.style.height = '70px';
            avatarEl.style.borderRadius = '50%';
            avatarEl.style.objectFit = 'cover';
        }
    }
    
    // Модальное окно авторизации
    const authModal = document.getElementById('authModal');
    const authTriggers = document.querySelectorAll('.auth-trigger');
    const closeAuth = document.querySelector('.close-auth');
    
    authTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    closeAuth.addEventListener('click', function() {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.getElementById("authModal").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const data = {
            UserName: document.getElementById("Auth_UserName").value,
            password: document.getElementById("Auth_Pass").value
        };
        
        try {
            const response = await fetch("https://192.168.0.103/api/auth/authoriz", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Вход выполнен успешно!', 'success');
                window.location.href = "/Profile.html";
            } else {
                document.getElementById('passwordRecoveryLink').style.display = 'block';
                console.log(result)
                showAlert(result.Errors || 'Ошибка входа', 'error');
            }
        } catch (error) {
            showAlert('Ошибка сети', 'error');
        }
    });

    function showAlert(message, type = 'info', duration = 5000) {
        const alert = document.getElementById('custom-alert');
        const alertContent = alert.querySelector('.cyber-alert-content');
        const alertMessage = alert.querySelector('.cyber-alert-message');
        const alertClose = alert.querySelector('.cyber-alert-close');
        
        alertMessage.innerHTML = message;
        alert.className = 'cyber-alert ' + type;
        alert.classList.add('active');
        
        alertClose.onclick = () => {
            alert.classList.remove('active');
            alert.classList.add('hiding');
            setTimeout(() => {
                alert.classList.remove('hiding');
            }, 500);
        };
        
        if (duration > 0) {
            setTimeout(() => {
                if (alert.classList.contains('active')) {
                    alert.classList.remove('active');
                    alert.classList.add('hiding');
                    setTimeout(() => {
                        alert.classList.remove('hiding');
                    }, 500);
                }
            }, duration);
        }
    }

    
});