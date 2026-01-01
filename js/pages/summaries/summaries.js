(function(App) {
    'use strict';
    
    let currentFolder = null;
    let currentPath = [];
    let allData = null;
    
    App.Pages.summaries = function() {
        const container = document.getElementById('summaries-container');
        const errorEl = document.getElementById('summaries-error');
        const breadcrumbEl = document.getElementById('summaries-breadcrumb');
        
        const statsContainer = document.getElementById('summaries-stats');
        if (statsContainer) {
            statsContainer.style.display = 'none';
        }
        
        currentFolder = null;
        currentPath = [];
        allData = null;
        
        fetchData();
        
        function showSkeleton() {
            if (container) {
                container.innerHTML = `
                    <div class="space-y-3">
                        ${Array(6).fill(0).map(() => `
                            <div class="glass-panel rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 animate-pulse">
                                <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>
                                <div class="flex-1 space-y-2">
                                    <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                    <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                                </div>
                                <div class="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded flex-shrink-0"></div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        function fetchData() {
            showSkeleton();
            if (errorEl) errorEl.classList.add('hidden');
            
            const folderId = currentFolder || App.GOOGLE_DRIVE.SUMMARIES_FOLDER_ID;
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                `&orderBy=folder,name`;
            
            const cacheKey = App.CACHE_KEYS.SUMMARIES_STRUCTURE + '_' + folderId;
            
            App.API.fetchWithCache(url, cacheKey)
                .then(result => {
                    allData = result.data.files || [];
                    renderItems();
                    updateBreadcrumb();
                    
                    if (!result.fromSession && result.fromCache) {
                        App.Toast.info('البيانات محفوظة محلياً', 'غير متصل');
                    }
                })
                .catch(error => {
                    console.error('Error fetching summaries:', error);
                    if (errorEl) errorEl.classList.remove('hidden');
                    container.innerHTML = '';
                });
        }
        
        function renderItems() {
            if (!container || !allData) return;
            
            if (allData.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-6 animate-pulse">
                            <i class="fa-solid fa-inbox text-4xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-400 text-lg font-medium">لا توجد ملفات</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="space-y-3">';
            
            allData.forEach(item => {
                const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                
                if (isFolder) {
                    html += renderFolderItem(item);
                } else {
                    html += renderFileItem(item);
                }
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            const folderItems = container.querySelectorAll('.folder-item');
            folderItems.forEach(item => {
                item.addEventListener('click', function() {
                    const folderId = this.getAttribute('data-folder-id');
                    const folderName = this.getAttribute('data-folder-name');
                    currentFolder = folderId;
                    currentPath.push({ id: folderId, name: folderName });
                    fetchData();
                });
            });
            
            if (App.Effects && App.Effects.initScrollAnimations) {
                App.Effects.initScrollAnimations();
            }
        }
        
        function renderFolderItem(item) {
            return `
                <div class="folder-item group cursor-pointer" data-folder-id="${item.id}" data-folder-name="${item.name}">
                    <div class="glass-panel rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cyan-500/20 relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10 flex items-center gap-3 md:gap-4 w-full">
                            <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-teal-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                                <i class="fa-solid fa-folder text-xl md:text-2xl text-cyan-400"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold text-sm md:text-base group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition line-clamp-1">${item.name}</h3>
                                <div class="flex items-center gap-2 md:gap-3 text-xs text-gray-400 mt-1">
                                    <span>مجلد</span>
                                    <span>•</span>
                                    <span class="text-[10px] md:text-xs">${App.Utils.timeAgo(new Date(item.modifiedTime))}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
                                <span class="text-[10px]">فتح</span>
                                <i class="fa-solid fa-arrow-left text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderFileItem(item) {
            const isPDF = item.mimeType && item.mimeType.indexOf('pdf') > -1;
            
            return `
                <div class="file-item group">
                    <div class="glass-panel rounded-2xl p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/10 hover:border-cyan-500/30 relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10 flex items-start gap-3 md:gap-4">
                            <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                                <i class="fa-solid ${isPDF ? 'fa-file-pdf' : 'fa-file'} text-xl md:text-2xl text-cyan-400"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold text-sm md:text-base group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition break-words line-clamp-2 leading-tight mb-2">
                                    ${item.name}
                                </h3>
                                <div class="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-gray-400 mb-3">
                                    <span>${App.Utils.timeAgo(new Date(item.modifiedTime))}</span>
                                    ${item.size ? '<span>•</span><span>' + App.Utils.formatFileSize(item.size) + '</span>' : ''}
                                </div>
                                <div class="flex gap-2">
                                    <button class="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 group/btn" onclick="window.open('${item.webViewLink}', '_blank')">
                                        <i class="fa-solid fa-eye text-xs group-hover/btn:scale-110 transition-transform"></i>
                                        <span class="hidden sm:inline">عرض</span>
                                    </button>
                                    ${item.webContentLink ? `
                                        <button class="px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 group/btn" onclick="window.open('${item.webContentLink}', '_blank')">
                                            <i class="fa-solid fa-download text-xs group-hover/btn:scale-110 transition-transform"></i>
                                            <span class="hidden sm:inline">تحميل</span>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function updateBreadcrumb() {
            if (!breadcrumbEl) return;
            
            let breadcrumbHtml = `
                <button class="breadcrumb-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-all hover:scale-105" data-nav="root">
                    <i class="fa-solid fa-house ml-1"></i>الملخصات
                </button>
            `;
            
            currentPath.forEach((item, index) => {
                breadcrumbHtml += `
                    <i class="fa-solid fa-chevron-left text-xs text-gray-400 mx-1"></i>
                    <button class="breadcrumb-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-105" data-nav="${index}">
                        ${item.name}
                    </button>
                `;
            });
            
            breadcrumbEl.innerHTML = breadcrumbHtml;
            
            const navBtns = breadcrumbEl.querySelectorAll('.breadcrumb-btn');
            navBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const nav = this.getAttribute('data-nav');
                    if (nav === 'root') {
                        currentFolder = null;
                        currentPath = [];
                    } else {
                        const index = parseInt(nav);
                        currentPath = currentPath.slice(0, index + 1);
                        currentFolder = currentPath[currentPath.length - 1].id;
                    }
                    fetchData();
                });
            });
        }
    };
    
})(window.App);