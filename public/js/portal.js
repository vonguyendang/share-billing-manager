import { apiCall } from './api.js';

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const loading = document.getElementById('loading');
const errorView = document.getElementById('errorView');
const portalView = document.getElementById('portalView');

const paymentForm = document.getElementById('paymentFormSection');
const paymentPending = document.getElementById('paymentPendingSection');

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
        document.getElementById('p-start').innerText = sub.start_date;
        document.getElementById('p-due').innerText = sub.next_due_date;
        document.getElementById('p-amount').innerText = sub.amount_due.toLocaleString();

        let statusText = sub.status;
        if (sub.status === 'active') statusText = 'Đang hoạt động';
        if (sub.status === 'pending_payment') statusText = 'Chờ duyệt thanh toán';
        document.getElementById('p-status').innerText = statusText;

        // Generate VietQR
        const bankBin = '963388'; // TIMO
        const accNo = '0944353323';
        const accName = 'VO NGUYEN DANG';
        const addInfo = `${sub.member_name} chuyen tien ${sub.plan_name}`;

        // Hiển thị nội dung chuyển khoản ra màn hình cho người dùng copy nếu cần
        const noteEl = document.getElementById('p-transfer-note');
        if (noteEl) noteEl.innerText = addInfo;

        const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accNo}-qr_only.png?amount=${sub.amount_due}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accName)}`;
        const qrImg = document.getElementById('qr-code');
        qrImg.src = qrUrl;
        qrImg.style.display = 'block';

        if (sub.status === 'pending_payment') {
            paymentForm.classList.add('hidden');
            paymentPending.classList.remove('hidden');
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
        await apiCall(`/user/${token}/pay`, 'POST', { user_note: note });
        alert('Cảm ơn bạn! Yêu cầu đã được gửi.');
        window.location.reload();
    } catch (e) {
        alert(e.message);
        btn.disabled = false;
        btn.innerText = 'Tôi đã chuyển khoản';
    }
});

init();
