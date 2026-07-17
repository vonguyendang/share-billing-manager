import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        const result = await DB.prepare(`
            SELECT id, description, amount, expense_date, created_at 
            FROM expenses 
            ORDER BY expense_date DESC
        `).all();

        return jsonResponse({ success: true, data: result.results });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        const body = await context.request.json() as any;
        const { id, description, amount, expense_date } = body;

        if (!description || !amount || !expense_date) {
            return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
        }

        if (id) {
            await DB.prepare("UPDATE expenses SET description = ?, amount = ?, expense_date = ? WHERE id = ?")
                .bind(description, amount, expense_date, id).run();
        } else {
            const newId = 'exp_' + Date.now();
            await DB.prepare("INSERT INTO expenses (id, description, amount, expense_date) VALUES (?, ?, ?, ?)")
                .bind(newId, description, amount, expense_date).run();
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonResponse({ success: false, error: 'Missing id' }, 400);

        await DB.prepare("DELETE FROM expenses WHERE id = ?").bind(id).run();

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
