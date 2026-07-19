export default function paymentAdminTemplate(data: any) {
    const noteVi = data.user_note ? `\n📝 Ghi chú: <i>${data.user_note}</i>` : '';
    const noteEn = data.user_note ? `\n📝 Note: <i>${data.user_note}</i>` : '';
    const amountStr = data.amount.toLocaleString();
    
    return {
        vi: {
            subject: `[Thanh toán] Yêu cầu mới từ ${data.full_name} - ${data.plan_name}`,
            body: `Có yêu cầu thanh toán mới từ ${data.full_name}.\n\nKhách hàng: ${data.full_name}\nGói: ${data.plan_name}\nSố tiền: ${amountStr}đ\nGhi chú: ${data.user_note || 'Không có'}\n\nVui lòng vào trang quản trị để kiểm tra và duyệt.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Yêu cầu thanh toán mới 🔔</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Khách hàng:</strong> ${data.full_name}</p>
                    <p><strong>Gói:</strong> ${data.plan_name}</p>
                    <p><strong>Số tiền:</strong> ${amountStr} VNĐ</p>
                    <p><strong>Ghi chú:</strong> ${data.user_note || 'Không có'}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Vui lòng vào trang quản trị để kiểm tra và duyệt.</p>
                </div>
            </div>
            `,
            tgMessage: `🔔 <b>Yêu cầu thanh toán mới</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💰 Số tiền: <b>${amountStr}đ</b>${noteVi}\n\n👉 Vui lòng vào trang quản trị để kiểm tra và duyệt.`
        },
        en: {
            subject: `[Payment] New request from ${data.full_name} - ${data.plan_name}`,
            body: `New payment request from ${data.full_name}.\n\nCustomer: ${data.full_name}\nPlan: ${data.plan_name}\nAmount: ${amountStr} VND\nNote: ${data.user_note || 'None'}\n\nPlease check the admin dashboard to verify.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">New Payment Request 🔔</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Customer:</strong> ${data.full_name}</p>
                    <p><strong>Plan:</strong> ${data.plan_name}</p>
                    <p><strong>Amount:</strong> ${amountStr} VND</p>
                    <p><strong>Note:</strong> ${data.user_note || 'None'}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Please log in to the admin dashboard to review and approve.</p>
                </div>
            </div>
            `,
            tgMessage: `🔔 <b>New Payment Request</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💰 Amount: <b>${amountStr} VND</b>${noteEn}\n\n👉 Please verify on the admin dashboard.`
        }
    };
}
