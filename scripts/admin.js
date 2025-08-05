document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Ban user confirmation
    const banButtons = document.querySelectorAll('.btn-ban, .btn-ban-sm');
    banButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите забанить этого пользователя?')) {
                e.preventDefault();
            }
        });
    });
    
    // Unban user confirmation
    const unbanButtons = document.querySelectorAll('.btn-unban');
    unbanButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите разбанить этого пользователя?')) {
                e.preventDefault();
            }
        });
    });
    
    // Dismiss report confirmation
    const dismissButtons = document.querySelectorAll('.btn-dismiss');
    dismissButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите отклонить эту жалобу?')) {
                e.preventDefault();
            }
        });
    });
    
    // Remove role confirmation
    const removeRoleButtons = document.querySelectorAll('.btn-remove');
    removeRoleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить эту роль?')) {
                e.preventDefault();
            }
        });
    });
    
    // Log filter functionality
    const logFilter = document.querySelector('.log-filters select');
    if (logFilter) {
        logFilter.addEventListener('change', function() {
            const filter = this.value;
            const logEntries = document.querySelectorAll('.log-entry');
            
            logEntries.forEach(entry => {
                if (filter === 'Все логи' || entry.classList.contains(`log-${filter.toLowerCase()}`)) {
                    entry.style.display = 'flex';
                } else {
                    entry.style.display = 'none';
                }
            });
        });
    }

    // ФЕТЧИ АДМИН ПАНЕЛИ 
    // Получаем элементы DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM
    const searchInput = document.getElementById('searchuser');
    const searchBtn = document.getElementById('searchbtn');
    const usersTableBody = document.querySelector('#users-tab .admin-table tbody');

    // Функция для отправки данных
    async function sendSearchData() {
        const searchValue = searchInput.value.trim();
        
        if (searchValue) {
            try {
                // Здесь должен быть ваш реальный API endpoint
                const url = 'http://192.168.0.103:5001/api/admin/get'; // Пример URL
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: searchValue })
                });
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                console.log('Success:', data);
                updateUsersTable(data);
                
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при поиске пользователя');
            }
        } else {
            alert('Пожалуйста, введите имя пользователя или email для поиска');
        }
    }

    // Функция для обновления таблицы пользователей
    function updateUsersTable(users) {
        // Очищаем таблицу, но оставляем заголовок
        usersTableBody.innerHTML = '';
        
        // Если пользователи не найдены
        if (users.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">Пользователи не найдены</td>';
            usersTableBody.appendChild(row);
            return;
        }
        
        // Добавляем найденных пользователей в таблицу
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Определяем класс для роли
            let roleClass = 'user';
            if (user.role === 'Администратор') roleClass = 'admin';
            
            
            row.innerHTML = `
                <td><img src="${user.avatar || '/img/default-avatar.jpg'}" class="user-avatar"></td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="${roleClass}">${user.role || 'Пользователь'}</span></td>
                <td>${user.ip || 'N/A'}</td>
                <td>
                    <button class="btn-action btn-edit"><i class="fas fa-user-edit"></i></button>
                    <button class="btn-action btn-ban"><i class="fas fa-ban"></i></button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
    }

    // Добавляем обработчик события на кнопку
    searchBtn.addEventListener('click', sendSearchData);
    
    // Также можно добавить обработчик нажатия Enter в поле ввода
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendSearchData();
        }
    });
});

});