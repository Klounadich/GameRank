document.addEventListener('DOMContentLoaded', function() {
    const suspiciousTab = document.querySelector('.admin-tab[data-tab="suspicious"]');
    const suspiciousTabContent = document.getElementById('suspicious-tab');
    const suspiciousList = suspiciousTabContent.querySelector('.suspicious-list');
    const refreshBtn = suspiciousTabContent.querySelector('.btn-refresh');
    
    // Обработчики событий
    suspiciousTab.addEventListener('click', loadSuspiciousAccounts);
    refreshBtn.addEventListener('click', loadSuspiciousAccounts);
    
    // Функция загрузки подозрительных аккаунтов
    async function loadSuspiciousAccounts() {
        try {
            // Показываем индикатор загрузки
            suspiciousList.innerHTML = '<div class="loading">Загрузка данных...</div>';
            
            const url = 'http://192.168.0.103:5002/api/admin/get-suspect';
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
            console.log('Suspicious accounts data:', data);
            
            // Получаем массив из свойства suspectList (а не suspiciousAccounts)
            const suspiciousAccounts = data.suspectList || [];
            console.log('Suspicious accounts array:', suspiciousAccounts);
            
            // Очищаем список
            suspiciousList.innerHTML = '';
            
            // Если нет подозрительных аккаунтов
            if (suspiciousAccounts.length === 0) {
                suspiciousList.innerHTML = '<div class="no-data">Нет подозрительных аккаунтов</div>';
                return;
            }
            
            // Добавляем аккаунты в список
            suspiciousAccounts.forEach(account => {
                const item = document.createElement('div');
                item.className = 'suspicious-item';
                
                item.innerHTML = `
                    <div class="suspicious-info">
                        <img src="/img/default-avatar.jpg" class="user-avatar">
                        <div>
                            <strong>${account.id || 'N/A'}</strong>
                            <div class="suspicious-reason">Причина: ${account.cause || 'Подозрительная активность'}</div>
                            <div class="suspicious-ip">IP: ${account.ipAdress || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="suspicious-actions">
                        <button class="btn-action btn-ban-sm" data-id="${account.id}">
                            <i class="fas fa-ban"></i> Бан
                        </button>
                        <button class="btn-action btn-watch" data-id="${account.id}">
                            <i class="fas fa-eye"></i> Наблюдать
                        </button>
                        <button class="btn-action btn-ignore" data-id="${account.id}">
                            <i class="fas fa-times"></i> Игнорировать
                        </button>
                    </div>
                `;
                
                suspiciousList.appendChild(item);
                
                // Добавляем обработчики для кнопок
                item.querySelector('.btn-ban-sm').addEventListener('click', () => banAccount(account.id));
                item.querySelector('.btn-watch').addEventListener('click', () => watchAccount(account.id));
                item.querySelector('.btn-ignore').addEventListener('click', () => ignoreAccount(account.id));
            });
            
        } catch (error) {
            console.error('Error loading suspicious accounts:', error);
            suspiciousList.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
        }
    }
    
    // Функция для бана аккаунта
    async function banAccount(accountId) {
        if (!confirm('Забанить этот аккаунт?')) return;
        
        try {
            const url = 'http://192.168.0.103:5002/api/admin/ban-account';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountId })
            });
            
            if (!response.ok) throw new Error('Ban failed');
            
            const result = await response.json();
            alert('Аккаунт забанен');
            loadSuspiciousAccounts(); // Обновляем список
            
        } catch (error) {
            console.error('Ban error:', error);
            alert('Ошибка при бане аккаунта');
        }
    }
    
    // Функция для добавления в наблюдение
    async function watchAccount(accountId) {
        try {
            const url = 'http://192.168.0.103:5002/api/admin/watch-account';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountId })
            });
            
            if (!response.ok) throw new Error('Watch failed');
            
            alert('Аккаунт добавлен в наблюдение');
            
        } catch (error) {
            console.error('Watch error:', error);
            alert('Ошибка при добавлении в наблюдение');
        }
    }
    
    // Функция для игнорирования
    async function ignoreAccount(accountId) {
        if (!confirm('Игнорировать это предупреждение?')) return;
        
        try {
            const url = 'http://192.168.0.103:5002/api/admin/ignore-account';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountId })
            });
            
            if (!response.ok) throw new Error('Ignore failed');
            
            alert('Предупреждение игнорировано');
            loadSuspiciousAccounts(); // Обновляем список
            
        } catch (error) {
            console.error('Ignore error:', error);
            alert('Ошибка при игнорировании');
        }
    }
});