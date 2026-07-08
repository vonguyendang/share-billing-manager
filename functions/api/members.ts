import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    
    try {
        const { results } = await context.env.DB.prepare("SELECT * FROM members ORDER BY full_name").all();
        return jsonResponse({ success: true, data: results });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const body = await context.request.json() as any;
        const id = 'mem_' + Date.now();
        
        await context.env.DB.prepare(`
            INSERT INTO members (id, full_name, email, phone, note, active)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            id, body.full_name, body.email, body.phone || null, body.note || null, body.active === false ? 0 : 1
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
            UPDATE members 
            SET full_name = ?, email = ?, phone = ?, note = ?, active = ?
            WHERE id = ?
        `).bind(
            body.full_name, body.email, body.phone || null, body.note || null, body.active === false ? 0 : 1, id
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

        await context.env.DB.prepare("DELETE FROM members WHERE id = ?").bind(id).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
