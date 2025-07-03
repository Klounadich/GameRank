document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    mobileMenuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        const icon = this.querySelector('i');
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Модальное окно авторизации
    const authModal = document.getElementById('authModal');
    const authTriggers = document.querySelectorAll('.auth-trigger');
    const closeAuth = document.querySelector('.close-auth');
    
    authTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    closeAuth.addEventListener('click', function() {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
   

    // Auth modal 


    document.getElementById("authModal").addEventListener("submit", async (e) => {
    e.preventDefault();
    

    const data = {
        UserName: document.getElementById("Auth_UserName").value,
        
        password: document.getElementById("Auth_Pass").value
    };
    

    try {
        
        const response = await fetch("http://192.168.0.103:5001/api/auth/authoriz", {
            method: "POST",
            credentials:'include',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
                
        })

        

        
        const result = await response.json();
        

         console.log('Full response:', response);
        console.log('Response data:', result);

        if (response.ok) {
            console.log(response.headers.get('set-cookie'));
            // 1. Проверяем, есть ли RedirectUrl в ответе
            if (result.RedirectUrl) {
                console.log('Redirecting to:', result.RedirectUrl);
                // 2. Выполняем редирект вручную
                window.location.href = "/Profile.html";
            } else {
                console.error('No RedirectUrl in response');
                //window.location.href = "/Profile.html";
            }
        } else {
            console.error('Login failed:', data.Message || 'Unknown error');
            alert(data.Message || 'Login failed');
        }
    } catch (error) {
        
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


});






});