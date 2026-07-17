import { apiCall } from './api.js';

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

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const loading = document.getElementById('loading');
const errorView = document.getElementById('errorView');
const portalView = document.getElementById('portalView');

const paymentForm = document.getElementById('paymentFormSection');
const paymentPending = document.getElementById('paymentPendingSection');

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = dateStr.split(' ')[0];
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

async function init() {
    if (!token) {
        showError();
        return;
    }

    try {
        const res = await apiCall(`/user/${token}`);
        const sub = res.data.subscription;

        document.getElementById('p-plan').innerText = sub.plan_name;
        document.getElementById('p-member').innerText = sub.member_name;
        document.getElementById('p-start').innerText = formatDate(sub.start_date);
        document.getElementById('p-due').innerText = formatDate(sub.next_due_date);
        document.getElementById('p-amount').innerText = sub.amount_due.toLocaleString();

        let statusText = sub.status;
        if (sub.status === 'active') statusText = 'Đang hoạt động';
        if (sub.status === 'pending_payment') statusText = 'Chờ duyệt thanh toán';
        if (sub.status === 'cancel_pending') statusText = 'Chờ huỷ gia hạn';
        document.getElementById('p-status').innerText = statusText;

        const settings = res.data.settings;

        // Generate VietQR if bank info is configured
        if (settings.bank_id && settings.bank_account_number) {
            const bankBin = settings.bank_id;
            const accNo = settings.bank_account_number;
            const accName = settings.bank_account_name || 'ADMIN';
            const addInfo = `${sub.member_name} CT ${sub.plan_name}`;

            let bankDisplayName = bankBin;
            try {
                let banksData = null;
                try {
                    const apiRes = await fetch('https://api.vietqr.io/v2/banks');
                    if (apiRes.ok) banksData = await apiRes.json();
                } catch(e) {}
                
                if (!banksData) {
                    const localRes = await fetch('/data/banks.json');
                    if (localRes.ok) banksData = await localRes.json();
                }
                
                if (banksData && banksData.data) {
                    const normalizedBin = String(bankBin).trim().toLowerCase();
                    const bankInfo = banksData.data.find(b => 
                        String(b.bin).toLowerCase() === normalizedBin || 
                        String(b.shortName).toLowerCase() === normalizedBin || 
                        String(b.short_name).toLowerCase() === normalizedBin
                    );
                    if (bankInfo) {
                        bankDisplayName = `${bankInfo.shortName} - ${bankInfo.name}`;
                    }
                }
            } catch (e) {
                console.error('Failed to load banks data', e);
            }

            document.getElementById('p-bank-name').innerText = bankDisplayName;
            document.getElementById('p-bank-account').innerText = accNo;
            document.getElementById('p-bank-owner').innerText = accName;
            document.getElementById('p-transfer-note').innerText = addInfo;

            const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accNo}-qr_only.png?amount=${sub.amount_due}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accName)}`;
            const qrImg = document.getElementById('qr-code');
            qrImg.src = qrUrl;
            qrImg.style.display = 'block';
            document.getElementById('qr-instruction').style.display = 'block';
            document.getElementById('bankInfoSection').classList.remove('hidden');

            const btnCopyAcc = document.getElementById('btnCopyAcc');
            if (btnCopyAcc) {
                btnCopyAcc.addEventListener('click', () => {
                    navigator.clipboard.writeText(accNo);
                    const originalText = btnCopyAcc.innerText;
                    btnCopyAcc.innerText = 'Copied!';
                    setTimeout(() => btnCopyAcc.innerText = originalText, 2000);
                });
            }

            const btnCopyNote = document.getElementById('btnCopyNote');
            if (btnCopyNote) {
                btnCopyNote.addEventListener('click', () => {
                    navigator.clipboard.writeText(addInfo);
                    const originalText = btnCopyNote.innerText;
                    btnCopyNote.innerText = 'Copied!';
                    setTimeout(() => btnCopyNote.innerText = originalText, 2000);
                });
            }
        }

        if (sub.status === 'pending_payment') {
            paymentForm.classList.add('hidden');
            paymentPending.classList.remove('hidden');
        }

        if (sub.status === 'cancel_pending') {
            paymentForm.classList.add('hidden');
            document.getElementById('cancelPendingSection').classList.remove('hidden');
        } else if (settings.allow_user_cancel === 1 && sub.status !== 'pending_payment') {
            document.getElementById('userCancelSection').classList.remove('hidden');
        }

        loading.classList.add('hidden');
        portalView.classList.remove('hidden');

    } catch (e) {
        showError();
    }
}

function showError() {
    loading.classList.add('hidden');
    errorView.classList.remove('hidden');
}

document.getElementById('btnConfirmPay').addEventListener('click', async () => {
    const note = document.getElementById('p-note').value;
    const btn = document.getElementById('btnConfirmPay');
    btn.disabled = true;
    btn.innerText = 'Đang xử lý...';

    try {
        await apiCall(`/user/${token}`, 'POST', { user_note: note });
        await window.ui.alert('Cảm ơn bạn! Yêu cầu đã được gửi.');
        window.location.reload();
    } catch (e) {
        await window.ui.alert(e.message);
        btn.disabled = false;
        btn.innerText = 'Tôi đã chuyển khoản';
    }
});

document.getElementById('btnCancelSub')?.addEventListener('click', async () => {
    if (!await window.ui.confirm('Bạn có chắc chắn muốn hủy gia hạn? Gói dịch vụ của bạn sẽ tự động kết thúc vào kỳ hạn tiếp theo.')) return;
    
    const btn = document.getElementById('btnCancelSub');
    btn.disabled = true;
    btn.innerText = 'Đang xử lý...';

    try {
        await apiCall(`/user/${token}`, 'POST', { action: 'cancel_pending' });
        await window.ui.alert('Yêu cầu hủy gia hạn thành công.');
        window.location.reload();
    } catch (e) {
        await window.ui.alert(e.message);
        btn.disabled = false;
        btn.innerText = 'Hủy gia hạn chu kỳ sau';
    }
});

init();
