    App.Pages.settings = function() {
        const isDark = document.documentElement.classList.contains('dark');
        const isOled = document.documentElement.classList.contains('oled');
        
        const darkToggle = document.getElementById('dark-mode-toggle');
        const oledToggle = document.getElementById('oled-mode-toggle');
        const animationsToggle = document.getElementById('animations-toggle');
        const particlesToggle = document.getElementById('particles-toggle');
        
        if (darkToggle) {
            darkToggle.checked = isDark;
            darkToggle.addEventListener('change', function() {
                App.State.Theme.toggleDark();
            });
        }
        
        if (oledToggle) {
            oledToggle.checked = isOled;
            oledToggle.addEventListener('change', function() {
                App.State.Theme.toggleOled();
            });
        }
        
        App.State.Theme.updateOledButtonState();
        
        if (animationsToggle) {
            animationsToggle.checked = App._settings.animationsEnabled;
            animationsToggle.addEventListener('change', function() {
                App.Effects.toggleAnimations(this.checked);
                
                if (this.checked) {
                    App.Toast.success('تم تفعيل التأثيرات المتقدمة');
                } else {
                    App.Toast.info('تم تعطيل التأثيرات المتقدمة');
                }
            });
        }
        
        if (particlesToggle) {
            particlesToggle.checked = App._settings.particlesEnabled;
            particlesToggle.addEventListener('change', function() {
                App.Effects.toggleParticles(this.checked);
                
                if (this.checked) {
                    App.Toast.success('تم تفعيل الخلفية المتحركة');
                } else {
                    App.Toast.info('تم تعطيل الخلفية المتحركة');
                }
            });
        }
        
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                App.State.Theme.reset();
            });
        }
        
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', function() {
                const isDark = document.documentElement.classList.contains('dark');
                
                Swal.fire({
                    title: 'مسح البيانات المحفوظة؟',
                    text: "سيتم حذف جميع البيانات المخزنة للعمل بدون إنترنت",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'نعم، امسح!',
                    cancelButtonText: 'إلغاء',
                    customClass: {
                        popup: isDark ? 'swal-dark' : ''
                    }
                }).then(function(result) {
                    if (result.isConfirmed) {
                        App.Cache.clearAll();
                        App.Toast.success('تم مسح البيانات المحفوظة');
                    }
                });
            });
        }
    };
    