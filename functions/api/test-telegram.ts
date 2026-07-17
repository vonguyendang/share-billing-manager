import { checkAuth } from '../utils/auth';

export async function onRequest(context: any) {
    const { request, env } = context;
    const method = request.method;

    if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    try {
        if (method === 'POST') {
            const body = await request.json();
            const { token, chatId, topicId } = body;

            if (!token || !chatId) {
                return new Response(JSON.stringify({ success: false, error: 'Vui lòng nhập Bot Token và Chat ID để test.' }), { status: 400 });
            }

            const url = `https://api.telegram.org/bot${token}/sendMessage`;
            const payload: any = {
                chat_id: chatId,
                text: '🚀 Xin chào! Đây là tin nhắn test từ <b>Share Billing Manager</b>. Cấu hình Telegram của bạn đã hoạt động tốt!',
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
                return new Response(JSON.stringify({ success: false, error: `Lỗi từ Telegram: ${errorText}` }), { status: 400 });
            }

            return new Response(JSON.stringify({ success: true, message: 'Gửi tin nhắn test thành công!' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { status: 405 });
    } catch (e: any) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
