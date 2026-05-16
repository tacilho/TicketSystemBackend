function showPasswordReset() {
    document.getElementById('password-reset').classList.remove('oculto');
}

function closePasswordReset() {
    document.getElementById('password-reset').classList.add('oculto');
    document.getElementById('reset-modal-overlay').classList.add('oculto');
}

function passwordReset() {
  const senha = document.getElementById('nova_senha').value;
  const confSenha = document.getElementById('confirma_senha').value;

  if (senha === confSenha){
    alert('Senha alterada com sucesso!');
    closePasswordReset();
  } else {
    alert('O conteúdo dos campos não coincidem! Tente novamente!');
  }

}

function checkEmail(){
    
    const email = 'suporte@gmail.com';

    const userEmail = document.getElementById('e-mail').value;

    if (email == userEmail){
        document.getElementById('reset-modal-overlay').classList.remove('oculto');
    } else {
        alert('E-mail invalido! Por favor, tente novamente.');
    }

}


