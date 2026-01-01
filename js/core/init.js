(function(App) {
    'use strict';
    
    function initApp() {
        
        App.DOM.appContainer = document.getElementById('app-container');
        App.DOM.appContent = document.getElementById('app-content');
        App.DOM.sidebar = document.getElementById('sidebar');
        App.DOM.sidebarOverlay = document.getElementById('sidebar-overlay');
        App.DOM.sidebarLinks = document.getElementById('sidebar-links');
        App.DOM.pageTitleHeader = document.getElementById('page-title-header');
        App.DOM.bottomNav = document.getElementById('bottom-nav');
        App.DOM.breadcrumb = document.getElementById('breadcrumb');
        App.DOM.particlesContainer = document.getElementById('particles-container');
        App.DOM.pullRefreshIndicator = document.getElementById('pull-refresh-indicator');
        App.DOM.toastContainer = document.getElementById('toast-container');
        
        App.State.Theme.init();
        
        App.State.Connection.init();
        
        App.UI.Sidebar.render();
        
        App.UI.bindHeaderButtons();
        
        App.UI.BottomNav.attachEvents();
        
        App.Effects.init();
        
        App.Router.initHistory();
        
        fetchAndCacheNotifications();
        
        setTimeout(function() {
            App.Router.go('home', false, false);
        }, 100);
        
        App._initialized = true;
        
        showConnectionStatus();
        
    }
    
    function fetchAndCacheNotifications() {
        if (!navigator.onLine) {
            const cached = App.Cache.get(App.CACHE_KEYS.NOTIFICATIONS);
            if (cached) {
                App.NOTIFICATIONS = cached;
                App.Pages.updateNotificationsBadge();
            }
            return;
        }
        
        fetch(App.GITHUB.NOTIFICATIONS_URL)
            .then(response => response.json())
            .then(data => {
                App.NOTIFICATIONS = data;
                App.Cache.set(App.CACHE_KEYS.NOTIFICATIONS, data);
                App.Pages.updateNotificationsBadge();
            })
            .catch(error => {
                console.error('❌ Error fetching notifications:', error);
                const cached = App.Cache.get(App.CACHE_KEYS.NOTIFICATIONS);
                if (cached) {
                    App.NOTIFICATIONS = cached;
                    App.Pages.updateNotificationsBadge();
                }
            });
    }
    
    function showConnectionStatus() {
        if (!navigator.onLine) {
            setTimeout(() => {
                App.Toast.warning('أنت غير متصل بالإنترنت', 'وضع غير متصل');
            }, 1000);
        }
        
        window.addEventListener('online', function() {
            App.Toast.success('تم الاتصال بالإنترنت', 'متصل');
            
            App.API.clearSessionCache();
            
            if (App.State.currentPage === 'lectures' || 
                App.State.currentPage === 'summaries' ||
                App.State.currentPage === 'home') {
                setTimeout(() => {
                    App.Router.go(App.State.currentPage, false, false);
                }, 500);
            }
        });
        
        window.addEventListener('offline', function() {
            App.Toast.warning('تم فقد الاتصال بالإنترنت', 'غير متصل');
        });
    }
    
    function hideSkeletons() {
        const skeletonScreen = document.getElementById('skeleton-screen');
        const appContainer = App.DOM.appContainer;
        
        if (!skeletonScreen || !appContainer) return;
        
        skeletonScreen.classList.add('fade-out');
        
        setTimeout(function() {
            skeletonScreen.style.display = 'none';
            appContainer.style.opacity = '1';
            
            setTimeout(function() {
                const animatedElements = document.querySelectorAll('.scroll-animate');
                animatedElements.forEach(function(el, index) {
                    el.style.setProperty('--stagger-delay', (index * 0.1) + 's');
                    setTimeout(function() {
                        el.classList.add('visible');
                    }, index * 100);
                });
            }, 50);
            
        }, 500);
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        initApp();
    });
    
    window.addEventListener('load', function() {
        setTimeout(hideSkeletons, 200);
    });
    
})(window.App);