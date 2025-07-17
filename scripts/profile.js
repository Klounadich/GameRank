document.addEventListener('DOMContentLoaded', function() {
    LoadProfile();
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
    
    const editMenuToogle = document.getElementById('profileEditModal');
    const ProfileEditButton = document.querySelector('.edit-profile');
    const CloseBtn1 = document.getElementById('closeEditModal');
    const CloseBtn2 = document.getElementById('cancelEditBtn');
    const ExitAcc = document.getElementById('logoutBtn');
    
    // Открытие модального окна редактирования
    ProfileEditButton.addEventListener('click', function() {
        editMenuToogle.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Выход из аккаунта
   

    // Закрытие модального окна
    CloseBtn1.addEventListener('click', function() {
        editMenuToogle.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    CloseBtn2.addEventListener('click', function() {
        editMenuToogle.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Загрузка данных в UI
    



    // profile.js
async function LoadProfile() {
    try {
        const response = await fetch('http://192.168.0.103:5001/api/user/usershow', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Обработка 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/index.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateProfileUI(data);
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        showError('Не удалось загрузить данные профиля');
    }
}

 const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if(confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                // 
                    handleLogout();
                    if(response.ok) {
                 window.location.href = '/index.html';
                     } // Uncomment this in production
            }

        });
    }

async function handleLogout() {
    try {
        const response = await fetch('http://192.168.0.103:5001/api/user/signout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            localStorage.removeItem('authToken');
            window.location.href = '/index.html';
        } else {
            throw new Error('Ошибка при выходе');
        }
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showError('Ошибка при выходе из системы');
    }
}

function updateProfileUI(data) {
    console.log('Получены данные профиля:', data); // Для отладки
    
    const usernameEl = document.querySelector('.profile-username');
    const emailEl = document.querySelector('.profile-email');

    if(data.role === "Admin") {
        const panel=document.querySelector(".admin-panel-btn")
        const status = document.querySelector(".profile-admin-info");
        const badge =document.querySelector(".admin-badge");
        panel.style.display="flex"
        status.style.display="flex"
        badge.style.display="flex"
        panel.addEventListener('click', ()=> {
            window.location.href = '/admin.html';
        })
    }
    
    // Проверяем, найдены ли элементы
    if (!usernameEl || !emailEl) {
        console.error('Элементы профиля не найдены в DOM');
        return;
    }
    
    // Проверяем и нормализуем данные
    const username = data?.userName || data?.username || data?.user?.name || 'Гость';
    const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
    
    // Обновляем UI
    usernameEl.textContent = username;
    emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
}

function showError(message) {
    alert(message); // Или другой способ показа ошибки
}
});