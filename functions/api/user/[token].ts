import { Env } from '../../utils/types';
import { jsonResponse } from '../../utils/auth';
import { sendEmail } from '../../utils/email';
import { sendTelegramNotification } from '../../utils/telegram';

// GET subscription info for the portal
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const token = context.params.token as string;
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

    try {
        const { DB } = context.env;
        const sub = await DB.prepare(`
            SELECT s.id, s.start_date, s.next_due_date, s.amount_due, s.status, s.personal_note, s.billing_cycle_months,
                   m.full_name as member_name, p.name as plan_name, p.note as plan_note
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_token = ?
        `).bind(token).first<any>();

        if (!sub) return jsonResponse({ success: false, error: 'Invalid token' }, 404);

        // Fetch recent payment history
        const history = await DB.prepare(`
            SELECT amount, status, created_at, user_note, approved_at 
            FROM payment_requests 
            WHERE subscription_id = ? 
            ORDER BY created_at DESC LIMIT 5
        `).bind(sub.id).all();

        // Fetch settings (bank info, user cancel)
        const settings = await DB.prepare(`
            SELECT bank_id, bank_account_number, bank_account_name, 
                   alt_bank_id, alt_bank_account_number, alt_bank_account_name, 
                   allow_user_cancel
            FROM admin_settings WHERE id = 'global'
        `).first<any>();

        return jsonResponse({
            success: true,
            data: { 
                subscription: sub, 
                history: history.results,
                settings: settings || {}
            }
        });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};

