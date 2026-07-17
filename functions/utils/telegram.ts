export async function sendTelegramNotification(env: any, message: string): Promise<boolean> {
    try {
        const DB = env.DB;
        const settings = await DB.prepare("SELECT * FROM admin_settings WHERE id = 'global'").first();

        if (!settings) {
            return false;
        }

        const enabled = settings.telegram_notifications_enabled === 1;
        const token = settings.telegram_bot_token;
        const chatId = settings.telegram_chat_id;
        const topicId = settings.telegram_topic_id;

        if (!enabled || !token || !chatId) {
            return false;
        }

        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const payload: any = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
        };

        if (topicId) {
            payload.message_thread_id = topicId;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Telegram notification failed:', response.status, errorText);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error sending Telegram notification:', e);
        return false;
    }
}
