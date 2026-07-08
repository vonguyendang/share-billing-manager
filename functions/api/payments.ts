import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';

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
        const { request_id, action } = body;

        if (action !== 'approve' && action !== 'reject') {
            return jsonResponse({ success: false, error: 'Invalid action' }, 400);
        }

        const { DB } = context.env;
        const reqInfo = await DB.prepare(`
            SELECT pr.*, s.billing_cycle_months, s.next_due_date, m.email, m.full_name, p.name as plan_name
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE pr.id = ? AND pr.status = 'pending'
        `).bind(request_id).first<any>();

        if (!reqInfo) {
            return jsonResponse({ success: false, error: 'Request not found or already processed' }, 404);
        }

        if (action === 'approve') {
            // Calculate new due date (add months)
            const oldDate = new Date(reqInfo.next_due_date);
            oldDate.setMonth(oldDate.getMonth() + reqInfo.billing_cycle_months);
            const newDateStr = oldDate.toISOString().split('T')[0];

            // Update in transaction-like manner using batch
            await DB.batch([
                DB.prepare("UPDATE payment_requests SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?").bind(request_id),
                DB.prepare("UPDATE subscriptions SET next_due_date = ?, status = 'active' WHERE id = ?").bind(newDateStr, reqInfo.subscription_id)
            ]);

            // Try sending email
            const emailBody = `Chào ${reqInfo.full_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${reqInfo.amount} cho gói ${reqInfo.plan_name}.\nHạn dùng tiếp theo của bạn là: ${newDateStr}.\n\nCảm ơn bạn!`;
            await sendEmail(context.env, {
                to: reqInfo.email,
                subject: `[Xác nhận] Thanh toán thành công - ${reqInfo.plan_name}`,
                body: emailBody
            });

        } else if (action === 'reject') {
            await DB.prepare("UPDATE payment_requests SET status = 'rejected' WHERE id = ?").bind(request_id).run();
            // Subscription status stays pending_payment or active
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
