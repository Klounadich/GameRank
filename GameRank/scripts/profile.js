document.addEventListener('DOMContentLoaded', function(){
    LoadProfile();
    const editMenuToogle=document.getElementById('profileEditModal');
    const ProfileEditButton = document.querySelector('.edit-profile');
    const CloseBtn1 = document.getElementById('closeEditModal');
    const CloseBtn2 = document.getElementById('cancelEditBtn');
    const ExitAcc = document.getElementById('logoutBtn');
    ProfileEditButton.addEventListener('click', function(){
        editMenuToogle.style.display='flex';
        document.body.style.overflow = 'hidden';
    });

    ExitAcc.addEventListener('click', function(){
        const a = fetch ('api/user/signout', {
            method:'POST',
            headers:{
                'Content-Type':'application/json' 
            },
            credentials:'include'
        });

        if (a.ok){
             window.location.href = '/index.html';
        }
        else{
            const error =  response.json();
            throw new Error(error.message || 'Ошибка при выходе из аккаунта');
        }
    })
    CloseBtn1.addEventListener('click', function(){
        editMenuToogle.style.display='none';
    })


    CloseBtn2.addEventListener('click', function(){
        editMenuToogle.style.display='none';
    })
    
    async  function LoadUi(data) {
        const Username = document.querySelector('.profile-username');
        if (Username) {
            Username.textContent=data.Username;
        }
        const email = document.querySelector('.profile-email');
        if(email){
            email.innerHTML = `<i class="fas fa-envelope"></i> ${data.Email}`;
        }
    }

    async function LoadProfile() {
        try {
            const responce = await fetch('api/user/usershow',{
                method:'GET',
                headers:{
                    'Content-type':'application/json',
                    
                },
                credentials:'include'
            });

            if (!responce.ok) {
                throw new Error('Ошибка загрузки профиля')
            }

            const data = await responce.json();
            LoadUi(data);
        }
        catch (Error) {
            
        }
    }
});