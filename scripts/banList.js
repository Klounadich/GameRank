document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const banTab = document.querySelector('.admin-tab[data-tab="ban"]');
    const banTabContent = document.getElementById('ban-tab');
    const banTableBody = banTabContent.querySelector('tbody');
    
    // Обработчик клика на вкладку "Бан-лист"
    banTab.addEventListener('click', function() {
        loadBannedUsers();
    });
    
    // Функция загрузки забаненных пользователей
    async function loadBannedUsers() {
        try {
            // Показываем индикатор загрузки
            banTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Загрузка данных...</td></tr>';
            
            const url = 'http://192.168.0.103:5002/api/admin/get-ban';
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            console.log('Banned users data:', data);
            
            // Получаем массив из свойства banList
            const bannedUsers = data.banList || [];
            console.log('Banned users array:', bannedUsers);
            
            // Очищаем таблицу
            banTableBody.innerHTML = '';
            
            // Если нет забаненных пользователей
            if (bannedUsers.length === 0) {
                banTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Нет забаненных пользователей</td></tr>';
                return;
            }
            
            // Добавляем пользователей в таблицу
            bannedUsers.forEach(user => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${user.id || 'N/A'}</td>
                    <td>${user.ipAdress || 'N/A'}</td>
                    <td>
                        <button class="btn-action btn-unban" data-id="${user.id}">
                            <i class="fas fa-unlock"></i> Разбанить
                        </button>
                    </td>
                `;
                
                banTableBody.appendChild(row);
                
                // Добавляем обработчик для кнопки разбана
                const unbanBtn = row.querySelector('.btn-unban');
                unbanBtn.addEventListener('click', function() {
                    unbanUser(this.dataset.id);
                });
            });
            
        } catch (error) {
            console.error('Error loading banned users:', error);
            banTableBody.innerHTML = '<tr><td colspan="3" class="text-center error">Ошибка загрузки данных</td></tr>';
        }
    }
    
    // Функция для разбана пользователя
    async function unbanUser(userId) {
        if (!userId) return;
        
        if (!confirm(`Вы уверены, что хотите разбанить пользователя с ID ${userId}?`)) {
            return;
        }
        
        try {
            const url = 'http://192.168.0.103:5002/api/admin/unban';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: userId
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            console.log('Unban result:', result);
            alert(`Пользователь с ID ${userId} успешно разбанен`);
            
            // Обновляем список забаненных пользователей
            loadBannedUsers();
            
        } catch (error) {
            console.error('Unban error:', error);
            alert('Произошла ошибка при попытке разбана пользователя');
        }
    }
});