import { apiCall } from './api.js';

// DOM Elements
const loginView = document.getElementById('loginView');
const appView = document.getElementById('appView');
const loginForm = document.getElementById('loginForm');
const navItems = document.querySelectorAll('.nav-item');

window.ui = {
    showDialog: function(title, message, type = 'alert', defaultInputValue = '') {
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
    alert: (msg) => window.ui.showDialog('Thông báo', msg, 'alert'),
    confirm: (msg) => window.ui.showDialog('Xác nhận', msg, 'confirm'),
    prompt: (msg, defaultVal) => window.ui.showDialog('Nhập thông tin', msg, 'prompt', defaultVal)
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
        document.getElementById('loginError').innerText = 'Invalid password';
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
    if (!(await window.ui.confirm(`Chạy tiến trình gửi email nhắc nhở cho các mốc ngày: ${days}?`))) return;
    try {
        const res = await apiCall('/reminders', 'POST');
        await window.ui.alert(`Sent ${res.data.sent} emails. ${res.data.errors} errors.`);
    } catch (e) {
        await window.ui.alert('Error: ' + e.message);
    }
});

// Routing
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const view = item.getAttribute('data-view');
        loadView(view);
    });
});

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = dateStr.split(' ')[0];
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}


async function loadView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    try {
        if (view === 'dashboard') await loadDashboard();
        if (view === 'plans') await loadPlans();
        if (view === 'members') await loadMembers();
        if (view === 'subscriptions') await loadSubscriptions();
        if (view === 'payments') await loadPayments();
        if (view === 'settings') await loadSettings();
    } catch (e) {
        console.error(e);
        await window.ui.alert('Error loading ' + view);
    }
}

