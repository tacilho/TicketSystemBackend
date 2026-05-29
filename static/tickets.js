// Simulando banco de dados de tickets na memória (Carregados via API)
let ticketsDb = [];
let abaAtual = 'aguardando';
let ticketSelecionado = null;
let chatInterval = null;

// Função para carregar tickets da API
function carregarTickets() {
    fetch('/api/tickets')
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar tickets');
            return res.json();
        })
        .then(data => {
            ticketsDb = data;
            renderizarLista();
            if (ticketSelecionado !== null) {
                carregarMensagens(ticketSelecionado);
            }
        })
        .catch(err => console.error(err));
}

// Função para alternar entre as abas
function mudarAba(aba) {
    abaAtual = aba;
    ticketSelecionado = null; // Reseta a seleção
    
    // Atualiza botões
    const btnAguardando = document.getElementById('btnAguardando');
    const btnAtendimento = document.getElementById('btnAtendimento');
    const btnConcluido = document.getElementById('btnConcluido');
    if (btnAguardando) btnAguardando.classList.toggle('active', aba === 'aguardando');
    if (btnAtendimento) btnAtendimento.classList.toggle('active', aba === 'em_atendimento');
    if (btnConcluido) btnConcluido.classList.toggle('active', aba === 'concluido');
    
    esconderDetalhes();
    renderizarLista();
}

