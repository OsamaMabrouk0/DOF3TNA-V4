(function(App) {
    'use strict';
    
    App.Cache = {};
    
    const CACHE_KEYS = {
        LECTURES: 'cache_lectures',
        SUMMARIES: 'cache_summaries',
        NOTIFICATIONS: 'cache_notifications',
        STATS: 'cache_stats',
        RECENT_FILES: 'cache_recent_files',
        LECTURES_STRUCTURE: 'cache_lectures_structure',
        SUMMARIES_STRUCTURE: 'cache_summaries_structure'
    };
    
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    App.Cache.set = function(key, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            return true;
        } catch (e) {
            console.error('Error saving to cache:', e);
            return false;
        }
    };
    
    App.Cache.get = function(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;
            
            if (age > CACHE_DURATION) {
                localStorage.removeItem(key);
                return null;
            }
            
            return cacheData.data;
        } catch (e) {
            console.error('Error reading from cache:', e);
            return null;
        }
    };
    
    App.Cache.clear = function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error clearing cache:', e);
            return false;
        }
    };
    
    App.Cache.clearAll = function() {
        try {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Error clearing all cache:', e);
            return false;
        }
    };
    
    App.Cache.fetchWithCache = function(url, cacheKey) {
        return new Promise(function(resolve, reject) {
            const cached = App.Cache.get(cacheKey);
            if (cached && !navigator.onLine) {
                resolve({ data: cached, fromCache: true });
                return;
            }
            
            if (navigator.onLine) {
                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error('Network error');
                        return response.json();
                    })
                    .then(data => {
                        App.Cache.set(cacheKey, data);
                        resolve({ data: data, fromCache: false });
                    })
                    .catch(error => {
                        if (cached) {
                            resolve({ data: cached, fromCache: true });
                        } else {
                            reject(error);
                        }
                    });
            } else {
                if (cached) {
                    resolve({ data: cached, fromCache: true });
                } else {
                    reject(new Error('No internet and no cache available'));
                }
            }
        });
    };
    
    App.Cache.KEYS = CACHE_KEYS;
    
})(window.App);