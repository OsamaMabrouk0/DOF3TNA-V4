(function(App) {
    'use strict';
    
    App.State.currentPage = null;
    App.State.isNavigating = false;
    
    App.State.Theme = {
        init: function() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            const savedOled = localStorage.getItem('oled') === 'true';
            
            const html = document.documentElement;
            
            if (savedTheme === 'dark') {
                html.classList.add('dark');
                
                if (savedOled) {
                    html.classList.add('oled');
                }
            } else {
                html.classList.remove('dark');
                html.classList.remove('oled');
            }
        },
        
        toggleDark: function() {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            const wasOled = localStorage.getItem('oled') === 'true';
            
            if (isDark) {
                html.classList.remove('dark');
                html.classList.remove('oled');
                localStorage.setItem('theme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                
                if (wasOled) {
                    html.classList.add('oled');
                }
            }
            
            this.updateOledButtonState();
            
            App.UI.Sidebar.render();
            
            if (App.State.currentPage === 'settings') {
                this.updateOledButtonState();
                
                const darkToggle = document.getElementById('dark-mode-toggle');
                const oledToggle = document.getElementById('oled-mode-toggle');
                
                if (darkToggle) {
                    darkToggle.checked = html.classList.contains('dark');
                }
                
                if (oledToggle) {
                    oledToggle.checked = html.classList.contains('oled');
                }
            }
        },
        
        toggleOled: function() {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            const isOled = html.classList.contains('oled');
            
            if (!isDark) {
                App.Toast.warning('يجب تفعيل الوضع الليلي أولاً');
                
                const oledToggle = document.getElementById('oled-mode-toggle');
                if (oledToggle) {
                    oledToggle.checked = false;
                }
                return;
            }
            
            if (isOled) {
                html.classList.remove('oled');
                localStorage.setItem('oled', 'false');
                App.Toast.info('تم تعطيل وضع OLED');
            } else {
                html.classList.add('oled');
                localStorage.setItem('oled', 'true');
                App.Toast.success('تم تفعيل وضع OLED');
            }
        },
        
        updateOledButtonState: function() {
            const isDark = document.documentElement.classList.contains('dark');
            const oledToggle = document.getElementById('oled-mode-toggle');
            const oledContainer = document.getElementById('oled-toggle-container');
            
            if (oledToggle && oledContainer) {
                if (isDark) {
                    oledToggle.disabled = false;
                    oledContainer.style.opacity = '1';
                    oledContainer.style.pointerEvents = 'auto';
                } else {
                    oledToggle.disabled = true;
                    oledToggle.checked = false;
                    oledContainer.style.opacity = '0.5';
                    oledContainer.style.pointerEvents = 'none';
                }
            }
        },
        
        reset: function() {
            const isDark = document.documentElement.classList.contains('dark');
            
            Swal.fire({
                title: 'هل أنت متأكد؟',
                text: "سيتم مسح كافة التفضيلات والعودة للوضع الافتراضي!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'نعم، إعادة تعيين!',
                cancelButtonText: 'إلغاء',
                customClass: {
                    popup: isDark ? 'swal-dark' : ''
                }
            }).then(function(result) {
                if (result.isConfirmed) {
                    localStorage.clear();
                    Swal.fire({
                        title: 'تم!',
                        text: 'تمت إعادة الضبط. سيتم إعادة تحميل الصفحة.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup: isDark ? 'swal-dark' : ''
                        },
                        willClose: function() {
                            window.location.reload();
                        }
                    });
                }
            });
        }
    };
    
    App.State.Connection = {
        updateUI: function(isOnline) {
            const btn = document.getElementById('conn-btn');
            if (!btn) return;
            
            if (!isOnline) {
                btn.classList.add('is-offline');
                btn.title = "غير متصل";
            } else {
                btn.classList.remove('is-offline');
                btn.title = "متصل";
            }
        },
        
        init: function() {
            const self = this;
            
            this.updateUI(navigator.onLine);
            
            window.addEventListener('online', function() {
                self.updateUI(true);
            });
            
            window.addEventListener('offline', function() {
                self.updateUI(false);
            });
        }
    };
    
})(window.App);