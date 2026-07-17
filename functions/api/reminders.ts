import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    try {
        const { DB } = context.env;
        
        // 1. Check if reminders are globally enabled
        const settings = await DB.prepare("SELECT reminders_enabled, reminder_days FROM admin_settings WHERE id = 'global'").first<{reminders_enabled: number, reminder_days: string}>();
        if (settings && settings.reminders_enabled === 0) {
            return jsonResponse({ success: false, error: 'Reminders are disabled in settings' }, 400);
        }

        const reminderDaysStr = settings?.reminder_days || '7,3,1,0,-2,-4';
        const reminderDaysArr = reminderDaysStr.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
        
        if (reminderDaysArr.length === 0) {
            return jsonResponse({ success: true, data: { sent: 0, errors: 0, message: "No reminder days configured" } });
        }

        // 2. Find subscriptions due based on configured days
        const dueQuery = await DB.prepare(`
            SELECT s.id, s.next_due_date, s.amount_due, m.email, m.full_name, p.name as plan_name,
                   CAST(julianday(s.next_due_date) - julianday(date('now')) AS INTEGER) as days_left
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status = 'active'
            AND days_left IN (${reminderDaysArr.join(',')})
        `).all<any>();

        let sentCount = 0;
        let errorsCount = 0;

        for (const sub of dueQuery.results) {
            const emailType = `${sub.days_left}_days`;
            
            // Check idempotency (has this reminder been sent for this target_date?)
            const logId = `log_${Date.now()}_${sub.id}`;
            try {
                // Try to insert log first. If it fails due to UNIQUE constraint, it means we already sent it.
                await DB.prepare(`
                    INSERT INTO email_logs (id, subscription_id, email_type, target_date)
                    VALUES (?, ?, ?, ?)
                `).bind(logId, sub.id, emailType, sub.next_due_date).run();
                
                // If log inserted, send email
                const portalLink = `${context.env.APP_URL}/portal.html?token=...`; // In real life, fetch token
                // Actually we need the token
                const tokenRec = await DB.prepare("SELECT user_token FROM subscriptions WHERE id = ?").bind(sub.id).first<{user_token: string}>();
                const actualLink = `${context.env.APP_URL}/portal.html?token=${tokenRec?.user_token}`;

                // Format date as dd-mm-yyyy
                const parts = sub.next_due_date.split(' ')[0].split('-');
                const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : sub.next_due_date;
                
                let formattedDeadline = '';
                if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    d.setDate(d.getDate() + 4);
                    const dd = String(d.getDate()).padStart(2, '0');
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const yyyy = d.getFullYear();
                    formattedDeadline = `${dd}-${mm}-${yyyy}`;
                }

                let emailSubject = '';
                let titleHtml = '';
                let headerColor = '#4F46E5';
                let messageHtml = '';

                if (sub.days_left > 0) {
                    emailSubject = `[Nhắc nhở] Sắp đến hạn thanh toán - ${sub.plan_name}`;
                    titleHtml = `Sắp đến hạn thanh toán`;
                    messageHtml = `Gói dịch vụ <strong>${sub.plan_name}</strong> của bạn sắp đến hạn thanh toán.
                    <br/><br/>
                    <strong>Ngày đến hạn:</strong> <span style="color: #EF4444;">${formattedDate}</span> (còn ${sub.days_left} ngày)<br/>
                    <strong>Số tiền cần đóng:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${sub.amount_due.toLocaleString()} VNĐ</span>
                    <br/><br/>
                    Vui lòng thanh toán trước ngày hạn chót <strong>${formattedDeadline}</strong> để đảm bảo dịch vụ được duy trì liên tục.`;
                } else if (sub.days_left === 0) {
                    emailSubject = `[Thông báo] Hôm nay là ngày đến hạn thanh toán - ${sub.plan_name}`;
                    titleHtml = `Đến hạn thanh toán`;
                    headerColor = '#F59E0B'; // Amber
                    messageHtml = `Hôm nay (<strong>${formattedDate}</strong>) là ngày đến hạn thanh toán gói dịch vụ <strong>${sub.plan_name}</strong> của bạn.
                    <br/><br/>
                    <strong>Số tiền cần đóng:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${sub.amount_due.toLocaleString()} VNĐ</span>
                    <br/><br/>
                    Vui lòng thanh toán sớm trước ngày <strong>${formattedDeadline}</strong> để không bị gián đoạn dịch vụ nhé!`;
                } else if (sub.days_left === -2) {
                    emailSubject = `[Quan trọng] Đã trễ hạn thanh toán 2 ngày - ${sub.plan_name}`;
                    titleHtml = `Trễ hạn thanh toán`;
                    headerColor = '#EF4444'; // Red
                    messageHtml = `Gói dịch vụ <strong>${sub.plan_name}</strong> của bạn đã trễ hạn thanh toán 2 ngày (từ ngày ${formattedDate}).
                    <br/><br/>
                    <strong>Số tiền cần đóng:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${sub.amount_due.toLocaleString()} VNĐ</span>
                    <br/><br/>
                    Hạn chót để giữ lại dịch vụ là ngày <strong>${formattedDeadline}</strong>. Xin vui lòng thanh toán ngay để tránh bị hệ thống tự động khóa.`;
                } else if (sub.days_left === -4) {
                    emailSubject = `[Ngưng dịch vụ] Tài khoản của bạn đã bị khóa do trễ hạn - ${sub.plan_name}`;
                    titleHtml = `Dịch vụ bị tạm ngưng`;
                    headerColor = '#111827'; // Dark gray/black
                    messageHtml = `Rất tiếc, do đã trễ hạn thanh toán 4 ngày, hệ thống đã <strong>tự động tạm ngưng</strong> dịch vụ của bạn đối với gói <strong>${sub.plan_name}</strong>.
                    <br/><br/>
                    <strong>Số tiền còn nợ:</strong> <span style="font-size: 18px; font-weight: bold; color: #EF4444;">${sub.amount_due.toLocaleString()} VNĐ</span>
                    <br/><br/>
                    Vui lòng thanh toán khoản nợ và báo cho Admin để được kích hoạt lại dịch vụ. Cảm ơn bạn.`;
                }

                // Plain text body mapping (simplified)
                const emailBody = messageHtml.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
                
                const htmlBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
                        <h2 style="color: white; margin: 0;">${titleHtml}</h2>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <h3 style="color: #111827; margin-top: 0;">Chào ${sub.full_name},</h3>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${messageHtml}</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Xem Chi Tiết & Thanh Toán</a>
                        </div>
                        
                        <p style="color: #6B7280; font-size: 14px; text-align: center;">Nếu bạn đã thanh toán, vui lòng nhấn vào nút bên trên để báo cáo cho Admin.</p>
                        
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

                const success = await sendEmail(context.env, {
                    to: sub.email,
                    subject: emailSubject,
                    body: emailBody,
                    htmlBody: htmlBody
                });

                if (success) {
                    sentCount++;
                    
                    // Telegram Notification for Admin
                    let statusLabel = '';
                    if (sub.days_left > 0) statusLabel = 'Sắp đến hạn';
                    else if (sub.days_left === 0) statusLabel = 'Đến hạn hôm nay';
                    else if (sub.days_left < 0 && sub.days_left > -4) statusLabel = `Trễ hạn ${Math.abs(sub.days_left)} ngày`;
                    else statusLabel = 'Tạm ngưng dịch vụ';

                    const tgMessage = `📧 <b>Đã gửi email nhắc nhở</b>\n👤 Khách hàng: <b>${sub.full_name}</b>\n📦 Gói: <b>${sub.plan_name}</b>\n🏷 Trạng thái: <b>${statusLabel}</b>\n📅 Ngày đến hạn: <b>${formattedDate}</b>`;
                    context.waitUntil(sendTelegramNotification(context.env, tgMessage));

                    // Auto pause if days_left is -4
                    if (sub.days_left === -4) {
                        await DB.prepare("UPDATE subscriptions SET status = 'paused' WHERE id = ?").bind(sub.id).run();
                    }
                } else {
                    errorsCount++;
                    // Optional: remove log if send failed, so it can be retried later
                    await DB.prepare("DELETE FROM email_logs WHERE id = ?").bind(logId).run();
                }

            } catch (err: any) {
                // D1 constraint error (UNIQUE) usually means already sent. Just ignore.
                console.log(`Email ${emailType} for ${sub.id} already sent for date ${sub.next_due_date}`);
            }
        }

        return jsonResponse({ success: true, data: { sent: sentCount, errors: errorsCount } });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
