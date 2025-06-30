document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    

    const data = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    

    try {
        
        const response = await fetch("http://192.168.0.101:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
                
        });
        
        
        const result = await response.json();
        

        if (response.ok) {
            
        } else {
            alert("Ошибка: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        
    }
});
