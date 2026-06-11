class User {
    constructor(name,level){
        this.name = name;
        this.level =  level;
    }

    levelManagement(levelRequired){
        const levels = {
            'admin': 3,
            'operator': 2,
            'user': 1
        };

        if (!levelRequired) return true;
        
        return levels[this.level] >= levels[levelRequired];

    }

}

class PermissionManager{
    constructor(user){
        this.user = user;
    }

    applyRestrictions(){
        const restrictedElements = document.querySelectorAll('[data-nivel]');

        restrictedElements.forEach(element => {
            const levelRequired = element.getAttribute('data-nivel');

            if(!this.user.levelManagement(levelRequired)){

                element.classList.add('oculto');
            } else {
                element.classList.remove('oculto');
            }
        });

        this.refreshPage();
    }

    refreshPage(){
        // Also update sub-title for admin page or sidebar profile label
        const sideElement = document.querySelector('.brand-subtitle');
        if (sideElement){
            sideElement.textContent = this.user.level === 'admin' ? 'Administrator' : this.user.level === 'operator' ? 'Operador' : 'Solicitante';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/me')
        .then(response => {
            if (!response.ok) {
                // If not logged in, redirect to login page (if we are not already on login page)
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            window.currentUser = new User(data.name, data.role);

            const uiManager = new PermissionManager(window.currentUser);
            uiManager.applyRestrictions();

            // Dynamic welcome name in dashboard
            const welcomeUser = document.getElementById('welcomeUser');
            if (welcomeUser) {
                welcomeUser.innerHTML = `Olá, ${data.name}! 👋`;
            }

            // Dynamic profile name in header
            const profileBtn = document.querySelector('.btn-profile');
            if (profileBtn) {
                profileBtn.innerHTML = `<i class="fa-regular fa-user-circle"></i> ${data.name}`;
            }

            // Stats loader (Dashboard)
            const statCards = document.querySelectorAll('.stat-value');
            if (statCards.length >= 2) {
                fetch('/api/stats')
                    .then(res => res.json())
                    .then(stats => {
                        statCards[0].textContent = stats.abertos;
                        statCards[1].textContent = stats.pendentes;
                    })
                    .catch(err => console.error('Erro ao buscar estatísticas:', err));
            }

            if (typeof renderizarLista === 'function') {
                renderizarLista();
            }
            if (typeof carregarTickets === 'function') {
                carregarTickets();
            }
        })
        .catch(err => {
            console.error('Erro ao buscar dados do usuário:', err);
        });
});

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


window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

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
