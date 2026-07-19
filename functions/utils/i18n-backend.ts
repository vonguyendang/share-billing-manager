import cancelUserTemplate from './templates/cancel_user';
import cancelAdminTemplate from './templates/cancel_admin';
import paymentUserTemplate from './templates/payment_user';
import paymentAdminTemplate from './templates/payment_admin';
import paymentApproveTemplate from './templates/payment_approve';
import paymentRejectTemplate from './templates/payment_reject';
import paymentUndoTemplate from './templates/payment_undo';
import reminderUserTemplate from './templates/reminder_user';
import reminderAdminTemplate from './templates/reminder_admin';

export function getNotificationContent(lang: string, type: 'cancel_user' | 'cancel_admin' | 'payment_admin' | 'payment_user' | 'payment_approve' | 'payment_reject' | 'payment_undo' | 'reminder' | 'reminder_admin', data: any): { subject?: string, body?: string, htmlBody?: string, tgMessage?: string } {
    
    let templates: { vi: any, en: any } = { vi: {}, en: {} };

    switch (type) {
        case 'cancel_user':
            templates = cancelUserTemplate(data);
            break;
        case 'cancel_admin':
            templates = cancelAdminTemplate(data);
            break;
        case 'payment_user':
            templates = paymentUserTemplate(data);
            break;
        case 'payment_admin':
            templates = paymentAdminTemplate(data);
            break;
        case 'payment_approve':
            templates = paymentApproveTemplate(data);
            break;
        case 'payment_reject':
            templates = paymentRejectTemplate(data);
            break;
        case 'payment_undo':
            templates = paymentUndoTemplate(data);
            break;
        case 'reminder':
            templates = reminderUserTemplate(data);
            break;
        case 'reminder_admin':
            templates = reminderAdminTemplate(data);
            break;
    }

    const { vi, en } = templates;

    if (lang === 'en') return en;
    if (lang === 'bilingual') {
        return {
            subject: `${vi.subject} | ${en.subject}`,
            body: `${vi.body}\n\n---\n\n${en.body}`,
            htmlBody: `
                ${vi.htmlBody}
                <br />
                <div style="text-align: center; color: #9CA3AF;">- English Version Below -</div>
                <br />
                ${en.htmlBody}
            `,
            tgMessage: `${vi.tgMessage}\n\n---\n\n${en.tgMessage}`
        };
    }
    
    return vi; // Default
}
