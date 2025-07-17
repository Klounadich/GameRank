document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Ban user confirmation
    const banButtons = document.querySelectorAll('.btn-ban, .btn-ban-sm');
    banButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите забанить этого пользователя?')) {
                e.preventDefault();
            }
        });
    });
    
    // Unban user confirmation
    const unbanButtons = document.querySelectorAll('.btn-unban');
    unbanButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите разбанить этого пользователя?')) {
                e.preventDefault();
            }
        });
    });
    
    // Dismiss report confirmation
    const dismissButtons = document.querySelectorAll('.btn-dismiss');
    dismissButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите отклонить эту жалобу?')) {
                e.preventDefault();
            }
        });
    });
    
    // Remove role confirmation
    const removeRoleButtons = document.querySelectorAll('.btn-remove');
    removeRoleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Вы уверены, что хотите удалить эту роль?')) {
                e.preventDefault();
            }
        });
    });
    
    // Log filter functionality
    const logFilter = document.querySelector('.log-filters select');
    if (logFilter) {
        logFilter.addEventListener('change', function() {
            const filter = this.value;
            const logEntries = document.querySelectorAll('.log-entry');
            
            logEntries.forEach(entry => {
                if (filter === 'Все логи' || entry.classList.contains(`log-${filter.toLowerCase()}`)) {
                    entry.style.display = 'flex';
                } else {
                    entry.style.display = 'none';
                }
            });
        });
    }
});