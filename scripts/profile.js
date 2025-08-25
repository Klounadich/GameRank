// Добавляем глобальные переменные для управления состоянием
let isPageLoading = true;
const LOAD_TIMEOUT = 5000; // 5 секунд timeout

// Preload critical resources
function preloadCriticalResources() {
    // Preload avatar if likely to be needed
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://192.168.0.103/api/user/showavatar';
    link.as = 'image';
    document.head.appendChild(link);
}

// Запускаем preload как можно раньше
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}

document.addEventListener('DOMContentLoaded', async function() {
    // Показываем loader сразу
    showLoadingState();
    
    try {
        // Запускаем ВСЕ асинхронные операции ПАРАЛЛЕЛЬНО
        await Promise.all([
            LoadProfile().catch(handleProfileError),
            loadAvatar().catch(handleAvatarError)
        ]);
        
    } catch (error) {
        console.error('Critical loading error:', error);
    } finally {
        // Скрываем loader когда всё загружено (или упало)
        hideLoadingState();
        isPageLoading = false;
    }

    setupEventListeners();
});

// ==================== ОПТИМИЗИРОВАННЫЕ ФУНКЦИИ ====================

async function LoadProfile() {
    try {
        // Добавляем timeout чтобы запрос не "висел" вечно
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT);

        const response = await fetch('https://192.168.0.103/api/user/usershow', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/index.html';
            return;
        }
        
        if (response.status === 403) {
            localStorage.removeItem('authToken');
            window.location.href = '/banned.html';
            return;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        updateProfileUI(data);
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Profile load timeout');
            showError('Загрузка профиля заняла слишком много времени');
        } else {
            console.error('Profile load error:', error);
            window.location.href = '/index.html';
        }
        throw error;
    }
}

async function loadAvatar() {
    const avatarImg = document.getElementById('userAvatar');
    const avatarImg1 = document.getElementById('userAvatar1');
    if (!avatarImg) return;

    try {
        const response = await fetch(`https://192.168.0.103/api/user/showavatar?v=${Date.now()}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
        });

        if (!response.ok) throw new Error('Avatar fetch failed');

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        avatarImg.onload = () => URL.revokeObjectURL(objectUrl);
        avatarImg.src = objectUrl;
        avatarImg1.onload = () => URL.revokeObjectURL(objectUrl);
        avatarImg1.src = objectUrl;

    } catch (error) {
        console.warn('Avatar load failed, using default:', error);
        avatarImg.src = '/img/default-avatar.jpg';
    }
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function showLoadingState() {
    // Добавляем красивый loader в вашу HTML структуру
    document.body.classList.add('loading');
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <p>Загрузка профиля...</p>
    `;
    document.body.appendChild(loader);
}

function hideLoadingState() {
    document.body.classList.remove('loading');
    const loader = document.querySelector('.page-loader');
    if (loader) loader.remove();
}

function handleProfileError(error) {
    console.error('Profile loading failed:', error);
    // Можно показать частичный UI с basic информацией
}

function handleAvatarError(error) {
    console.error('Avatar loading failed:', error);
    // Уже обработано в loadAvatar
}

function updateProfileUI(data) {
    console.log('Получены данные профиля:', data);
    
    const usernameEl = document.querySelector('.profile-username');
    const emailEl = document.querySelector('.profile-email');
    const DescriptionEl = document.querySelector('.profile-bio-content');
    const AvatarEl = document.querySelector('.profile-avatar');

    if(data.role && data.role.includes('Admin')) {
        const panel = document.querySelector(".admin-panel-btn");
        const status = document.querySelector(".profile-admin-info");
        const badge = document.querySelector(".admin-badge");
        panel.style.display = "flex";
        status.style.display = "flex";
        badge.style.display = "flex";
        panel.addEventListener('click', () => {
            window.location.href = '/admin.html';
        });
    }
    
    // Проверяем, найдены ли элементы
    if (!usernameEl || !emailEl) {
        console.error('Элементы профиля не найдены в DOM');
        return;
    }
    
    // Проверяем и нормализуем данные
    const avatarUrl = data?.Avatar || '/img/default-avatar.jpg';
    const Description = data?.Description || data?.description;
    const username = data?.userName || data?.username || data?.user?.name || 'Гость';
    const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
    console.log(Description);
    
    // Обновляем UI
    if (DescriptionEl) DescriptionEl.textContent = Description;
    if (usernameEl) usernameEl.textContent = username;
    if (emailEl) emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
}

function showError(message) {
    alert(message);
}

async function handleLogout() {
    try {
        const response = await fetch('https://192.168.0.103/api/user/signout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            localStorage.removeItem('myToken');
            window.location.href = '/index.html';
        } else {
            throw new Error('Ошибка при выходе');
        }
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showError('Ошибка при выходе из системы');
    }
}

// ==================== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ====================

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle && mainNav) {
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
    }
    
    // Edit profile modal
    const editMenuToogle = document.getElementById('profileEditModal');
    const ProfileEditButton = document.querySelector('.edit-profile');
    const CloseBtn1 = document.getElementById('closeEditModal');
    const CloseBtn2 = document.getElementById('cancelEditBtn');
    
    if (ProfileEditButton && editMenuToogle) {
        ProfileEditButton.addEventListener('click', function() {
            editMenuToogle.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (CloseBtn1 && editMenuToogle) {
        CloseBtn1.addEventListener('click', function() {
            editMenuToogle.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (CloseBtn2 && editMenuToogle) {
        CloseBtn2.addEventListener('click', function() {
            editMenuToogle.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                handleLogout();
            }
        });
    }

    // Bio edit form
    const saveBioBtn = document.getElementById('saveBioEdit');
    const bioTextarea = document.getElementById('bioTextarea');
    
    if (saveBioBtn && bioTextarea) {
        saveBioBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const newBio = bioTextarea.value.trim();
            const token = localStorage.getItem('myToken');

            if (!newBio) {
                alert('Пожалуйста, введите информацию о себе');
                return;
            }

            try {
                const response = await fetch('https://192.168.0.103/api/user/change-description', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newBio)
                });

                if (!response.ok) {
                    throw new Error('Ошибка при сохранении');
                }

                alert('Данные успешно сохранены!');
                window.location.reload();
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось сохранить: ' + error.message);
            }
        });
    }

    // Password change modal
    const changePasswordModal = document.getElementById('changePasswordModal');
    const passBtn = document.getElementById('pass_btn');
    const closeChangePassword = document.getElementById('closeChangePassword');
    const cancelChangePassword = document.getElementById('cancelChangePassword');
    
    if (passBtn) {
        passBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (changePasswordModal) {
                changePasswordModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    if (closeChangePassword && changePasswordModal) {
        closeChangePassword.addEventListener('click', function() {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (cancelChangePassword && changePasswordModal) {
        cancelChangePassword.addEventListener('click', function() {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', function(e) {
            if (e.target === changePasswordModal) {
                changePasswordModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Password change form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                alert('Новый пароль и подтверждение не совпадают');
                return;
            }
            
            // Отправка данных на сервер
            fetch('https://192.168.0.103/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OldPassword: currentPassword,
                    NewPassword: newPassword
                }),
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alert('Пароль успешно изменён');
                    if (changePasswordModal) {
                        changePasswordModal.style.display = 'none';
                    }
                    document.body.style.overflow = 'auto';
                    location.reload();
                } else {
                    alert(data.message || 'Ошибка при изменении пароля');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке запроса');
            });
        });
    }
}