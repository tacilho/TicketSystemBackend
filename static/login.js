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
    .catch(err => alert(err.message));
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
            alert('Senha alterada com sucesso!');
            closePasswordReset();
        })
        .catch(err => alert(err.message));
    } else {
        alert('O conteúdo dos campos não coincidem! Tente novamente!');
    }
}
