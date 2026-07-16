import { Env } from '../utils/types';
import { checkAuth, jsonResponse, generateToken } from '../utils/auth';

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
            const sub = await context.env.DB.prepare("SELECT * FROM subscriptions WHERE id = ?").bind(body.id).first<any>();
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
            INSERT INTO subscriptions (id, member_id, plan_id, start_date, end_date, next_due_date, amount_due, billing_cycle_months, status, user_token, personal_note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, body.member_id, body.plan_id, body.start_date, body.end_date || null, 
            body.next_due_date, body.amount_due, body.billing_cycle_months || 1,
            body.status || 'active', token, body.personal_note || null
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
            SET start_date = ?, next_due_date = ?, amount_due = ?, billing_cycle_months = ?, status = ?, plan_id = ?, member_id = ?
            WHERE id = ?
        `).bind(
            body.start_date, body.next_due_date, body.amount_due, 
            body.billing_cycle_months || 1, body.status, targetPlanId, targetMemberId, id
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
