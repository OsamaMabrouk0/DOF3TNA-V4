(function(App) {
    'use strict';
    
    App.Pages.home = function() {
        
        renderQuickAccess();
        
        fetchRecentFiles(true);
        fetchAndRenderStats(true);
        renderHomeNotifications();
        
        initHomeSwiper();
        
        const showAllBtn = document.getElementById('show-all-pages');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', function() {
                App.UI.Sidebar.toggle(true);
            });
        }
        
        if (App.Effects && App.Effects.refresh) {
            App.Effects.refresh();
        }
    };
    
    function renderQuickAccess() {
        const slidesContainer = document.getElementById('quick-access-slides');
        if (!slidesContainer) return;
        
        let slidesHtml = '';
        
        for (let i = 0; i < App.PAGES.length; i++) {
            const page = App.PAGES[i];
            slidesHtml += `
                <div class="swiper-slide">
                    <div data-page="${page.id}" class="quick-access-card h-36 glass-panel border-none bg-gradient-to-b ${page.bg} rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group hover:-translate-y-1 transition duration-300">
                        <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
                            <i class="${page.icon} text-2xl ${page.color}"></i>
                        </div>
                        <span class="font-semibold text-sm group-hover:text-blue-500 dark:group-hover:text-blue-300 transition">${page.title}</span>
                    </div>
                </div>
            `;
        }
        
        slidesContainer.innerHTML = slidesHtml;
        
        const cards = slidesContainer.querySelectorAll('.quick-access-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                App.Router.go(pageId);
            });
        });
    }
    
    function fetchAndRenderStats(forceRefresh = false) {
        const statsChart = document.getElementById('stats-chart');
        if (!statsChart) return;
        
        const ctx = statsChart.getContext('2d');
        ctx.clearRect(0, 0, statsChart.width, statsChart.height);
        
        Promise.all([
            App.API.fetchAllFilesRecursive(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures', forceRefresh),
            App.API.fetchAllFilesRecursive(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries', forceRefresh)
        ]).then(([lecturesFiles, summariesFiles]) => {
            const lecturesStats = App.API.calculateStats(lecturesFiles);
            const summariesStats = App.API.calculateStats(summariesFiles);
            
            const lecturesCount = lecturesStats.total - lecturesStats.folders;
            const summariesCount = summariesStats.total - summariesStats.folders;
            
            renderStatsChart(ctx, statsChart, lecturesCount, summariesCount);
            
        }).catch(error => {
            console.error('Error fetching stats:', error);
        });
    }
    
    function renderStatsChart(ctx, canvas, lecturesCount, summariesCount) {
        const totalCount = lecturesCount + summariesCount;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        const colors = ['#3b82f6', '#06b6d4'];
        
        const lecturesAngle = (lecturesCount / totalCount) * 2 * Math.PI;
        const summariesAngle = (summariesCount / totalCount) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, lecturesAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[0];
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, lecturesAngle, lecturesAngle + summariesAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = colors[1];
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-panel') || '#ffffff';
        ctx.fill();
        
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-main') || '#000000';
        ctx.font = 'bold 24px Cairo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(totalCount, centerX, centerY);
        
        const legend = document.createElement('div');
        legend.className = 'mt-4 space-y-2 text-xs';
        legend.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #3b82f6"></div>
                    <span>المحاضرات</span>
                </div>
                <span class="font-bold">${lecturesCount}</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background: #06b6d4"></div>
                    <span>الملخصات</span>
                </div>
                <span class="font-bold">${summariesCount}</span>
            </div>
        `;
        
        const container = canvas.parentElement;
        const existingLegend = container.querySelector('.mt-4');
        if (existingLegend) existingLegend.remove();
        container.appendChild(legend);
    }
    
    function fetchRecentFiles(forceRefresh = false) {
        const recentList = document.getElementById('recent-files-list');
        if (!recentList) return;
        
        recentList.innerHTML = `
            <div class="space-y-3">
                <div class="skeleton h-16 rounded-xl"></div>
                <div class="skeleton h-16 rounded-xl"></div>
                <div class="skeleton h-16 rounded-xl"></div>
            </div>
        `;
        
        Promise.all([
            App.API.fetchAllFilesRecursive(App.GOOGLE_DRIVE.LECTURES_FOLDER_ID, 'lectures', forceRefresh),
            App.API.fetchAllFilesRecursive(App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID, 'summaries', forceRefresh)
        ]).then(([lecturesFiles, summariesFiles]) => {
            lecturesFiles.forEach(f => f.source = 'lectures');
            summariesFiles.forEach(f => f.source = 'summaries');
            
            const allFiles = [...lecturesFiles, ...summariesFiles];
            
            const filesOnly = allFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
            
            filesOnly.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
            
            const recent = filesOnly.slice(0, 3);
            
            renderRecentFilesList(recent);
            
        }).catch(error => {
            console.error('Error fetching recent files:', error);
            recentList.innerHTML = `
                <div class="text-center py-6">
                    <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <i class="fa-solid fa-wifi-slash text-gray-400"></i>
                    </div>
                    <p class="text-sm text-gray-400">لا يوجد اتصال بالإنترنت</p>
                </div>
            `;
        });
    }
    
    function renderRecentFilesList(recent) {
        const recentList = document.getElementById('recent-files-list');
        if (!recentList) return;
        
        if (recent.length === 0) {
            recentList.innerHTML = `
                <div class="text-center py-6 text-gray-400 text-sm">
                    لا توجد ملفات حديثة
                </div>
            `;
            return;
        }
        
        let listHtml = '';
        recent.forEach(file => {
            const isVideo = file.mimeType && file.mimeType.indexOf('video') > -1;
            const isPDF = file.mimeType && file.mimeType.indexOf('pdf') > -1;
            const icon = isVideo ? 'fa-circle-play' : (isPDF ? 'fa-file-pdf' : 'fa-file');
            const iconColor = isVideo ? 'text-red-500' : (isPDF ? 'text-red-600' : 'text-blue-500');
            const sourceIcon = file.source === 'lectures' ? 'fa-chalkboard-user' : 'fa-file-pen';
            const sourceColor = file.source === 'lectures' ? 'text-blue-500' : 'text-cyan-500';
            
            listHtml += `
                <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer group border border-transparent hover:border-blue-500/20" data-file-link="${file.webViewLink}">
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ${iconColor} flex-shrink-0">
                            <i class="fa-solid ${icon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-sm line-clamp-1">${file.name}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-gray-400">
                                <i class="fa-solid ${sourceIcon} ${sourceColor}"></i>
                                <span>${App.Utils.timeAgo(new Date(file.modifiedTime))}</span>
                            </div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left text-xs text-gray-400 group-hover:text-blue-400 transition flex-shrink-0"></i>
                </div>
            `;
        });
        
        recentList.innerHTML = listHtml;
        
        const fileItems = recentList.querySelectorAll('[data-file-link]');
        fileItems.forEach(item => {
            item.addEventListener('click', function() {
                const link = this.getAttribute('data-file-link');
                if (link) window.open(link, '_blank');
            });
        });
    }
    
    function renderHomeNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        App.API.fetchWithCache(
            App.GITHUB.NOTIFICATIONS_URL,
            App.CACHE_KEYS.NOTIFICATIONS
        ).then(result => {
            App.NOTIFICATIONS = result.data;
            renderNotificationsList(App.NOTIFICATIONS);
        }).catch(error => {
            console.error('Error fetching notifications:', error);
            notificationsList.innerHTML = '<div class="text-center py-4 text-gray-400 text-sm">لا توجد إشعارات</div>';
        });
    }
    
    function renderNotificationsList(notifications) {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        let notifHtml = '';
        const displayCount = Math.min(3, notifications.length);
        
        for (let i = 0; i < displayCount; i++) {
            const notif = notifications[i];
            notifHtml += `
                <div class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-blue-500/20">
                    <div class="w-10 h-10 rounded-lg bg-${notif.color.replace('text-', '')}/10 flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid ${notif.icon} ${notif.color}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                            <h4 class="font-semibold text-sm truncate">${notif.title}</h4>
                            ${!notif.read ? '<span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>' : ''}
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">${notif.message}</p>
                        <p class="text-[10px] text-gray-400 mt-1">${notif.time}</p>
                    </div>
                </div>
            `;
        }
        
        notificationsList.innerHTML = notifHtml;
    }
    
    function initHomeSwiper() {
        if (App.Pages.homeSwiperInstance) {
            App.Pages.homeSwiperInstance.destroy(true, true);
            App.Pages.homeSwiperInstance = null;
        }
        
        const swiperEl = document.querySelector('.mySwiper');
        if (!swiperEl) return;
        
        App.Pages.homeSwiperInstance = new Swiper('.mySwiper', {
            slidesPerView: 2.5,
            spaceBetween: 15,
            freeMode: true,
            grabCursor: true,
            breakpoints: {
                640: { slidesPerView: 3.5, spaceBetween: 20 },
                768: { slidesPerView: 4.5, spaceBetween: 20 },
                1024: { slidesPerView: 5.5, spaceBetween: 20 }
            }
        });
    }
    
})(window.App);