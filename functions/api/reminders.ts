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

                const emailBody = `Chào ${sub.full_name},\n\nGói ${sub.plan_name} của bạn sẽ hết hạn trong ${sub.days_left} ngày tới (vào ${sub.next_due_date}).\nSố tiền cần thanh toán: ${sub.amount_due} VNĐ.\n\nVui lòng truy cập link sau để xem chi tiết và báo thanh toán:\n${actualLink}\n\nCảm ơn bạn!`;
                
                const success = await sendEmail(context.env, {
                    to: sub.email,
                    subject: `[Nhắc nhở] Sắp đến hạn thanh toán - ${sub.plan_name}`,
                    body: emailBody
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
