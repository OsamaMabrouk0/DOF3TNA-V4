(function(App) {
    'use strict';
    
    App.Utils.on = function(selector, event, handler) {
        const el = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
            
        if (el) {
            el.addEventListener(event, handler);
            return true;
        }
        return false;
    };
    
    App.Utils.$ = function(selector) {
        return document.querySelector(selector);
    };
    
    App.Utils.$$ = function(selector) {
        return document.querySelectorAll(selector);
    };
    
    App.Utils.debounce = function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    };
    
    App.Utils.throttle = function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    };
    
    App.Utils.exists = function(selector) {
        return document.querySelector(selector) !== null;
    };
    
    App.Utils.random = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    App.Utils.randomColor = function() {
        const colors = [
            'rgba(59, 130, 246, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(6, 182, 212, 0.6)',
            'rgba(16, 185, 129, 0.6)',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    
    App.Utils.timeAgo = function(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " سنة";
        
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " شهر";
        
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " يوم";
        
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " ساعة";
        
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " دقيقة";
        
        return "الآن";
    };
    
    App.Utils.formatFileSize = function(bytes) {
        if (bytes === 0) return '0 بايت';
        
        const k = 1024;
        const sizes = ['بايت', 'كيلو', 'ميجا', 'جيجا'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    
    App.Utils.saveToStorage = function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    };
    
    App.Utils.loadFromStorage = function(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    };
    
    App.Utils.removeFromStorage = function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    };
    
    App.Utils.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    App.Utils.isTouchDevice = function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    
    App.Utils.getScrollPosition = function() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    };
    
    App.Utils.scrollTo = function(element, offset) {
        offset = offset || 0;
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            const top = el.getBoundingClientRect().top + window.pageYOffset + offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    };
    
    App.Utils.copyToClipboard = function(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return Promise.resolve();
            } catch (e) {
                document.body.removeChild(textarea);
                return Promise.reject(e);
            }
        }
    };
    
    App.Utils.generateId = function() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    App.Utils.isInViewport = function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };
    
    App.Utils.wait = function(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    };
    
    App.Utils.formatNumber = function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    App.Utils.truncate = function(str, length) {
        length = length || 50;
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    };
    
})(window.App);