
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

function showPasswordReset() {
    document.getElementById('password-reset').classList.remove('oculto');
}

function closePasswordReset() {
    document.getElementById('password-reset').classList.add('oculto');
    document.getElementById('reset-modal-overlay').classList.add('oculto');
}

function checkEmail() {
    const userEmail = document.getElementById('e-mail').value;
    if (!userEmail) return;

    fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
    })
    .then(res => {
        if (!res.ok) throw new Error('E-mail não cadastrado na nossa base de dados!');
        return res.json();
    })
    .then(() => {
        document.getElementById('reset-modal-overlay').classList.remove('oculto');
    })
    .catch(err => showToast(err.message, 'error'));
}

function passwordReset() {
    const senha = document.getElementById('nova_senha').value;
    const confSenha = document.getElementById('confirma_senha').value;

    if (!senha || !confSenha) return;

    if (senha === confSenha){
        fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: senha })
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao redefinir a senha');
            return res.json();
        })
        .then(() => {
            showToast('Senha alterada com sucesso!', 'success');
            closePasswordReset();
        })
        .catch(err => showToast(err.message, 'error'));
    } else {
        showToast('O conteúdo dos campos não coincidem! Tente novamente!', 'error');
    }
}
