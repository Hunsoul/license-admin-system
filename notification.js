// 🔔 Notification System - Shared across all admin pages
// Place this in a separate file and include in all pages

const NotificationSystem = {
    supabase: null,
    
    init(supabaseClient) {
        this.supabase = supabaseClient;
    },
    
    async loadAll() {
        try {
            const notifications = {
                pendingRequests: 0,
                pendingApprovals: 0,
                expiringSoon: 0
            };
            
            // Pending license requests
            const { count: requests } = await this.supabase
                .from('license_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            notifications.pendingRequests = requests || 0;
            
            // Pending approvals (only for admin/owner)
            const userRole = sessionStorage.getItem('userRole');
            if (userRole === 'admin' || userRole === 'owner') {
                const { count: approvals } = await this.supabase
                    .from('approval_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending');
                notifications.pendingApprovals = approvals || 0;
            }
            
            // Licenses expiring soon (within 7 days)
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            const now = new Date().toISOString();
            const { count: expiring } = await this.supabase
                .from('licenses')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true)
                .gte('expires_at', now)
                .lte('expires_at', sevenDaysFromNow.toISOString());
            notifications.expiringSoon = expiring || 0;
            
            return notifications;
        } catch (error) {
            console.error('❌ Error loading notifications:', error);
            return {
                pendingRequests: 0,
                pendingApprovals: 0,
                expiringSoon: 0
            };
        }
    },
    
    updateBadge(elementId, count) {
        const badge = document.getElementById(elementId);
        if (!badge) return;
        
        if (count && count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    },
    
    async updateAllBadges() {
        const notifications = await this.loadAll();
        
        // Update all badges
        this.updateBadge('requestsBadge', notifications.pendingRequests);
        this.updateBadge('approvalsBadge', notifications.pendingApprovals);
        
        // Update header badge (total)
        const total = notifications.pendingRequests + notifications.pendingApprovals;
        this.updateBadge('headerNotificationBadge', total);
        
        return notifications;
    },
    
    // Auto-refresh every 30 seconds
    startAutoRefresh(intervalMs = 30000) {
        setInterval(() => {
            this.updateAllBadges();
        }, intervalMs);
    }
};

// Usage example:
// NotificationSystem.init(supabase);
// await NotificationSystem.updateAllBadges();
// NotificationSystem.startAutoRefresh(); // Auto-refresh every 30s