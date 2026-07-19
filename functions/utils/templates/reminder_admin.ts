export default function reminderAdminTemplate(data: any) {
    let statusLabelVi = '';
    let statusLabelEn = '';

    if (data.days_left > 0) {
        statusLabelVi = 'Sắp đến hạn';
        statusLabelEn = 'Due Soon';
    } else if (data.days_left === 0) {
        statusLabelVi = 'Đến hạn hôm nay';
        statusLabelEn = 'Due Today';
    } else if (data.isAutoPauseDay) {
        statusLabelVi = 'Tạm ngưng dịch vụ';
        statusLabelEn = 'Service Suspended';
    } else if (data.days_left < 0) {
        statusLabelVi = `Trễ hạn ${Math.abs(data.days_left)} ngày`;
        statusLabelEn = `Overdue ${Math.abs(data.days_left)} days`;
    }

    return {
        vi: {
            subject: '', body: '', htmlBody: '',
            tgMessage: `📧 <b>Đã gửi email nhắc nhở</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n🏷 Trạng thái: <b>${statusLabelVi}</b>\n📅 Ngày đến hạn: <b>${data.formattedDate}</b>\n👉 Chi tiết: <a href="${data.actualLink}">Hóa đơn</a>`
        },
        en: {
            subject: '', body: '', htmlBody: '',
            tgMessage: `📧 <b>Reminder Email Sent</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n🏷 Status: <b>${statusLabelEn}</b>\n📅 Due Date: <b>${data.formattedDate}</b>\n👉 Details: <a href="${data.actualLink}">Invoice</a>`
        }
    };
}
