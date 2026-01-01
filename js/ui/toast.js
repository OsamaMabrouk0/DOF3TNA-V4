(function(App) {
    'use strict';
    
    App.Toast.queue = [];
    App.Toast.activeToasts = [];
    App.Toast.maxToasts = 3;
    
    App.Toast.show = function(message, type, options) {
        type = type || 'info';
        options = options || {};
        
        const toast = {
            id: App.Utils.generateId(),
            message: message,
            title: options.title || '',
            type: type,
            duration: options.duration || 3000,
            closable: options.closable !== false,
            progressBar: options.progressBar !== false
        };
        
        App.Toast.queue.push(toast);
        
        App.Toast.processQueue();
    };
    
    App.Toast.processQueue = function() {
        if (App.Toast.activeToasts.length >= App.Toast.maxToasts) {
            return;
        }
        
        if (App.Toast.queue.length === 0) {
            return;
        }
        
        const toast = App.Toast.queue.shift();
        App.Toast.render(toast);
    };
    
    App.Toast.render = function(toast) {
        const container = App.DOM.toastContainer;
        if (!container) return;
        
        const toastEl = document.createElement('div');
        toastEl.className = 'toast ' + toast.type;
        toastEl.setAttribute('data-toast-id', toast.id);
        
        let icon = '';
        switch (toast.type) {
            case 'success':
                icon = 'fa-check';
                break;
            case 'error':
                icon = 'fa-xmark';
                break;
            case 'warning':
                icon = 'fa-exclamation';
                break;
            case 'info':
                icon = 'fa-info';
                break;
        }
        
        let html = '<div class="toast-icon"><i class="fa-solid ' + icon + '"></i></div>';
        html += '<div class="toast-content">';
        
        if (toast.title) {
            html += '<div class="toast-title">' + toast.title + '</div>';
        }
        
        html += '<div class="toast-message">' + toast.message + '</div>';
        html += '</div>';
        
        if (toast.closable) {
            html += '<button class="toast-close"><i class="fa-solid fa-xmark"></i></button>';
        }
        
        if (toast.progressBar) {
            html += '<div class="toast-progress"><div class="toast-progress-bar"></div></div>';
        }
        
        toastEl.innerHTML = html;
        
        container.appendChild(toastEl);
        
        App.Toast.activeToasts.push({
            id: toast.id,
            element: toastEl,
            timeout: null
        });
        
        setTimeout(function() {
            toastEl.classList.add('show');
        }, 10);
        
        if (toast.closable) {
            const closeBtn = toastEl.querySelector('.toast-close');
            closeBtn.addEventListener('click', function() {
                App.Toast.hide(toast.id);
            });
        }
        
        if (toast.duration > 0) {
            const activeToast = App.Toast.activeToasts.find(function(t) {
                return t.id === toast.id;
            });
            
            if (activeToast) {
                activeToast.timeout = setTimeout(function() {
                    App.Toast.hide(toast.id);
                }, toast.duration);
            }
        }
        
        setTimeout(function() {
            App.Toast.processQueue();
        }, 200);
    };
    
    App.Toast.hide = function(toastId) {
        const activeToast = App.Toast.activeToasts.find(function(t) {
            return t.id === toastId;
        });
        
        if (!activeToast) return;
        
        if (activeToast.timeout) {
            clearTimeout(activeToast.timeout);
        }
        
        activeToast.element.classList.remove('show');
        activeToast.element.classList.add('hide');
        
        setTimeout(function() {
            if (activeToast.element.parentNode) {
                activeToast.element.parentNode.removeChild(activeToast.element);
            }
            
            App.Toast.activeToasts = App.Toast.activeToasts.filter(function(t) {
                return t.id !== toastId;
            });
            
            App.Toast.processQueue();
        }, 400);
    };
    
    App.Toast.hideAll = function() {
        App.Toast.activeToasts.forEach(function(toast) {
            App.Toast.hide(toast.id);
        });
    };
    
    App.Toast.success = function(message, title) {
        App.Toast.show(message, 'success', { title: title });
    };
    
    App.Toast.error = function(message, title) {
        App.Toast.show(message, 'error', { title: title });
    };
    
    App.Toast.warning = function(message, title) {
        App.Toast.show(message, 'warning', { title: title });
    };
    
    App.Toast.info = function(message, title) {
        App.Toast.show(message, 'info', { title: title });
    };
    
})(window.App);