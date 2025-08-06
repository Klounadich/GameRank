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
    const searchInput = document.getElementById('searchuser');
    const searchBtn = document.getElementById('searchbtn');
    const usersTableBody = document.querySelector('#users-tab .admin-table tbody');

    // Функция для отправки данных
    async function sendSearchData() {
        const searchValue = searchInput.value.trim();
        console.log(searchValue)
        if (searchValue) {
            try {
                // Здесь должен быть ваш реальный API endpoint
                const response = await fetch("http://192.168.0.103:5002/api/admin/get", {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(searchValue),
                
        })
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const userData = await response.json();
                console.log('Success:', userData);
                updateUsersTable(userData); // Передаем один объект пользователя
                
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при поиске пользователя');
            }
        } else {
            alert('Пожалуйста, введите имя пользователя или email для поиска');
        }
    }

    function updateUsersTable(user) {
    // Очищаем таблицу
    usersTableBody.innerHTML = '';
    
    // Если пользователь не найден
    if (!user || !user.username) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">Пользователь не найден</td>';
        usersTableBody.appendChild(row);
        return;
    }
    
    // Создаем строку для найденного пользователя
    const row = document.createElement('tr');
    
    // Определяем класс для роли (берем первую роль из массива)
    const userRole = user.role && user.role.length > 0 ? user.role[0] : 'Пользователь';
    let roleClass = 'User';
    
    if (userRole === 'Администратор') roleClass = 'Admin';
    
    // Определяем какая кнопка будет отображаться (бан/разбан)
    let actionButton = '';
    if (user.status === 'banned') {
        actionButton = `
            <button class="btn-action btn-unban" data-id="${user.id}">
                <i class="fas fa-unlock"></i> Разбанить
            </button>
        `;
    } else {
        actionButton = `
            <button class="btn-action btn-ban" data-username="${user.username}">
                <i class="fas fa-ban"></i> Забанить
            </button>
        `;
    }
    
    row.innerHTML = `
        <td><img src="/img/default-avatar.jpg" class="user-avatar"></td>
        <td>${user.username || 'N/A'}</td>
        <td>${user.email || 'N/A'}</td>
        <td><span class="${roleClass}">${userRole}</span></td>
        <td>${user.ipAdress || 'N/A'}</td>
        <td>${user.status || 'N/A'}</td>
        <td>
            ${actionButton}
        </td>
    `;
    
    usersTableBody.appendChild(row);
    
    // Добавляем обработчик для кнопки
    if (user.status === 'banned') {
        const unbanBtn = row.querySelector('.btn-unban');
        unbanBtn.addEventListener('click', function() {
            unbanUser(user.username);
        });
    } else {
        const banBtn = row.querySelector('.btn-ban');
        banBtn.addEventListener('click', function() {
            banUser(this.dataset.username);
        });
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
        sendSearchData();
        
    } catch (error) {
        console.error('Unban error:', error);
        alert('Произошла ошибка при попытке разбана пользователя');
    }
}
async function banUser(username) {
        if (!username) return;
        
        if (!confirm(`Вы уверены, что хотите забанить пользователя ${username}?`)) {
            return;
        }
        
        try {
            const response = await fetch("http://192.168.0.103:5002/api/admin/ban-user", {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(username),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            console.log('Ban result:', result);
            alert(`Пользователь ${username} успешно забанен`);
            
            // Обновляем данные после бана
            sendSearchData();
            
        } catch (error) {
            console.error('Ban error:', error);
            alert('Произошла ошибка при попытке бана пользователя');
        }
    }
    
    searchBtn.addEventListener('click', sendSearchData);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendSearchData();
        }
    });
});