document.addEventListener('DOMContentLoaded', function(){
    const editMenuToogle=document.getElementById('profileEditModal');
    const ProfileEditButton = document.querySelector('.edit-profile');
    const CloseBtn1 = document.getElementById('closeEditModal');
    const CloseBtn2 = document.getElementById('cancelEditBtn');
    ProfileEditButton.addEventListener('click', function(){
        editMenuToogle.style.display='flex';
        document.body.style.overflow = 'hidden';
    });

    CloseBtn1.addEventListener('click', function(){
        editMenuToogle.style.display='none';
    })


    CloseBtn2.addEventListener('click', function(){
        editMenuToogle.style.display='none';
    })
})