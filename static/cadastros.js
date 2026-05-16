document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Simulação de Dados (Serão substituídos pelo banco de dados Flask futuramente)
    const usuariosDb = [
        { usuario: "Gabriel Otacilio", email: "gabriel.trans@gmail.com", setor: "Expedição", nivel: "Usuário", data: "01/01/2026" }
    ];

    const clientesDb = [
        { cliente: "Gabriel Otacilio", email: "gabriel.trans@gmail.com", setor: "Expedição", usuario: "Gabriel Otacilio", data: "01/01/2026" }
    ];

    const setoresDb = [
        { setor: "Expedição", responsavel: "Gabriel Otacilio", data: "01/01/2026" }
    ];

    // 2. Funções de Renderização
    function renderizarUsuarios() {
        const tbody = document.getElementById('tabela-usuarios');
        tbody.innerHTML = '';
        usuariosDb.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.usuario}</td>
                    <td>${user.email}</td>
                    <td>${user.setor}</td>
                    <td>${user.nivel}</td>
                    <td>${user.data}</td>
                </tr>
            `;
        });
    }

    function renderizarClientes() {
        const tbody = document.getElementById('tabela-clientes');
        tbody.innerHTML = '';
        clientesDb.forEach(cliente => {
            tbody.innerHTML += `
                <tr>
                    <td>${cliente.cliente}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.setor}</td>
                    <td>${cliente.usuario}</td>
                    <td>${cliente.data}</td>
                </tr>
            `;
        });
    }

    function renderizarSetores() {
        const tbody = document.getElementById('tabela-setores');
        tbody.innerHTML = '';
        setoresDb.forEach(setor => {
            tbody.innerHTML += `
                <tr>
                    <td>${setor.setor}</td>
                    <td>${setor.responsavel}</td>
                    <td>${setor.data}</td>
                </tr>
            `;
        });
    }

    // 3. Inicialização
    renderizarUsuarios();
    renderizarClientes();
    renderizarSetores();
});

// Abre o modal removendo a classe "oculto"
function abrirModal(tipo) {
    const modalId = `modal-${tipo}`; // Vai gerar "modal-usuario", "modal-cliente", etc.
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('oculto');
    }
}

// Fecha o modal adicionando a classe "oculto"
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('oculto');
    }
}