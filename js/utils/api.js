(function(App) {
    'use strict';
    
    App.API.sessionCache = {};
    
    App.API.fetchWithCache = function(url, cacheKey, forceRefresh) {
        return new Promise(function(resolve, reject) {
            if (!forceRefresh && App.API.sessionCache[cacheKey]) {
                resolve({
                    data: App.API.sessionCache[cacheKey],
                    fromCache: true,
                    fromSession: true
                });
                return;
            }
            
            const cached = App.Cache.get(cacheKey);
            if (!forceRefresh && cached && !navigator.onLine) {
                App.API.sessionCache[cacheKey] = cached;
                resolve({
                    data: cached,
                    fromCache: true,
                    fromSession: false
                });
                return;
            }
            
            if (navigator.onLine) {
                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error('Network error');
                        return response.json();
                    })
                    .then(data => {
                        App.API.sessionCache[cacheKey] = data;
                        
                        App.Cache.set(cacheKey, data);
                        
                        resolve({
                            data: data,
                            fromCache: false,
                            fromSession: false
                        });
                    })
                    .catch(error => {
                        console.error('❌ [API] Network error:', error);
                        if (cached) {
                            App.API.sessionCache[cacheKey] = cached;
                            resolve({
                                data: cached,
                                fromCache: true,
                                fromSession: false
                            });
                        } else {
                            reject(error);
                        }
                    });
            } else {
                if (cached) {
                    App.API.sessionCache[cacheKey] = cached;
                    resolve({
                        data: cached,
                        fromCache: true,
                        fromSession: false
                    });
                } else {
                    reject(new Error('No internet and no cache available'));
                }
            }
        });
    };
    
    App.API.clearSessionCache = function(pattern) {
        if (!pattern) {
            App.API.sessionCache = {};
            return;
        }
        
        Object.keys(App.API.sessionCache).forEach(function(key) {
            if (key.includes(pattern)) {
                delete App.API.sessionCache[key];
            }
        });
    };
    
    App.API.fetchAllFilesRecursive = function(folderId, source, forceRefresh) {
        const cacheKey = App.CACHE_KEYS.LECTURES_STRUCTURE + '_recursive_' + folderId;
        
        if (!forceRefresh && App.API.sessionCache[cacheKey]) {
            return Promise.resolve(App.API.sessionCache[cacheKey]);
        }
        
        const cached = App.Cache.get(cacheKey);
        if (!forceRefresh && cached) {
            App.API.sessionCache[cacheKey] = cached;
            return Promise.resolve(cached);
        }
        
        return new Promise(function(resolve, reject) {
            const url = `${App.GOOGLE_DRIVE.API_BASE_URL}/files?` +
                `q='${folderId}' in parents and trashed=false` +
                `&key=${App.GOOGLE_DRIVE.API_KEY}` +
                `&fields=files(id,name,mimeType,modifiedTime,webViewLink,size)` +
                `&orderBy=modifiedTime desc`;
            
            fetch(url)
                .then(r => r.json())
                .then(data => {
                    if (!data.files) {
                        resolve([]);
                        return;
                    }
                    
                    const folders = data.files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
                    const files = data.files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
                    
                    files.forEach(f => f.source = source);
                    
                    if (folders.length === 0) {
                        App.API.sessionCache[cacheKey] = files;
                        App.Cache.set(cacheKey, files);
                        resolve(files);
                        return;
                    }
                    
                    const subFolderPromises = folders.map(folder => 
                        App.API.fetchAllFilesRecursive(folder.id, source, forceRefresh)
                    );
                    
                    Promise.all(subFolderPromises)
                        .then(subResults => {
                            const allSubFiles = subResults.flat();
                            const allFiles = [...files, ...allSubFiles];
                            
                            App.API.sessionCache[cacheKey] = allFiles;
                            App.Cache.set(cacheKey, allFiles);
                            
                            resolve(allFiles);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    };
    
    App.API.calculateStats = function(files) {
        const stats = {
            total: 0,
            videos: 0,
            pdfs: 0,
            docs: 0,
            others: 0,
            totalSize: 0,
            folders: 0
        };
        
        files.forEach(function(file) {
            stats.total++;
            
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                stats.folders++;
            } else if (file.mimeType && file.mimeType.indexOf('video') > -1) {
                stats.videos++;
            } else if (file.mimeType && file.mimeType.indexOf('pdf') > -1) {
                stats.pdfs++;
            } else if (file.mimeType && (file.mimeType.indexOf('document') > -1 || file.mimeType.indexOf('word') > -1)) {
                stats.docs++;
            } else {
                stats.others++;
            }
            
            if (file.size) {
                stats.totalSize += parseInt(file.size);
            }
        });
        
        return stats;
    };
    
})(window.App);