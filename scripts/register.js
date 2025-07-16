document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    

    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    const passwords = document.getElementById("password").value;
    const returnpass= document.getElementById("confirmPassword").value;

    try {
        console.log("Пароли:", passwords, returnpass);
        if (passwords!==returnpass){
            showAlert("Ошибка: Пароли не совпадают" , 'error');
            return;
            
        }
        const response = await fetch("http://192.168.0.103:5001/api/auth/register", {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
                
        });
        console.log("Status:", response.status, response.statusText);
         console.log(response);
        const result = await response.json();
        console.log(result.message);

        if (response.ok) {
            showAlert('Регистрация успешна!', 'success');
                console.log(result.message)
                console.log("1")
                window.location.href = "/Profile.html";
            
            
        } 
        else {
            showAlert("Ошибка: " + (result.message || "Unknown error"));
            console.log(response.message)
        }
    } catch (error) {
        console.log("1")
        console.log(result.message)
    }


    function showAlert(message, type = 'info', duration = 5000) {
    const alert = document.getElementById('custom-alert');
    const alertContent = alert.querySelector('.cyber-alert-content');
    const alertMessage = alert.querySelector('.cyber-alert-message');
    const alertClose = alert.querySelector('.cyber-alert-close');
    
    // Set message and type
    alertMessage.innerHTML = message;
    alert.className = 'cyber-alert ' + type;
    
    // Show alert
    alert.classList.add('active');
    
    // Close button handler
    alertClose.onclick = () => {
        alert.classList.remove('active');
        alert.classList.add('hiding');
        setTimeout(() => {
            alert.classList.remove('hiding');
        }, 500);
    };
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alert.classList.contains('active')) {
                alert.classList.remove('active');
                alert.classList.add('hiding');
                setTimeout(() => {
                    alert.classList.remove('hiding');
                }, 500);
            }
        }, duration);
    }
}

// Примеры использования:
// showAlert('Регистрация успешна!', 'success');
// showAlert('Ошибка: Пользователь уже существует', 'error');
// showAlert('Внимание: Пароль слишком простой', 'warning');
});
