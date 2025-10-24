// 📝 Activity Logger - บันทึกการทำงานทั้งหมด
// Include this in all admin pages: <script src="activity_logger.js"></script>

const ActivityLogger = {
    supabase: null,
    
    init(supabaseClient) {
        this.supabase = supabaseClient;
    },
    
    /**
     * บันทึก Activity
     * @param {string} action - การกระทำ เช่น 'approve_license', 'create_user'
     * @param {string} targetType - ประเภทของ target เช่น 'license', 'user'
     * @param {string} targetId - ID ของ target
     * @param {object} details - รายละเอียดเพิ่มเติม (optional)
     */
    async log(action, targetType = null, targetId = null, details = null) {
        try {
            const userId = sessionStorage.getItem('userId');
            const userEmail = sessionStorage.getItem('userEmail') || 'unknown@example.com';
            const userName = sessionStorage.getItem('userName') || 'Unknown User';
            
            const logEntry = {
                user_id: userId,
                user_email: userEmail,
                user_name: userName,
                action: action,
                target_type: targetType,
                target_id: targetId ? targetId.toString() : null,
                details: details,
                ip_address: await this.getIP(),
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('activity_logs')
                .insert(logEntry);
            
            if (error) {
                console.error('Failed to log activity:', error);
            } else {
                console.log('✅ Activity logged:', action);
            }
            
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },
    
    // ดึง IP Address (ถ้าต้องการ)
    async getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    },
    
    // Shortcuts สำหรับ actions ที่ใช้บ่อย
    async logLogin() {
        await this.log('login', null, null, { timestamp: new Date().toISOString() });
    },
    
    async logLogout() {
        await this.log('logout', null, null, { timestamp: new Date().toISOString() });
    },
    
    async logApproveLicense(licenseId, accountId) {
        await this.log('approve_license', 'license', licenseId, { account_id: accountId });
    },
    
    async logRejectLicense(licenseId, accountId, reason) {
        await this.log('reject_license', 'license', licenseId, { 
            account_id: accountId,
            reason: reason 
        });
    },
    
    async logCreateLicense(licenseId, accountId, days) {
        await this.log('create_license', 'license', licenseId, {
            account_id: accountId,
            duration_days: days
        });
    },
    
    async logRevokeLicense(licenseId, reason) {
        await this.log('revoke_license', 'license', licenseId, { reason: reason });
    },
    
    async logExtendLicense(licenseId, days) {
        await this.log('extend_license', 'license', licenseId, { 
            extension_days: days 
        });
    },
    
    async logCreateUser(userId, accountId) {
        await this.log('create_user', 'user', userId, { account_id: accountId });
    },
    
    async logUpdateUser(userId) {
        await this.log('update_user', 'user', userId);
    },
    
    async logDeleteUser(userId) {
        await this.log('delete_user', 'user', userId);
    },
    
    async logCreateTeamMember(adminUserId, role) {
        await this.log('create_team_member', 'admin_user', adminUserId, { role: role });
    },
    
    async logUpdateTeamMember(adminUserId, changes) {
        await this.log('update_team_member', 'admin_user', adminUserId, changes);
    },
    
    async logDeleteTeamMember(adminUserId) {
        await this.log('delete_team_member', 'admin_user', adminUserId);
    },
    
    async logChangePassword() {
        await this.log('change_password', 'admin_user', sessionStorage.getItem('userId'));
    },
    
    async logViewPage(pageName) {
        await this.log('view_page', 'page', null, { page: pageName });
    },
    
    async logExport(type, count) {
        await this.log('export_data', 'export', null, { 
            type: type, 
            record_count: count 
        });
    },
    
    async logSearch(query, resultCount) {
        await this.log('search', 'search', null, { 
            query: query, 
            results: resultCount 
        });
    }
};

// Usage Examples:
/*
// 1. Initialize in your page
ActivityLogger.init(supabase);

// 2. Log activities
await ActivityLogger.logLogin();
await ActivityLogger.logApproveLicense('license-id-123', 12345);
await ActivityLogger.logCreateUser('user-id-456', 67890);

// 3. Custom log
await ActivityLogger.log('custom_action', 'custom_type', 'custom-id', {
    custom_field: 'custom_value'
});
*/