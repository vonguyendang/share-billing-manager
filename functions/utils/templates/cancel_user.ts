export default function cancelUserTemplate(data: any) {
    return {
        vi: {
            subject: `[Xác nhận] Đã ghi nhận yêu cầu Hủy gia hạn - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nHệ thống đã ghi nhận yêu cầu Hủy gia hạn của bạn cho gói ${data.plan_name}.\nGói của bạn sẽ bị hủy khi hết hạn vào ngày ${data.formattedDate}.\n\nNếu bạn có thắc mắc hoặc muốn tiếp tục gia hạn, vui lòng liên hệ Admin:\n${data.adminContactsText}\n\nCảm ơn bạn đã sử dụng dịch vụ!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Đã ghi nhận yêu cầu Hủy gia hạn</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu <strong>Hủy gia hạn</strong> của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FECACA;">
                        <p style="margin: 0; color: #991B1B; text-align: center;">Bạn vẫn có thể sử dụng dịch vụ đến hết chu kỳ hiện tại (ngày ${data.formattedDate}).</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Tới ngày đến hạn, hệ thống sẽ tự động ngắt quyền truy cập của bạn vào dịch vụ này.</p>
                    
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
            subject: `[Confirmed] Cancellation Request Received - ${data.plan_name}`,
            body: `Hello ${data.full_name},\n\nWe have received your request to cancel the renewal for ${data.plan_name}.\nYour subscription will be canceled on ${data.formattedDate}.\n\nIf you have any questions or wish to continue, please contact the Admin:\n${data.adminContactsText}\n\nThank you for using our service!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Cancellation Request Confirmed</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hello ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">We have received your <strong>Cancellation Request</strong> for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FECACA;">
                        <p style="margin: 0; color: #991B1B; text-align: center;">You can continue using the service until ${data.formattedDate}.</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">On the due date, your access to this service will be automatically revoked.</p>
                    
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
