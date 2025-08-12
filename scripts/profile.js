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
        if (response.status === 401  ) {
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
        window.location.href = '/index.html';
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
    const DescriptionEl = document.querySelector('.profile-bio-content');

    if(data.role && data.role.includes('Admin')) {
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
    const Description = data?.Description ||data?.description
    const username = data?.userName || data?.username || data?.user?.name || 'Гость';
    const email = data?.Email || data?.email || data?.user?.email || 'Не указан';
    console.log(Description);
    
    // Обновляем UI
    DescriptionEl.textContent= Description; // если закоментить эту строку то всё работает
    usernameEl.textContent = username;
    emailEl.innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
}

function showError(message) {
    alert(message); // Или другой способ показа ошибки
}
const saveBioBtn = document.getElementById('saveBioEdit');
    const bioTextarea = document.getElementById('bioTextarea');
    
    saveBioBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const newBio = bioTextarea.value.trim();
        const token = localStorage.getItem('myToken');

        if (!newBio) {
            alert('Пожалуйста, введите информацию о себе');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.103:5001/api/user/change-description', {
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

     const changePasswordModal = document.getElementById('changePasswordModal');
    const passBtn = document.getElementById('pass_btn');
    const closeChangePassword = document.getElementById('closeChangePassword');
    const cancelChangePassword = document.getElementById('cancelChangePassword');
    
    if(passBtn) {
        passBtn.addEventListener('click', function(e) {
            e.preventDefault();
            changePasswordModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    if(closeChangePassword) {
        closeChangePassword.addEventListener('click', function() {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if(cancelChangePassword) {
        cancelChangePassword.addEventListener('click', function() {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    changePasswordModal.addEventListener('click', function(e) {
        if(e.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Password Change Form Submission
    const changePasswordForm = document.getElementById('changePasswordForm');
    if(changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if(newPassword !== confirmPassword) {
                alert('Новый пароль и подтверждение не совпадают');
                return;
            }
            
            // Отправка данных на сервер
            fetch('http://192.168.0.103:5001/api/user/change-password', {
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
                if(data.status === 'ok') {
                    alert('Пароль успешно изменён');
                    changePasswordModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    location.reload(); // Обновляем страницу
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

});