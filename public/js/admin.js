import { apiCall } from './api.js';

// DOM Elements
const loginView = document.getElementById('loginView');
const appView = document.getElementById('appView');
const loginForm = document.getElementById('loginForm');
const navItems = document.querySelectorAll('.nav-item');

window.ui = {
    showDialog: function (title, message, type = 'alert', defaultInputValue = '', options = []) {
        return new Promise((resolve) => {
            const modal = document.getElementById('modal-dialog');
            document.getElementById('dialog-title').innerText = title;
            document.getElementById('dialog-message').innerText = message;

            const btnCancel = document.getElementById('dialog-btn-cancel');
            const btnOk = document.getElementById('dialog-btn-ok');
            const inputField = document.getElementById('dialog-input');

            if (type === 'confirm' || type === 'prompt') {
                btnCancel.classList.remove('hidden');
            } else {
                btnCancel.classList.add('hidden');
            }

            const optionsContainer = document.getElementById('dialog-options');
            if (options && options.length > 0) {
                optionsContainer.classList.remove('hidden');
                optionsContainer.innerHTML = '';
                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'badge badge-pending';
                    btn.style.cursor = 'pointer';
                    btn.style.border = 'none';
                    btn.style.padding = '0.5rem 1rem';
                    btn.innerText = opt;
                    btn.onclick = () => { inputField.value = opt; };
                    optionsContainer.appendChild(btn);
                });
            } else {
                optionsContainer.classList.add('hidden');
            }

            if (type === 'prompt') {
                inputField.classList.remove('hidden');
                inputField.value = defaultInputValue;
            } else {
                inputField.classList.add('hidden');
            }

            modal.classList.add('active');

            if (type === 'prompt') inputField.focus();
            else btnOk.focus();

            const cleanup = () => {
                modal.classList.remove('active');
                btnOk.onclick = null;
                btnCancel.onclick = null;
            };

            btnOk.onclick = () => {
                cleanup();
                if (type === 'prompt') resolve(inputField.value);
                else resolve(true);
            };

            btnCancel.onclick = () => {
                cleanup();
                resolve(false);
            };
        });
    },
    alert: (msg) => window.ui.showDialog(t('dialog_title_alert'), msg, 'alert'),
    confirm: (msg) => window.ui.showDialog(t('dialog_title_confirm'), msg, 'confirm'),
    prompt: (msg, defaultVal, options = []) => window.ui.showDialog(t('dialog_title_prompt'), msg, 'prompt', defaultVal, options)
};

async function checkSession() {
    try {
        const res = await apiCall('/auth/session');
        if (res.valid) {
            loginView.classList.add('hidden');
            appView.classList.remove('hidden');
            loadView('dashboard');
        } else {
            showLogin();
        }
    } catch (e) {
        showLogin();
    }
}

function showLogin() {
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('adminPassword').value;
    try {
        await apiCall('/auth/login', 'POST', { password: pw });
        loginView.classList.add('hidden');
        appView.classList.remove('hidden');
        loadView('dashboard');
    } catch (e) {
        document.getElementById('loginError').innerText = t('msg_invalid_pwd');
    }
});

document.getElementById('btnLogout').addEventListener('click', async () => {
    await apiCall('/auth/logout', 'POST');
    showLogin();
});

let settingsData = { reminders_enabled: 1, reminder_days: '7,3,1,0,-2,-4' };

document.getElementById('btnRunReminders').addEventListener('click', async () => {
    try {
        const res = await apiCall('/settings');
        if (res.data) settingsData = res.data;
    } catch (e) { console.error('Could not fetch settings', e); }

    const days = settingsData.reminder_days || '7,3,1,0,-2,-4';
    if (!(await window.ui.confirm(t('msg_run_reminders') + days + '?'))) return;
    try {
        const res = await apiCall('/reminders', 'POST');
        await window.ui.alert(t('msg_sent_emails').replace('{0}', res.data.sent).replace('{1}', res.data.errors));
    } catch (e) {
        await window.ui.alert(t('msg_error') + e.message);
    }
});

// Mobile Sidebar Toggle
const btnMobileMenu = document.getElementById('btnMobileMenu');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function toggleSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    }
}

if (btnMobileMenu) {
    btnMobileMenu.addEventListener('click', toggleSidebar);
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', toggleSidebar);
}

// Routing
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const view = item.getAttribute('data-view');
        loadView(view);

        // Close sidebar on mobile after navigating
        if (sidebar && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });
});




async function loadView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');

    try {
        if (view === 'dashboard') await loadDashboard();
        if (view === 'plans') await loadPlans();
        if (view === 'members') await loadMembers();
        if (view === 'subscriptions') await loadSubscriptions();
        if (view === 'payments') await loadPayments();
        if (view === 'history') await loadHistory();
        if (view === 'expenses') await loadExpenses();
        if (view === 'settings') await loadSettings();
    } catch (e) {
        console.error(e);
        await window.ui.alert(t('msg_err_loading') + t('nav_' + view));
    }
}

