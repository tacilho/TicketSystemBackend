import os
import re

css_content = '''
/* =========================================
   TOAST NOTIFICATIONS
========================================= */
#toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.toast-msg {
    background-color: #333;
    color: #fff;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 1rem;
    font-weight: 500;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
}
.toast-msg.show {
    opacity: 1;
    transform: translateY(0);
}
.toast-msg.success { background-color: #1ea32a; border-left: 6px solid #14801e; }
.toast-msg.error { background-color: #e74c3c; border-left: 6px solid #c0392b; }
'''

js_toast = '''
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
'''

with open('static/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_content)

with open('static/pageManager.js', 'a', encoding='utf-8') as f:
    f.write(js_toast)

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to find alert('...') and alert("...") and alert(variable)
    def replacer(match):
        inner = match.group(1)
        if 'err.message' in inner or 'error' in inner.lower() or 'não coincidem' in inner.lower():
            return f"showToast({inner}, 'error')"
        else:
            return f"showToast({inner}, 'success')"

    new_content = re.sub(r'alert\((.*?)\)', replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

replace_in_file('static/tickets.js')
replace_in_file('static/cadastros.js')

# For login.js we also prepend js_toast because it doesn't import pageManager.js
with open('static/login.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = js_toast + '\n' + content
def replacer(match):
    inner = match.group(1)
    if 'err.message' in inner or 'error' in inner.lower() or 'não coincidem' in inner.lower():
        return f"showToast({inner}, 'error')"
    else:
        return f"showToast({inner}, 'success')"
new_content = re.sub(r'alert\((.*?)\)', replacer, content)
with open('static/login.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
