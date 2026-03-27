    // Simulando banco de dados de tickets na memória
        let ticketsDb = [
            { id: 101, cliente: "Jair Bolsonaro", titulo: "Queda da Rede", descricao: "A internet caiu no setor de faturamento. Computadores sem acesso ao sistema local.", status: "aguardando" },
            { id: 102, cliente: "Maria Silva", titulo: "Impressora com Erro", descricao: "A impressora do RH está atolando papel toda vez que tentamos imprimir o espelho de ponto.", status: "aguardando" },
            { id: 103, cliente: "João Pedro", titulo: "Acesso Negado", descricao: "Não consigo fazer login no sistema ERP, diz que a senha expirou.", status: "em_atendimento" }
        ];

        let abaAtual = 'aguardando';
        let ticketSelecionado = null;

        // Função para alternar entre as abas
        function mudarAba(aba) {
            abaAtual = aba;
            ticketSelecionado = null; // Reseta a seleção
            
            // Atualiza botões
            document.getElementById('btnAguardando').classList.toggle('active', aba === 'aguardando');
            document.getElementById('btnAtendimento').classList.toggle('active', aba === 'em_atendimento');
            
            esconderDetalhes();
            renderizarLista();
        }

        // Desenha a lista de tickets na esquerda
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
        // Usa o nome para filtrar (Ex: 'Pedro')
        filtrados = ticketsDb.filter(t => t.cliente === nomeCliente);
    } else {
        filtrados = ticketsDb.filter(t => t.status === abaAtual);
    }

    // 3. Controle da Tela Vazia
    if (isUser && filtrados.length === 0) {
        workspace.style.display = 'none';
        msgVazia.classList.remove('oculto');
        return;
    } else {
        workspace.style.display = 'flex';
        msgVazia.classList.add('oculto');
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
    
    // Esconde a mensagem vazia e mostra o card
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('ticketDetailsView').style.display = 'flex';
    
    // Preenche os dados
    document.getElementById('detalheTitulo').textContent = `${ticket.titulo} #${ticket.id}`;
    document.getElementById('detalheCliente').textContent = ticket.cliente;
    document.getElementById('detalheDescricao').value = ticket.descricao;

    // Verificamos o nível do usuário
    const isUser = window.currentUser && window.currentUser.level === 'user';
    const footer = document.getElementById('detailsFooter');

    // Lógica de exibição do rodapé
    if (isUser) {
        // 1. SE FOR CLIENTE: Não mostra nada! Limpa e esconde o rodapé.
        footer.innerHTML = '';
        footer.style.display = 'none';
        
    } else {
        // Garante que o rodapé esteja visível para Admin/Operator
        footer.style.display = 'flex'; 

        if (ticket.status === 'aguardando') {
            // 2. SE FOR ADMIN/OPERADOR e o ticket for NOVO: Mostra o botão de Aceitar
            footer.innerHTML = `
                <button class="btn-aceitar" onclick="aceitarTicket(${ticket.id})">Aceitar Ticket</button>
            `;
            footer.style.justifyContent = 'center';
            
        }
    }

    renderizarLista(); // Re-renderiza para aplicar a borda cinza no selecionado
}

        // Função de Aceitar Chamado
function aceitarTicket(id) {
    const ticket = ticketsDb.find(t => t.id === id);
    if(ticket) {
            ticket.status = 'em_atendimento'; // Muda o status
            mudarAba('em_atendimento'); // Joga o usuário para a outra aba para ele ver o ticket lá
        }
    }

function enviarComentario() {
    alert('Comentário enviado com sucesso!');
    // Aqui futuramente você conectará ao Flask via Fetch/AJAX para salvar no banco.
}

function esconderDetalhes() {
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('ticketDetailsView').style.display = 'none';
}

// Inicializa a tela
window.onload = () => renderizarLista();

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

// Salva o Ticket (Simulação)
function salvarNovoTicket(event) {
    event.preventDefault(); // Evita recarregar a página
    
    // Captura o que o usuário digitou
    const titulo = document.getElementById('novoTicketTitulo').value;
    const descricao = document.getElementById('novoTicketDescricao').value;
    
    // Se o usuário estiver na tela de Tickets (onde a variável ticketsDb existe),
    // nós inserimos o ticket novo na lista na mesma hora!
    if (typeof ticketsDb !== 'undefined' && typeof mudarAba === 'function') {
        const novoId = ticketsDb.length > 0 ? ticketsDb[ticketsDb.length - 1].id + 1 : 100;
        const nomeCliente = window.currentUser ? window.currentUser.name : 'Cliente Web';
        
        // Adiciona na simulação de banco de dados
        ticketsDb.push({
            id: novoId,
            cliente: nomeCliente,
            titulo: titulo,
            descricao: descricao,
            status: 'aguardando'
        });
        
        // Atualiza a tela para a aba "Aguardando" para ele ver o ticket novo
        mudarAba('aguardando');
    } else {
        // Se estiver em outra tela (como a Dashboard), apenas avisa que deu certo
        alert(`Ticket "${titulo}" aberto com sucesso! Nossa equipe analisará em breve.`);
    }
    
    // Limpa os campos do formulário e fecha o popup
    event.target.reset();
    fecharModalTicket();
}
        