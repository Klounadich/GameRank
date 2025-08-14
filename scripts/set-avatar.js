 document.addEventListener('DOMContentLoaded', function() {
    // Элементы для работы с аватаром
    const editAvatarBtn = document.querySelector('.edit-avatar');
    const avatarModal = document.createElement('div');
    avatarModal.className = 'avatar-modal';
    avatarModal.innerHTML = `
        <div class="avatar-modal-content">
            <h3>Изменение аватара</h3>
            <div class="avatar-preview-container">
                <img src="/img/default-avatar.jpg" alt="Предпросмотр аватара" class="avatar-preview-img">
            </div>
            <input type="file" id="avatarFileInput" accept="image/*" style="display: none;">
            <button class="btn-select-avatar" id="selectAvatarBtn">Выбрать изображение</button>
            <div class="avatar-modal-actions">
                <button class="btn btn-secondary" id="cancelAvatarChange">Отмена</button>
                <button class="btn btn-primary" id="saveAvatarBtn">Сохранить</button>
            </div>
        </div>
    `;
    document.body.appendChild(avatarModal);

    // Стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
        .avatar-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .avatar-modal-content {
            background-color: #2a2a3a;
            padding: 2rem;
            border-radius: 8px;
            width: 350px;
            max-width: 90%;
            border: 1px solid #444;
            text-align: center;
        }
        
        .avatar-modal h3 {
            color: #fff;
            margin-bottom: 1.5rem;
            font-size: 1.2rem;
        }
        
        .avatar-preview-container {
            width: 150px;
            height: 150px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid #444;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .avatar-preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .btn-select-avatar {
            background-color: #3a3a4a;
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 1.5rem;
            transition: background-color 0.3s;
        }
        
        .btn-select-avatar:hover {
            background-color: #4a4a5a;
        }
        
        .avatar-modal-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
    `;
    document.head.appendChild(style);

    // Обработчики событий
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', function() {
            avatarModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    const selectAvatarBtn = document.getElementById('selectAvatarBtn');
    const avatarFileInput = document.getElementById('avatarFileInput');
    const avatarPreviewImg = document.querySelector('.avatar-preview-img');
    const cancelAvatarChange = document.getElementById('cancelAvatarChange');
    const saveAvatarBtn = document.getElementById('saveAvatarBtn');

    selectAvatarBtn.addEventListener('click', function() {
        avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Файл слишком большой. Максимальный размер - 5MB.');
                return;
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Пожалуйста, выберите изображение в формате JPEG, PNG или GIF.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                avatarPreviewImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    cancelAvatarChange.addEventListener('click', function() {
        avatarModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        avatarFileInput.value = '';
    });

    saveAvatarBtn.addEventListener('click', function() {
        const file = avatarFileInput.files[0];
        if (!file) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        // Отправка на сервер
        fetch('/api/user/avatar', {
            method: 'POST',
            body: formData,
            credentials: 'include' // для отправки куки, если используется аутентификация
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при загрузке аватара');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Обновляем аватар на странице
                const avatarElements = document.querySelectorAll('.profile-avatar img, .avatar-preview img');
                avatarElements.forEach(img => {
                    img.src = data.avatarUrl + '?' + new Date().getTime(); // Добавляем timestamp для избежания кеширования
                });
                avatarModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            } else {
                throw new Error(data.message || 'Ошибка при обновлении аватара');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Произошла ошибка: ' + error.message);
        });
    });

    // Закрытие модального окна при клике вне его
    avatarModal.addEventListener('click', function(e) {
        if (e.target === avatarModal) {
            avatarModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            avatarFileInput.value = '';
        }
    });
});