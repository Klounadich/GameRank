document.addEventListener('DOMContentLoaded', function() {
    const changeUserName =document.getElementById('username')
    const changePassbtn =document.getElementById('pass_btn')
    const changeEmail =document.getElementById('email')
    const Savebtn = document.getElementById('updbtn')


    changeUserName.addEventListener('updbtn', async function() {
    const newUsername = this.value;
    
    try {
        const response = await fetch('http://192.168.0.103:5001/api/user/change-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: newUsername }),
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении имени пользователя');
        }

        const data = await response.json();
        console.log('Успешно:', data);
        alert('Имя пользователя изменено!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось изменить имя пользователя');
    }
});




changeEmail.addEventListener('updbtn', async function() {
    const newEmail = this.value;
    
    try {
        const response = await fetch('http://192.168.0.103:5001/api/user/change-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: newEmail }),
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении email');
        }

        const data = await response.json();
        console.log('Успешно:', data);
        alert('Email изменен!');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось изменить email');
    }
});

});