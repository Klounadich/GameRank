document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('updbtn');
    
    saveBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const newUsername = document.getElementById('username').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        const token = localStorage.getItem('myToken');

       

        try {
            // 1. Сначала меняем имя пользователя (если указано)
            if (newUsername) {
                const usernameResponse = await fetch('http://192.168.0.103:5001/api/user/change-username', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newUsername)
                });

                if (!usernameResponse.ok) {
                    const errorData = await usernameResponse.json().catch(() => null);
                    throw new Error(errorData?.message || 'Ошибка при изменении имени');
                }

                // Обновляем токен, если сервер его вернул
                const usernameResult = await usernameResponse.json();
                if (usernameResult.token) {
                    localStorage.setItem('myToken', usernameResult.token);
                }
            }

            // 2. Затем меняем email (если указан)
            if (newEmail) {
                const emailResponse = await fetch('http://192.168.0.103:5001/api/user/change-email', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('myToken')}`
                    },
                    body: JSON.stringify(newEmail)
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json().catch(() => null);
                    throw new Error(errorData?.message || 'Ошибка при изменении email');
                }

                // Обновляем токен, если сервер его вернул
                const emailResult = await emailResponse.json();
                if (emailResult.token) {
                    localStorage.setItem('myToken', emailResult.token);
                }
            }

            alert('Данные успешно обновлены!');
            setTimeout(() => window.location.reload(), 500);
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка: ' + error.message);
            
            // Восстанавливаем предыдущие значения в полях ввода
            document.getElementById('username').value = '';
            document.getElementById('email').value = '';
        }
    });
});