import { Env } from '../../utils/types';
import { jsonResponse } from '../../utils/auth';
import { sendEmail } from '../../utils/email';

// GET subscription info for the portal
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const token = context.params.token as string;
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

    try {
        const { DB } = context.env;
        const sub = await DB.prepare(`
            SELECT s.id, s.start_date, s.next_due_date, s.amount_due, s.status, s.personal_note,
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

        return jsonResponse({
            success: true,
            data: { subscription: sub, history: history.results }
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
        
        // 1. Verify token
        const subInfo = await DB.prepare(`
            SELECT s.id, s.amount_due, m.email, m.full_name, p.name as plan_name
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_token = ?
        `).bind(token).first<any>();

        if (!subInfo) return jsonResponse({ success: false, error: 'Invalid token' }, 404);

        const body = await context.request.json() as any;
        const reqId = 'req_' + Date.now();

        // 2. Insert payment request (Catch D1 UNIQUE constraint error if one is already pending)
        try {
            await DB.prepare(`
                INSERT INTO payment_requests (id, subscription_id, amount, status, user_note)
                VALUES (?, ?, ?, 'pending', ?)
            `).bind(reqId, subInfo.id, body.amount || subInfo.amount_due, body.user_note || '').run();
        } catch (dbErr: any) {
            // UNIQUE constraint failure for (subscription_id) WHERE status = 'pending'
            return jsonResponse({ success: false, error: 'Bạn đã báo thanh toán rồi, vui lòng chờ admin duyệt.' }, 400);
        }

        // 3. Update subscription status
        await DB.prepare("UPDATE subscriptions SET status = 'pending_payment' WHERE id = ?").bind(subInfo.id).run();

        const emailBody = `Chào ${subInfo.full_name},\n\nHệ thống đã ghi nhận yêu cầu báo thanh toán của bạn.\nVui lòng chờ admin kiểm tra và duyệt nhé.\n\nCảm ơn bạn!`;
        
        const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Yêu cầu đã được ghi nhận ⏳</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <h3 style="color: #111827; margin-top: 0;">Chào ${subInfo.full_name},</h3>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${subInfo.plan_name}</strong>.</p>
                
                <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                    <p style="margin: 0; color: #1E40AF; text-align: center;">Trạng thái: <strong>Đang chờ Admin duyệt</strong></p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px;">Vui lòng chờ Admin kiểm tra tài khoản và xác nhận trong thời gian sớm nhất. Hệ thống sẽ tự động thông báo cho bạn ngay khi khoản thanh toán được duyệt.</p>
                <p style="color: #6B7280; font-size: 14px; margin-top: 30px; text-align: center;">Cảm ơn bạn đã đồng hành cùng chúng tôi!</p>
            </div>
        </div>
        `;

        // 4. Send email confirmation to user (optional, can be disabled)
        await sendEmail(context.env, {
            to: subInfo.email,
            subject: `[Đã ghi nhận] Yêu cầu thanh toán - ${subInfo.plan_name}`,
            body: emailBody,
            htmlBody: htmlBody
        });

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
