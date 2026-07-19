import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
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
            WHERE pr.status != 'pending'
            ORDER BY COALESCE(pr.approved_at, pr.created_at) DESC
            LIMIT 50
        `).all();
        return jsonResponse({ success: true, data: results });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        if (!id) return jsonResponse({ success: false, error: 'ID required' }, 400);

        const { DB } = context.env;
        const reqInfo = await DB.prepare(`
            SELECT pr.*, s.amount_due, s.billing_cycle_months, s.next_due_date, s.user_token, m.full_name as member_name
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            WHERE pr.id = ?
        `).bind(id).first<any>();

        if (!reqInfo) {
            return jsonResponse({ success: false, error: 'Request not found' }, 404);
        }

        if (reqInfo.status === 'approved') {
            // Need to revert the subscription next_due_date
            let newDateStr = reqInfo.previous_due_date;

            // Fallback calculation if previous_due_date is missing (old records)
            if (!newDateStr) {
                const monthlyPrice = reqInfo.amount_due / reqInfo.billing_cycle_months;
                const addedMonths = reqInfo.amount / monthlyPrice;
                
                const wholeMonths = Math.floor(addedMonths);
                const fractionalMonth = addedMonths - wholeMonths;
                const addedDays = Math.round(fractionalMonth * 30);

                let rawDate = reqInfo.next_due_date.split(' ')[0];
                if (rawDate.includes('/')) {
                    const parts = rawDate.split('/');
                    if (parts.length === 3) rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else if (rawDate.split('-').length === 3 && rawDate.split('-')[0].length <= 2) {
                    const parts = rawDate.split('-');
                    rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                const oldDate = new Date(rawDate);
                oldDate.setMonth(oldDate.getMonth() - wholeMonths);
                oldDate.setDate(oldDate.getDate() - addedDays);
                newDateStr = oldDate.toISOString().split('T')[0];
            }

            await DB.batch([
                DB.prepare("UPDATE subscriptions SET next_due_date = ? WHERE id = ?").bind(newDateStr, reqInfo.subscription_id),
                DB.prepare("DELETE FROM payment_requests WHERE id = ?").bind(id)
            ]);

            // Notify via Telegram about undo
            const adminSettings = await DB.prepare(`SELECT admin_language FROM admin_settings WHERE id = 'global'`).first<any>();
            const adminLang = adminSettings?.admin_language || 'vi';
            
            const adminNotif = getNotificationContent(adminLang, 'payment_undo', {
                full_name: reqInfo.member_name,
                amount: reqInfo.amount,
                actualLink: `${context.env.APP_URL}/portal.html?token=${reqInfo.user_token}`,
                newDateStr
            });
            context.waitUntil(sendTelegramNotification(context.env, adminNotif.tgMessage!));

        } else {
            // Just delete rejected requests
            await DB.prepare("DELETE FROM payment_requests WHERE id = ?").bind(id).run();
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
