import { Env } from '../../utils/types';
import { jsonResponse } from '../../utils/auth';
import { sendEmail } from '../../utils/email';
import { sendTelegramNotification } from '../../utils/telegram';
import { getNotificationContent } from '../../utils/i18n-backend';

// GET subscription info for the portal
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const token = context.params.token as string;
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

    try {
        const { DB } = context.env;
        
        let sub: any = null;
        let historyResults: any[] = [];
        
        if (token === 'test_token_123') {
            const now = new Date();
            const dueDate = new Date(now);
            dueDate.setDate(now.getDate() + 3);
            
            sub = {
                id: 999999,
                start_date: new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0],
                next_due_date: dueDate.toISOString().split('T')[0],
                amount_due: '500000',
                status: 'active',
                personal_note: 'Đây là giao diện mô phỏng (Test Portal).',
                billing_cycle_months: 1,
                member_name: 'Nguyễn Văn Test',
                plan_name: 'Gói VIP (Mock)',
                plan_note: 'Gói thử nghiệm dành cho tính năng gửi Email/Telegram.'
            };
            historyResults = [];
        } else {
            sub = await DB.prepare(`
                SELECT s.id, s.start_date, s.next_due_date, s.amount_due, s.status, s.personal_note, s.billing_cycle_months,
                       m.full_name as member_name, p.name as plan_name, p.note as plan_note
                FROM subscriptions s
                JOIN members m ON s.member_id = m.id
                JOIN plans p ON s.plan_id = p.id
                WHERE s.user_token = ?
            `).bind(token).first<any>();

            if (!sub) return jsonResponse({ success: false, error: 'Invalid token' }, 404);

            // Fetch recent payment history
            const history = await DB.prepare(`
                SELECT amount, status, created_at, user_note, approved_at 
                FROM payment_requests 
                WHERE subscription_id = ? 
                ORDER BY created_at DESC LIMIT 5
            `).bind(sub.id).all();
            historyResults = history.results;
        }


        // Fetch settings (bank info, user cancel)
        const settings = await DB.prepare(`
            SELECT bank_id, bank_account_number, bank_account_name, 
                   alt_bank_id, alt_bank_account_number, alt_bank_account_name, 
                   allow_user_cancel
            FROM admin_settings WHERE id = 'global'
        `).first<any>();

        return jsonResponse({
            success: true,
            data: { 
                subscription: sub, 
                history: historyResults,
                settings: settings || {}
            }
        });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

