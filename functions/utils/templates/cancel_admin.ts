export default function cancelAdminTemplate(data: any) {
    return {
        vi: {
            subject: `[Thông báo] Khách hàng ${data.full_name} hủy gia hạn gói ${data.plan_name}`,
            body: `Khách hàng ${data.full_name} yêu cầu hủy gia hạn.\n\nGói: ${data.plan_name}\n\nKhách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn. Vui lòng kiểm tra trên trang quản trị.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Khách hàng yêu cầu hủy gia hạn ⚠️</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Khách hàng:</strong> ${data.full_name}</p>
                    <p><strong>Gói:</strong> ${data.plan_name}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Khách hàng không muốn gia hạn chu kỳ sau. Tới ngày đến hạn, hãy ngắt quyền truy cập của khách hàng này.</p>
                </div>
            </div>
            `,
            tgMessage: `⚠️ <b>Khách hàng yêu cầu hủy gia hạn</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n\n👉 Khách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn.`
        },
        en: {
            subject: `[Notice] Customer ${data.full_name} cancelled renewal for ${data.plan_name}`,
            body: `Customer ${data.full_name} requested to cancel renewal.\n\nPlan: ${data.plan_name}\n\nCustomer doesn't want to renew for the next cycle. The system will auto-revoke access on the due date. Please check the admin dashboard.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Customer Cancellation Request ⚠️</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Customer:</strong> ${data.full_name}</p>
                    <p><strong>Plan:</strong> ${data.plan_name}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>The customer doesn't want to renew for the next cycle. Please revoke their access on the due date.</p>
                </div>
            </div>
            `,
            tgMessage: `⚠️ <b>Cancellation Request</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n\n👉 Customer doesn't want to renew. Auto-revoke will happen on due date.`
        }
    };
}
