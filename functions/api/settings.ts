import { checkAuth } from '../utils/auth';

export async function onRequest(context: any) {
    const { request, env } = context;
    const DB = env.DB;
    const method = request.method;

    if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    try {
        if (method === 'GET') {
            const settings = await DB.prepare("SELECT * FROM admin_settings WHERE id = 'global'").first();
            return new Response(JSON.stringify({ success: true, data: settings || {} }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (method === 'PUT') {
            const body = await request.json();
            const { 
                reminders_enabled, 
                reminder_days,
                telegram_bot_token,
                telegram_chat_id,
                telegram_topic_id,
                telegram_notifications_enabled,
                bank_id,
                bank_account_number,
                bank_account_name,
                allow_user_cancel
            } = body;
            
            // Validate reminder_days (e.g., must be a string like "7,3,1,0,-2,-4")
            let safeReminderDays = reminder_days;
            if (typeof reminder_days === 'string') {
                // Keep only numbers, commas and minus signs to prevent SQL injection or junk
                safeReminderDays = reminder_days.replace(/[^0-9,\-]/g, '');
            }

            const query = `
                UPDATE admin_settings 
                SET reminders_enabled = ?, 
                    reminder_days = ?,
                    telegram_bot_token = ?,
                    telegram_chat_id = ?,
                    telegram_topic_id = ?,
                    telegram_notifications_enabled = ?,
                    bank_id = ?,
                    bank_account_number = ?,
                    bank_account_name = ?,
                    allow_user_cancel = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = 'global'
            `;
            await DB.prepare(query).bind(
                reminders_enabled !== undefined ? reminders_enabled : 1,
                safeReminderDays !== undefined ? safeReminderDays : '7,3,1,0,-2,-4',
                telegram_bot_token || null,
                telegram_chat_id || null,
                telegram_topic_id || null,
                telegram_notifications_enabled !== undefined ? telegram_notifications_enabled : 0,
                bank_id || null,
                bank_account_number || null,
                bank_account_name || null,
                allow_user_cancel !== undefined ? allow_user_cancel : 0
            ).run();

            return new Response(JSON.stringify({ success: true, message: 'Settings updated' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { status: 405 });
    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
