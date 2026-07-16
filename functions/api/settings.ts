export async function onRequest(context: any) {
    const { request, env } = context;
    const DB = env.DB;
    const method = request.method;

    try {
        if (method === 'GET') {
            const settings = await DB.prepare("SELECT * FROM admin_settings WHERE id = 'global'").first();
            return new Response(JSON.stringify({ success: true, data: settings || {} }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (method === 'PUT') {
            const body = await request.json();
            const { reminders_enabled, reminder_days } = body;
            
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
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = 'global'
            `;
            await DB.prepare(query).bind(
                reminders_enabled !== undefined ? reminders_enabled : 1,
                safeReminderDays !== undefined ? safeReminderDays : '7,3,1,0,-2,-4'
            ).run();

            return new Response(JSON.stringify({ success: true, message: 'Settings updated' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), { status: 405 });
    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500 });
    }
}
