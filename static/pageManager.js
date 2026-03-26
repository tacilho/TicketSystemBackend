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
            }
        });

        this.refreshPage();
    }

    refreshPage(){
        
        const sideElement = document.querySelector('.text-secondary[style*="0.75rem"]');

        if (sideElement){
            
            sideElement.textContent = this.user.level.charAt(0).toUpperCase() + this.user.level.slice(1);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    window.currentUser = new User('Pedro', 'user');

    const uiManager = new PermissionManager(window.currentUser);
    uiManager.applyRestrictions();

    if (typeof renderizarLista === 'function') {
        renderizarLista();
    }
})


