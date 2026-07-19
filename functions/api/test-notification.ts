import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { sendTelegramNotification } from '../utils/telegram';
import { getNotificationContent } from '../utils/i18n-backend';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const body = await context.request.json() as { template: string, test_email: string, lang: string };
        const { template, test_email, lang } = body;

        if (!template || !test_email) {
            return jsonResponse({ success: false, error: 'Missing template or test_email' }, 400);
        }

        const { DB } = context.env;
        const adminSettings = await DB.prepare(`
            SELECT admin_email_notifications_enabled, admin_email_notification_to, admin_email_notification_cc, admin_email_notification_bcc, customer_language, admin_language, admin_contacts
            FROM admin_settings WHERE id = 'global'
        `).first<any>();

        const testLang = lang || 'vi';

        // Dummy data for testing
        const now = new Date();
        
        const dueDate = new Date(now);
        dueDate.setDate(now.getDate() + 3);
        const formattedDate = dueDate.toISOString().split('T')[0].split('-').reverse().join('-');

        const deadlineDate = new Date(dueDate);
        deadlineDate.setDate(dueDate.getDate() + 2);
        const formattedDeadline = deadlineDate.toISOString().split('T')[0].split('-').reverse().join('-');

        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const formattedNewDate = nextMonth.toISOString().split('T')[0].split('-').reverse().join('-');

        const mockData = {
            full_name: 'Nguyễn Văn Test',
            email: test_email,
            plan_name: 'Gói VIP 1 năm',
            amount_due: '500,000',
            amount: '500,000',
            totalPaid: '500,000',
            formattedDate: formattedDate,
            formattedNewDate: formattedNewDate,
            formattedDeadline: formattedDeadline,
            days_left: 3,
            actualLink: `${context.env.APP_URL || 'https://share-billing-manager.pages.dev'}/portal.html?token=test_token_123`,
            admin_note: 'Khách chuyển khoản đúng hẹn, cảm ơn!',
            rejectReason: 'Không tìm thấy thông tin chuyển khoản tương ứng.',
            admin_contacts: adminSettings?.admin_contacts
        };

        // Let's send the user notification
        let userTemplateType: any = null;
        let adminTemplateType: any = null;

        if (template === 'reminder') {
            userTemplateType = 'reminder';
            adminTemplateType = 'reminder_admin';
        } else if (template === 'payment_user') {
            userTemplateType = 'payment_user';
            adminTemplateType = 'payment_admin'; // Admin gets payment_admin
        } else if (template === 'payment_approve') {
            userTemplateType = 'payment_approve';
            adminTemplateType = 'payment_approve';
        } else if (template === 'payment_reject') {
            userTemplateType = 'payment_reject';
            adminTemplateType = 'payment_reject';
        } else if (template === 'cancel_user') {
            userTemplateType = 'cancel_user';
            adminTemplateType = 'cancel_admin';
        } else {
            return jsonResponse({ success: false, error: 'Unknown template type' }, 400);
        }

        // Send Email to User
        if (userTemplateType) {
            const userNotif = getNotificationContent(testLang, userTemplateType, mockData);
            await sendEmail(context.env, {
                to: test_email,
                subject: '[TEST] ' + userNotif.subject!,
                body: userNotif.body!,
                htmlBody: userNotif.htmlBody!
            });
        }

        // Send Telegram to Admin
        if (adminTemplateType) {
            const adminNotif = getNotificationContent(testLang, adminTemplateType, mockData);
            if (adminNotif.tgMessage) {
                // Send Telegram
                context.waitUntil(sendTelegramNotification(context.env, `[TEST] ${adminNotif.tgMessage}`));
            }
        }

        return jsonResponse({ success: true, message: 'Test notification sent' });
    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
