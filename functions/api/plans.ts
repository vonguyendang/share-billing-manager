import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    
    try {
        const { results } = await context.env.DB.prepare("SELECT * FROM plans ORDER BY name").all();
        return jsonResponse({ success: true, data: results });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const body = await context.request.json() as any;
        const id = 'plan_' + Date.now();
        
        await context.env.DB.prepare(`
            INSERT INTO plans (id, name, category, total_price, renewal_cycle_months, renewal_anchor_date, note, active, max_slots)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, body.name, body.category, body.total_price, 
            body.renewal_cycle_months || 1, body.renewal_anchor_date || null, body.note || null, body.active === false ? 0 : 1,
            body.max_slots || 0
        ).run();

        return jsonResponse({ success: true, data: { id } });
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
            UPDATE plans 
            SET name = ?, category = ?, total_price = ?, renewal_cycle_months = ?, active = ?, max_slots = ?, renewal_anchor_date = ?, note = ?
            WHERE id = ?
        `).bind(
            body.name, body.category, body.total_price, 
            body.renewal_cycle_months || 1, body.active === false ? 0 : 1, body.max_slots || 0,
            body.renewal_anchor_date || null, body.note || null, id
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

        await context.env.DB.prepare("DELETE FROM plans WHERE id = ?").bind(id).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
