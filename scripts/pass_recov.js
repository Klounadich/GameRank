document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('passwordRecoveryForm');
    const recoveryEmail = document.getElementById('recoveryEmail');
    const recoverySubmit = document.getElementById('recoverySubmit');
    
    let recoveryStep = 1; // 1 - ввод email, 2 - ввод нового пароля
    let userEmail = '';
    
    // Функция показа уведомления
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
    
    // Обработка отправки формы
    recoveryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (recoveryStep === 1) {
            // Шаг 1: Отправка email
            userEmail = recoveryEmail.value.trim();
            
            if (!userEmail) {
                showAlert('Пожалуйста, введите email', 'error');
                return;
            }
            
            try {
                recoverySubmit.disabled = true;
                recoverySubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                
                const response = await fetch("https://192.168.0.103/api/auth/password-reset-check", {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userEmail),
            });
                
                const result = await response.json();
                console.log(result)
                
                if (response.ok) {
                    // Переходим ко второму шагу
                    recoveryStep = 2;
                    updateUIForStep2();
                    showAlert('Код подтверждения отправлен на вашу почту', 'success');
                } else {
                    showAlert(result.message || 'Ошибка при отправке кода', 'error');
                }
            } catch (error) {
                showAlert('Ошибка сети. Попробуйте позже.', 'error');
            } finally {
                recoverySubmit.disabled = false;
                recoverySubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить код';
            }
        } else {
            // Шаг 2: Установка нового пароля
            const code = document.getElementById('resetCode').value.trim();
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!code || !newPassword || !confirmPassword) {
                showAlert('Заполните все поля', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showAlert('Пароли не совпадают', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showAlert('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            
            try {
                recoverySubmit.disabled = true;
                recoverySubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
                
                const response = await fetch('https://192.168.0.103/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: userEmail,
                        
                        newPassword: newPassword
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showAlert('Пароль успешно изменен!', 'success');
                    setTimeout(() => {
                        window.location.href = '/index.html';
                    }, 2000);
                } else {
                    showAlert(result.message || 'Ошибка при сбросе пароля', 'error');
                }
            } catch (error) {
                showAlert('Ошибка сети. Попробуйте позже.', 'error');
            } finally {
                recoverySubmit.disabled = false;
                recoverySubmit.innerHTML = '<i class="fas fa-save"></i> Сохранить пароль';
            }
        }
    });
    
    // Обновление UI для второго шага
    function updateUIForStep2() {
        const authHeader = document.querySelector('.auth-header');
        const form = document.getElementById('passwordRecoveryForm');
        
        authHeader.querySelector('h2').innerHTML = '<i class="fas fa-lock"></i> Новый пароль';
        authHeader.querySelector('p').textContent = 'Введите код подтверждения и новый пароль';
        
        // Сохраняем оригинальное поле email (скрываем его)
        recoveryEmail.style.display = 'none';
        recoveryEmail.disabled = true;
        
        // Добавляем поля для кода и пароля
        form.innerHTML = `
            <div class="form-group">
                <label for="resetCode"><i class="fas fa-shield-alt"></i> Код подтверждения</label>
                <input type="text" id="resetCode" placeholder="Введите код из письма" required>
            </div>
            
            <div class="form-group">
                <label for="newPassword"><i class="fas fa-lock"></i> Новый пароль</label>
                <input type="password" id="newPassword" placeholder="Введите новый пароль" required minlength="6">
            </div>
            
            <div class="form-group">
                <label for="confirmPassword"><i class="fas fa-lock"></i> Подтвердите пароль</label>
                <input type="password" id="confirmPassword" placeholder="Повторите новый пароль" required minlength="6">
            </div>
            
            <button type="submit" class="auth-submit" id="recoverySubmit">
                <i class="fas fa-save"></i> Сохранить пароль
            </button>
        `;
        
        // Переназначаем обработчики событий
        document.getElementById('passwordRecoveryForm').addEventListener('submit', recoveryForm.onsubmit);
    }
    
    // Мобильное меню
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
});