document.getElementById("registerForm").addEventListener("submit",async(e)=>{
    e.preventDefault();

    const data= {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value

    };

    try{
        const responce= await fetch("hhtp://192.168.0.101/api/Auth/Register",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify.json(),
        });
        const result= await responce.json();
        
        
    }

    catch(error){
            console.error(error);
        }
});