export default function paymentUserTemplate(data: any) {
    return {
        vi: {
            subject: `[Đã ghi nhận] Yêu cầu thanh toán - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nHệ thống đã ghi nhận yêu cầu báo thanh toán của bạn.\nVui lòng chờ admin kiểm tra và duyệt nhé.\n\nThông tin liên hệ Admin:\n${data.adminContactsText}\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Yêu cầu đã được ghi nhận ⏳</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                        <p style="margin: 0; color: #1E40AF; text-align: center;">Trạng thái: <strong>Đang chờ Admin duyệt</strong></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Vui lòng chờ Admin kiểm tra tài khoản và xác nhận trong thời gian sớm nhất. Hệ thống sẽ tự động thông báo cho bạn ngay khi khoản thanh toán được duyệt.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        },
        en: {
            subject: `[Received] Payment Request - ${data.plan_name}`,
            body: `Hello ${data.full_name},\n\nWe have received your payment request.\nPlease wait for the admin to verify and approve it.\n\nAdmin Contact Info:\n${data.adminContactsText}\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Request Received ⏳</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">We have successfully received your payment request for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                        <p style="margin: 0; color: #1E40AF; text-align: center;">Status: <strong>Waiting for Admin Approval</strong></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Please allow some time for the admin to review and verify your payment. You will be notified automatically once it is approved.</p>
                    
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
