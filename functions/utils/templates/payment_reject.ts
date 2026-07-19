export default function paymentRejectTemplate(data: any) {
    return {
        vi: {
            subject: `[Từ chối] Yêu cầu thanh toán - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nAdmin đã từ chối yêu cầu báo thanh toán của bạn cho gói ${data.plan_name}.\n\nLý do: ${data.admin_note || 'Không có ghi chú'}\n\nVui lòng kiểm tra lại thông tin chuyển khoản và liên hệ với Admin nếu có sai sót:\n${data.adminContactsText}\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Từ Chối Thanh Toán ❌</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Rất tiếc, Admin đã <strong>từ chối</strong> yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FCA5A5;">
                        <p style="margin: 5px 0; color: #991B1B;"><strong>Lý do từ chối:</strong></p>
                        <p style="margin: 5px 0; color: #991B1B; font-style: italic;">"${data.admin_note || 'Không có ghi chú'}"</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Vui lòng kiểm tra lại giao dịch ngân hàng của bạn. Nếu có sai sót, bạn có thể truy cập lại đường link Portal để gửi báo cáo thanh toán mới, hoặc liên hệ trực tiếp với Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: `❌ <b>Đã từ chối thanh toán</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💬 Lý do: <i>${data.admin_note || 'Không có ghi chú'}</i>`
        },
        en: {
            subject: `[Rejected] Payment Request - ${data.plan_name}`,
            body: `Hello ${data.full_name},\n\nThe admin has rejected your payment request for the ${data.plan_name} plan.\n\nReason: ${data.admin_note || 'No note provided'}\n\nPlease check your transaction details and contact the Admin if this is a mistake:\n${data.adminContactsText}\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Payment Rejected ❌</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Unfortunately, the admin has <strong>rejected</strong> your payment request for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FCA5A5;">
                        <p style="margin: 5px 0; color: #991B1B;"><strong>Reason for rejection:</strong></p>
                        <p style="margin: 5px 0; color: #991B1B; font-style: italic;">"${data.rejectReason}"</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Please double-check your bank transactions. If this is a mistake, you can visit the Portal to submit a new payment report, or contact the admin directly.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact Info:</strong></p>
                        ${data.adminContactsHtml}
                    </div>
                </div>
            </div>
            `,
            tgMessage: `❌ <b>Payment Rejected</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💬 Reason: <i>${data.rejectReason}</i>`
        }
    };
}
