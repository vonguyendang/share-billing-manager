import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';
import { getNotificationContent } from '../utils/i18n-backend';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { results } = await context.env.DB.prepare(`
            SELECT pr.*, s.amount_due as expected_amount, m.full_name as member_name, p.name as plan_name 
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE pr.status = 'pending'
            ORDER BY pr.created_at ASC
        `).all();
        return jsonResponse({ success: true, data: results });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const body = await context.request.json() as any;
        const { request_id, action, total_paid } = body;

        if (action !== 'approve' && action !== 'reject') {
            return jsonResponse({ success: false, error: 'Invalid action' }, 400);
        }

        const { DB } = context.env;
        const reqInfo = await DB.prepare(`
            SELECT pr.*, s.amount_due, s.billing_cycle_months, s.next_due_date, s.send_email, m.email, m.full_name, p.name as plan_name
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE pr.id = ? AND pr.status = 'pending'
        `).bind(request_id).first<any>();

        const adminSettings = await DB.prepare(`
            SELECT customer_language, admin_language FROM admin_settings WHERE id = 'global'
        `).first<any>();
        
        const customerLang = adminSettings?.customer_language || 'vi';
        const adminLang = adminSettings?.admin_language || 'vi';

        if (!reqInfo) {
            return jsonResponse({ success: false, error: 'Request not found or already processed' }, 404);
        }

        if (action === 'approve') {
            const totalPaid = total_paid || reqInfo.amount;

            // Calculate monthly price and how many months they paid for
            const monthlyPrice = reqInfo.amount_due / reqInfo.billing_cycle_months;
            const addedMonths = totalPaid / monthlyPrice;

            const wholeMonths = Math.floor(addedMonths);
            const fractionalMonth = addedMonths - wholeMonths;
            const addedDays = Math.round(fractionalMonth * 30); // Approximate 1 month = 30 days

            // Handle potentially malformed dates (e.g. DD/MM/YYYY)
            let rawDate = reqInfo.next_due_date.split(' ')[0];
            if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else if (rawDate.split('-').length === 3 && rawDate.split('-')[0].length <= 2) {
                const parts = rawDate.split('-');
                rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            // Calculate new due date
            const oldDate = new Date(rawDate);
            if (isNaN(oldDate.getTime())) {
                throw new Error("Dữ liệu ngày tháng không hợp lệ trong database: " + reqInfo.next_due_date);
            }

            oldDate.setMonth(oldDate.getMonth() + wholeMonths);
            oldDate.setDate(oldDate.getDate() + addedDays);
            const newDateStr = oldDate.toISOString().split('T')[0];

            // Update in transaction-like manner using batch
            await DB.batch([
                DB.prepare("UPDATE payment_requests SET status = 'approved', amount = ?, previous_due_date = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?").bind(totalPaid, reqInfo.next_due_date, request_id),
                DB.prepare("UPDATE subscriptions SET next_due_date = ?, status = 'active' WHERE id = ?").bind(newDateStr, reqInfo.subscription_id)
            ]);

            // Try sending email
            const newDateParts = newDateStr.split('-');
            const formattedNewDate = newDateParts.length === 3 ? `${newDateParts[2]}-${newDateParts[1]}-${newDateParts[0]}` : newDateStr;

            const dataForNotification = { ...reqInfo, totalPaid: totalPaid.toLocaleString(), formattedNewDate };

            if (reqInfo.send_email !== 0) {
                const userNotif = getNotificationContent(customerLang, 'payment_approve', dataForNotification);
                await sendEmail(context.env, {
                    to: reqInfo.email,
                    subject: userNotif.subject!,
                    body: userNotif.body!,
                    htmlBody: userNotif.htmlBody!
                });
            }

            // Telegram Notification
            const adminNotif = getNotificationContent(adminLang, 'payment_approve', dataForNotification);
            context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));

        } else if (action === 'reject') {
            const rejectReason = body.reject_reason || 'Không rõ lý do';

            await DB.batch([
                DB.prepare("UPDATE payment_requests SET status = 'rejected' WHERE id = ?").bind(request_id),
                // Reset subscription status so they can submit again if needed
                DB.prepare("UPDATE subscriptions SET status = 'active' WHERE id = ?").bind(reqInfo.subscription_id)
            ]);

            const dataForNotification = { ...reqInfo, rejectReason };

            if (reqInfo.send_email !== 0) {
                const userNotif = getNotificationContent(customerLang, 'payment_reject', dataForNotification);
                await sendEmail(context.env, {
                    to: reqInfo.email,
                    subject: userNotif.subject!,
                    body: userNotif.body!,
                    htmlBody: userNotif.htmlBody!
                });
            }

            // Telegram Notification
            const adminNotif = getNotificationContent(adminLang, 'payment_reject', dataForNotification);
            context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
