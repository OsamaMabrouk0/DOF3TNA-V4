(function(App) {
    'use strict';
    
    let currentFolder = null;
    let currentPath = [];
    let allData = null;
    let previewCache = {};
    
    App.Pages.lectures = function() {
        const container = document.getElementById('lectures-container');
        const errorEl = document.getElementById('lectures-error');
        const breadcrumbEl = document.getElementById('lectures-breadcrumb');
        
        const statsContainer = document.getElementById('lectures-stats');
        if (statsContainer) {
            statsContainer.style.display = 'none';
        }
        
        currentFolder = null;
        currentPath = [];
        allData = null;
        previewCache = {};
        
        fetchData();
        
        function showSkeleton() {
            if (container) {
                container.innerHTML = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        ${Array(8).fill(0).map(() => `
                            <div class="glass-panel rounded-2xl p-5 h-full animate-pulse">
                                <div class="flex items-center gap-3 mb-4">
                                    <div class="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10"></div>
                                    <div class="flex-1 space-y-2">
                                        <div class="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                        <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-full mb-2"></div>
                                <div class="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3"></div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        function fetchData() {
            showSkeleton();
            if (errorEl) errorEl.classList.add('hidden');
            
            const folderId = currentFolder || App.GOOGLE_DRIVE.LECTURES_FOLDER_ID;
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=${App.GOOGLE_DRIVE.FIELDS}` +
                `&orderBy=folder,name`;
            
            const cacheKey = App.CACHE_KEYS.LECTURES_STRUCTURE + '_' + folderId;
            
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
                    console.error('Error fetching lectures:', error);
                    if (errorEl) errorEl.classList.remove('hidden');
                    container.innerHTML = '';
                });
        }
        
        function renderItems() {
            if (!container || !allData) return;
            
            if (allData.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full flex flex-col items-center justify-center py-20">
                        <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-pulse">
                            <i class="fa-solid fa-inbox text-4xl text-gray-400"></i>
                        </div>
                        <p class="text-gray-400 text-lg font-medium">لا توجد ملفات</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';
            
            allData.forEach(item => {
                const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                
                if (isFolder) {
                    html += renderFolderCard(item);
                } else {
                    html += renderFileCard(item);
                }
            });
            
            html += '</div>';
            container.innerHTML = html;
            
            const folderCards = container.querySelectorAll('.folder-card');
            folderCards.forEach(card => {
                card.addEventListener('click', function() {
                    const folderId = this.getAttribute('data-folder-id');
                    const folderName = this.getAttribute('data-folder-name');
                    currentFolder = folderId;
                    currentPath.push({ id: folderId, name: folderName });
                    fetchData();
                });
            });
            
            loadPDFPreviews();
            
            if (App.Effects && App.Effects.initScrollAnimations) {
                App.Effects.initScrollAnimations();
            }
        }
        
        function renderFolderCard(item) {
            return `
                <div class="folder-card group cursor-pointer" data-folder-id="${item.id}" data-folder-name="${item.name}">
                    <div class="glass-panel rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-blue-500/20 h-full relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 shadow-lg shadow-blue-500/20">
                                    <i class="fa-solid fa-folder text-2xl text-blue-400"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-bold text-sm group-hover:text-blue-500 dark:group-hover:text-blue-400 transition line-clamp-2 leading-tight">${item.name}</h3>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span class="flex items-center gap-1.5">
                                    <i class="fa-solid fa-folder-open"></i>
                                    مجلد
                                </span>
                                <div class="flex items-center gap-1 text-blue-400 group-hover:translate-x-1 transition-transform">
                                    <span class="text-[10px]">فتح</span>
                                    <i class="fa-solid fa-arrow-left text-xs"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function renderFileCard(item) {
            const isVideo = item.mimeType && item.mimeType.indexOf('video') > -1;
            const isPDF = item.mimeType && item.mimeType.indexOf('pdf') > -1;
            const icon = isVideo ? 'fa-circle-play' : (isPDF ? 'fa-file-pdf' : 'fa-file');
            const iconColor = isVideo ? 'text-red-500' : (isPDF ? 'text-blue-500' : 'text-purple-500');
            const bgGradient = isVideo ? 'from-red-500/20 to-pink-500/20' : (isPDF ? 'from-blue-500/20 to-cyan-500/20' : 'from-purple-500/20 to-indigo-500/20');
            
            return `
                <div class="file-card group">
                    <div class="glass-panel rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col border border-white/10 hover:border-blue-500/30">
                        <div class="h-40 bg-gradient-to-br ${bgGradient} flex items-center justify-center relative overflow-hidden pdf-preview-container" data-file-id="${item.id}" data-is-pdf="${isPDF}">
                            ${isPDF ? '<div class="pdf-preview-loader absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm"><i class="fa-solid fa-spinner animate-spin text-3xl text-blue-400"></i></div>' : ''}
                            <div class="pdf-preview-fallback">
                                <i class="fa-solid ${icon} text-5xl ${iconColor} opacity-40 group-hover:scale-110 transition-transform duration-500"></i>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div class="p-4 flex-1 flex flex-col">
                            <h3 class="font-bold text-sm mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition leading-tight">${item.name}</h3>
                            <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
                                <span class="flex items-center gap-1.5">
                                    <i class="fa-solid ${icon} ${iconColor}"></i>
                                    ${isVideo ? 'فيديو' : (isPDF ? 'PDF' : 'ملف')}
                                </span>
                                <span class="text-[10px]">${App.Utils.timeAgo(new Date(item.modifiedTime))}</span>
                            </div>
                            <div class="flex gap-2 mt-auto">
                                <button class="flex-1 px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 group/btn" onclick="window.open('${item.webViewLink}', '_blank')">
                                    <i class="fa-solid fa-eye text-xs group-hover/btn:scale-110 transition-transform"></i>
                                    عرض
                                </button>
                                ${item.webContentLink ? `
                                    <button class="px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500 hover:text-white text-green-500 text-xs font-medium transition-all duration-300 flex items-center justify-center group/btn" onclick="window.open('${item.webContentLink}', '_blank')">
                                        <i class="fa-solid fa-download text-xs group-hover/btn:scale-110 transition-transform"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        async function loadPDFPreviews() {
            const pdfContainers = container.querySelectorAll('.pdf-preview-container[data-is-pdf="true"]');
            
            pdfContainers.forEach(async (container) => {
                const fileId = container.getAttribute('data-file-id');
                const loader = container.querySelector('.pdf-preview-loader');
                const fallback = container.querySelector('.pdf-preview-fallback');
                
                try {
                    if (previewCache[fileId]) {
                        showPreview(container, previewCache[fileId], loader, fallback);
                        return;
                    }
                    
                    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
                    
                    const img = new Image();
                    img.onload = function() {
                        previewCache[fileId] = thumbnailUrl;
                        showPreview(container, thumbnailUrl, loader, fallback);
                    };
                    img.onerror = function() {
                        if (loader) loader.style.display = 'none';
                    };
                    img.src = thumbnailUrl;
                    
                } catch (error) {
                    console.error('Error loading PDF preview:', error);
                    if (loader) loader.style.display = 'none';
                }
            });
        }
        
        function showPreview(container, imageUrl, loader, fallback) {
            if (loader) loader.style.display = 'none';
            if (fallback) fallback.style.display = 'none';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'w-full h-full object-cover opacity-0 transition-opacity duration-500';
            img.style.opacity = '0';
            
            container.appendChild(img);
            
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        }
        
        function updateBreadcrumb() {
            if (!breadcrumbEl) return;
            
            let breadcrumbHtml = `
                <button class="breadcrumb-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all hover:scale-105" data-nav="root">
                    <i class="fa-solid fa-house ml-1"></i>المحاضرات
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