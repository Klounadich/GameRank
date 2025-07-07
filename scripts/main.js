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
    console.log('Получены данные профиля:', data); // Для отладки
    
    // Находим элементы в DOM
    const authButton = document.getElementById('auth-button'); // Кнопка авторизации
    const profileContainer = document.querySelector('.profile-container'); // Контейнер для профиля
    const usernameEl = document.querySelector('.profile-username');
    const emailEl = document.querySelector('.profile-email');
    const avatarEl = document.querySelector('.profile-avatar');
    
    // Проверяем, есть ли данные пользователя
    if (!data || (!data.userName && !data.username && !data.user?.name)) {
        console.log('Данные пользователя отсутствуют или пользователь не авторизован');
        // Показываем кнопку авторизации и скрываем профиль, если он был показан
        if (authButton) authButton.style.display = 'block';
        if (profileContainer) profileContainer.style.display = 'none';
        return;
    }
    
    // Нормализуем данные
    const username = data?.userName || data?.username || data?.user?.name || 'Гость';
    const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
    const avatarUrl = data?.avatar || data?.user?.avatar || '/img/default-avatar.jpg';
    
    // Скрываем кнопку авторизации
    if (authButton) authButton.style.display = 'none';
    
    // Обновляем профиль пользователя
    if (usernameEl) usernameEl.textContent = username;
    
    if (avatarEl) avatarEl.src = avatarUrl;
    if (avatarEl) avatarEl.alt = `Аватар ${username}`;
    
    // Показываем контейнер профиля
    if (profileContainer) profileContainer.style.display = 'flex'; // или 'block', в зависимости от вашей вёрстки
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