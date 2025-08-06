document.addEventListener('DOMContentLoaded', function() {
    // Элементы формы назначения ролей
    const roleForm = document.querySelector('.role-form');
    const usernameInput = roleForm.querySelector('input[type="text"]');
    const roleSelect = roleForm.querySelector('select');
    const saveBtn = roleForm.querySelector('.btn-save');
    const roleTableBody = document.querySelector('.role-list tbody');

    // Обработчик отправки формы
    saveBtn.addEventListener('click', assignRole);

    // Функция назначения роли
    async function assignRole() {
        const UserName = usernameInput.value.trim();
        const newRole = roleSelect.value;
        console.log(newRole)
        
        if (!UserName) {
            alert('Пожалуйста, введите имя пользователя');
            return;
        }

        try {
            // Показываем индикатор загрузки
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

            const url = 'http://192.168.0.103:5002/api/admin/change-role';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    UserName: UserName,
                    newRole: newRole
                })
            });

            if (!response.ok) {
                const result1 = await response.json();
                throw new Error(result1);
            }

            const result = await response.json();
            console.log('Role assignment result:', result);
            alert(`Роль "${role}" успешно назначена пользователю ${username}`);

            // Очищаем форму
            usernameInput.value = '';
            roleSelect.value = 'Пользователь';

            // Обновляем список ролей
            loadRoleAssignments();

        } catch (error) {
            console.error('Error assigning role:', error);
            alert('Произошла ошибка при назначении роли');
        } finally {
            // Восстанавливаем кнопку
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить';
        }
    }

    // Функция загрузки текущих назначений ролей
    async function loadRoleAssignments() {
        try {
            const url = 'http://192.168.0.103:5002/api/admin/role-assignments';
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
            console.log('Role assignments:', data);

            // Очищаем таблицу
            roleTableBody.innerHTML = '';

            // Если нет назначений
            if (!data.assignments || data.assignments.length === 0) {
                roleTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Нет назначенных ролей</td></tr>';
                return;
            }

            // Добавляем назначения в таблицу
            data.assignments.forEach(assignment => {
                const row = document.createElement('tr');
                
                // Определяем класс для роли
                let roleClass = 'role-user';
                if (assignment.role === 'Администратор') roleClass = 'role-admin';
                else if (assignment.role === 'Редактор') roleClass = 'role-moderator';

                row.innerHTML = `
                    <td>${assignment.username || 'N/A'}</td>
                    <td><span class="${roleClass}">${assignment.role || 'Пользователь'}</span></td>
                    <td>${assignment.assignedBy || 'Система'}</td>
                    <td>${new Date(assignment.assignedAt).toLocaleDateString() || 'N/A'}</td>
                    <td>
                        <button class="btn-action btn-edit" data-id="${assignment.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-remove" data-id="${assignment.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                roleTableBody.appendChild(row);

                // Добавляем обработчики для кнопок
                row.querySelector('.btn-edit').addEventListener('click', () => editRoleAssignment(assignment.id));
                row.querySelector('.btn-remove').addEventListener('click', () => removeRoleAssignment(assignment.id));
            });

        } catch (error) {
            console.error('Error loading role assignments:', error);
            roleTableBody.innerHTML = '<tr><td colspan="5" class="text-center error">Ошибка загрузки данных</td></tr>';
        }
    }

    // Функция редактирования назначения роли
    async function editRoleAssignment(assignmentId) {
        // Здесь можно реализовать логику редактирования
        console.log('Editing role assignment:', assignmentId);
        alert('Функция редактирования в разработке');
    }

    // Функция удаления назначения роли
    async function removeRoleAssignment(assignmentId) {
        if (!confirm('Вы уверены, что хотите удалить это назначение роли?')) return;

        try {
            const url = `http://192.168.0.103:5002/api/admin/remove-role/${assignmentId}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Role removal result:', result);
            alert('Назначение роли успешно удалено');

            // Обновляем список
            loadRoleAssignments();

        } catch (error) {
            console.error('Error removing role assignment:', error);
            alert('Произошла ошибка при удалении назначения роли');
        }
    }

    // Загружаем назначения ролей при открытии вкладки
    const rolesTab = document.querySelector('.admin-tab[data-tab="roles"]');
    rolesTab.addEventListener('click', loadRoleAssignments);
});