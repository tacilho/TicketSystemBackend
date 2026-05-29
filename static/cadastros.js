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
                    <td>
                        <button class="btn-editar" onclick="editarUsuario(${user.id})" title="Editar" style="color: #3498db; background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 10px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-excluir" onclick="excluirUsuario(${user.id})" title="Excluir Usuário" style="color: #e74c3c; background: none; border: none; cursor: pointer; font-size: 1.1rem;">
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
                    <td>${cliente.setor || 'Nenhum'}</td>
                    <td>${cliente.usuario}</td>
                    <td>${cliente.data}</td>
                    <td>
                        <button class="btn-editar" onclick="editarCliente(${cliente.id})" title="Editar" style="color: #3498db; background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 10px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-excluir" onclick="excluirCliente(${cliente.id})" title="Excluir Cliente" style="color: #e74c3c; background: none; border: none; cursor: pointer; font-size: 1.1rem;">
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
                        <button class="btn-editar" onclick="editarSetor(${setor.id})" title="Editar" style="color: #3498db; background: none; border: none; cursor: pointer; font-size: 1.1rem; margin-right: 10px;">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-excluir" onclick="excluirSetor(${setor.id})" title="Excluir Setor" style="color: #e74c3c; background: none; border: none; cursor: pointer; font-size: 1.1rem;">
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
                        throw new Error(json.error || 'Erro ao salvar cliente');
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
        
        // Limpar form para garantir que é uma criação
        const form = document.getElementById(`form-${tipo}`);
        if(form) {
            form.reset();
            const idInput = document.getElementById(`edit-${tipo}-id`);
            if(idInput) idInput.value = '';
            
            if(tipo === 'usuario') {
                const senhaInput = form.querySelector('[name="senha"]');
                if(senhaInput) senhaInput.setAttribute('required', 'true');
            }
        }
    }
}

function abrirModalUsuario(nivel) {
    abrirModal('usuario');
    document.getElementById('titulo-modal-usuario').textContent = "Cadastro de " + (nivel === 'operator' ? 'Operador' : 'Usuário');
    
    const selectNivel = document.getElementById('select-nivel-usuario');
    if(selectNivel) {
        selectNivel.value = nivel;
        selectNivel.disabled = true;
        let hidden = document.getElementById('hidden-nivel-usuario');
        if(!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.id = 'hidden-nivel-usuario';
            hidden.name = 'nivel';
            document.getElementById('form-usuario').appendChild(hidden);
        }
        hidden.value = nivel;
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
    if (confirm("Tem certeza que deseja excluir este usuário? O acesso dele será revogado.")) {
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
        .catch(err => alert(err.message));
    }
}

function editarUsuario(id) {
    fetch('/api/users')
        .then(res => res.json())
        .then(users => {
            const user = users.find(u => u.id === id);
            if(user) {
                abrirModal('usuario');
                document.getElementById('edit-usuario-id').value = user.id;
                document.getElementById('titulo-modal-usuario').textContent = "Editar " + (user.nivel === 'operator' ? 'Operador' : 'Usuário');
                const form = document.getElementById('form-usuario');
                form.querySelector('[name="usuario"]').value = user.usuario;
                form.querySelector('[name="email"]').value = user.email;
                
                const selectNivel = document.getElementById('select-nivel-usuario');
                if(selectNivel) {
                    selectNivel.value = user.nivel;
                    selectNivel.disabled = true;
                    let hidden = document.getElementById('hidden-nivel-usuario');
                    if(!hidden) {
                        hidden = document.createElement('input');
                        hidden.type = 'hidden';
                        hidden.id = 'hidden-nivel-usuario';
                        hidden.name = 'nivel';
                        form.appendChild(hidden);
                    }
                    hidden.value = user.nivel;
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
                const selectSetor = form.querySelector('[name="setor"]');
                if(selectSetor && cliente.setor) selectSetor.value = cliente.setor;
            }
        });
}

function excluirCliente(id) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        fetch(`/api/clients/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => document.location.reload())
        .catch(err => alert(err.message));
    }
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
    if (confirm("Tem certeza que deseja excluir este setor?")) {
        fetch(`/api/sectors/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => document.location.reload())
        .catch(err => alert(err.message));
    }
}

document.addEventListener('DOMContentLoaded', restoreSidebarState);