async function loadDashboard() {
    const res = await apiCall('/dashboard');
    document.getElementById('stat-plans').innerText = res.data.activePlans;
    document.getElementById('stat-members').innerText = res.data.activeMembers;
    document.getElementById('stat-due').innerText = res.data.dueSoonSubscriptions;
    document.getElementById('stat-pending').innerText = res.data.pendingPayments;

    const budget = res.data.budget;
    document.getElementById('stat-cost').innerText = formatCurrency(budget.monthlyCost);
    document.getElementById('stat-actual-cost').innerText = formatCurrency(budget.actualMonthlyCost);
    document.getElementById('stat-revenue').innerText = formatCurrency(budget.monthlyRevenue);

    const profitEl = document.getElementById('stat-profit');
    profitEl.innerText = formatCurrency(budget.netProfit);
    profitEl.style.color = budget.netProfit >= 0 ? 'var(--success)' : 'var(--danger)';

    const actualProfitEl = document.getElementById('stat-actual-profit');
    actualProfitEl.innerText = formatCurrency(budget.actualNetProfit);
    actualProfitEl.style.color = budget.actualNetProfit >= 0 ? 'var(--success)' : 'var(--danger)';

    // Populate overdue list
    const tbodyOverdue = document.querySelector('#table-dashboard-overdue tbody');
    tbodyOverdue.innerHTML = '';
    if (res.data.overdueList && res.data.overdueList.length === 0) {
        tbodyOverdue.innerHTML = `<tr><td colspan=\"4\" style=\"text-align:center; padding: 2rem;\">${t('msg_no_overdue')}</td></tr>`;
    } else if (res.data.overdueList) {
        res.data.overdueList.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.member_name}</td>
                <td>${item.plan_name}</td>
                <td style="color: var(--danger); font-weight: bold;">${formatDate(item.next_due_date)}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-primary" onclick="adminApp.copyPortalLink('${item.user_token}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Copy Link"><i class="ph ph-link"></i></button>
                        <button class="btn btn-success" onclick="adminApp.markPaid('${item.id}', ${item.amount_due})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Mark Paid"><i class="ph ph-check"></i></button>
                    </div>
                </td>
            `;
            tbodyOverdue.appendChild(tr);
        });
    }

    // Populate due soon list
    const tbodyDue = document.querySelector('#table-dashboard-duesoon tbody');
    tbodyDue.innerHTML = '';
    if (res.data.dueSoonList && res.data.dueSoonList.length === 0) {
        tbodyDue.innerHTML = `<tr><td colspan=\"4\" style=\"text-align:center; padding: 2rem;\">${t('msg_no_upcoming')}</td></tr>`;
    } else if (res.data.dueSoonList) {
        res.data.dueSoonList.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.member_name}</td>
                <td>${item.plan_name}</td>
                <td style="color: var(--warning); font-weight: bold;">${formatDate(item.next_due_date)}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem;">
                        <button class="btn btn-primary" onclick="adminApp.copyPortalLink('${item.user_token}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Copy Link"><i class="ph ph-link"></i></button>
                        <button class="btn btn-success" onclick="adminApp.markPaid('${item.id}', ${item.amount_due})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Mark Paid"><i class="ph ph-check"></i></button>
                    </div>
                </td>
            `;
            tbodyDue.appendChild(tr);
        });
    }

    // Cancel Pending List
    const tbodyCancelPending = document.querySelector('#table-dashboard-cancel-pending tbody');
    if (tbodyCancelPending) {
        tbodyCancelPending.innerHTML = '';
        if (res.data.cancelPendingList && res.data.cancelPendingList.length === 0) {
            tbodyCancelPending.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">${t('msg_no_data') || 'No data'}</td></tr>`;
        } else if (res.data.cancelPendingList) {
            res.data.cancelPendingList.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.member_name}</td>
                    <td>${item.plan_name}</td>
                    <td style="color: var(--secondary); font-weight: bold;">${formatDate(item.next_due_date)}</td>
                    <td>
                        <div style="display: flex; gap: 0.25rem;">
                            <button class="btn btn-primary" onclick="adminApp.copyPortalLink('${item.user_token}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Copy Link"><i class="ph ph-link"></i></button>
                            <button class="btn btn-primary" onclick="adminApp.editSub('${item.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        </div>
                    </td>
                `;
                tbodyCancelPending.appendChild(tr);
            });
        }
    }

    // Populate plan utilization
    let totalEmptySlots = 0;
    const tbodyUtil = document.querySelector('#table-dashboard-utilization tbody');
    tbodyUtil.innerHTML = '';
    if (res.data.planUtilList) {
        res.data.planUtilList.forEach((item, index) => {
            const tr = document.createElement('tr');
            const max = item.max_slots || 0;
            const used = item.used_slots || 0;
            let progressHtml = '';
            let slotText = '';

            if (max === 0) {
                slotText = `${used} / ∞`;
                progressHtml = `<div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="flex-grow: 1; background: #2a2d3e; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: 100%; background: var(--primary); height: 100%;"></div>
                                    </div>
                                    <span style="font-size: 0.8rem; width: 40px; color: #8892b0;">-</span>
                                </div>`;
            } else {
                slotText = `${used} / ${max}`;
                const percent = Math.min(100, Math.round((used / max) * 100));
                let color = 'var(--success)';
                if (percent >= 100) color = 'var(--danger)';
                else if (percent >= 80) color = 'var(--warning)';

                progressHtml = `<div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="flex-grow: 1; background: #2a2d3e; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${percent}%; background: ${color}; height: 100%;"></div>
                                    </div>
                                    <span style="font-size: 0.8rem; width: 40px; color: #8892b0;">${percent}%</span>
                                </div>`;
            }
            if (max > 0) {
                totalEmptySlots += Math.max(0, max - used);
            }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><a href="#" onclick="window.adminApp.filterSubByPlan('${item.name.replace(/'/g, "\\'")}')">${item.name}</a></td>
                <td>${slotText}</td>
                <td style="width: 40%;">${progressHtml}</td>
            `;
            tbodyUtil.appendChild(tr);
        });
    }
    const emptySlotsEl = document.getElementById('stat-empty-slots');
    if (emptySlotsEl) emptySlotsEl.innerText = totalEmptySlots;

    // Populate pending payments
    const pendingSection = document.getElementById('dashboard-pending-section');
    const tbodyPending = document.querySelector('#table-dashboard-pending tbody');
    if (res.data.pendingList && res.data.pendingList.length > 0) {
        pendingSection.classList.remove('hidden');
        tbodyPending.innerHTML = '';
        res.data.pendingList.forEach((req, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${req.member_name}</td>
                <td>${req.plan_name}</td>
                <td>${formatCurrency(req.amount)}</td>
                <td>${formatDate(req.created_at)}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-success" onclick="adminApp.approvePayment('${req.id}', ${req.amount})" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Approve"><i class="ph ph-check"></i></button>
                        <button class="btn btn-danger" onclick="adminApp.rejectPayment('${req.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Reject"><i class="ph ph-x"></i></button>
                    </div>
                </td>
            `;
            tbodyPending.appendChild(tr);
        });
    } else {
        pendingSection.classList.add('hidden');
    }

    // Populate recent payments
    const tbodyRecent = document.querySelector('#table-dashboard-recent tbody');
    if (tbodyRecent) {
        tbodyRecent.innerHTML = '';
        if (res.data.recentPayments && res.data.recentPayments.length === 0) {
            tbodyRecent.innerHTML = `<tr><td colspan=\"4\" style=\"text-align:center; padding: 2rem;\">${t('msg_no_recent')}</td></tr>`;
        } else if (res.data.recentPayments) {
            res.data.recentPayments.forEach((req, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${req.member_name}</td>
                    <td>${req.plan_name}</td>
                    <td style="color: var(--success); font-weight: bold;">+${formatCurrency(req.amount)}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(req.processed_at)}</td>
                `;
                tbodyRecent.appendChild(tr);
            });
        }
    }

    // Render Revenue Chart
    const chartCtx = document.getElementById('revenueChart');
    if (chartCtx && res.data.revenueChart && typeof Chart !== 'undefined') {
        if (window.revenueChartInstance) {
            window.revenueChartInstance.destroy();
        }
        const labels = res.data.revenueChart.map(d => {
            const parts = d.month.split('-');
            return parts.length === 2 ? `${parts[1]}/${parts[0]}` : d.month;
        });
        const data = res.data.revenueChart.map(d => d.revenue);

        window.revenueChartInstance = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (VND)',
                    data: data,
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
}

// Global data stores for easy edit access
let plansData = [];
let membersData = [];
let subsData = [];

async function loadSettings() {
    const res = await apiCall('/settings');
    if (res.data) settingsData = res.data;

    document.getElementById('setting-reminders-enabled').checked = settingsData.reminders_enabled === 1;
    document.getElementById('setting-reminder-days').value = settingsData.reminder_days || '7,3,1,0,-2,-4';
    document.getElementById('setting-telegram-enabled').checked = settingsData.telegram_notifications_enabled === 1;
    document.getElementById('setting-telegram-bot-token').value = settingsData.telegram_bot_token || '';
    document.getElementById('setting-telegram-chat-id').value = settingsData.telegram_chat_id || '';
    document.getElementById('setting-telegram-topic-id').value = settingsData.telegram_topic_id || '';

    document.getElementById('setting-admin-email-enabled').checked = settingsData.admin_email_notifications_enabled === 1;
    document.getElementById('setting-admin-email-to').value = settingsData.admin_email_notification_to || '';
    document.getElementById('setting-admin-email-cc').value = settingsData.admin_email_notification_cc || '';
    document.getElementById('setting-admin-email-bcc').value = settingsData.admin_email_notification_bcc || '';

    document.getElementById('setting-bank-id').value = settingsData.bank_id || '';
    document.getElementById('setting-bank-account-number').value = settingsData.bank_account_number || '';
    document.getElementById('setting-bank-account-name').value = settingsData.bank_account_name || '';
    
    document.getElementById('setting-alt-bank-id').value = settingsData.alt_bank_id || '';
    document.getElementById('setting-alt-bank-account-number').value = settingsData.alt_bank_account_number || '';
    document.getElementById('setting-alt-bank-account-name').value = settingsData.alt_bank_account_name || '';
    
    document.getElementById('setting-allow-user-cancel').checked = settingsData.allow_user_cancel === 1;

    document.getElementById('setting-customer-language').value = settingsData.customer_language || 'vi';
    document.getElementById('setting-admin-language').value = settingsData.admin_language || 'vi';

    document.getElementById('admin-contacts-container').innerHTML = '';
    let contacts = [];
    try {
        if (settingsData.admin_contacts) {
            contacts = typeof settingsData.admin_contacts === 'string' ? JSON.parse(settingsData.admin_contacts) : settingsData.admin_contacts;
        }
    } catch (e) {}
    if (!contacts || contacts.length === 0) {
        adminApp.addAdminContactRow();
    } else {
        contacts.forEach(c => adminApp.addAdminContactRow(c));
    }

    if (!window.bankSelectInitialized) {
        initBankSelect();
        window.bankSelectInitialized = true;
    } else {
        updateBankTriggerDisplay('bank');
        updateBankTriggerDisplay('alt-bank');
    }
}

async function loadExpenses() {
    const res = await apiCall('/expenses');
    const tbody = document.getElementById('expense-list');
    tbody.innerHTML = '';
    if (!res.data || res.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">${t('msg_no_expense')}</td></tr>`;
        return;
    }
    res.data.forEach((e, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(e.expense_date)}</td>
            <td>${e.description}</td>
            <td style="color: var(--danger); font-weight: bold;">-${formatCurrency(e.amount)}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" onclick='adminApp.editExpense(${JSON.stringify(e).replace(/'/g, "&apos;")})' style="padding: 0.25rem 0.5rem;"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn btn-danger" onclick="adminApp.deleteExpense('${e.id}')" style="padding: 0.25rem 0.5rem;"><i class="ph ph-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadPlans() {
    const res = await apiCall('/plans');
    plansData = res.data;
    if (subsData.length === 0) {
        const resSubs = await apiCall('/subscriptions');
        subsData = resSubs.data || [];
    }
    const tbody = document.getElementById('plan-list');
    tbody.innerHTML = '';
    if (!plansData || plansData.length === 0) {
        tbody.innerHTML = `<tr><td colspan=\"10\" style=\"text-align: center; padding: 2rem;\">${t('msg_no_data') || 'No data'}</td></tr>`;
        return;
    }
    plansData.forEach((p, index) => {
        const usedSlots = subsData.filter(s => s.plan_id === p.id && s.status !== 'paused').length;
        const maxSlots = p.max_slots || 0;
        const slotsDisplay = maxSlots > 0 ? `${usedSlots}/${maxSlots}` : `${usedSlots}/∞`;
        const slotsHtml = usedSlots > 0
            ? `<a href="#" onclick="window.adminApp.filterSubByPlan('${p.name.replace(/'/g, "\\'")}')">${slotsDisplay}</a>`
            : slotsDisplay;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><code>${p.id}</code></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${formatCurrency(p.total_price)}</td>
            <td>${p.renewal_cycle_months}</td>
            <td>${slotsHtml}</td>
            <td>${p.active ? 'Active' : 'Inactive'}</td>
            <td>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn btn-primary" onclick="adminApp.editPlan('${p.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn btn-danger" onclick="adminApp.deletePlan('${p.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const searchInput = document.getElementById('search-plan');
    if (searchInput && searchInput.value) {
        searchInput.dispatchEvent(new Event('keyup'));
    }
}

async function loadMembers() {
    const res = await apiCall('/members');
    membersData = res.data;
    const tbody = document.getElementById('member-list');
    tbody.innerHTML = '';
    if (!membersData || membersData.length === 0) {
        tbody.innerHTML = `<tr><td colspan=\"10\" style=\"text-align: center; padding: 2rem;\">${t('msg_no_data') || 'No data'}</td></tr>`;
        return;
    }
    membersData.forEach((m, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><code>${m.id}</code></td>
            <td>${m.full_name}</td>
            <td>${m.email}</td>
            <td>${m.phone || '-'}</td>
            <td>${m.note || '-'}</td>
            <td>${m.active ? 'Active' : 'Inactive'}</td>
            <td>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn btn-primary" onclick="adminApp.editMember('${m.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn btn-danger" onclick="adminApp.deleteMember('${m.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const searchInput = document.getElementById('search-member');
    if (searchInput && searchInput.value) {
        searchInput.dispatchEvent(new Event('keyup'));
    }
}

async function loadSubscriptions() {
    const res = await apiCall('/subscriptions');
    subsData = res.data;
    const tbody = document.getElementById('sub-list');
    tbody.innerHTML = '';
    if (!subsData || subsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan=\"10\" style=\"text-align: center; padding: 2rem;\">${t('msg_no_data') || 'No data'}</td></tr>`;
        return;
    }
    subsData.forEach((sub, index) => {
        const link = `${window.location.origin}/portal.html?token=${sub.user_token}`;
        const tr = document.createElement('tr');
        tr.setAttribute('data-status', sub.status);
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${sub.member_name}</td>
            <td>${sub.plan_name}</td>
            <td>${formatDate(sub.next_due_date)}</td>
            <td>${formatCurrency(sub.amount_due)}</td>
            <td>${sub.billing_cycle_months}</td>
            <td><span class="badge ${sub.status === 'active' ? 'badge-active' : 'badge-pending'}">${sub.status}</span></td>
            <td><a href="${link}" target="_blank" style="font-size: 0.8rem">Portal</a></td>
            <td>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn btn-primary" onclick="adminApp.editSub('${sub.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn btn-danger" onclick="adminApp.deleteSub('${sub.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const searchInput = document.getElementById('search-sub');
    const filterStatus = document.getElementById('filter-sub-status');
    const applyFilter = () => {
        if (searchInput) searchInput.dispatchEvent(new Event('keyup'));
    };
    if (searchInput && searchInput.value) {
        applyFilter();
    }
    if (filterStatus) {
        // Prevent multiple listeners if re-rendered
        filterStatus.removeEventListener('change', applyFilter);
        filterStatus.addEventListener('change', applyFilter);
    }
}

async function loadPayments() {
    const res = await apiCall('/payments');
    const tbody = document.getElementById('payment-list');
    tbody.innerHTML = '';
    if (!res.data || res.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan=\"10\" style=\"text-align: center; padding: 2rem;\">${t('msg_no_data') || 'No data'}</td></tr>`;
        return;
    }
    res.data.forEach((req, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${req.member_name}</td>
            <td>${req.plan_name}</td>
            <td>${formatCurrency(req.amount)}</td>
            <td>${req.user_note || ''}</td>
            <td>${formatDate(req.created_at)}</td>
            <td>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn btn-success" onclick="adminApp.approvePayment('${req.id}', ${req.amount})">Approve</button>
                    <button class="btn btn-danger" onclick="adminApp.rejectPayment('${req.id}')">Reject</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadHistory() {
    const res = await apiCall('/history');
    const tbody = document.getElementById('history-list');
    tbody.innerHTML = '';

    if (!res.data || res.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">${t('hist_empty')}</td></tr>`;
        return;
    }

    res.data.forEach((p, index) => {
        const tr = document.createElement('tr');
        const dateObj = p.approved_at ? new Date(p.approved_at + 'Z') : new Date(p.created_at + 'Z');
        const dateStr = formatDate(dateObj);

        let statusBadge = '';
        if (p.status === 'approved') statusBadge = `<span class="badge badge-success" style="background-color: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${t('status_approved')}</span>`;
        else if (p.status === 'rejected') statusBadge = `<span class="badge badge-danger" style="background-color: var(--danger); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${t('status_rejected')}</span>`;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${dateStr}</td>
            <td><strong>${p.member_name}</strong></td>
            <td>${p.plan_name}</td>
            <td><strong style="color: var(--success);">${formatCurrency(p.amount)}</strong></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm" style="background-color: var(--danger); color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;" onclick="window.adminApp.undoPayment('${p.id}')"><i class="ph ph-arrow-counter-clockwise"></i> Undo</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Helper to populate select dropdowns for Subscriptions
async function populateSubSelects(currentSubId = null) {
    if (plansData.length === 0) {
        const res = await apiCall('/plans');
        plansData = res.data;
    }
    if (membersData.length === 0) {
        const res = await apiCall('/members');
        membersData = res.data;
    }

    if (subsData.length === 0) {
        const resSubs = await apiCall('/subscriptions');
        subsData = resSubs.data || [];
    }

    const memberSelect = document.getElementById('sub-member');
    memberSelect.innerHTML = `<option value=\"\">${t('lbl_choose_member')}</option>`;
    membersData.forEach(m => {
        if (m.active) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.innerText = m.full_name;
            memberSelect.appendChild(opt);
        }
    });

    const planSelect = document.getElementById('sub-plan');
    planSelect.innerHTML = `<option value=\"\">${t('lbl_choose_plan')}</option>`;
    plansData.forEach(p => {
        if (p.active) {
            const usedSlots = subsData.filter(s => s.plan_id === p.id && s.status !== 'paused' && s.id !== currentSubId).length;
            const maxSlots = p.max_slots || 0;
            const opt = document.createElement('option');
            opt.value = p.id;

            if (maxSlots > 0) {
                const remaining = maxSlots - usedSlots;
                opt.innerText = `${p.name} (${formatCurrency(p.total_price)})${t('txt_plan_slots_left')} ${remaining}`;
                if (remaining <= 0) {
                    opt.disabled = true;
                    opt.innerText = `${p.name} ${t('txt_plan_full')}`;
                }
            } else {
                opt.innerText = `${p.name} (${formatCurrency(p.total_price)})${t('txt_plan_unlimited')}`;
            }
                planSelect.appendChild(opt);
        }
    });
}

// Global actions & modals
window.adminApp = {
    exportData: (type) => {
        window.location.href = `/api/export?type=${type}`;
    },
    addAdminContactRow: (contact = { type: 'phone', value: '' }) => {
        const container = document.getElementById('admin-contacts-container');
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.style.alignItems = 'center';
        row.className = 'contact-row';
        
        row.innerHTML = `
            <select class="form-control contact-type" style="width: 150px; flex-shrink: 0;" onchange="this.nextElementSibling.style.display = this.value === 'other' ? 'block' : 'none'">
                <option value="phone" ${contact.type === 'phone' ? 'selected' : ''}>📞 SĐT/Zalo</option>
                <option value="email" ${contact.type === 'email' ? 'selected' : ''}>📧 Email</option>
                <option value="facebook" ${contact.type === 'facebook' ? 'selected' : ''}>🌐 Facebook</option>
                <option value="telegram" ${contact.type === 'telegram' ? 'selected' : ''}>💬 Telegram</option>
                <option value="website" ${contact.type === 'website' ? 'selected' : ''}>🌍 Website</option>
                <option value="other" ${contact.type === 'other' ? 'selected' : ''}>📝 Khác</option>
            </select>
            <input type="text" class="form-control contact-label" placeholder="Tên nền tảng..." value="${contact.label || ''}" style="width: 120px; flex-shrink: 0; display: ${contact.type === 'other' ? 'block' : 'none'};">
            <input type="text" class="form-control contact-display-name" placeholder="Tên hiển thị (Tùy chọn)..." value="${contact.display_name || ''}" style="width: 150px; flex-shrink: 0;">
            <input type="text" class="form-control contact-value" placeholder="Nhập thông tin liên hệ..." value="${contact.value}" style="flex: 1;">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 0.5rem; flex-shrink: 0;"><i class="ph ph-trash"></i></button>
        `;
        container.appendChild(row);
    },
    sendTestNotification: async () => {
        const type = document.getElementById('test-notification-type').value;
        const lang = document.getElementById('test-notification-lang').value;
        const email = document.getElementById('test-notification-email').value;
        
        if (!email) {
            window.ui.alert(t('msg_test_email_req') || "Vui lòng nhập email nhận test!");
            return;
        }

        const btn = document.getElementById('btn-test-notification');
        const oldText = btn.innerText;
        btn.innerText = t('btn_sending') || "Đang gửi...";
        btn.disabled = true;

        try {
            await apiCall('/test-notification', 'POST', {
                template: type,
                lang: lang,
                test_email: email
            });
            window.ui.alert(t('msg_test_success') || "Đã gửi thông báo test thành công! Hãy kiểm tra Email (và Telegram nếu có cấu hình).");
        } catch (e) {
            window.ui.alert((t('msg_test_err') || "Lỗi gửi test: ") + e.message);
        } finally {
            btn.innerText = oldText;
            btn.disabled = false;
        }
    },
    openExpenseModal: () => {
        document.getElementById('form-expense').reset();
        document.getElementById('expense-id').value = '';
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('expense-modal-title').innerText = t('modal_add_expense');
        document.getElementById('modal-expense').classList.add('active');
    },
    editExpense: (e) => {
        document.getElementById('expense-id').value = e.id;
        document.getElementById('expense-date').value = e.expense_date;
        document.getElementById('expense-desc').value = e.description;
        document.getElementById('expense-amount').value = e.amount;
        document.getElementById('expense-modal-title').innerText = t('modal_edit_expense');
        document.getElementById('modal-expense').classList.add('active');
    },
    deleteExpense: async (id) => {
        if (!await window.ui.confirm(t('msg_confirm_delete'))) return;
        try {
            await apiCall('/expenses?id=' + id, 'DELETE');
            await loadExpenses();
        } catch (e) { await window.ui.alert(e.message); }
    },
    undoPayment: async (id) => {
        if (!await window.ui.confirm(t('msg_confirm_undo'))) return;
        try {
            await apiCall('/history?id=' + id, 'DELETE');
            await window.ui.alert(t('msg_save_success'));
            await loadHistory();
        } catch (e) {
            await window.ui.alert(e.message);
        }
    },
    copyPortalLink: async (token) => {
        const link = `${window.location.origin}/portal.html?token=${token}`;
        try {
            await navigator.clipboard.writeText(link);
            window.ui.alert(t('msg_link_copied'));
        } catch (e) {
            window.ui.prompt(t('msg_prompt_copy'), link);
        }
    },

    markPaid: async (subId, expectedAmount) => {
        const amountInput = await window.ui.prompt(t('msg_prompt_paid'), expectedAmount || '');
        if (amountInput === null || amountInput === false) return;

        const totalPaid = parseFloat(amountInput);
        if (isNaN(totalPaid) || totalPaid <= 0) return;

        try {
            await apiCall('/subscriptions', 'POST', { action: 'mark_paid', id: subId, total_paid: totalPaid });
            loadView('dashboard');
        } catch (e) {
            window.ui.alert(e.message);
        }
    },

    navigate: (viewName) => {
        document.querySelector(`[data-view='${viewName}']`).click();
    },

    filterSubByStatus: async (status) => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('.nav-item[data-view="subscriptions"]').classList.add('active');
        await loadView('subscriptions');
        // A simple search filter isn't perfect for 'due_soon' without complex logic in subscriptions view.
        // I will just show the subscriptions view as per user request to click to navigate.
        // Or I can type 'warning' or whatever colors the row but let's just leave it at navigating.
    },

    approvePayment: async (id, expectedAmount) => {
        const amountInput = await window.ui.prompt(t('msg_prompt_received'), expectedAmount || '');
        if (amountInput === null || amountInput === false) return; // User cancelled

        const totalPaid = parseFloat(amountInput);
        if (isNaN(totalPaid) || totalPaid <= 0) {
            await window.ui.alert(t('msg_err_amount'));
            return;
        }

        try {
            await apiCall('/payments', 'POST', { request_id: id, action: 'approve', total_paid: totalPaid });
            loadView('payments');
        } catch (e) { await window.ui.alert(e.message); }
    },

    rejectPayment: async (id) => {
        const templates = [
            t('reject_reason_1'),
            t('reject_reason_2'),
            t('reject_reason_3'),
            t('reject_reason_4')
        ];
        const reason = await window.ui.prompt(t('msg_prompt_reject'), '', templates);
        if (reason === null || reason === false) return; // Cancelled

        try {
            await apiCall('/payments', 'POST', { request_id: id, action: 'reject', reject_reason: reason });
            loadView('payments');
        } catch (e) { await window.ui.alert(e.message); }
    },

    filterSubByPlan: async (planName) => {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('.nav-item[data-view="subscriptions"]').classList.add('active');

        await loadView('subscriptions');

        const input = document.getElementById('search-sub');
        input.value = planName;
        input.dispatchEvent(new Event('keyup'));
    },

    // Plans
    showAddPlanModal: () => {
        document.getElementById('plan-modal-title').innerText = t('modal_add_plan');
        document.getElementById('form-plan').reset();
        document.getElementById('plan-id').value = '';
        document.getElementById('plan-anchor-date').value = '';
        document.getElementById('plan-note').value = '';
        document.getElementById('plan-status').value = '1';
        document.getElementById('modal-plan').classList.add('active');
    },
    editPlan: (id) => {
        const p = plansData.find(x => x.id === id);
        if (!p) return;
        document.getElementById('plan-modal-title').innerText = t('modal_edit_plan');
        document.getElementById('plan-id').value = p.id;
        document.getElementById('plan-name').value = p.name;
        document.getElementById('plan-category').value = p.category;
        document.getElementById('plan-price').value = p.total_price;
        document.getElementById('plan-cycle').value = p.renewal_cycle_months;
        document.getElementById('plan-anchor-date').value = p.renewal_anchor_date || '';
        document.getElementById('plan-note').value = p.note || '';
        document.getElementById('plan-slots').value = p.max_slots || 0;
        document.getElementById('plan-status').value = p.active ? '1' : '0';
        document.getElementById('modal-plan').classList.add('active');
    },
    deletePlan: async (id) => {
        const p = plansData.find(x => x.id === id);
        if (!p) return;
        const input = await window.ui.prompt(t('msg_warn_del_plan') + '\"' + p.name + '\":', '');
        if (!input || input.trim().toUpperCase() !== 'DELETE') return;
        try {
            await apiCall(`/plans?id=${id}`, 'DELETE');
            loadView('plans');
        } catch (e) { await window.ui.alert(e.message); }
    },

    // Members
    showAddMemberModal: () => {
        document.getElementById('member-modal-title').innerText = t('modal_add_member');
        document.getElementById('form-member').reset();
        document.getElementById('member-id').value = '';
        document.getElementById('member-note').value = '';
        document.getElementById('member-status').value = '1';
        document.getElementById('modal-member').classList.add('active');
    },
    editMember: (id) => {
        const m = membersData.find(x => x.id === id);
        if (!m) return;
        document.getElementById('member-modal-title').innerText = t('modal_edit_member');
        document.getElementById('member-id').value = m.id;
        document.getElementById('member-name').value = m.full_name;
        document.getElementById('member-email').value = m.email;
        document.getElementById('member-phone').value = m.phone || '';
        document.getElementById('member-note').value = m.note || '';
        document.getElementById('member-status').value = m.active ? '1' : '0';
        document.getElementById('modal-member').classList.add('active');
    },
    deleteMember: async (id) => {
        const m = membersData.find(x => x.id === id);
        if (!m) return;
        const input = await window.ui.prompt(t('msg_warn_del_member') + '\"' + m.full_name + '\":', '');
        if (!input || input.trim().toUpperCase() !== 'DELETE') return;
        try {
            await apiCall(`/members?id=${id}`, 'DELETE');
            loadView('members');
        } catch (e) { await window.ui.alert(e.message); }
    },

    // Subscriptions
    showAddSubModal: async () => {
        await populateSubSelects(null);
        document.getElementById('sub-modal-title').innerText = t('modal_add_sub');
        document.getElementById('form-sub').reset();
        document.getElementById('sub-id').value = '';
        document.getElementById('sub-due').value = '';
        document.getElementById('sub-amount').value = '';
        document.getElementById('sub-cycle').value = '1';
        document.getElementById('sub-status').value = 'active';
        document.getElementById('sub-note').value = '';
        document.getElementById('sub-send-email').checked = true;
        document.getElementById('modal-sub').classList.add('active');
    },
    editSub: async (id) => {
        await populateSubSelects(id);
        const s = subsData.find(x => x.id === id);
        if (!s) return;
        document.getElementById('sub-modal-title').innerText = t('modal_edit_sub');
        document.getElementById('sub-id').value = s.id;
        document.getElementById('sub-member').value = s.member_id;
        document.getElementById('sub-plan').value = s.plan_id;
        document.getElementById('sub-start').value = s.start_date;
        document.getElementById('sub-due').value = s.next_due_date;
        document.getElementById('sub-amount').value = s.amount_due;
        document.getElementById('sub-cycle').value = s.billing_cycle_months;
        document.getElementById('sub-status').value = s.status;
        document.getElementById('sub-note').value = s.personal_note || '';
        document.getElementById('sub-send-email').checked = (s.send_email === undefined || s.send_email === null || s.send_email === 1);
        document.getElementById('modal-sub').classList.add('active');
    },
    deleteSub: async (id) => {
        const s = subsData.find(x => x.id === id);
        if (!s) return;
        const input = await window.ui.prompt(t('msg_warn_del_sub') + '"' + s.member_name + '" (' + t('sub_plan') + ': ' + s.plan_name + '):', '');
        if (!input || input.trim().toUpperCase() !== 'DELETE') return;
        try {
            await apiCall(`/subscriptions?id=${id}`, 'DELETE');
            loadView('subscriptions');
        } catch (e) { await window.ui.alert(e.message); }
    },

    testTelegram: async () => {
        const token = document.getElementById('setting-telegram-bot-token').value;
        const chatId = document.getElementById('setting-telegram-chat-id').value;
        const topicId = document.getElementById('setting-telegram-topic-id').value;

        if (!token || !chatId) {
            return window.ui.alert(t('msg_err_bot'));
        }

        try {
            const res = await apiCall('/test-telegram', 'POST', { token, chatId, topicId });
            window.ui.alert(res.message || t('msg_success'));
        } catch (e) {
            window.ui.alert(e.message);
        }
    },

    closeModal: (id) => document.getElementById(id).classList.remove('active')
};

// Form submits
document.getElementById('form-plan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('plan-id').value;
    const data = {
        name: document.getElementById('plan-name').value,
        category: document.getElementById('plan-category').value,
        total_price: parseFloat(document.getElementById('plan-price').value),
        renewal_cycle_months: parseInt(document.getElementById('plan-cycle').value),
        renewal_anchor_date: document.getElementById('plan-anchor-date').value || null,
        note: document.getElementById('plan-note').value || null,
        max_slots: parseInt(document.getElementById('plan-slots').value) || 0,
        active: document.getElementById('plan-status').value === '1'
    };
    try {
        if (id) {
            await apiCall(`/plans?id=${id}`, 'PUT', data);
        } else {
            await apiCall('/plans', 'POST', data);
        }
        adminApp.closeModal('modal-plan');
        loadView('plans');
    } catch (e) { await window.ui.alert(e.message); }
});

document.getElementById('form-member').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('member-id').value;
    const data = {
        full_name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        phone: document.getElementById('member-phone').value,
        note: document.getElementById('member-note').value,
        active: document.getElementById('member-status').value === '1'
    };
    try {
        if (id) {
            await apiCall(`/members?id=${id}`, 'PUT', data);
        } else {
            await apiCall('/members', 'POST', data);
        }
        adminApp.closeModal('modal-member');
        loadView('members');
    } catch (e) { await window.ui.alert(e.message); }
});

document.getElementById('form-sub').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('sub-id').value;
    const data = {
        member_id: document.getElementById('sub-member').value,
        plan_id: document.getElementById('sub-plan').value,
        start_date: document.getElementById('sub-start').value,
        next_due_date: document.getElementById('sub-due').value,
        amount_due: parseFloat(document.getElementById('sub-amount').value),
        billing_cycle_months: parseInt(document.getElementById('sub-cycle').value) || 1,
        status: document.getElementById('sub-status').value,
        personal_note: document.getElementById('sub-note').value || null,
        send_email: document.getElementById('sub-send-email').checked ? 1 : 0
    };
    try {
        if (id) {
            await apiCall(`/subscriptions?id=${id}`, 'PUT', data);
        } else {
            await apiCall('/subscriptions', 'POST', data);
        }
        adminApp.closeModal('modal-sub');
        loadView('subscriptions');
    } catch (e) { await window.ui.alert(e.message); }
});

document.getElementById('form-settings').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        reminders_enabled: document.getElementById('setting-reminders-enabled').checked ? 1 : 0,
        reminder_days: document.getElementById('setting-reminder-days').value,
        telegram_notifications_enabled: document.getElementById('setting-telegram-enabled').checked ? 1 : 0,
        telegram_bot_token: document.getElementById('setting-telegram-bot-token').value,
        telegram_chat_id: document.getElementById('setting-telegram-chat-id').value,
        telegram_topic_id: document.getElementById('setting-telegram-topic-id').value,
        admin_email_notifications_enabled: document.getElementById('setting-admin-email-enabled').checked ? 1 : 0,
        admin_email_notification_to: document.getElementById('setting-admin-email-to').value,
        admin_email_notification_cc: document.getElementById('setting-admin-email-cc').value,
        admin_email_notification_bcc: document.getElementById('setting-admin-email-bcc').value,
        bank_id: document.getElementById('setting-bank-id').value,
        bank_account_number: document.getElementById('setting-bank-account-number').value,
        bank_account_name: document.getElementById('setting-bank-account-name').value,
        alt_bank_id: document.getElementById('setting-alt-bank-id').value,
        alt_bank_account_number: document.getElementById('setting-alt-bank-account-number').value,
        alt_bank_account_name: document.getElementById('setting-alt-bank-account-name').value,
        allow_user_cancel: document.getElementById('setting-allow-user-cancel').checked ? 1 : 0,
        customer_language: document.getElementById('setting-customer-language').value,
        admin_language: document.getElementById('setting-admin-language').value,
        admin_contacts: Array.from(document.querySelectorAll('#admin-contacts-container .contact-row')).map(row => ({
            type: row.querySelector('.contact-type').value,
            label: row.querySelector('.contact-label').value,
            display_name: row.querySelector('.contact-display-name').value,
            value: row.querySelector('.contact-value').value
        })).filter(c => c.value.trim() !== '')
    };
    try {
        await apiCall('/settings', 'PUT', data);
        settingsData = data;
        await window.ui.alert(t('msg_save_success'));
    } catch (e) { await window.ui.alert(e.message); }
});

document.getElementById('form-expense').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        id: document.getElementById('expense-id').value,
        expense_date: document.getElementById('expense-date').value,
        description: document.getElementById('expense-desc').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
    };
    try {
        await apiCall('/expenses', 'POST', data);
        adminApp.closeModal('modal-expense');
        await loadExpenses();
        window.ui.alert(t('msg_save_success'));
    } catch (e) { window.ui.alert(e.message); }
});

// Search/Filter logic
function setupSearchFilter(inputId, listId) {
    document.getElementById(inputId).addEventListener('keyup', function (e) {
        const term = e.target.value.toLowerCase();
        const rows = document.getElementById(listId).getElementsByTagName('tr');
        const filterStatusEl = inputId === 'search-sub' ? document.getElementById('filter-sub-status') : null;
        const filterStatus = filterStatusEl ? filterStatusEl.value : 'all';

        for (let row of rows) {
            const text = row.innerText.toLowerCase();
            const rowStatus = row.getAttribute('data-status') || '';
            
            const matchText = text.includes(term);
            const matchStatus = filterStatus === 'all' || rowStatus === filterStatus;

            if (matchText && matchStatus) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        }
    });
}

setupSearchFilter('search-sub', 'sub-list');
setupSearchFilter('search-member', 'member-list');
setupSearchFilter('search-plan', 'plan-list');

// Init
checkSession();
// === Custom Bank Select Logic ===
let bankDataList = [];

async function initBankSelect() {
    try {
        const res = await fetch('https://api.vietqr.io/v2/banks');
        const json = await res.json();
        bankDataList = json.data;
    } catch (e) {
        const res = await fetch('data/banks.json');
        const json = await res.json();
        bankDataList = json.data;
    }

    setupBankSelect('bank');
    setupBankSelect('alt-bank');
}

function setupBankSelect(prefix) {
    renderBankOptions(prefix, '');

    document.getElementById(`${prefix}-select-trigger`).addEventListener('click', function (e) {
        document.getElementById(`${prefix}-select`).classList.toggle('open');
        document.getElementById(`${prefix}-search-input`).focus();
        e.stopPropagation();
    });

    document.getElementById(`${prefix}-search-input`).addEventListener('input', function (e) {
        renderBankOptions(prefix, e.target.value.toLowerCase());
    });

    document.getElementById(`${prefix}-search-input`).addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
        const wrapper = document.getElementById(`${prefix}-select-wrapper`);
        if (wrapper && !wrapper.contains(e.target)) {
            document.getElementById(`${prefix}-select`).classList.remove('open');
        }
    });
}

function renderBankOptions(prefix, filter = '') {
    const list = document.getElementById(`${prefix}-options-list`);
    list.innerHTML = '';
    const currentVal = document.getElementById(`setting-${prefix}-id`).value;

    bankDataList.forEach(bank => {
        const text = `${bank.shortName} - ${bank.name}`;
        if (filter) {
            const searchStr = `${bank.name} ${bank.shortName} ${bank.code} ${bank.bin} ${bank.short_name}`.toLowerCase();
            if (!searchStr.includes(filter)) return;
        }

        const opt = document.createElement('div');
        opt.className = 'custom-option' + (currentVal === bank.bin || currentVal === bank.shortName ? ' selected' : '');
        opt.innerHTML = `<img src="${bank.logo}" onerror="this.style.display='none'">
                         <div class="custom-option-text">${text}</div>`;

        opt.addEventListener('click', function (e) {
            document.getElementById(`setting-${prefix}-id`).value = bank.bin;
            updateBankTriggerDisplay(prefix, bank);
            document.getElementById(`${prefix}-select`).classList.remove('open');
            renderBankOptions(prefix); // re-render to update selected styling
            e.stopPropagation();
        });
        list.appendChild(opt);
    });

    updateBankTriggerDisplay(prefix);
}

function updateBankTriggerDisplay(prefix, bank = null) {
    if (!bank && bankDataList.length > 0) {
        const currentVal = document.getElementById(`setting-${prefix}-id`).value;
        bank = bankDataList.find(b => b.bin === currentVal || b.shortName === currentVal || b.short_name === currentVal);
    }
    const content = document.getElementById(`${prefix}-select-content`);
    if (bank) {
        content.innerHTML = `<img src="${bank.logo}" style="width: 40px; height: 20px; object-fit: contain; margin-right: 10px;" onerror="this.style.display='none'">
                             <span>${bank.shortName} - ${bank.name}</span>`;
    } else {
        const val = document.getElementById(`setting-${prefix}-id`).value;
        content.innerHTML = `<span>${val || t('lbl_select_bank')}</span>`;
    }
}
