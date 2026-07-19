import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';
import { getNotificationContent } from '../utils/i18n-backend';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        
        // 1. Check if reminders are globally enabled
        const settings = await DB.prepare("SELECT reminders_enabled, reminder_days, customer_language, admin_language, admin_contacts FROM admin_settings WHERE id = 'global'").first<any>();
        if (settings && settings.reminders_enabled === 0) {
            return jsonResponse({ success: false, error: 'Reminders are disabled in settings' }, 400);
        }

        const customerLang = settings?.customer_language || 'vi';
        const adminLang = settings?.admin_language || 'vi';

        const reminderDaysStr = settings?.reminder_days || '7,3,1,0,-2,-4';
        const reminderDaysArr = reminderDaysStr.split(',').map((d: string) => parseInt(d.trim())).filter((d: number) => !isNaN(d));
        
        if (reminderDaysArr.length === 0) {
            return jsonResponse({ success: true, data: { sent: 0, errors: 0, message: "No reminder days configured" } });
        }

        const autoPauseDay = Math.min(...reminderDaysArr);

        // 2. Find subscriptions due based on configured days
        const dueQuery = await DB.prepare(`
            SELECT s.id, s.next_due_date, s.amount_due, m.email, m.full_name, p.name as plan_name,
                   CAST(julianday(s.next_due_date) - julianday(date('now')) AS INTEGER) as days_left
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status = 'active'
            AND (s.send_email = 1 OR s.send_email IS NULL)
            AND days_left IN (${reminderDaysArr.join(',')})
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
                    const daysToDeadline = autoPauseDay < 0 ? Math.abs(autoPauseDay) : 0;
                    d.setDate(d.getDate() + daysToDeadline);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    formattedDeadline = `${dd}-${mm}-${yyyy}`;
                }

                const dataForNotification = {
                    plan_name: sub.plan_name,
                    full_name: sub.full_name,
                    days_left: sub.days_left,
                    formattedDate: formattedDate,
                    formattedDeadline: formattedDeadline,
                    amount_due: sub.amount_due.toLocaleString(),
                    actualLink: actualLink,
                    isAutoPauseDay: sub.days_left === autoPauseDay && autoPauseDay < 0,
                    admin_contacts: settings?.admin_contacts
                };

                const userNotif = getNotificationContent(customerLang, 'reminder', dataForNotification);

                const success = await sendEmail(context.env, {
                    to: sub.email,
                    subject: userNotif.subject!,
                    body: userNotif.body!,
                    htmlBody: userNotif.htmlBody!
                });

                if (success) {
                    sentCount++;
                    
                    // Telegram Notification for Admin
                    const adminNotif = getNotificationContent(adminLang, 'reminder_admin', dataForNotification);
                    context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));

                    // Auto pause if it is the most negative day configured
                    if (sub.days_left === autoPauseDay && autoPauseDay < 0) {
                        await DB.prepare("UPDATE subscriptions SET status = 'paused' WHERE id = ?").bind(sub.id).run();
                    }
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
