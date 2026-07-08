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
            const emailBody = `Chào ${reqInfo.full_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${reqInfo.amount.toLocaleString()} VNĐ cho gói ${reqInfo.plan_name}.\nHạn dùng tiếp theo của bạn là: ${newDateStr}.\n\nCảm ơn bạn!`;
            
            const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Thanh Toán Thành Công 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${reqInfo.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Admin đã nhận được khoản thanh toán của bạn cho gói dịch vụ <strong>${reqInfo.plan_name}</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Số tiền đã đóng:</strong> ${reqInfo.amount.toLocaleString()} VNĐ</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Ngày đến hạn tiếp theo:</strong> <span style="font-size: 18px; font-weight: bold;">${newDateStr}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Chúc bạn có những trải nghiệm tuyệt vời cùng gia đình và bạn bè!</p>
                    <p style="color: #6B7280; font-size: 14px; margin-top: 30px; text-align: center;">Share Billing Manager</p>
                </div>
            </div>
            `;

            await sendEmail(context.env, {
                to: reqInfo.email,
                subject: `[Xác nhận] Thanh toán thành công - ${reqInfo.plan_name}`,
                body: emailBody,
                htmlBody: htmlBody
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
