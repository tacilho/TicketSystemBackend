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
        const filtrados = usuariosDb.filter(u => u.role !== 'user');
        filtrados.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.usuario}</td>
                    <td>${user.email}</td>
                    <td>${user.telefone || ''}</td>
                    <td>${user.setor || 'Nenhum'}</td>
                    <td>${user.role === 'admin' ? 'Administrador' : 'Operador'}</td>
                    <td>${user.data}</td>
                    <td>
                        <button class="btn-icon edit" onclick="editarUsuario(${user.id})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="excluirUsuario(${user.id})" title="Excluir Operador">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
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
                    <td>${cliente.telefone || ''}</td>
                    <td>${cliente.setor || 'Nenhum'}</td>
                    <td>${cliente.usuario}</td>
                    <td>${cliente.data}</td>
                    <td>
                        <button class="btn-icon edit" onclick="editarCliente(${cliente.id})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="excluirCliente(${cliente.id})" title="Excluir Cliente">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
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
                    <td>
                        <button class="btn-icon edit" onclick="editarSetor(${setor.id})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-icon delete" onclick="excluirSetor(${setor.id})" title="Excluir Setor">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
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
            data.is_admin = data.nivel === 'admin';
            const userId = document.getElementById('edit-usuario-id').value;
            
            const method = userId ? 'PUT' : 'POST';
            const url = userId ? `/api/users/${userId}` : '/api/users';

            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao salvar usuário');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-usuario');
                formUser.reset();
            })
            .catch(err => showToast(err.message, 'error'));
        });
    }

    // Submit do Cliente
    const formCliente = document.getElementById('form-cliente');
    if (formCliente) {
        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formCliente);
            const data = Object.fromEntries(formData.entries());
            const clienteId = document.getElementById('edit-cliente-id').value;
            
            const method = clienteId ? 'PUT' : 'POST';
            const url = clienteId ? `/api/clients/${clienteId}` : '/api/clients';
            
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao salvar solicitante');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-cliente');
                formCliente.reset();
            })
            .catch(err => showToast(err.message, 'error'));
        });
    }

    // Submit do Setor
    const formSetor = document.getElementById('form-setor');
    if (formSetor) {
        formSetor.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formSetor);
            const data = Object.fromEntries(formData.entries());
            const setorId = document.getElementById('edit-setor-id').value;
            
            const method = setorId ? 'PUT' : 'POST';
            const url = setorId ? `/api/sectors/${setorId}` : '/api/sectors';
            
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(json => {
                        throw new Error(json.error || 'Erro ao salvar setor');
                    });
                }
                return res.json();
            })
            .then(() => {
                carregarDados();
                fecharModal('modal-setor');
                formSetor.reset();
            })
            .catch(err => showToast(err.message, 'error'));
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
        
        // Limpar form para garantir que é uma criação
        const form = document.getElementById(`form-${tipo}`);
        if(form) {
            form.reset();
            const idInput = document.getElementById(`edit-${tipo}-id`);
            if(idInput) idInput.value = '';
            
            if(tipo === 'usuario' || tipo === 'cliente') {
                const senhaInput = form.querySelector('[name="senha"]');
                if(senhaInput) senhaInput.setAttribute('required', 'true');
            }
        }
    }
}

function abrirModalUsuario(nivel) {
    abrirModal('usuario');
    document.getElementById('titulo-modal-usuario').textContent = "Cadastro de Operador";
    
    const selectNivel = document.getElementById('select-nivel-usuario');
    if(selectNivel) {
        selectNivel.value = nivel;
        selectNivel.disabled = false;
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

function excluirUsuario(id) {
    showConfirmModal("Excluir Usuário", "Tem certeza que deseja excluir este usuário? O acesso dele será revogado.", function() {
        fetch(`/api/users/${id}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(json => {
                    throw new Error(json.error || 'Erro ao excluir usuário');
                });
            }
            return res.json();
        })
        .then(() => {
            document.location.reload();
        })
        .catch(err => showToast(err.message, 'error'));
    });
}

function editarUsuario(id) {
    fetch('/api/users')
        .then(res => res.json())
        .then(users => {
            const user = users.find(u => u.id === id);
            if(user) {
                abrirModal('usuario');
                document.getElementById('edit-usuario-id').value = user.id;
                document.getElementById('titulo-modal-usuario').textContent = "Editar Operador";
                const form = document.getElementById('form-usuario');
                form.querySelector('[name="usuario"]').value = user.usuario;
                form.querySelector('[name="email"]').value = user.email;
                if(form.querySelector('[name="telefone"]')) form.querySelector('[name="telefone"]').value = user.telefone || '';
                
                const selectNivel = document.getElementById('select-nivel-usuario');
                if(selectNivel) {
                    selectNivel.value = user.role;
                    selectNivel.disabled = false;
                }
                
                const selectSetor = form.querySelector('[name="setor"]');
                if(selectSetor && user.setor) selectSetor.value = user.setor;
                
                form.querySelector('[name="senha"]').removeAttribute('required');
            }
        });
}

function editarCliente(id) {
    fetch('/api/clients')
        .then(res => res.json())
        .then(clients => {
            const cliente = clients.find(c => c.id === id);
            if(cliente) {
                abrirModal('cliente');
                document.getElementById('edit-cliente-id').value = cliente.id;
                document.getElementById('titulo-modal-cliente').textContent = "Editar Cliente";
                const form = document.getElementById('form-cliente');
                form.querySelector('[name="cliente"]').value = cliente.cliente;
                form.querySelector('[name="email"]').value = cliente.email;
                form.querySelector('[name="usuario"]').value = cliente.usuario;
                if(form.querySelector('[name="telefone"]')) form.querySelector('[name="telefone"]').value = cliente.telefone || '';
                const selectSetor = form.querySelector('[name="setor"]');
                if(selectSetor && cliente.setor) selectSetor.value = cliente.setor;
                const senhaInput = form.querySelector('[name="senha"]');
                if(senhaInput) {
                    senhaInput.removeAttribute('required');
                    senhaInput.value = '';
                }
            }
        });
}

function excluirCliente(id) {
    showConfirmModal("Excluir Cliente", "Tem certeza que deseja excluir este cliente?", function() {
        fetch(`/api/clients/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => document.location.reload())
        .catch(err => showToast(err.message, 'error'));
    });
}

function editarSetor(id) {
    fetch('/api/sectors')
        .then(res => res.json())
        .then(sectors => {
            const setor = sectors.find(s => s.id === id);
            if(setor) {
                abrirModal('setor');
                document.getElementById('edit-setor-id').value = setor.id;
                document.getElementById('titulo-modal-setor').textContent = "Editar Setor";
                const form = document.getElementById('form-setor');
                form.querySelector('[name="setor"]').value = setor.setor;
                form.querySelector('[name="responsavel"]').value = setor.responsavel;
            }
        });
}

function excluirSetor(id) {
    showConfirmModal("Excluir Setor", "Tem certeza que deseja excluir este setor?", function() {
        fetch(`/api/sectors/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => document.location.reload())
        .catch(err => showToast(err.message, 'error'));
    });
}

document.addEventListener('DOMContentLoaded', restoreSidebarState);