export default function paymentApproveTemplate(data: any) {
    return {
        vi: {
            subject: `[Xác nhận] Thanh toán thành công - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${data.totalPaid} VNĐ cho gói ${data.plan_name}.\nHạn dùng tiếp theo của bạn là: ${data.formattedNewDate}.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`,
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
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Đã duyệt thanh toán</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💰 Số tiền: <b>${data.totalPaid}đ</b>\n📅 Hạn mới: <b>${data.formattedNewDate}</b>`
        },
        en: {
            subject: `[Confirmed] Payment Successful - ${data.plan_name}`,
            body: `Hi ${data.full_name},\n\nThe admin has successfully verified your payment of ${data.totalPaid} VND for the ${data.plan_name} plan.\nYour next due date is: ${data.formattedNewDate}.\n\nAdmin Contact:\n- Zalo/Phone: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nThank you!`,
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
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Payment Approved</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💰 Amount: <b>${data.totalPaid} VND</b>\n📅 New Due Date: <b>${data.formattedNewDate}</b>`
        }
    };
}
