import { Env } from '../utils/types';
import { checkAuth, jsonResponse, generateToken } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    
    try {
        const { results } = await context.env.DB.prepare(`
            SELECT s.*, m.full_name as member_name, m.email as member_email, p.name as plan_name 
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            ORDER BY s.next_due_date ASC
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
        
        // If updating a token
        if (body.action === 'regenerate_token' && body.id) {
            const newToken = generateToken();
            await context.env.DB.prepare(`
                UPDATE subscriptions SET user_token = ?, token_updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `).bind(newToken, body.id).run();
            return jsonResponse({ success: true, data: { token: newToken } });
        }

        // Direct mark paid from admin dashboard
        if (body.action === 'mark_paid' && body.id) {
            const sub = await context.env.DB.prepare(`
                SELECT s.*, m.full_name as member_name, m.email as member_email, p.name as plan_name 
                FROM subscriptions s
                JOIN members m ON s.member_id = m.id
                JOIN plans p ON s.plan_id = p.id
                WHERE s.id = ?
            `).bind(body.id).first<any>();
            if (!sub) return jsonResponse({ success: false, error: 'Sub not found' }, 404);
            
            const monthlyPrice = sub.amount_due / sub.billing_cycle_months;
            const addedMonths = body.total_paid / monthlyPrice;
            const wholeMonths = Math.floor(addedMonths);
            const fractionalMonth = addedMonths - wholeMonths;
            const addedDays = Math.round(fractionalMonth * 30);
            
            let rawDate = sub.next_due_date.split(' ')[0];
            if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else if (rawDate.split('-').length === 3 && rawDate.split('-')[0].length <= 2) {
                const parts = rawDate.split('-');
                rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            const oldDate = new Date(rawDate);
            oldDate.setMonth(oldDate.getMonth() + wholeMonths);
            oldDate.setDate(oldDate.getDate() + addedDays);
            const newDateStr = oldDate.toISOString().split('T')[0];

            await context.env.DB.prepare("UPDATE subscriptions SET next_due_date = ?, status = 'active' WHERE id = ?").bind(newDateStr, body.id).run();
            
            const reqId = 'pay_' + Date.now();
            await context.env.DB.prepare(`
                INSERT INTO payment_requests (id, subscription_id, amount, status, created_at, processed_at)
                VALUES (?, ?, ?, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(reqId, body.id, body.total_paid).run();
            
            // Try sending email
            const newDateParts = newDateStr.split('-');
            const formattedNewDate = newDateParts.length === 3 ? `${newDateParts[2]}-${newDateParts[1]}-${newDateParts[0]}` : newDateStr;

            const emailBody = `Chào ${sub.member_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${body.total_paid.toLocaleString()} VNĐ cho gói ${sub.plan_name}.\nHạn dùng tiếp theo của bạn là: ${formattedNewDate}.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`;

            const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Thanh Toán Thành Công 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${sub.member_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Admin đã nhận được khoản thanh toán của bạn cho gói dịch vụ <strong>${sub.plan_name}</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Số tiền đã thanh toán:</strong> ${body.total_paid.toLocaleString()} VNĐ</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Ngày đến hạn tiếp theo:</strong> <span style="font-size: 18px; font-weight: bold;">${formattedNewDate}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Chúc bạn có những trải nghiệm tuyệt vời cùng gia đình và bạn bè!</p>
                    
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

            if (sub.send_email !== 0) {
                await sendEmail(context.env, {
                    to: sub.member_email,
                    subject: `[Xác nhận] Thanh toán thành công - ${sub.plan_name}`,
                    body: emailBody,
                    htmlBody: htmlBody
                });
            }

            // Telegram Notification
            const tgMessage = `✅ <b>Đã gia hạn nhanh (Thanh toán thành công)</b>\n👤 Khách hàng: <b>${sub.member_name}</b>\n📦 Gói: <b>${sub.plan_name}</b>\n💰 Số tiền: <b>${body.total_paid.toLocaleString()}đ</b>\n📅 Hạn mới: <b>${formattedNewDate}</b>`;
            context.waitUntil(sendTelegramNotification(context.env, tgMessage));

            return jsonResponse({ success: true, data: { new_date: newDateStr } });
        }

        // Creating new subscription
        const id = 'sub_' + Date.now();
        const token = generateToken();
        
        // Validate slots
        const plan = await context.env.DB.prepare("SELECT max_slots FROM plans WHERE id = ?").bind(body.plan_id).first<{max_slots: number}>();
        if (plan && plan.max_slots > 0) {
            const activeSubs = await context.env.DB.prepare("SELECT count(*) as count FROM subscriptions WHERE plan_id = ? AND status != 'paused'").bind(body.plan_id).first<{count: number}>();
            if (activeSubs && activeSubs.count >= plan.max_slots) {
                return jsonResponse({ success: false, error: 'Gói này đã đạt giới hạn slot tối đa.' }, 400);
            }
        }

        // Prevent duplicate member in same plan
        const existingSub = await context.env.DB.prepare(
            "SELECT id FROM subscriptions WHERE member_id = ? AND plan_id = ?"
        ).bind(body.member_id, body.plan_id).first();
        
        if (existingSub) {
            return jsonResponse({ success: false, error: 'Thành viên này đã có sẵn trong gói rồi! Nếu một người muốn mua 2 slot, hãy tạo thêm 1 Member mới (VD: "Tên Khách - Slot 2") để dễ quản lý.' }, 400);
        }
        
        await context.env.DB.prepare(`
            INSERT INTO subscriptions (id, member_id, plan_id, start_date, end_date, next_due_date, amount_due, billing_cycle_months, status, user_token, personal_note, send_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, body.member_id, body.plan_id, body.start_date, body.end_date || null, 
            body.next_due_date, body.amount_due, body.billing_cycle_months || 1,
            body.status || 'active', token, body.personal_note || null,
            body.send_email !== undefined ? body.send_email : 1
        ).run();

        return jsonResponse({ success: true, data: { id, token } });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        if (!id) return jsonResponse({ success: false, error: 'ID required' }, 400);

        const body = await context.request.json() as any;

        // Validate slots (only if we are modifying an existing sub and it's not paused, or changing plans)
        const sub = await context.env.DB.prepare("SELECT plan_id, status, member_id FROM subscriptions WHERE id = ?").bind(id).first<{plan_id: string, status: string, member_id: string}>();
        if (!sub) return jsonResponse({ success: false, error: 'Subscription not found' }, 404);
        
        // If we change plan or if we are activating a previously paused sub, we must check capacity
        const targetPlanId = body.plan_id || sub.plan_id;
        const targetStatus = body.status || sub.status;
        
        if (targetStatus !== 'paused' && (targetPlanId !== sub.plan_id || sub.status === 'paused')) {
            const plan = await context.env.DB.prepare("SELECT max_slots FROM plans WHERE id = ?").bind(targetPlanId).first<{max_slots: number}>();
            if (plan && plan.max_slots > 0) {
                const activeSubs = await context.env.DB.prepare("SELECT count(*) as count FROM subscriptions WHERE plan_id = ? AND status != 'paused' AND id != ?").bind(targetPlanId, id).first<{count: number}>();
                if (activeSubs && activeSubs.count >= plan.max_slots) {
                    return jsonResponse({ success: false, error: 'Gói này đã đạt giới hạn slot tối đa.' }, 400);
                }
            }
        }

        // Prevent duplicate member in same plan when editing
        const targetMemberId = body.member_id || sub.member_id;
        if (targetPlanId !== sub.plan_id || targetMemberId !== sub.member_id) {
            const existingSub = await context.env.DB.prepare(
                "SELECT id FROM subscriptions WHERE member_id = ? AND plan_id = ? AND id != ?"
            ).bind(targetMemberId, targetPlanId, id).first();
            if (existingSub) {
                return jsonResponse({ success: false, error: 'Thành viên này đã có sẵn trong gói rồi! Nếu một người muốn mua 2 slot, hãy tạo thêm 1 Member mới (VD: "Tên Khách - Slot 2") để dễ quản lý.' }, 400);
            }
        }

        await context.env.DB.prepare(`
            UPDATE subscriptions 
            SET start_date = ?, next_due_date = ?, amount_due = ?, billing_cycle_months = ?, status = ?, plan_id = ?, member_id = ?, send_email = ?
            WHERE id = ?
        `).bind(
            body.start_date, body.next_due_date, body.amount_due, 
            body.billing_cycle_months || 1, body.status, targetPlanId, targetMemberId,
            body.send_email !== undefined ? body.send_email : 1, id
        ).run();

        return jsonResponse({ success: true });
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

        await context.env.DB.prepare("DELETE FROM subscriptions WHERE id = ?").bind(id).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
