function showPasswordReset() {
    document.getElementById('password-reset').classList.remove('oculto');
}

function closePasswordReset() {
    document.getElementById('password-reset').classList.add('oculto');
}

function passwordReset(event) {
    event.preventDefault();
    alert('E-mail de recuperação enviado!');
    closePasswordReset(); 
}


