import { registerUser, loginUser, logoutUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('sign-up-form');
    const signInForm = document.getElementById('sign-in-form');

    // Kayıt formu işlemi
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signUpForm.querySelector('input[type="email"]').value;
            const password = signUpForm.querySelector('input[type="password"]').value;

            try {
                await registerUser(email, password);
                alert('Kayıt başarılı! Ana sayfaya yönlendiriliyorsunuz...');
                window.location.href = 'user.html';
            } catch (error) {
                alert('Kayıt işlemi sırasında hata: ' + error.message);
            }
        });
    }

    // Giriş formu işlemi
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signInForm.querySelector('input[type="email"]').value;
            const password = signInForm.querySelector('input[type="password"]').value;
            
            try {
                await loginUser(email, password);
            } catch (error) {
                alert('Giriş başarısız: ' + error.message);
            }
        });
    }
});

// Çıkış işlemi
window.handleLogout = async (event) => {
    event.preventDefault();
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        try {
            await logoutUser();
        } catch (error) {
            alert('Çıkış yapılırken bir hata oluştu: ' + error.message);
        }
    }
};
