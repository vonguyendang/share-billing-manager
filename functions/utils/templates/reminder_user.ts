export default function reminderUserTemplate(data: any) {
    let emailSubjectVi = '';
    let titleHtmlVi = '';
    let messageHtmlVi = '';

    let emailSubjectEn = '';
    let titleHtmlEn = '';
    let messageHtmlEn = '';

    let headerColor = '#4F46E5';

    if (data.days_left > 0) {
        emailSubjectVi = `[Nhắc nhở] Sắp đến hạn thanh toán - ${data.plan_name}`;
        titleHtmlVi = `Sắp đến hạn thanh toán`;
        messageHtmlVi = `Gói dịch vụ <strong>${data.plan_name}</strong> của bạn sắp đến hạn thanh toán.
        <br/><br/>
        <strong>Ngày đến hạn:</strong> <span style="color: #EF4444;">${data.formattedDate}</span> (còn ${data.days_left} ngày)<br/>
        <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
        <br/><br/>
        Vui lòng thanh toán trước ngày hạn chót <strong>${data.formattedDeadline}</strong> để đảm bảo dịch vụ được duy trì liên tục.`;

        emailSubjectEn = `[Reminder] Upcoming Payment - ${data.plan_name}`;
        titleHtmlEn = `Upcoming Payment`;
        messageHtmlEn = `Your subscription for the <strong>${data.plan_name}</strong> plan is nearing its due date.
        <br/><br/>
        <strong>Due Date:</strong> <span style="color: #EF4444;">${data.formattedDate}</span> (${data.days_left} days left)<br/>
        <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
        <br/><br/>
        Please make your payment before the deadline on <strong>${data.formattedDeadline}</strong> to ensure uninterrupted service.`;

    } else if (data.days_left === 0) {
        emailSubjectVi = `[Thông báo] Hôm nay là ngày đến hạn thanh toán - ${data.plan_name}`;
        titleHtmlVi = `Đến hạn thanh toán`;
        headerColor = '#F59E0B'; // Amber
        messageHtmlVi = `Hôm nay (<strong>${data.formattedDate}</strong>) là ngày đến hạn thanh toán gói dịch vụ <strong>${data.plan_name}</strong> của bạn.
        <br/><br/>
        <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
        <br/><br/>
        Vui lòng thanh toán sớm trước ngày <strong>${data.formattedDeadline}</strong> để không bị gián đoạn dịch vụ nhé!`;

        emailSubjectEn = `[Notice] Payment is Due Today - ${data.plan_name}`;
        titleHtmlEn = `Payment Due Today`;
        messageHtmlEn = `Today (<strong>${data.formattedDate}</strong>) is the due date for your <strong>${data.plan_name}</strong> subscription.
        <br/><br/>
        <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
        <br/><br/>
        Please pay before <strong>${data.formattedDeadline}</strong> to avoid any service interruption.`;

    } else if (data.isAutoPauseDay) {
        const overdueDays = Math.abs(data.days_left);
        emailSubjectVi = `[Ngưng dịch vụ] Tài khoản của bạn đã bị khóa do trễ hạn - ${data.plan_name}`;
        titleHtmlVi = `Dịch vụ bị tạm ngưng`;
        headerColor = '#111827'; // Dark gray/black
        messageHtmlVi = `Rất tiếc, do đã trễ hạn thanh toán ${overdueDays} ngày, hệ thống đã <strong>tự động tạm ngưng</strong> dịch vụ của bạn đối với gói <strong>${data.plan_name}</strong>.
        <br/><br/>
        <strong>Số tiền còn nợ:</strong> <span style="font-size: 18px; font-weight: bold; color: #EF4444;">${data.amount_due} VNĐ</span>
        <br/><br/>
        Vui lòng thanh toán khoản nợ và báo cho Admin để được kích hoạt lại dịch vụ. Cảm ơn bạn.`;

        emailSubjectEn = `[Suspended] Your Account has been Suspended - ${data.plan_name}`;
        titleHtmlEn = `Service Suspended`;
        messageHtmlEn = `Unfortunately, as your payment is ${overdueDays} days overdue, your subscription for the <strong>${data.plan_name}</strong> plan has been <strong>automatically suspended</strong>.
        <br/><br/>
        <strong>Outstanding Balance:</strong> <span style="font-size: 18px; font-weight: bold; color: #EF4444;">${data.amount_due} VND</span>
        <br/><br/>
        Please clear your balance and contact the Admin to reactivate your service. Thank you.`;
    } else if (data.days_left < 0) {
        const overdueDays = Math.abs(data.days_left);
        emailSubjectVi = `[Quan trọng] Đã trễ hạn thanh toán ${overdueDays} ngày - ${data.plan_name}`;
        titleHtmlVi = `Trễ hạn thanh toán`;
        headerColor = '#EF4444'; // Red
        messageHtmlVi = `Gói dịch vụ <strong>${data.plan_name}</strong> của bạn đã trễ hạn thanh toán ${overdueDays} ngày (từ ngày ${data.formattedDate}).
        <br/><br/>
        <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
        <br/><br/>
        Hạn chót để giữ lại dịch vụ là ngày <strong>${data.formattedDeadline}</strong>. Xin vui lòng thanh toán ngay để tránh bị hệ thống tự động khóa.`;

        emailSubjectEn = `[Important] Payment is ${overdueDays} Days Overdue - ${data.plan_name}`;
        titleHtmlEn = `Payment Overdue`;
        messageHtmlEn = `Your subscription for the <strong>${data.plan_name}</strong> plan is ${overdueDays} days overdue (since ${data.formattedDate}).
        <br/><br/>
        <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
        <br/><br/>
        The absolute deadline to keep your service active is <strong>${data.formattedDeadline}</strong>. Please pay immediately to prevent automatic suspension.`;
    }

    return {
        vi: {
            subject: emailSubjectVi,
            body: `Chào ${data.full_name},\n\n${messageHtmlVi.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}\n\nVui lòng truy cập đường link sau để xem hướng dẫn chuyển khoản và báo cáo thanh toán:\n${data.actualLink}\n\nNếu có thắc mắc, vui lòng liên hệ Admin:\n${data.adminContactsText}\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">${titleHtmlVi}</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${messageHtmlVi}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Xem Chi Tiết & Thanh Toán</a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">Nếu bạn đã thanh toán, vui lòng nhấn vào nút bên trên để báo cáo cho Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin (Nếu cần hỗ trợ):</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        },
        en: {
            subject: emailSubjectEn,
            body: `Hello ${data.full_name},\n\n${messageHtmlEn.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}\n\nPlease click the link below to view payment instructions and submit your payment:\n${data.actualLink}\n\nIf you have any questions, please contact the Admin:\n${data.adminContactsText}\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">${titleHtmlEn}</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${messageHtmlEn}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Details & Pay</a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">If you have already paid, please click the button above to report it to the Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact Info:</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        }
    };
}
