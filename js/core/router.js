(function (App) {
    'use strict';

    App.Router.go = function (pageId, animate, pushState) {
        if (pageId === App.State.currentPage || App.State.isNavigating) {
            return;
        }

        if (animate === undefined) animate = true;
        if (pushState === undefined) pushState = true;

        App.State.isNavigating = true;

        if (App.UI.Sidebar.isOpen) {
            App.UI.Sidebar.toggle(false);
        }

        if (pageId === 'home') {
            App.UI.BottomNav.toggle(false);
        } else {
            App.UI.BottomNav.toggle(true);
        }

        const previousPage = App.State.currentPage;
        App.State.currentPage = pageId;

        if (pushState && window.history && window.history.pushState) {
            window.history.pushState(
                { page: pageId },
                '',
                '#' + pageId
            );
        }

        App.UI.Header.updateTitle(pageId);
        App.UI.Sidebar.render();

        const loadContent = function () {
            App.Router._mountTemplate(pageId);

            if (App.DOM.appContent) {
                App.DOM.appContent.scrollTo(0, 0);
                App.DOM.appContent.scrollTop = 0;
            }
            
            window.scrollTo(0, 0);

            if (App.Effects && App.Effects.refresh) {
                setTimeout(function () {
                    App.Effects.refresh();
                }, 100);
            }

            if (animate) {
                gsap.fromTo(
                    App.DOM.appContent,
                    { opacity: 0, y: 8 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: function () {
                            App.State.isNavigating = false;
                        }
                    }
                );
            } else {
                gsap.set(App.DOM.appContent, { opacity: 1, y: 0 });
                App.State.isNavigating = false;
            }
        };

        if (animate) {
            gsap.to(App.DOM.appContent, {
                opacity: 0,
                y: -8,
                duration: 0.2,
                ease: 'power2.in',
                onComplete: loadContent
            });
        } else {
            loadContent();
        }
    };

    App.Router._mountTemplate = function (pageId) {
        let templateId;

        if (pageId === 'home') {
            templateId = 'page-home';
        } else if (pageId === 'settings') {
            templateId = 'page-settings';
        } else if (pageId === 'notifications') {
            templateId = 'page-notifications';
        } else if (pageId === 'lectures') {
            templateId = 'page-lectures';
        } else if (pageId === 'summaries') {
            templateId = 'page-summaries';
        } else {
            templateId = 'page-default';
        }

        const template = document.getElementById(templateId);
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }

        App.DOM.appContent.replaceChildren();

        const clone = template.content.cloneNode(true);
        App.DOM.appContent.appendChild(clone);

        if (pageId === 'home' && typeof App.Pages.home === 'function') {
            App.Pages.home();
        } else if (pageId === 'settings' && typeof App.Pages.settings === 'function') {
            App.Pages.settings();
        } else if (pageId === 'notifications' && typeof App.Pages.notifications === 'function') {
            App.Pages.notifications();
        } else if (pageId === 'lectures' && typeof App.Pages.lectures === 'function') {
            App.Pages.lectures();
        } else if (pageId === 'summaries' && typeof App.Pages.summaries === 'function') {
            App.Pages.summaries();
        } else if (typeof App.Pages.default === 'function') {
            App.Pages.default(pageId);
        }
    };

    App.Router.initHistory = function () {
        window.addEventListener('popstate', function (e) {
            const sidebar = App.DOM.sidebar;
            const isMobile = window.innerWidth < 768;

            if (isMobile && sidebar && App.UI.Sidebar.isOpen) {
                App.UI.Sidebar.toggle(false);
                window.history.pushState(
                    { page: App.State.currentPage },
                    '',
                    '#' + App.State.currentPage
                );
                return;
            }

            App.Router.go('home', true, false);
        });
    };

})(window.App);