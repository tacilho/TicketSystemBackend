import re

js_confirm = '''
window.showConfirmModal = function(title, message, onConfirm) {
    let modal = document.getElementById('customConfirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customConfirmModal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '99999';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 400px; text-align: center; padding: 30px;">
                <h2 id="confirmTitle" class="modal-title" style="margin-bottom: 15px; font-size: 1.5rem; color: #1ea32a;"></h2>
                <p id="confirmMessage" style="color: #555; margin-bottom: 25px; line-height: 1.5;"></p>
                <div class="modal-actions" style="margin-top: 0; justify-content: center; gap: 15px;">
                    <button type="button" class="btn-cancelar" id="btnCancelConfirm">Cancelar</button>
                    <button type="button" class="btn-confirmar" id="btnOkConfirm">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    modal.classList.remove('oculto');
    
    document.getElementById('btnCancelConfirm').onclick = function() {
        modal.classList.add('oculto');
    };
    
    document.getElementById('btnOkConfirm').onclick = function() {
        modal.classList.add('oculto');
        if (typeof onConfirm === 'function') onConfirm();
    };
};
'''

with open('static/pageManager.js', 'a', encoding='utf-8') as f:
    f.write(js_confirm)

# tickets.js has 2 confirms:
# if (confirm("Deseja realmente concluir este ticket? Ele será movido para o histórico.")) { fetch... }
# if (confirm("Deseja realmente reabrir este ticket?")) { fetch... }

with open('static/tickets.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''    if (confirm("Deseja realmente concluir este ticket? Ele será movido para o histórico.")) {
        fetch(`/api/tickets/${id}/status`, {''',
'''    showConfirmModal("Concluir Ticket", "Deseja realmente concluir este ticket? Ele será movido para o histórico.", function() {
        fetch(`/api/tickets/${id}/status`, {'''
)
content = content.replace(
'''        .catch(err => showToast(err.message, 'error'));
    }
}

// Função para Reabrir o Ticket''',
'''        .catch(err => showToast(err.message, 'error'));
    });
}

// Função para Reabrir o Ticket'''
)

content = content.replace(
'''    if (confirm("Deseja realmente reabrir este ticket?")) {
        fetch(`/api/tickets/${id}/status`, {''',
'''    showConfirmModal("Reabrir Ticket", "Deseja realmente reabrir este ticket?", function() {
        fetch(`/api/tickets/${id}/status`, {'''
)
content = content.replace(
'''        .catch(err => showToast(err.message, 'error'));
    }
}

function abrirModalTransferir''',
'''        .catch(err => showToast(err.message, 'error'));
    });
}

function abrirModalTransferir'''
)

with open('static/tickets.js', 'w', encoding='utf-8') as f:
    f.write(content)

# cadastros.js has 3 confirms:
with open('static/cadastros.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''    if (confirm("Tem certeza que deseja excluir este usuário? O acesso dele será revogado.")) {
        fetch(`/api/users/${id}`, {''',
'''    showConfirmModal("Excluir Usuário", "Tem certeza que deseja excluir este usuário? O acesso dele será revogado.", function() {
        fetch(`/api/users/${id}`, {'''
)
content = content.replace(
'''        .catch(err => showToast(err.message, 'error'));
    }
}

// --- CLIENTES ---''',
'''        .catch(err => showToast(err.message, 'error'));
    });
}

// --- CLIENTES ---'''
)

content = content.replace(
'''    if (confirm("Tem certeza que deseja excluir este cliente?")) {
        fetch(`/api/clients/${id}`, {''',
'''    showConfirmModal("Excluir Cliente", "Tem certeza que deseja excluir este cliente?", function() {
        fetch(`/api/clients/${id}`, {'''
)
content = content.replace(
'''        .catch(err => showToast(err.message, 'error'));
    }
}

// --- SETORES ---''',
'''        .catch(err => showToast(err.message, 'error'));
    });
}

// --- SETORES ---'''
)

content = content.replace(
'''    if (confirm("Tem certeza que deseja excluir este setor?")) {
        fetch(`/api/sectors/${id}`, {''',
'''    showConfirmModal("Excluir Setor", "Tem certeza que deseja excluir este setor?", function() {
        fetch(`/api/sectors/${id}`, {'''
)
content = content.replace(
'''        .catch(err => showToast(err.message, 'error'));
    }
}''',
'''        .catch(err => showToast(err.message, 'error'));
    });
}'''
)

with open('static/cadastros.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced all confirms!")
