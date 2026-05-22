document.addEventListener('DOMContentLoaded', () => {
    
    let usuariosDb = [];
    let clientesDb = [];
    let setoresDb = [];

    // Função para carregar todos os dados da API
    function carregarDados() {
        Promise.all([
            fetch('/api/users').then(res => {
                if (!res.ok) throw new Error('Erro ao carregar usuários');
                return res.json();
            }),
            fetch('/api/clients').then(res => {
                if (!res.ok) throw new Error('Erro ao carregar clientes');
                return res.json();
            }),
            fetch('/api/sectors').then(res => {
                if (!res.ok) throw new Error('Erro ao carregar setores');
                return res.json();
            })
        ])
        .then(([users, clients, sectors]) => {
            usuariosDb = users;
            clientesDb = clients;
            setoresDb = sectors;
            
            renderizarUsuarios();
            renderizarClientes();
            renderizarSetores();
            
            // Popula os seletores de setores nos modais com os setores reais
            atualizarSeletoresSetores();
        })
        .catch(err => console.error('Erro ao carregar dados de cadastro:', err));
    }

    function renderizarUsuarios() {
        const tbody = document.getElementById('tabela-usuarios');
        if (!tbody) return;
        tbody.innerHTML = '';
        usuariosDb.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.usuario}</td>
                    <td>${user.email}</td>
                    <td>${user.setor || 'Nenhum'}</td>
                    <td>${user.nivel === 'admin' ? 'Administrador' : user.nivel === 'operator' ? 'Operador' : 'Usuário'}</td>
                    <td>${user.data}</td>
                </tr>
            `;
        });
    }

    function renderizarClientes() {
        const tbody = document.getElementById('tabela-clientes');
        if (!tbody) return;
        tbody.innerHTML = '';
        clientesDb.forEach(cliente => {
            tbody.innerHTML += `
                <tr>
                    <td>${cliente.cliente}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.setor || 'Nenhum'}</td>
                    <td>${cliente.usuario}</td>
                    <td>${cliente.data}</td>
                </tr>
            `;
        });
    }

    function renderizarSetores() {
        const tbody = document.getElementById('tabela-setores');
        if (!tbody) return;
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

    function atualizarSeletoresSetores() {
        const seletores = document.querySelectorAll('select[name="setor"]');
        seletores.forEach(select => {
            select.innerHTML = '';
            setoresDb.forEach(setor => {
                const opt = document.createElement('option');
                opt.value = setor.setor;
                opt.textContent = setor.setor;
                select.appendChild(opt);
            });
            if (setoresDb.length === 0) {
                const opt = document.createElement('option');
                opt.value = "";
                opt.textContent = "Nenhum setor cadastrado";
                select.appendChild(opt);
            }
        });
    }

    // Submit do Usuário
    const formUser = document.getElementById('form-usuario');
    if (formUser) {
        formUser.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formUser);
            const data = Object.fromEntries(formData.entries());
            
            fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao cadastrar usuário');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-usuario');
                formUser.reset();
            })
            .catch(err => alert(err.message));
        });
    }

    // Submit do Cliente
    const formCliente = document.getElementById('form-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formCliente);
            const data = Object.fromEntries(formData.entries());
            
            fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao cadastrar cliente');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-cliente');
                formCliente.reset();
            })
            .catch(err => alert(err.message));
        });
    }

    // Submit do Setor
    const formSetor = document.getElementById('form-setor');
    if (formSetor) {
        formSetor.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formSetor);
            const data = Object.fromEntries(formData.entries());
            
            fetch('/api/sectors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao cadastrar setor');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-setor');
                formSetor.reset();
            })
            .catch(err => alert(err.message));
        });
    }

    // Carregar inicialmente
    carregarDados();
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

// =========================================
// UX IMPROVEMENT: RETRACTABLE SIDEBAR JS
// =========================================
function toggleSidebar() {
    const layout = document.querySelector('.layout-container');
    const icon = document.getElementById('toggleIcon');
    if (!layout) return;
    
    const isCollapsed = layout.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed ? 'true' : 'false');
    
    if (icon) {
        if (isCollapsed) {
            icon.className = 'fa-solid fa-chevron-right';
        } else {
            icon.className = 'fa-solid fa-chevron-left';
        }
    }
}

function restoreSidebarState() {
    const layout = document.querySelector('.layout-container');
    const icon = document.getElementById('toggleIcon');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (layout && isCollapsed) {
        layout.classList.add('sidebar-collapsed');
        if (icon) {
            icon.className = 'fa-solid fa-chevron-right';
        }
    }
}

document.addEventListener('DOMContentLoaded', restoreSidebarState);