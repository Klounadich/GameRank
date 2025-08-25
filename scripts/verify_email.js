document.addEventListener('DOMContentLoaded', function() {
    checkEmailVerificationStatus();
    

    async function checkEmailVerificationStatus() {
        try {
            const response = await fetch('https://192.168.0.103/api/auth/check-verify', {
                method: 'GET',
                credentials: 'include'
            });
                
            if (!response.ok) {
                throw new Error('Ошибка при проверке статуса email');
            }

            const data = await response.json();
            console.log(data)
            updateEmailVerificationUI(data.getStatusEmail);
            
        } catch (error) {
            console.error('Error:', error);
            showMessage('error', 'Не удалось проверить статус email');
        }
    }

    function updateEmailVerificationUI(isVerified) {
        setTimeout(() => {
    console.log(isVerified)
    const emailElement = document.querySelector('.profile-email');
    
    if (emailElement) {
        // Удаляем предыдущий статус, если есть
        const existingStatus = emailElement.querySelector('.email-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Создаем элемент статуса
        const statusElement = document.createElement('span');
        statusElement.className = 'email-status';
        
        if (isVerified === true) {  // Исправлено на ===
            statusElement.innerHTML = ' <i class="fas fa-check-circle verified-icon"></i>';
            statusElement.title = 'Email подтверждён';
            statusElement.style.color = '#4CAF50';
            statusElement.style.cursor = 'help';
        } else {  // Используем else вместо второго if
            statusElement.innerHTML = ' <i class="fas fa-exclamation-circle unverified-icon"></i>';
            statusElement.title = 'Email не подтверждён';
            statusElement.style.color = '#FF5722';
            statusElement.style.cursor = 'help';
        }
        
        emailElement.appendChild(statusElement);

    }
    }, 5);
}

    function showMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.textContent = text;
        document.body.prepend(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    const confirmEmailBtn = document.getElementById('confirmEmailBtn');
    const settingsModal = document.getElementById('settingsModal');
    
    if (confirmEmailBtn) {
        confirmEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Вы уверены, что хотите подтвердить этот email? На вашу почту будет отправлено письмо с подтверждением.')) {
                confirmEmailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
                confirmEmailBtn.disabled = true;
                
                fetch('https://192.168.0.103/api/auth/verify', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка сервера');
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message || 'Письмо с подтверждением отправлено на ваш email!');
                    settingsModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    // Обновляем статус после отправки
                    checkEmailVerificationStatus();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(error.message || 'Произошла ошибка при отправке запроса подтверждения');
                })
                .finally(() => {
                    confirmEmailBtn.innerHTML = '<i class="fas fa-envelope"></i> Подтвердить email';
                    confirmEmailBtn.disabled = false;
                });
            }
        });
    }
    
});