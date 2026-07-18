import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { results } = await context.env.DB.prepare(`
            SELECT pr.*, s.amount_due as expected_amount, m.full_name as member_name, p.name as plan_name 
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE pr.status = 'pending'
            ORDER BY pr.created_at ASC
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
        const { request_id, action, total_paid } = body;

        if (action !== 'approve' && action !== 'reject') {
            return jsonResponse({ success: false, error: 'Invalid action' }, 400);
        }

        const { DB } = context.env;
        const reqInfo = await DB.prepare(`
            SELECT pr.*, s.amount_due, s.billing_cycle_months, s.next_due_date, s.send_email, m.email, m.full_name, p.name as plan_name
            FROM payment_requests pr
            JOIN subscriptions s ON pr.subscription_id = s.id
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE pr.id = ? AND pr.status = 'pending'
        `).bind(request_id).first<any>();

        if (!reqInfo) {
            return jsonResponse({ success: false, error: 'Request not found or already processed' }, 404);
        }

        if (action === 'approve') {
            const totalPaid = total_paid || reqInfo.amount;

            // Calculate monthly price and how many months they paid for
            const monthlyPrice = reqInfo.amount_due / reqInfo.billing_cycle_months;
            const addedMonths = totalPaid / monthlyPrice;

            const wholeMonths = Math.floor(addedMonths);
            const fractionalMonth = addedMonths - wholeMonths;
            const addedDays = Math.round(fractionalMonth * 30); // Approximate 1 month = 30 days

            // Handle potentially malformed dates (e.g. DD/MM/YYYY)
            let rawDate = reqInfo.next_due_date.split(' ')[0];
            if (rawDate.includes('/')) {
                const parts = rawDate.split('/');
                if (parts.length === 3) rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else if (rawDate.split('-').length === 3 && rawDate.split('-')[0].length <= 2) {
                const parts = rawDate.split('-');
                rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            // Calculate new due date
            const oldDate = new Date(rawDate);
            if (isNaN(oldDate.getTime())) {
                throw new Error("Dữ liệu ngày tháng không hợp lệ trong database: " + reqInfo.next_due_date);
            }

            oldDate.setMonth(oldDate.getMonth() + wholeMonths);
            oldDate.setDate(oldDate.getDate() + addedDays);
            const newDateStr = oldDate.toISOString().split('T')[0];

            // Update in transaction-like manner using batch
            await DB.batch([
                DB.prepare("UPDATE payment_requests SET status = 'approved', amount = ?, previous_due_date = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?").bind(totalPaid, reqInfo.next_due_date, request_id),
                DB.prepare("UPDATE subscriptions SET next_due_date = ?, status = 'active' WHERE id = ?").bind(newDateStr, reqInfo.subscription_id)
            ]);

            // Try sending email
            const newDateParts = newDateStr.split('-');
            const formattedNewDate = newDateParts.length === 3 ? `${newDateParts[2]}-${newDateParts[1]}-${newDateParts[0]}` : newDateStr;

            const emailBody = `Chào ${reqInfo.full_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${totalPaid.toLocaleString()} VNĐ cho gói ${reqInfo.plan_name}.\nHạn dùng tiếp theo của bạn là: ${formattedNewDate}.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`;

            const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Thanh Toán Thành Công 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${reqInfo.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Admin đã nhận được khoản thanh toán của bạn cho gói dịch vụ <strong>${reqInfo.plan_name}</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Số tiền đã thanh toán:</strong> ${totalPaid.toLocaleString()} VNĐ</p>
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

            if (reqInfo.send_email !== 0) {
                await sendEmail(context.env, {
                    to: reqInfo.email,
                    subject: `[Xác nhận] Thanh toán thành công - ${reqInfo.plan_name}`,
                    body: emailBody,
                    htmlBody: htmlBody
                });
            }

            // Telegram Notification
            const tgMessage = `✅ <b>Đã duyệt thanh toán</b>\n👤 Khách hàng: <b>${reqInfo.full_name}</b>\n📦 Gói: <b>${reqInfo.plan_name}</b>\n💰 Số tiền: <b>${totalPaid.toLocaleString()}đ</b>\n📅 Hạn mới: <b>${formattedNewDate}</b>`;
            context.waitUntil(sendTelegramNotification(context.env, tgMessage));

        } else if (action === 'reject') {
            const rejectReason = body.reject_reason || 'Không rõ lý do';

            await DB.batch([
                DB.prepare("UPDATE payment_requests SET status = 'rejected' WHERE id = ?").bind(request_id),
                // Reset subscription status so they can submit again if needed
                DB.prepare("UPDATE subscriptions SET status = 'active' WHERE id = ?").bind(reqInfo.subscription_id)
            ]);

            const emailBody = `Chào ${reqInfo.full_name},\n\nAdmin đã TỪ CHỐI yêu cầu báo thanh toán của bạn cho gói ${reqInfo.plan_name}.\nLý do: ${rejectReason}\n\nVui lòng kiểm tra lại. Nếu có sai sót, bạn có thể gửi lại báo cáo thanh toán mới hoặc liên hệ Admin.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`;

            const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Từ Chối Thanh Toán ❌</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${reqInfo.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Rất tiếc, Admin đã <strong>từ chối</strong> yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${reqInfo.plan_name}</strong>.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FCA5A5;">
                        <p style="margin: 5px 0; color: #991B1B;"><strong>Lý do từ chối:</strong></p>
                        <p style="margin: 5px 0; color: #991B1B; font-style: italic;">"${rejectReason}"</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Vui lòng kiểm tra lại giao dịch ngân hàng của bạn. Nếu có sai sót, bạn có thể truy cập lại đường link Portal để gửi báo cáo thanh toán mới, hoặc liên hệ trực tiếp với Admin.</p>
                    
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

            if (reqInfo.send_email !== 0) {
                await sendEmail(context.env, {
                    to: reqInfo.email,
                    subject: `[Từ chối] Yêu cầu thanh toán - ${reqInfo.plan_name}`,
                    body: emailBody,
                    htmlBody: htmlBody
                });
            }

            // Telegram Notification
            const tgMessage = `❌ <b>Đã từ chối thanh toán</b>\n👤 Khách hàng: <b>${reqInfo.full_name}</b>\n📦 Gói: <b>${reqInfo.plan_name}</b>\n💬 Lý do: <i>${rejectReason}</i>`;
            context.waitUntil(sendTelegramNotification(context.env, tgMessage));
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