// POST submit a payment confirmation
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const token = context.params.token as string;
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

    try {
        const { DB } = context.env;
        
        let subInfo: any = null;
        if (token === 'test_token_123') {
            subInfo = {
                id: 999999,
                amount_due: '500000',
                send_email: 1,
                email: 'test@example.com',
                full_name: 'Nguyễn Văn Test',
                plan_name: 'Gói VIP (Mock)',
                user_token: 'test_token_123'
            };
        } else {
            subInfo = await DB.prepare(`
                SELECT s.id, s.amount_due, s.send_email, s.user_token, m.email, m.full_name, p.name as plan_name
                FROM subscriptions s
                JOIN members m ON s.member_id = m.id
                JOIN plans p ON s.plan_id = p.id
                WHERE s.user_token = ?
            `).bind(token).first<any>();
            
            if (!subInfo) return jsonResponse({ success: false, error: 'Invalid token' }, 404);
        }

        const body = await context.request.json() as any;

        // Check if action is cancel_pending
        if (body.action === 'cancel_pending') {
            const settings = await DB.prepare("SELECT allow_user_cancel, admin_email_notifications_enabled, admin_email_notification_to, admin_email_notification_cc, admin_email_notification_bcc, customer_language, admin_language, admin_contacts FROM admin_settings WHERE id = 'global'").first<any>();
            if (settings?.allow_user_cancel !== 1) {
                return jsonResponse({ success: false, error: 'Tính năng tự hủy gia hạn chưa được bật.' }, 403);
            }
            
            if (token !== 'test_token_123') {
                await DB.prepare("UPDATE subscriptions SET status = 'cancel_pending' WHERE id = ?").bind(subInfo.id).run();
            }
            
            const dataForNotification = {
                ...subInfo,
                formattedDate: subInfo.next_due_date,
                actualLink: `${context.env.APP_URL}/portal.html?token=${subInfo.user_token}`,
                admin_contacts: settings?.admin_contacts
            };

            const adminLang = settings.admin_language || 'vi';
            const adminNotif = getNotificationContent(adminLang, 'cancel_admin', dataForNotification);

            context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));
            
            if (settings.admin_email_notifications_enabled === 1 && settings.admin_email_notification_to) {
                context.waitUntil(sendEmail(context.env, {
                    to: settings.admin_email_notification_to,
                    cc: settings.admin_email_notification_cc || undefined,
                    bcc: settings.admin_email_notification_bcc || undefined,
                    subject: adminNotif.subject!,
                    body: adminNotif.body!,
                    htmlBody: adminNotif.htmlBody!
                }));
            }
            
            if (subInfo.send_email !== 0) {
                const customerLang = settings.customer_language || 'vi';
                const userNotif = getNotificationContent(customerLang, 'cancel_user', dataForNotification);

                context.waitUntil(sendEmail(context.env, {
                    to: subInfo.email,
                    subject: userNotif.subject!,
                    body: userNotif.body!,
                    htmlBody: userNotif.htmlBody!
                }));
            }
            
            return jsonResponse({ success: true, message: 'Đã gửi yêu cầu hủy gia hạn thành công.' });
        }

        // 2. Insert payment request (Catch D1 UNIQUE constraint error if one is already pending)
        try {
            // 3. Insert payment request
            const amount = body.amount || subInfo.amount_due;
            if (token !== 'test_token_123') {
                await DB.prepare(`
                    INSERT INTO payment_requests (subscription_id, amount, status, user_note) 
                    VALUES (?, ?, 'pending', ?)
                `).bind(subInfo.id, amount, body.user_note || '').run();
            }
        } catch (dbErr: any) {
            // UNIQUE constraint failure for (subscription_id) WHERE status = 'pending'
            return jsonResponse({ success: false, error: 'Bạn đã báo thanh toán rồi, vui lòng chờ admin duyệt.' }, 400);
        }

        // 3. Update subscription status
        if (token !== 'test_token_123') {
            await DB.prepare("UPDATE subscriptions SET status = 'pending_payment' WHERE id = ?").bind(subInfo.id).run();
        }

        // Get admin settings to know the languages
        const adminSettings = await DB.prepare(`
            SELECT admin_email_notifications_enabled, admin_email_notification_to, admin_email_notification_cc, admin_email_notification_bcc, customer_language, admin_language, admin_contacts
            FROM admin_settings WHERE id = 'global'
        `).first<any>();

        const customerLang = adminSettings?.customer_language || 'vi';
        const adminLang = adminSettings?.admin_language || 'vi';

        // 4. Send email confirmation to user (optional, can be disabled)
        const amount = body.amount || subInfo.amount_due;
        const dataForNotification = { 
            ...subInfo, 
            amount, 
            user_note: body.user_note,
            actualLink: `${context.env.APP_URL}/portal.html?token=${subInfo.user_token}`,
            admin_contacts: adminSettings?.admin_contacts
        };

        if (subInfo.send_email !== 0) {
            const userNotif = getNotificationContent(customerLang, 'payment_user', dataForNotification);
            await sendEmail(context.env, {
                to: subInfo.email,
                subject: userNotif.subject!,
                body: userNotif.body!,
                htmlBody: userNotif.htmlBody!
            });
        }

        // 5. Send Telegram notification to admin
        const adminNotif = getNotificationContent(adminLang, 'payment_admin', dataForNotification);
        
        context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));

        // 6. Send Email notification to admin (if enabled)
        if (adminSettings && adminSettings.admin_email_notifications_enabled === 1 && adminSettings.admin_email_notification_to) {
            context.waitUntil(sendEmail(context.env, {
                to: adminSettings.admin_email_notification_to,
                cc: adminSettings.admin_email_notification_cc || undefined,
                bcc: adminSettings.admin_email_notification_bcc || undefined,
                subject: adminNotif.subject!,
                body: adminNotif.body!,
                htmlBody: adminNotif.htmlBody!
            }));
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
