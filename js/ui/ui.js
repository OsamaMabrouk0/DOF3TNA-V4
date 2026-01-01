(function(App) {
    'use strict';
    
    App.UI.Sidebar = {
        isOpen: false,
        
        toggle: function(show) {
            const body = document.body;
            const sidebar = App.DOM.sidebar;
            const overlay = App.DOM.sidebarOverlay;
            
            if (!sidebar || !overlay) return;
            
            const shouldShow = show !== undefined ? show : !this.isOpen;
            
            if (shouldShow && !this.isOpen) {
                this.isOpen = true;
                body.classList.add('sidebar-open');
                body.style.overflow = 'hidden';
                
                overlay.classList.remove('hidden');
                setTimeout(function() {
                    overlay.classList.remove('opacity-0');
                }, 10);
                
                if (window.innerWidth < 768 && window.history) {
                    window.history.pushState(
                        { sidebar: true, page: App.State.currentPage },
                        '',
                        '#' + App.State.currentPage
                    );
                }
            } else if (!shouldShow && this.isOpen) {
                this.isOpen = false;
                body.classList.remove('sidebar-open');
                overlay.classList.add('opacity-0');
                
                setTimeout(function() {
                    overlay.classList.add('hidden');
                    body.style.overflow = '';
                }, 300);
            }
        },
        
        render: function() {
            const container = App.DOM.sidebarLinks;
            if (!container) return;
            
            const currentPage = App.State.currentPage;
            
            function getLinkClass(id) {
                const isActive = id === currentPage;
                const base = "flex items-center gap-3 px-4 py-3 rounded-xl transition group ";
                
                if (isActive) {
                    return base + "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
                }
                return base + "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5";
            }
            
            const homeLink = '<a href="#home" data-page="home" class="' + getLinkClass('home') + '">' +
                '<i class="fa-solid fa-house w-6 text-center transition-transform ' + 
                (currentPage === 'home' ? 'scale-110' : '') + '"></i>' +
                '<span class="font-medium">الرئيسية</span>' +
                '</a>';
            
            let otherLinks = '';
            for (let i = 0; i < App.PAGES.length; i++) {
                const page = App.PAGES[i];
                otherLinks += '<a href="#' + page.id + '" data-page="' + page.id + '" class="' + getLinkClass(page.id) + '">' +
                    '<i class="' + page.icon + ' w-6 text-center transition-transform ' + 
                    (currentPage === page.id ? 'scale-110 ' + page.color : page.color) + '"></i>' +
                    '<span class="font-medium">' + page.title + '</span>' +
                    '</a>';
            }
            
            const divider = '<div class="h-px bg-gray-200 dark:bg-white/5 my-2 mx-4"></div>';
            
            container.innerHTML = homeLink + divider + otherLinks;
            this.attachEvents();
        },
        
        attachEvents: function() {
            const links = App.DOM.sidebarLinks.querySelectorAll('a[data-page]');
            
            for (let i = 0; i < links.length; i++) {
                const newLink = links[i].cloneNode(true);
                links[i].parentNode.replaceChild(newLink, links[i]);
                
                newLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const pageId = this.getAttribute('data-page');
                    
                    if (window.innerWidth < 768) {
                        App.UI.Sidebar.toggle(false);
                    }
                    
                    App.Router.go(pageId);
                });
            }
        }
    };
    
    App.UI.Header = {
        updateTitle: function(pageId) {
            const header = App.DOM.pageTitleHeader;
            if (!header) return;
            
            if (pageId === 'home') {
                header.innerText = 'الرئيسية';
                return;
            }
            
            const page = App.PAGES.find(function(p) {
                return p.id === pageId;
            });
            
            header.innerText = page ? page.title : 'الرئيسية';
        }
    };
    
    App.UI.BottomNav = {
        toggle: function(show) {
            const nav = App.DOM.bottomNav;
            if (!nav) return;
            
            if (show) {
                nav.classList.remove('nav-hidden');
            } else {
                nav.classList.add('nav-hidden');
            }
        },
        
        attachEvents: function() {
            const navHome = document.getElementById('nav-home');
            const navMenu = document.getElementById('nav-menu');
            const navSettings = document.getElementById('nav-settings');
            const centerAction = document.getElementById('center-action-btn');
            
            if (navHome) {
                navHome.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    App.Router.go('home');
                });
            }
            
            if (navMenu) {
                navMenu.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    App.UI.Sidebar.toggle(true);
                });
            }
            
            if (navSettings) {
                navSettings.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    App.Router.go('settings');
                });
            }
            
            if (centerAction) {
                centerAction.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    App.Toast.info('الإجراء السريع قيد التطوير!', 'قريباً');
                });
            }
        }
    };
    
    App.UI.bindHeaderButtons = function() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                App.State.Theme.toggleDark();
            });
        }
        
        const notifBtn = document.getElementById('notif-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', function(e) {
                e.preventDefault();
                App.Router.go('notifications');
            });
        }
        
        const openSidebar = document.getElementById('open-sidebar');
        if (openSidebar) {
            openSidebar.addEventListener('click', function(e) {
                e.preventDefault();
                App.UI.Sidebar.toggle(true);
            });
        }
        
        const closeSidebar = document.getElementById('close-sidebar');
        if (closeSidebar) {
            closeSidebar.addEventListener('click', function(e) {
                e.preventDefault();
                App.UI.Sidebar.toggle(false);
                
                if (window.innerWidth < 768 && window.history && App.UI.Sidebar.isOpen) {
                    window.history.back();
                }
            });
        }
        
        const overlay = App.DOM.sidebarOverlay;
        if (overlay) {
            const closeOnOverlay = function(e) {
                e.preventDefault();
                App.UI.Sidebar.toggle(false);
                
                if (window.innerWidth < 768 && window.history && App.UI.Sidebar.isOpen) {
                    window.history.back();
                }
            };
            
            overlay.addEventListener('click', closeOnOverlay);
            overlay.addEventListener('touchend', closeOnOverlay);
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && App.UI.Sidebar.isOpen) {
                App.UI.Sidebar.toggle(false);
            }
        });
    };
    
})(window.App);