// Desenha a lista de tickets na esquerda
function renderizarLista() {
    const container = document.getElementById('ticketList');
    if (!container) return;
    
    // Olha para o usuário do pageManager
    const isUser = window.currentUser && window.currentUser.level === 'user';
    const nomeCliente = window.currentUser ? window.currentUser.name : 'Visitante';
    
    // Captura elementos
    const headerCliente = document.getElementById('headerCliente');
    const workspace = document.getElementById('workspaceSplit');
    const msgVazia = document.getElementById('noTicketsMessage');

    // ==========================================
    // Controle Visual do Cabeçalho do Cliente
    // ==========================================
    if (headerCliente) {
        if (isUser) {
            headerCliente.classList.remove('oculto');
        } else {
            headerCliente.classList.add('oculto');
        }
    }

    // 2. Filtragem de Tickets
    let filtrados = [];
    if (isUser) {
        // Clientes vêem todos os seus próprios tickets
        filtrados = ticketsDb;
    } else {
        // Operadores vêem tickets do status selecionado na aba
        filtrados = ticketsDb.filter(t => t.status === abaAtual);
    }

    // 3. Controle da Tela Vazia
    if (isUser && filtrados.length === 0) {
        if (workspace) workspace.style.display = 'none';
        if (msgVazia) msgVazia.classList.remove('oculto');
        return;
    } else {
        if (workspace) workspace.style.display = 'flex';
        if (msgVazia) msgVazia.classList.add('oculto');
    }

    // 4. Desenha a Lista
    container.innerHTML = '';
    filtrados.forEach(ticket => {
        const isActive = ticketSelecionado === ticket.id ? 'active' : '';
        const corPonto = ticket.status === 'aguardando' ? '#1ea32a' : '#f1c40f';

        const card = `
            <div class="ticket-list-card ${isActive}" onclick="abrirDetalhes(${ticket.id})">
                <div class="card-topo">
                    <span class="dot" style="background-color: ${corPonto};"></span>
                    <span class="card-cliente">${ticket.cliente}</span>
                </div>
                <hr class="card-linha">
                <div class="card-titulo">${ticket.titulo}</div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Abre as informações no painel direito
function abrirDetalhes(id) {
    ticketSelecionado = id;
    const ticket = ticketsDb.find(t => t.id === id);
    if (!ticket) return;
    
    // Esconde a mensagem vazia e mostra o card
    const emptyState = document.getElementById('emptyState');
    const ticketDetailsView = document.getElementById('ticketDetailsView');
    if (emptyState) emptyState.style.display = 'none';
    if (ticketDetailsView) ticketDetailsView.style.display = 'flex';
    
    // Preenche os dados
    const detalheTitulo = document.getElementById('detalheTitulo');
    const detalheCliente = document.getElementById('detalheCliente');
    const detalheDescricao = document.getElementById('detalheDescricao');
    if (detalheTitulo) detalheTitulo.textContent = `${ticket.titulo} #${ticket.id}`;
    if (detalheCliente) detalheCliente.textContent = ticket.cliente;
    if (detalheDescricao) detalheDescricao.value = ticket.descricao;

    // Verificamos o nível do usuário
    const isUser = window.currentUser && window.currentUser.level === 'user';
    const footer = document.getElementById('detailsFooter');

    if (footer) {
        // Lógica de exibição do rodapé
        if (isUser) {
            if (ticket.status === 'concluido') {
                footer.innerHTML = `
                    <button class="btn-cancelar" onclick="reabrirTicket(${ticket.id})"><i class="fa-solid fa-lock-open"></i> Reabrir Ticket</button>
                `;
                footer.style.display = 'flex';
                footer.style.justifyContent = 'center';
            } else {
                footer.innerHTML = '';
                footer.style.display = 'none';
            }
        } else {
            // Garante que o rodapé esteja visível para Admin/Operator
            footer.style.display = 'flex'; 

            if (ticket.status === 'aguardando') {
                // SE FOR ADMIN/OPERADOR e o ticket for NOVO: Mostra o botão de Aceitar
                footer.innerHTML = `
                    <button class="btn-aceitar" onclick="aceitarTicket(${ticket.id})">Aceitar Ticket</button>
                `;
                footer.style.justifyContent = 'center';
            } else if (ticket.status === 'em_atendimento') {
                // Se já estiver em atendimento, pode concluir
                footer.innerHTML = `
                    <button class="btn-aceitar" style="background-color: #3498db;" onclick="concluirTicket(${ticket.id})"><i class="fa-solid fa-check"></i> Concluir Ticket</button>
                `;
                footer.style.justifyContent = 'center';
            } else {
                footer.innerHTML = `
                    <button class="btn-cancelar" onclick="reabrirTicket(${ticket.id})"><i class="fa-solid fa-lock-open"></i> Reabrir</button>
                    <span style="color: #666; font-size: 0.9rem; font-weight: 500; margin-left: 10px;"><i class="fa-solid fa-lock" style="margin-right: 5px;"></i>Este ticket foi concluído.</span>
                `;
                footer.style.justifyContent = 'center';
            }
        }
    }

    // Bloquear chat se estiver concluído
    const chatInput = document.getElementById('chatInput');
    const chatAttach = document.getElementById('chatAttach');
    const btnSendMessage = document.querySelector('.btn-send-message');
    const btnAttach = document.querySelector('.btn-attach');
    
    if (chatInput && chatAttach && btnSendMessage && btnAttach) {
        if (ticket.status === 'concluido') {
            chatInput.disabled = true;
            chatAttach.disabled = true;
            btnSendMessage.disabled = true;
            btnAttach.style.pointerEvents = 'none';
            btnAttach.style.opacity = '0.5';
            chatInput.placeholder = 'Ticket fechado. Reabra para enviar mensagens.';
        } else {
            chatInput.disabled = false;
            chatAttach.disabled = false;
            btnSendMessage.disabled = false;
            btnAttach.style.pointerEvents = 'auto';
            btnAttach.style.opacity = '1';
            chatInput.placeholder = 'Escreva uma mensagem...';
        }
    }

    // --- CARREGAMENTO DO CHAT ---
    carregarMensagens(id);
}

// Carregar mensagens de um ticket da API e renderizar
function carregarMensagens(ticket_id) {
    if (ticketSelecionado !== ticket_id) return;

    fetch(`/api/tickets/${ticket_id}/messages`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar mensagens');
            return res.json();
        })
        .then(messages => {
            const feed = document.getElementById('chatFeed');
            if (!feed) return;

            // Salva se o chat estava no final
            const wasAtBottom = feed.scrollHeight - feed.clientHeight <= feed.scrollTop + 60;

            feed.innerHTML = '';
            messages.forEach(msg => {
                if (msg.sender_name === 'Sistema') {
                    feed.innerHTML += `
                        <div style="text-align: center; margin: 15px 0; width: 100%;">
                            <span style="background-color: #e2e8f0; color: #475569; padding: 6px 14px; border-radius: 12px; font-size: 0.85rem; font-weight: 500; display: inline-block;">
                                <i class="fa-solid fa-circle-info" style="margin-right: 4px;"></i> ${msg.text} <span style="font-size: 0.75rem; margin-left: 6px; color: #94a3b8;">${msg.created_at}</span>
                            </span>
                        </div>
                    `;
                    return;
                }

                const isSelf = window.currentUser && window.currentUser.name === msg.sender_name;
                const alignment = isSelf ? 'self' : 'other';

                let textHtml = '';
                if (msg.text) {
                    textHtml = `<div class="chat-bubble">${msg.text}</div>`;
                }

                let imgHtml = '';
                if (msg.image_path) {
                    imgHtml = `<img src="${msg.image_path}" class="chat-image" onclick="window.open('${msg.image_path}', '_blank')" alt="Anexo">`;
                }

                const bubble = `
                    <div class="chat-message ${alignment}">
                        <span class="chat-sender-name">${msg.sender_name}</span>
                        ${textHtml}
                        ${imgHtml}
                        <span class="chat-meta">${msg.created_at}</span>
                    </div>
                `;
                feed.innerHTML += bubble;
            });

            if (messages.length === 0) {
                feed.innerHTML = '<div style="color: #999; text-align: center; font-size: 0.85rem; margin-top: 20px;">Nenhuma mensagem enviada ainda. Escreva uma mensagem abaixo!</div>';
            }

            // Scroll automático para a última mensagem
            if (wasAtBottom || feed.scrollTop === 0) {
                feed.scrollTop = feed.scrollHeight;
            }
        })
        .catch(err => console.error(err));
}

// Envia mensagens com foto opcional usando FormData
function enviarMensagem(event) {
    event.preventDefault();
    if (ticketSelecionado === null) return;

    const textInput = document.getElementById('chatInput');
    const fileInput = document.getElementById('chatAttach');

    const text = textInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    const formData = new FormData();
    if (text) formData.append('text', text);
    if (file) formData.append('image', file);

    fetch(`/api/tickets/${ticketSelecionado}/messages`, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao enviar mensagem');
        return res.json();
    })
    .then(() => {
        textInput.value = '';
        removerAnexo();
        carregarMensagens(ticketSelecionado);
    })
    .catch(err => alert(err.message));
}

