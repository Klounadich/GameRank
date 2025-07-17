document.addEventListener('DOMContentLoaded', function() {
    LoadProfile();
    
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

    if(data.Role === "Admin") {
        console.log("Вошёл админ")
         const adminButton = document.createElement('button');
    adminButton.textContent = 'Админ-панель';
    adminButton.style.position = 'fixed';
    adminButton.style.bottom = '20px';
    adminButton.style.right = '20px';
    adminButton.style.padding = '10px 15px';
    adminButton.style.backgroundColor = '#4CAF50';
    adminButton.style.color = 'white';
    adminButton.style.border = 'none';
    adminButton.style.borderRadius = '4px';
    adminButton.style.cursor = 'pointer';
    adminButton.style.zIndex = '1000';
    
    // Добавляем обработчик клика
    adminButton.addEventListener('click', () => {
        window.location.href = '/admin'; // или ваш URL админ-панели
    });
    
    // Добавляем кнопку на страницу
    document.body.appendChild(adminButton)
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