async function loadDashboard() {
    const res = await apiCall('/dashboard');
    document.getElementById('stat-plans').innerText = res.data.activePlans;
    document.getElementById('stat-members').innerText = res.data.activeMembers;
    document.getElementById('stat-due').innerText = res.data.dueSoonSubscriptions;
    document.getElementById('stat-pending').innerText = res.data.pendingPayments;
    
    const budget = res.data.budget;
    document.getElementById('stat-cost').innerText = budget.monthlyCost.toLocaleString();
    document.getElementById('stat-revenue').innerText = budget.monthlyRevenue.toLocaleString();
    const profitEl = document.getElementById('stat-profit');
    profitEl.innerText = budget.netProfit.toLocaleString();
    profitEl.style.color = budget.netProfit >= 0 ? 'var(--success)' : 'var(--danger)';
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
    plansData.forEach(p => {
        const usedSlots = subsData.filter(s => s.plan_id === p.id && s.status !== 'paused').length;
        const maxSlots = p.max_slots || 0;
        const slotsDisplay = maxSlots > 0 ? `${usedSlots}/${maxSlots}` : `${usedSlots}/∞`;
        const slotsHtml = usedSlots > 0 
            ? `<a href="#" onclick="window.adminApp.filterSubByPlan('${p.name.replace(/'/g, "\\'")}')">${slotsDisplay}</a>`
            : slotsDisplay;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${p.id}</code></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.total_price.toLocaleString()}</td>
            <td>${p.renewal_cycle_months}</td>
            <td>${slotsHtml}</td>
            <td>${p.active ? 'Active' : 'Inactive'}</td>
            <td>
                <button class="btn btn-primary" onclick="adminApp.editPlan('${p.id}')">Edit</button>
                <button class="btn btn-danger" onclick="adminApp.deletePlan('${p.id}')">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadMembers() {
    const res = await apiCall('/members');
    membersData = res.data;
    const tbody = document.getElementById('member-list');
    tbody.innerHTML = '';
    membersData.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${m.id}</code></td>
            <td>${m.full_name}</td>
            <td>${m.email}</td>
            <td>${m.phone || '-'}</td>
            <td>${m.note || '-'}</td>
            <td>${m.active ? 'Active' : 'Inactive'}</td>
            <td>
                <button class="btn btn-primary" onclick="adminApp.editMember('${m.id}')">Edit</button>
                <button class="btn btn-danger" onclick="adminApp.deleteMember('${m.id}')">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadSubscriptions() {
    const res = await apiCall('/subscriptions');
    subsData = res.data;
    const tbody = document.getElementById('sub-list');
    tbody.innerHTML = '';
    subsData.forEach(sub => {
        const link = `${window.location.origin}/portal.html?token=${sub.user_token}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sub.member_name}</td>
            <td>${sub.plan_name}</td>
            <td>${formatDate(sub.next_due_date)}</td>
            <td>${sub.amount_due.toLocaleString()}</td>
            <td>${sub.billing_cycle_months}</td>
            <td><span class="badge ${sub.status === 'active' ? 'badge-active' : 'badge-pending'}">${sub.status}</span></td>
            <td><a href="${link}" target="_blank" style="font-size: 0.8rem">Portal</a></td>
            <td>
                <button class="btn btn-primary" onclick="adminApp.editSub('${sub.id}')">Edit</button>
                <button class="btn btn-danger" onclick="adminApp.deleteSub('${sub.id}')">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadPayments() {
    const res = await apiCall('/payments');
    const tbody = document.getElementById('payment-list');
    tbody.innerHTML = '';
    res.data.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.member_name}</td>
            <td>${req.plan_name}</td>
            <td>${req.amount.toLocaleString()}</td>
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
    memberSelect.innerHTML = '<option value="">-- Choose Member --</option>';
    membersData.forEach(m => {
        if (m.active) {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.innerText = m.full_name;
            memberSelect.appendChild(opt);
        }
    });

    const planSelect = document.getElementById('sub-plan');
    planSelect.innerHTML = '<option value="">-- Choose Plan --</option>';
    plansData.forEach(p => {
        if (p.active) {
            const usedSlots = subsData.filter(s => s.plan_id === p.id && s.status !== 'paused' && s.id !== currentSubId).length;
            const maxSlots = p.max_slots || 0;
            const opt = document.createElement('option');
            opt.value = p.id;
            
            if (maxSlots > 0) {
                const remaining = maxSlots - usedSlots;
                opt.innerText = `${p.name} (${p.total_price.toLocaleString()} VND) - Còn ${remaining} slot`;
                if (remaining <= 0) {
                    opt.disabled = true;
                    opt.innerText = `${p.name} (Đã Đầy)`;
                }
            } else {
                opt.innerText = `${p.name} (${p.total_price.toLocaleString()} VND) - Không giới hạn`;
            }
            planSelect.appendChild(opt);
        }
    });
}

// Global actions & modals
window.adminApp = {
    approvePayment: async (id, expectedAmount) => {
        const amountInput = await window.ui.prompt('Khách đã chuyển khoản bao nhiêu tiền? (Ví dụ: Nhập 100000)', expectedAmount || '');
        if (amountInput === null || amountInput === false) return; // User cancelled
        
        const totalPaid = parseFloat(amountInput);
        if (isNaN(totalPaid) || totalPaid <= 0) {
            await window.ui.alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
            return;
        }

        try {
            await apiCall('/payments', 'POST', { request_id: id, action: 'approve', total_paid: totalPaid });
            loadView('payments');
        } catch (e) { await window.ui.alert(e.message); }
    },
    
    rejectPayment: async (id) => {
        const reason = await window.ui.prompt('Nhập lý do TỪ CHỐI thanh toán (VD: Kiểm tra chưa nhận được tiền):', '');
        if (reason === null || reason === false) return; // Cancelled
        
        try {
            await apiCall('/payments', 'POST', { request_id: id, action: 'reject', reject_reason: reason });
            loadView('payments');
        } catch (e) { await window.ui.alert(e.message); }
    },
    
    filterSubByPlan: async (planName) => {
        await loadView('subscriptions');
        const input = document.getElementById('search-sub');
        input.value = planName;
        input.dispatchEvent(new Event('keyup'));
    },
    
    // Plans
    showAddPlanModal: () => {
        document.getElementById('plan-modal-title').innerText = 'Add Plan';
        document.getElementById('form-plan').reset();
        document.getElementById('plan-id').value = '';
        document.getElementById('modal-plan').classList.add('active');
    },
    editPlan: (id) => {
        const p = plansData.find(x => x.id === id);
        if (!p) return;
        document.getElementById('plan-modal-title').innerText = 'Edit Plan';
        document.getElementById('plan-id').value = p.id;
        document.getElementById('plan-name').value = p.name;
        document.getElementById('plan-category').value = p.category;
        document.getElementById('plan-price').value = p.total_price;
        document.getElementById('plan-cycle').value = p.renewal_cycle_months;
        document.getElementById('plan-slots').value = p.max_slots || 0;
        document.getElementById('modal-plan').classList.add('active');
    },
    deletePlan: async (id) => {
        const p = plansData.find(x => x.id === id);
        if (!p) return;
        const input = await window.ui.prompt(`Cảnh báo: Xóa gói này sẽ xóa toàn bộ Subscriptions liên quan! Gõ chữ "DELETE" (viết hoa) để xác nhận xóa gói "${p.name}":`, '');
        if (input !== 'DELETE') return;
        try {
            await apiCall(`/plans?id=${id}`, 'DELETE');
            loadView('plans');
        } catch (e) { await window.ui.alert(e.message); }
    },
    
    // Members
    showAddMemberModal: () => {
        document.getElementById('member-modal-title').innerText = 'Add Member';
        document.getElementById('form-member').reset();
        document.getElementById('member-id').value = '';
        document.getElementById('member-note').value = '';
        document.getElementById('modal-member').classList.add('active');
    },
    editMember: (id) => {
        const m = membersData.find(x => x.id === id);
        if (!m) return;
        document.getElementById('member-modal-title').innerText = 'Edit Member';
        document.getElementById('member-id').value = m.id;
        document.getElementById('member-name').value = m.full_name;
        document.getElementById('member-email').value = m.email;
        document.getElementById('member-phone').value = m.phone || '';
        document.getElementById('member-note').value = m.note || '';
        document.getElementById('modal-member').classList.add('active');
    },
    deleteMember: async (id) => {
        const m = membersData.find(x => x.id === id);
        if (!m) return;
        const input = await window.ui.prompt(`Cảnh báo: Xóa thành viên sẽ xóa luôn các Subscriptions của người này. Gõ chữ "DELETE" (viết hoa) để xác nhận xóa "${m.full_name}":`, '');
        if (input !== 'DELETE') return;
        try {
            await apiCall(`/members?id=${id}`, 'DELETE');
            loadView('members');
        } catch (e) { await window.ui.alert(e.message); }
    },
    
    // Subscriptions
    showAddSubModal: async () => {
        await populateSubSelects(null);
        document.getElementById('sub-modal-title').innerText = 'Add Subscription';
        document.getElementById('form-sub').reset();
        document.getElementById('sub-id').value = '';
        document.getElementById('sub-cycle').value = '1';
        document.getElementById('sub-status').value = 'active';
        document.getElementById('modal-sub').classList.add('active');
    },
    editSub: async (id) => {
        await populateSubSelects(id);
        const s = subsData.find(x => x.id === id);
        if (!s) return;
        document.getElementById('sub-modal-title').innerText = 'Edit Subscription';
        document.getElementById('sub-id').value = s.id;
        document.getElementById('sub-member').value = s.member_id;
        document.getElementById('sub-plan').value = s.plan_id;
        document.getElementById('sub-start').value = s.start_date;
        document.getElementById('sub-due').value = s.next_due_date;
        document.getElementById('sub-amount').value = s.amount_due;
        document.getElementById('sub-cycle').value = s.billing_cycle_months;
        document.getElementById('sub-status').value = s.status;
        document.getElementById('modal-sub').classList.add('active');
    },
    deleteSub: async (id) => {
        const s = subsData.find(x => x.id === id);
        if (!s) return;
        const input = await window.ui.prompt(`Gõ chữ "DELETE" (viết hoa) để xác nhận xóa Subscription của "${s.member_name}" (Gói: ${s.plan_name}):`, '');
        if (input !== 'DELETE') return;
        try {
            await apiCall(`/subscriptions?id=${id}`, 'DELETE');
            loadView('subscriptions');
        } catch (e) { await window.ui.alert(e.message); }
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
        max_slots: parseInt(document.getElementById('plan-slots').value) || 0,
        active: true
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
        active: true
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
        status: document.getElementById('sub-status').value
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
        reminder_days: document.getElementById('setting-reminder-days').value
    };
    try {
        await apiCall('/settings', 'PUT', data);
        settingsData = data;
        await window.ui.alert('Lưu cài đặt thành công!');
    } catch (e) { await window.ui.alert(e.message); }
});

// Search/Filter logic
function setupSearchFilter(inputId, listId) {
    document.getElementById(inputId).addEventListener('keyup', function(e) {
        const term = e.target.value.toLowerCase();
        const rows = document.getElementById(listId).getElementsByTagName('tr');
        for (let row of rows) {
            const text = row.innerText.toLowerCase();
            if (text.includes(term)) {
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
