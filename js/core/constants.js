(function(App) {
    'use strict';
    
    App.GOOGLE_DRIVE = {
        API_KEY: 'AIzaSyB7vGBBmmybGA_EvGsvdmhLz8qangORK0I',
        LECTURES_FOLDER_ID: '1HR4eNb0yAdus0aOtJYRs8LotClUoNFMG',
        SUMMARIES_FOLDER_ID: '1rMmhGxnRc--DBBzjqkVvZsQBafFws3ba',
        API_BASE_URL: 'https://www.googleapis.com/drive/v3',
        FIELDS: 'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,modifiedTime,description)'
    };
    
    App.GITHUB = {
        NOTIFICATIONS_URL: 'https://raw.githubusercontent.com/OsamaMabrouk0/notifications/main/notifications.json'
    };
    
    App.CACHE_KEYS = {
        LECTURES: 'cache_lectures',
        SUMMARIES: 'cache_summaries',
        NOTIFICATIONS: 'cache_notifications',
        STATS: 'cache_stats',
        RECENT_FILES: 'cache_recent_files',
        LECTURES_STRUCTURE: 'cache_lectures_structure',
        SUMMARIES_STRUCTURE: 'cache_summaries_structure',
        LECTURES_STATS: 'cache_lectures_stats',
        SUMMARIES_STATS: 'cache_summaries_stats'
    };
    
    App.CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    App.PAGES = [
        { 
            id: 'lectures', 
            title: 'المحاضرات', 
            icon: 'fa-solid fa-chalkboard-user', 
            color: 'text-blue-400', 
            bg: 'from-blue-500/20 to-blue-600/5',
            description: 'جميع المحاضرات والدروس'
        },
        { 
            id: 'summaries', 
            title: 'الملخصات', 
            icon: 'fa-solid fa-file-pen', 
            color: 'text-cyan-400', 
            bg: 'from-cyan-500/20 to-cyan-600/5',
            description: 'ملخصات شاملة للمواد'
        },
        { 
            id: 'videos', 
            title: 'الفيديوهات', 
            icon: 'fa-brands fa-youtube', 
            color: 'text-red-400', 
            bg: 'from-red-500/20 to-red-600/5',
            description: 'مكتبة الفيديوهات التعليمية'
        },
        { 
            id: 'links', 
            title: 'الروابط', 
            icon: 'fa-solid fa-link', 
            color: 'text-indigo-400', 
            bg: 'from-indigo-500/20 to-indigo-600/5',
            description: 'روابط مفيدة ومصادر إضافية'
        },
        { 
            id: 'schedules', 
            title: 'الجداول', 
            icon: 'fa-regular fa-calendar-days', 
            color: 'text-emerald-400', 
            bg: 'from-emerald-500/20 to-emerald-600/5',
            description: 'جداول المحاضرات والاختبارات'
        },
        { 
            id: 'buildings', 
            title: 'المباني', 
            icon: 'fa-solid fa-building-columns', 
            color: 'text-amber-400', 
            bg: 'from-amber-500/20 to-amber-600/5',
            description: 'مواقع المباني والقاعات'
        },
        { 
            id: 'notifications', 
            title: 'الاشعارات', 
            icon: 'fa-solid fa-bell', 
            color: 'text-rose-400', 
            bg: 'from-rose-500/20 to-rose-600/5',
            description: 'جميع الإشعارات والتنبيهات'
        },
        { 
            id: 'settings', 
            title: 'الاعدادات', 
            icon: 'fa-solid fa-gear', 
            color: 'text-slate-400', 
            bg: 'from-slate-500/20 to-slate-600/5',
            description: 'تخصيص التطبيق وإعداداته'
        }
    ];
    
    App.NOTIFICATIONS = [];
    
})(window.App);