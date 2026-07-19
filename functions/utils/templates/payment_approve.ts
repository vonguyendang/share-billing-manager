export default function paymentApproveTemplate(data: any) {
    return {
        vi: {
            subject: `[Xác nhận] Thanh toán thành công - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nKhoản thanh toán của bạn cho gói ${data.plan_name} đã được Admin xác nhận thành công!\nChu kỳ sử dụng của bạn đã được gia hạn.\n\nThông tin chi tiết:\n- Gói dịch vụ: ${data.plan_name}\n- Hạn dùng mới: ${data.formattedNewDate}\n- Trạng thái: Đã thanh toán (Hoạt động)\n\nNếu có bất kỳ vấn đề gì, vui lòng liên hệ Admin:\n${data.adminContactsText}\n\nCảm ơn bạn đã tin tưởng và sử dụng dịch vụ!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Thanh Toán Thành Công 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Admin đã nhận được khoản thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Số tiền đã thanh toán:</strong> ${data.totalPaid} VNĐ</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Ngày đến hạn tiếp theo:</strong> <span style="font-size: 18px; font-weight: bold;">${data.formattedNewDate}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Chúc bạn có những trải nghiệm tuyệt vời cùng gia đình và bạn bè!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin (Nếu cần hỗ trợ):</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Đã duyệt thanh toán</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💰 Số tiền: <b>${data.totalPaid}đ</b>\n📅 Hạn mới: <b>${data.formattedNewDate}</b>\n👉 Chi tiết: <a href="${data.actualLink}">Hóa đơn</a>`
        },
        en: {
            subject: `[Confirmed] Payment Successful - ${data.plan_name}`,
            body: `Hello ${data.full_name},\n\nYour payment for the ${data.plan_name} plan has been successfully approved by the Admin!\nYour subscription has been renewed.\n\nDetails:\n- Plan: ${data.plan_name}\n- New Due Date: ${data.formattedNewDate}\n- Status: Paid (Active)\n\nIf you have any issues, please contact the Admin:\n${data.adminContactsText}\n\nThank you for using our service!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Payment Successful 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">The admin has received your payment for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Amount Paid:</strong> ${data.totalPaid} VND</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Next Due Date:</strong> <span style="font-size: 18px; font-weight: bold;">${data.formattedNewDate}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">We hope you enjoy your experience with family and friends!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact Info (If you need support):</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Payment Approved</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💰 Amount: <b>${data.totalPaid} VND</b>\n📅 New Due Date: <b>${data.formattedNewDate}</b>\n👉 Details: <a href="${data.actualLink}">Invoice</a>`
        }
    };
}
