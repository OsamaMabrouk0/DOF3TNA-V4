    App.Pages.default = function(pageId) {
        const page = App.PAGES.find(function(p) {
            return p.id === pageId;
        });
        
        if (!page) return;
        
        const headerCard = document.getElementById('page-header-card');
        if (headerCard) {
            headerCard.innerHTML = 
                '<div class="w-20 h-20 rounded-2xl bg-gradient-to-br ' + page.bg + ' flex items-center justify-center shadow-lg z-10 border border-white/10">' +
                '<i class="' + page.icon + ' text-4xl ' + page.color + '"></i>' +
                '</div>' +
                '<div class="z-10">' +
                '<h1 class="text-3xl font-bold mb-2">' + page.title + '</h1>' +
                '<p class="text-gray-500 dark:text-gray-300 max-w-xl text-sm md:text-base leading-relaxed">' +
                'تصفح محتويات ' + page.title + '. هذا القسم قيد التطوير المستمر لإضافة المزيد من المواد.' +
                '</p>' +
                '</div>' +
                '<i class="' + page.icon + ' absolute -right-6 -bottom-6 text-[10rem] opacity-[0.03] rotate-12 pointer-events-none"></i>';
        }
        
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                App.Router.go('home');
            });
        }
    };