// Verifica e exibe o anexo no formulário do chat
function verificarAnexo() {
    const input = document.getElementById('chatAttach');
    const preview = document.getElementById('previewAttach');
    const filename = document.getElementById('previewFilename');
    const textInput = document.getElementById('chatInput');

    if (input.files && input.files[0]) {
        const file = input.files[0];
        filename.textContent = file.name;
        preview.classList.remove('oculto');
        textInput.removeAttribute('required'); // Permite enviar apenas a foto
    }
}

// Remove o anexo selecionado
function removerAnexo() {
    const input = document.getElementById('chatAttach');
    const preview = document.getElementById('previewAttach');
    const textInput = document.getElementById('chatInput');

    input.value = '';
    preview.classList.add('oculto');
    textInput.setAttribute('required', '');
}

// Função de Aceitar Chamado (Chama a API do Flask)
function aceitarTicket(id) {
    fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'em_atendimento' })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao aceitar ticket');
        return res.json();
    })
    .then(() => {
        carregarTickets();
        mudarAba('em_atendimento');
    })
    .catch(err => alert(err.message));
}

// Função de Concluir Chamado (Chama a API do Flask)
function concluirTicket(id) {
    if (confirm("Deseja realmente concluir este ticket? Ele será movido para o histórico.")) {
        fetch(`/api/tickets/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'concluido' })
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao concluir ticket');
            return res.json();
        })
        .then(() => {
            carregarTickets();
            mudarAba('concluido');
        })
        .catch(err => alert(err.message));
    }
}

// Função para Reabrir o Ticket (Chama a API do Flask)
function reabrirTicket(id) {
    if (confirm("Deseja realmente reabrir este ticket?")) {
        fetch(`/api/tickets/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'em_atendimento' })
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao reabrir ticket');
            return res.json();
        })
        .then(() => {
            carregarTickets();
            mudarAba('em_atendimento');
        })
        .catch(err => alert(err.message));
    }
}

function enviarComentario() {
    alert('Comentário enviado com sucesso!');
}

function esconderDetalhes() {
    const emptyState = document.getElementById('emptyState');
    const ticketDetailsView = document.getElementById('ticketDetailsView');
    if (emptyState) emptyState.style.display = 'flex';
    if (ticketDetailsView) ticketDetailsView.style.display = 'none';
}

// Inicializa a tela (Carrega via API assim que o usuário estiver carregado)
window.onload = () => {
    carregarTickets();
    // Auto-update a cada 2 segundos (sincronização de chat e tickets)
    setInterval(carregarTickets, 2000);
};

function abrirTicket() {
    const modal = document.getElementById('modalAbrirTicket');
    if (modal) {
        modal.classList.remove('oculto');
    }
}

// Fecha o Modal
function fecharModalTicket() {
    const modal = document.getElementById('modalAbrirTicket');
    if (modal) {
        modal.classList.add('oculto');
    }
}

// Salva o Ticket (Chama a API do Flask)
function salvarNovoTicket(event) {
    event.preventDefault(); // Evita recarregar a página
    
    // Captura o que o usuário digitou
    const titulo = document.getElementById('novoTicketTitulo').value;
    const descricao = document.getElementById('novoTicketDescricao').value;
    
    fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao salvar novo ticket');
        return res.json();
    })
    .then(() => {
        carregarTickets();
        fecharModalTicket();
        event.target.reset();
    })
    .catch(err => alert(err.message));
}