// POST submit a payment confirmation
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const token = context.params.token as string;
    if (!token) return jsonResponse({ success: false, error: 'Token required' }, 400);

    try {
        const { DB } = context.env;
        
        // 1. Verify token
        const subInfo = await DB.prepare(`
            SELECT s.id, s.amount_due, s.send_email, m.email, m.full_name, p.name as plan_name
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_token = ?
        `).bind(token).first<any>();

        if (!subInfo) return jsonResponse({ success: false, error: 'Invalid token' }, 404);

        const body = await context.request.json() as any;

        // Check if action is cancel_pending
        if (body.action === 'cancel_pending') {
            const settings = await DB.prepare("SELECT allow_user_cancel, admin_email_notifications_enabled, admin_email_notification_to, admin_email_notification_cc, admin_email_notification_bcc FROM admin_settings WHERE id = 'global'").first<any>();
            if (settings?.allow_user_cancel !== 1) {
                return jsonResponse({ success: false, error: 'Tính năng tự hủy gia hạn chưa được bật.' }, 403);
            }
            
            await DB.prepare("UPDATE subscriptions SET status = 'cancel_pending' WHERE id = ?").bind(subInfo.id).run();
            
            const tgMessage = `⚠️ <b>Khách hàng yêu cầu hủy gia hạn</b>\n👤 Khách hàng: <b>${subInfo.full_name}</b>\n📦 Gói: <b>${subInfo.plan_name}</b>\n\n👉 Khách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn.`;
            context.waitUntil(sendTelegramNotification(context.env, tgMessage));
            
            if (settings.admin_email_notifications_enabled === 1 && settings.admin_email_notification_to) {
                const adminEmailBody = `Khách hàng ${subInfo.full_name} yêu cầu hủy gia hạn.\n\nGói: ${subInfo.plan_name}\n\nKhách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn. Vui lòng kiểm tra trên trang quản trị.`;
                const adminHtmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Khách hàng yêu cầu hủy gia hạn ⚠️</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <p><strong>Khách hàng:</strong> ${subInfo.full_name}</p>
                        <p><strong>Gói:</strong> ${subInfo.plan_name}</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p>Khách hàng không muốn gia hạn chu kỳ sau. Tới ngày đến hạn, hãy ngắt quyền truy cập của khách hàng này.</p>
                    </div>
                </div>
                `;
                context.waitUntil(sendEmail(context.env, {
                    to: settings.admin_email_notification_to,
                    cc: settings.admin_email_notification_cc || undefined,
                    bcc: settings.admin_email_notification_bcc || undefined,
                    subject: `[Thông báo] Khách hàng ${subInfo.full_name} hủy gia hạn gói ${subInfo.plan_name}`,
                    body: adminEmailBody,
                    htmlBody: adminHtmlBody
                }));
            }
            
            if (subInfo.send_email !== 0) {
                const userEmailBody = `Chào ${subInfo.full_name},\n\nHệ thống đã ghi nhận yêu cầu Hủy gia hạn gói dịch vụ ${subInfo.plan_name} của bạn.\nBạn vẫn có thể tiếp tục sử dụng dịch vụ cho đến ngày đến hạn tiếp theo. Sau ngày đó, hệ thống sẽ tự động ngắt quyền truy cập của bạn.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn đã sử dụng dịch vụ!`;
                
                const userHtmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">Đã ghi nhận yêu cầu Hủy gia hạn</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <h3 style="color: #111827; margin-top: 0;">Chào ${subInfo.full_name},</h3>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu <strong>Hủy gia hạn</strong> của bạn cho gói dịch vụ <strong>${subInfo.plan_name}</strong>.</p>
                        
                        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FECACA;">
                            <p style="margin: 0; color: #991B1B; text-align: center;">Bạn vẫn có thể sử dụng dịch vụ đến hết chu kỳ hiện tại.</p>
                        </div>
                        
                        <p style="color: #4b5563; font-size: 16px;">Tới ngày đến hạn, hệ thống sẽ tự động ngắt quyền truy cập của bạn vào dịch vụ này.</p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                            <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin (Nếu cần hỗ trợ thêm):</strong></p>
                            <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                            <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                            <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                        </div>
                    </div>
                </div>
                `;

                context.waitUntil(sendEmail(context.env, {
                    to: subInfo.email,
                    subject: `[Xác nhận] Đã ghi nhận yêu cầu Hủy gia hạn - ${subInfo.plan_name}`,
                    body: userEmailBody,
                    htmlBody: userHtmlBody
                }));
            }
            
            return jsonResponse({ success: true, message: 'Đã gửi yêu cầu hủy gia hạn thành công.' });
        }

        const reqId = 'req_' + Date.now();

        // 2. Insert payment request (Catch D1 UNIQUE constraint error if one is already pending)
        try {
            await DB.prepare(`
                INSERT INTO payment_requests (id, subscription_id, amount, status, user_note)
                VALUES (?, ?, ?, 'pending', ?)
            `).bind(reqId, subInfo.id, body.amount || subInfo.amount_due, body.user_note || '').run();
        } catch (dbErr: any) {
            // UNIQUE constraint failure for (subscription_id) WHERE status = 'pending'
            return jsonResponse({ success: false, error: 'Bạn đã báo thanh toán rồi, vui lòng chờ admin duyệt.' }, 400);
        }

        // 3. Update subscription status
        await DB.prepare("UPDATE subscriptions SET status = 'pending_payment' WHERE id = ?").bind(subInfo.id).run();

        const emailBody = `Chào ${subInfo.full_name},\n\nHệ thống đã ghi nhận yêu cầu báo thanh toán của bạn.\nVui lòng chờ admin kiểm tra và duyệt nhé.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`;
        
        const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                <h2 style="color: white; margin: 0;">Yêu cầu đã được ghi nhận ⏳</h2>
            </div>
            <div style="padding: 30px; background-color: #ffffff;">
                <h3 style="color: #111827; margin-top: 0;">Chào ${subInfo.full_name},</h3>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${subInfo.plan_name}</strong>.</p>
                
                <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                    <p style="margin: 0; color: #1E40AF; text-align: center;">Trạng thái: <strong>Đang chờ Admin duyệt</strong></p>
                </div>
                
                <p style="color: #4b5563; font-size: 16px;">Vui lòng chờ Admin kiểm tra tài khoản và xác nhận trong thời gian sớm nhất. Hệ thống sẽ tự động thông báo cho bạn ngay khi khoản thanh toán được duyệt.</p>
                
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

        // 4. Send email confirmation to user (optional, can be disabled)
        if (subInfo.send_email !== 0) {
            await sendEmail(context.env, {
                to: subInfo.email,
                subject: `[Đã ghi nhận] Yêu cầu thanh toán - ${subInfo.plan_name}`,
                body: emailBody,
                htmlBody: htmlBody
            });
        }

        // 5. Send Telegram notification to admin
        const amount = body.amount || subInfo.amount_due;
        const note = body.user_note ? `\n📝 Ghi chú: <i>${body.user_note}</i>` : '';
        const tgMessage = `🔔 <b>Yêu cầu thanh toán mới</b>\n👤 Khách hàng: <b>${subInfo.full_name}</b>\n📦 Gói: <b>${subInfo.plan_name}</b>\n💰 Số tiền: <b>${amount.toLocaleString()}đ</b>${note}\n\n👉 Vui lòng vào trang quản trị để kiểm tra và duyệt.`;
        context.waitUntil(sendTelegramNotification(context.env, tgMessage));

        // 6. Send Email notification to admin (if enabled)
        const adminSettings = await DB.prepare(`
            SELECT admin_email_notifications_enabled, admin_email_notification_to, admin_email_notification_cc, admin_email_notification_bcc
            FROM admin_settings WHERE id = 'global'
        `).first<any>();

        if (adminSettings && adminSettings.admin_email_notifications_enabled === 1 && adminSettings.admin_email_notification_to) {
            const adminEmailBody = `Có yêu cầu thanh toán mới từ ${subInfo.full_name}.\n\nKhách hàng: ${subInfo.full_name}\nGói: ${subInfo.plan_name}\nSố tiền: ${amount.toLocaleString()}đ\nGhi chú: ${body.user_note || 'Không có'}\n\nVui lòng vào trang quản trị để kiểm tra và duyệt.`;
            
            const adminHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Yêu cầu thanh toán mới 🔔</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Khách hàng:</strong> ${subInfo.full_name}</p>
                    <p><strong>Gói:</strong> ${subInfo.plan_name}</p>
                    <p><strong>Số tiền:</strong> ${amount.toLocaleString()} VNĐ</p>
                    <p><strong>Ghi chú:</strong> ${body.user_note || 'Không có'}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Vui lòng vào trang quản trị để kiểm tra và duyệt.</p>
                </div>
            </div>
            `;

            context.waitUntil(sendEmail(context.env, {
                to: adminSettings.admin_email_notification_to,
                cc: adminSettings.admin_email_notification_cc || undefined,
                bcc: adminSettings.admin_email_notification_bcc || undefined,
                subject: `[Thông báo] Yêu cầu thanh toán mới từ ${subInfo.full_name}`,
                body: adminEmailBody,
                htmlBody: adminHtmlBody
            }));
        }

        return jsonResponse({ success: true });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
