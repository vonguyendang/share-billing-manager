import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        
        // 1. Check if reminders are globally enabled
        const settings = await DB.prepare("SELECT reminders_enabled FROM admin_settings WHERE id = 'global'").first<{reminders_enabled: number}>();
        if (settings && settings.reminders_enabled === 0) {
            return jsonResponse({ success: false, error: 'Reminders are disabled in settings' }, 400);
        }

        // 2. Find subscriptions due in 7, 3, or 1 days
        const dueQuery = await DB.prepare(`
            SELECT s.id, s.next_due_date, s.amount_due, m.email, m.full_name, p.name as plan_name,
                   CAST(julianday(s.next_due_date) - julianday(date('now')) AS INTEGER) as days_left
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status = 'active'
            AND days_left IN (7, 3, 1)
        `).all<any>();

        let sentCount = 0;
        let errorsCount = 0;

        for (const sub of dueQuery.results) {
            const emailType = `${sub.days_left}_days`;
            
            // Check idempotency (has this reminder been sent for this target_date?)
            const logId = `log_${Date.now()}_${sub.id}`;
            try {
                // Try to insert log first. If it fails due to UNIQUE constraint, it means we already sent it.
                await DB.prepare(`
                    INSERT INTO email_logs (id, subscription_id, email_type, target_date)
                    VALUES (?, ?, ?, ?)
                `).bind(logId, sub.id, emailType, sub.next_due_date).run();
                
                // If log inserted, send email
                const portalLink = `${context.env.APP_URL}/portal.html?token=...`; // In real life, fetch token
                // Actually we need the token
                const tokenRec = await DB.prepare("SELECT user_token FROM subscriptions WHERE id = ?").bind(sub.id).first<{user_token: string}>();
                const actualLink = `${context.env.APP_URL}/portal.html?token=${tokenRec?.user_token}`;

                // Format date as dd-mm-yyyy
                const parts = sub.next_due_date.split(' ')[0].split('-');
                const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : sub.next_due_date;
                
                let formattedDeadline = '';
                if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    d.setDate(d.getDate() + 4);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    formattedDeadline = `${dd}-${mm}-${yyyy}`;
                }

                const emailBody = `Chào ${sub.full_name},\n\nGói ${sub.plan_name} của bạn sẽ hết hạn trong ${sub.days_left} ngày tới (vào ${formattedDate}).\nSố tiền cần thanh toán: ${sub.amount_due.toLocaleString()} VNĐ.\n\nVui lòng truy cập link sau để xem chi tiết và báo thanh toán:\n${actualLink}\n\nVui lòng thanh toán trước ngày ${formattedDeadline} để đảm bảo dịch vụ được duy trì liên tục.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`;
                
                const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Share Billing Manager</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <h3 style="color: #111827; margin-top: 0;">Chào ${sub.full_name},</h3>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Gói dịch vụ <strong>${sub.plan_name}</strong> của bạn sắp đến hạn thanh toán.</p>
                        
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Ngày đến hạn:</strong> <span style="color: #EF4444;">${formattedDate}</span> (còn ${sub.days_left} ngày)</p>
                            <p style="margin: 5px 0;"><strong>Số tiền cần đóng:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${sub.amount_due.toLocaleString()} VNĐ</span></p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Xem Chi Tiết & Thanh Toán</a>
                        </div>
                        
                        <p style="color: #EF4444; font-size: 14px; text-align: center; margin-bottom: 20px;">Vui lòng thanh toán trước ngày <strong>${formattedDeadline}</strong> để đảm bảo dịch vụ được duy trì liên tục.</p>
                        <p style="color: #6B7280; font-size: 14px; text-align: center;">Nếu bạn đã thanh toán, vui lòng nhấn vào nút bên trên để báo cáo cho Admin.</p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                            <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                            <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                            <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                            <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                        </div>
                    </div>
                </div>
                `;

                const success = await sendEmail(context.env, {
                    to: sub.email,
                    subject: `[Nhắc nhở] Sắp đến hạn thanh toán - ${sub.plan_name}`,
                    body: emailBody,
                    htmlBody: htmlBody
                });

                if (success) {
                    sentCount++;
                } else {
                    errorsCount++;
                    // Optional: remove log if send failed, so it can be retried later
                    await DB.prepare("DELETE FROM email_logs WHERE id = ?").bind(logId).run();
                }

            } catch (err: any) {
                // D1 constraint error (UNIQUE) usually means already sent. Just ignore.
                console.log(`Email ${emailType} for ${sub.id} already sent for date ${sub.next_due_date}`);
            }
        }

        return jsonResponse({ success: true, data: { sent: sentCount, errors: errorsCount } });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
