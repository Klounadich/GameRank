document.addEventListener('DOMContentLoaded', function() {
    LoadData();
    // Мобильное меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
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



    // Auth Check

    async function LoadData() {
    
        const response = await fetch('http://192.168.0.103:5001/api/user/usershow', {
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

        if (response.ok) {
            const data = await response.json();
        updateProfileUI(data);
        }

        
    
}

function updateProfileUI(data) {
    console.log('Получены данные профиля:', data);
    
    // Находим элементы в DOM
    const authButton = document.getElementById('auth-button');
    const profileContainer = document.querySelector('.profile-container');
    const usernameEl = document.querySelector('.profile-username');
    const emailEl = document.querySelector('.profile-email');
    const avatarEl = document.querySelector('.profile-avatar');
    
    // Проверяем данные пользователя
    const hasUserData = data && (data.userName || data.username || data.user?.name);
    
    if (!hasUserData) {
        console.log('Пользователь не авторизован');
        // Показываем кнопку, скрываем профиль
        if (authButton) authButton.style.display = 'block';
        if (profileContainer) profileContainer.style.display = 'none';
        return;
    }
    
    // Нормализуем данные
    const username = data?.userName || data?.username || data?.user?.name || 'Гость';
    const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
    const avatarUrl = data?.avatar || data?.user?.avatar || '/img/default-avatar.jpg';
    
    // Обновляем UI
    if (authButton) authButton.style.display = 'none';
    if (profileContainer) profileContainer.style.display = 'flex';
    
    if (usernameEl) usernameEl.textContent = username;
    if (emailEl) emailEl.textContent = email;
    
    if (avatarEl) {
        avatarEl.src = avatarUrl;
        avatarEl.alt = `Аватар ${username}`;
        // Устанавливаем фиксированный размер для аватарки
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
   

    // Auth modal 


    document.getElementById("authModal").addEventListener("submit", async (e) => {
    e.preventDefault();
    

    const data = {
        UserName: document.getElementById("Auth_UserName").value,
        
        password: document.getElementById("Auth_Pass").value
    };
    

    try {
        
        const response = await fetch("http://192.168.0.103:5001/api/auth/authoriz", {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
                
        })

        

        
        const result = await response.json();
        

         

        if (response.ok) {
            
            if (result.RedirectUrl) {
                
                showAlert('Вы авторизованы!', 'success');
                window.location.href = "/Profile.html";
            } 
            else {
                
            showAlert("Внутренняя ошибка ", "warning");
        
                window.location.href = "/Profile.html";
            }
        } else {
            console.error('Login failed:', data.Message || 'Unknown error');
             showAlert("Ошибка Авторизации . Попробуйте позже ");
        }
    } catch (error) {
        
    }


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






});