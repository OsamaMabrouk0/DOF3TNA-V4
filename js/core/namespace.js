(function(window) {
    'use strict';
    
    window.App = window.App || {};
    
    App.State = {};
    App.Router = {};
    App.UI = {};
    App.Pages = {};
    App.Utils = {};
    App.Cache = {};
    App.API = {};
    App.Effects = {};
    App.Toast = {};
    
    App._initialized = false;
    App._settings = {
        animationsEnabled: true,
        particlesEnabled: true
    };
    
    App.DOM = {
        appContainer: null,
        appContent: null,
        sidebar: null,
        sidebarOverlay: null,
        sidebarLinks: null,
        pageTitleHeader: null,
        bottomNav: null,
        breadcrumb: null,
        particlesContainer: null,
        pullRefreshIndicator: null,
        toastContainer: null
    };
    
})(window);