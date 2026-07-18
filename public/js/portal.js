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
    alert: (msg) => window.ui.showDialog(t('dialog_title_alert'), msg, 'alert'),
    confirm: (msg) => window.ui.showDialog(t('dialog_title_confirm'), msg, 'confirm'),
    prompt: (msg, defaultVal) => window.ui.showDialog(t('dialog_title_prompt'), msg, 'prompt', defaultVal)
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
        document.getElementById('p-amount').innerText = formatCurrency(sub.amount_due);

        let statusText = sub.status;
        if (sub.status === 'active') statusText = t('status_active_txt');
        if (sub.status === 'pending_payment') statusText = t('status_pending_txt');
        if (sub.status === 'cancel_pending') statusText = t('status_cancel_txt');
        document.getElementById('p-status').innerText = statusText;

        const settings = res.data.settings;

        // Generate VietQR if bank info is configured
        if (settings.bank_id && settings.bank_account_number) {
            let currentBankIndex = 0;
            const banks = [
                {
                    id: settings.bank_id,
                    accNo: settings.bank_account_number,
                    accName: settings.bank_account_name || 'ADMIN'
                }
            ];
            
            if (settings.alt_bank_id && settings.alt_bank_account_number) {
                banks.push({
                    id: settings.alt_bank_id,
                    accNo: settings.alt_bank_account_number,
                    accName: settings.alt_bank_account_name || 'ADMIN'
                });
                
                const btnSwitch = document.getElementById('btnSwitchBank');
                if (btnSwitch) {
                    btnSwitch.classList.remove('hidden');
                    btnSwitch.addEventListener('click', () => {
                        currentBankIndex = currentBankIndex === 0 ? 1 : 0;
                        renderBank(banks[currentBankIndex]);
                    });
                }
            }
            
            let banksDataList = null;
            async function fetchBanksData() {
                try {
                    const apiRes = await fetch('https://api.vietqr.io/v2/banks');
                    if (apiRes.ok) banksDataList = await apiRes.json();
                } catch(e) {}
                
                if (!banksDataList) {
                    try {
                        const localRes = await fetch('/data/banks.json');
                        if (localRes.ok) banksDataList = await localRes.json();
                    } catch(e) {}
                }
            }
            
            await fetchBanksData();
            
            const addInfo = `${sub.member_name} CT ${sub.plan_name}`;
            
            function renderBank(bankObj) {
                let bankDisplayName = bankObj.id;
                
                if (banksDataList && banksDataList.data) {
                    const normalizedBin = String(bankObj.id).trim().toLowerCase();
                    const bInfo = banksDataList.data.find(b => 
                        String(b.bin).toLowerCase() === normalizedBin || 
                        String(b.shortName).toLowerCase() === normalizedBin || 
                        String(b.short_name).toLowerCase() === normalizedBin
                    );
                    if (bInfo) bankDisplayName = `${bInfo.shortName} - ${bInfo.name}`;
                }

                document.getElementById('p-bank-name').innerText = bankDisplayName;
                document.getElementById('p-bank-account').innerText = bankObj.accNo;
                document.getElementById('p-bank-owner').innerText = bankObj.accName;
                document.getElementById('p-transfer-note').innerText = addInfo;

                const qrUrl = `https://img.vietqr.io/image/${bankObj.id}-${bankObj.accNo}-qr_only.png?amount=${sub.amount_due}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(bankObj.accName)}`;
                const qrImg = document.getElementById('qr-code');
                qrImg.src = qrUrl;
                qrImg.style.display = 'block';
                document.getElementById('qr-instruction').style.display = 'block';
                document.getElementById('bankInfoSection').classList.remove('hidden');
            }
            
            renderBank(banks[currentBankIndex]);

            const btnCopyAcc = document.getElementById('btnCopyAcc');
            if (btnCopyAcc) {
                // Remove old event listener if we were to re-run this, but this block only runs once per init
                // We use cloneNode to safely replace any existing listeners
                const newBtnCopyAcc = btnCopyAcc.cloneNode(true);
                btnCopyAcc.parentNode.replaceChild(newBtnCopyAcc, btnCopyAcc);
                newBtnCopyAcc.addEventListener('click', () => {
                    const currentAccNo = document.getElementById('p-bank-account').innerText;
                    navigator.clipboard.writeText(currentAccNo);
                    const originalText = newBtnCopyAcc.innerText;
                    newBtnCopyAcc.innerText = t('btn_copied');
                    setTimeout(() => newBtnCopyAcc.innerText = originalText, 2000);
                });
            }

            const btnCopyNote = document.getElementById('btnCopyNote');
            if (btnCopyNote) {
                const newBtnCopyNote = btnCopyNote.cloneNode(true);
                btnCopyNote.parentNode.replaceChild(newBtnCopyNote, btnCopyNote);
                newBtnCopyNote.addEventListener('click', () => {
                    navigator.clipboard.writeText(addInfo);
                    const originalText = newBtnCopyNote.innerText;
                    newBtnCopyNote.innerText = t('btn_copied');
                    setTimeout(() => newBtnCopyNote.innerText = originalText, 2000);
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
    btn.innerText = t('txt_processing');

    try {
        await apiCall(`/user/${token}`, 'POST', { user_note: note });
        await window.ui.alert(t('msg_portal_sent'));
        window.location.reload();
    } catch (e) {
        await window.ui.alert(e.message);
        btn.disabled = false;
        btn.innerText = t('portal_btn_confirm');
    }
});

document.getElementById('btnCancelSub')?.addEventListener('click', async () => {
    if (!await window.ui.confirm(t('msg_portal_confirm_cancel'))) return;
    
    const btn = document.getElementById('btnCancelSub');
    btn.disabled = true;
    btn.innerText = t('txt_processing');

    try {
        await apiCall(`/user/${token}`, 'POST', { action: 'cancel_pending' });
        await window.ui.alert(t('msg_portal_cancel_success'));
        window.location.reload();
    } catch (e) {
        await window.ui.alert(e.message);
        btn.disabled = false;
        btn.innerText = t('portal_btn_cancel');
    }
});

init();
