(function(App) {
    'use strict';
    
    App.Pages.notifications = function() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        fullList.innerHTML = `
            <div class="space-y-4">
                <div class="skeleton h-24 rounded-2xl"></div>
                <div class="skeleton h-24 rounded-2xl"></div>
                <div class="skeleton h-24 rounded-2xl"></div>
            </div>
        `;
        
        App.API.fetchWithCache(
            App.GITHUB.NOTIFICATIONS_URL,
            App.CACHE_KEYS.NOTIFICATIONS,
            true
        ).then(function(result) {
            App.NOTIFICATIONS = result.data;
            
            loadReadStatus();
            
            renderNotificationsList();
            updateNotificationsBadge();
            
            if (result.fromCache) {
                App.Toast.info('البيانات محفوظة محلياً', 'غير متصل');
            }
        }).catch(function(error) {
            console.error('Error fetching notifications:', error);
            fullList.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-wifi-slash text-2xl text-gray-400"></i>
                    </div>
                    <p class="text-gray-400">لا يوجد اتصال بالإنترنت</p>
                </div>
            `;
        });
    };
    
    function loadReadStatus() {
        const readNotifs = localStorage.getItem('dof3atna_read_notifications');
        if (readNotifs) {
            const readIds = JSON.parse(readNotifs);
            App.NOTIFICATIONS.forEach(notif => {
                if (readIds.includes(notif.id || notif.title)) {
                    notif.read = true;
                    notif.status = 'read';
                }
            });
        }
    }
    
    function saveReadStatus() {
        const readIds = App.NOTIFICATIONS
            .filter(n => n.read || n.status === 'read')
            .map(n => n.id || n.title);
        localStorage.setItem('dof3atna_read_notifications', JSON.stringify(readIds));
    }
    
    function renderNotificationsList() {
        const fullList = document.getElementById('notifications-full-list');
        if (!fullList) return;
        
        if (App.NOTIFICATIONS.length === 0) {
            fullList.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-bell-slash text-3xl text-gray-400"></i>
                    </div>
                    <p class="text-gray-400 text-lg font-medium">لا توجد إشعارات</p>
                </div>
            `;
            return;
        }
        
        let notifHtml = '';
        
        App.NOTIFICATIONS.forEach(function(notif, index) {
            const isUnread = !notif.read && notif.status !== 'read';
            const isNew = notif.status === 'new';
            const isUpdated = notif.status === 'updated';
            
            notifHtml += `
                <div class="glass-panel rounded-2xl p-5 flex items-start gap-4 hover:shadow-lg transition cursor-pointer scroll-animate ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800' : ''}" onclick="markAsRead(${index})">
                    <div class="w-12 h-12 rounded-xl bg-${notif.color.replace('text-', '')}/10 flex items-center justify-center flex-shrink-0">
                        <i class="fa-solid ${notif.icon} text-lg ${notif.color}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <h3 class="font-bold text-base flex-1">${notif.title}</h3>
                            <div class="flex items-center gap-2 flex-shrink-0">
                                ${isNew ? '<span class="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full border border-green-500/20 font-bold">🆕 جديد</span>' : ''}
                                ${isUpdated ? '<span class="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full border border-blue-500/20 font-bold">🔄 معدّل</span>' : ''}
                                ${isUnread && !isNew && !isUpdated ? '<span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>' : ''}
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">${notif.message}</p>
                        <div class="flex items-center justify-between">
                            <p class="text-xs text-gray-400">
                                <i class="fa-regular fa-clock ml-1"></i>${notif.time}
                            </p>
                            ${!isUnread ? '<span class="text-xs text-gray-400"><i class="fa-solid fa-check-double ml-1 text-blue-400"></i>مقروء</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        fullList.innerHTML = notifHtml;
        
        const markAllBtn = document.getElementById('mark-all-read');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', function() {
                markAllAsRead();
            });
        }
        
        if (App.Effects && App.Effects.initScrollAnimations) {
            App.Effects.initScrollAnimations();
        }
    }
    
    window.markAsRead = function(index) {
        if (App.NOTIFICATIONS[index]) {
            App.NOTIFICATIONS[index].read = true;
            App.NOTIFICATIONS[index].status = 'read';
            saveReadStatus();
            renderNotificationsList();
            updateNotificationsBadge();
        }
    };
    
    function markAllAsRead() {
        App.NOTIFICATIONS.forEach(function(notif) {
            notif.read = true;
            notif.status = 'read';
        });
        
        saveReadStatus();
        
        App.Toast.success('تم تحديد جميع الإشعارات كمقروءة');
        renderNotificationsList();
        updateNotificationsBadge();
    }
    
    function updateNotificationsBadge() {
        const notifBtn = document.getElementById('notif-btn');
        if (!notifBtn) return;
        
        const unreadCount = App.NOTIFICATIONS.filter(n => !n.read && n.status !== 'read').length;
        let badge = notifBtn.querySelector('.animate-pulse');
        
        if (unreadCount > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--bg-main)] animate-pulse';
                notifBtn.appendChild(badge);
            }
            
            if (unreadCount > 1) {
                let counter = notifBtn.querySelector('.notification-counter');
                if (!counter) {
                    counter = document.createElement('span');
                    counter.className = 'notification-counter absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-[var(--bg-main)]';
                    notifBtn.appendChild(counter);
                }
                counter.textContent = unreadCount > 9 ? '9+' : unreadCount;
            }
        } else {
            if (badge) badge.remove();
            const counter = notifBtn.querySelector('.notification-counter');
            if (counter) counter.remove();
        }
    }
    
    App.Pages.updateNotificationsBadge = updateNotificationsBadge;
    App.Pages.renderNotificationsList = renderNotificationsList;
    
})(window.App);