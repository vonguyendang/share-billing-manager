export default function paymentUndoTemplate(data: any) {
    const amountStr = data.amount.toLocaleString();
    return {
        vi: { subject: '', body: '', htmlBody: '', tgMessage: `⚠️ <b>Hoàn tác giao dịch duyệt nhầm</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n💰 Số tiền bị hủy: <b>${amountStr}đ</b>\n📅 Ngày tới hạn trả về: <b>${data.newDateStr}</b>\n👉 Chi tiết: <a href="${data.actualLink}">Hóa đơn</a>` },
        en: { subject: '', body: '', htmlBody: '', tgMessage: `⚠️ <b>Undo Approved Transaction</b>\n👤 Customer: <b>${data.full_name}</b>\n💰 Amount reverted: <b>${amountStr} VND</b>\n📅 Restored due date: <b>${data.newDateStr}</b>\n👉 Details: <a href="${data.actualLink}">Invoice</a>` }
    };
}
