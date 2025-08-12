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
                credentials: 'include',
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
                    <td>${user.userName || 'N/A'}</td>
                    <td>${user.ipAdress || 'N/A'}</td>
                    <td>SuperAdmin</td>
                    <td>
                        <button class="btn-action btn-unban" data-id="${user.userName}">
                            <i class="fas fa-unlock"></i> Разбанить
                        </button>
                    </td>
                `;
                
                banTableBody.appendChild(row);
                
                // Добавляем обработчик для кнопки разбана
                const unbanBtn = row.querySelector('.btn-unban');
                unbanBtn.addEventListener('click', function() {
                    unbanUser(user.userName);
                });
            });
            
        } catch (error) {
            console.error('Error loading banned users:', error);
            banTableBody.innerHTML = '<tr><td colspan="3" class="text-center error">Ошибка загрузки данных</td></tr>';
        }
    }
    
    // Функция для разбана пользователя
    async function unbanUser(username) {
    if (!username) return;
    
    if (!confirm(`Вы уверены, что хотите разбанить этого пользователя?`)) {
        return;
    }
    
    try {
        const response = await fetch("http://192.168.0.103:5002/api/admin/unban-user", {
            method: "POST",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( username ),
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        console.log('Unban result:', result);
        alert('Пользователь успешно разбанен');
        
        // Обновляем данные после разбана
        loadBannedUsers();
        
    } catch (error) {
        
        alert('Произошла ошибка при попытке разбана пользователя');
    }
}
});