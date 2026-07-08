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

        // Creating new subscription
        const id = 'sub_' + Date.now();
        const token = generateToken();
        
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
        
        await context.env.DB.prepare(`
            UPDATE subscriptions 
            SET start_date = ?, next_due_date = ?, amount_due = ?, billing_cycle_months = ?, status = ?
            WHERE id = ?
        `).bind(
            body.start_date, body.next_due_date, body.amount_due, 
            body.billing_cycle_months || 1, body.status, id
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
