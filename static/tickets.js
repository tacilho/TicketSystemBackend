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
        function renderizarLista() {
            const container = document.getElementById('ticketList');
            container.innerHTML = '';

            const filtrados = ticketsDb.filter(t => t.status === abaAtual);

            filtrados.forEach(ticket => {
                const isActive = ticketSelecionado === ticket.id ? 'active' : '';
                const corPonto = abaAtual === 'aguardando' ? '#1ea32a' : '#f1c40f'; // Verde ou Amarelo

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

            // Renderiza o rodapé correto (Botão verde ou Campo de enviar mensagem)
            const footer = document.getElementById('detailsFooter');
            if (ticket.status === 'aguardando') {
                footer.innerHTML = `
                    <button class="btn-aceitar" onclick="aceitarTicket(${ticket.id})">Aceitar Chamado</button>
                `;
                footer.style.justifyContent = 'center';
            } else {
                footer.innerHTML = `
                    <div class="comentario-wrapper">
                        <input type="text" class="input-comentario" placeholder="Adicionar comentário...">
                        <button class="btn-enviar" onclick="enviarComentario()"><i class="fa-solid fa-paper-plane"></i></button>
                    </div>
                `;
                footer.style.justifyContent = 'flex-start';
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