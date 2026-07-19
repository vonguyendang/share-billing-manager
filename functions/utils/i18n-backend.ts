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
    
    // Inject formatted admin contacts into data
    const formattedContacts = formatAdminContacts(data.admin_contacts || null);
    data.adminContactsHtml = formattedContacts.html;
    data.adminContactsText = formattedContacts.text;

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

export function formatAdminContacts(contactsJson: string | null): { html: string, text: string } {
    let contacts = [];
    try {
        contacts = contactsJson ? JSON.parse(contactsJson) : [];
    } catch (e) {}

    if (!contacts || contacts.length === 0) {
        // Fallback default
        contacts = [
            { type: 'phone', value: '0944353323' },
            { type: 'email', value: 'vndang96@gmail.com' },
            { type: 'facebook', value: 'https://www.facebook.com/iamnguyendang' }
        ];
    }

    let html = '';
    let text = '';
    
    contacts.forEach((c: any) => {
        let iconHtml = '';
        let iconText = '';
        let valueHtml = c.value;
        
        switch (c.type) {
            case 'phone':
                iconHtml = '📞 Zalo/SĐT: '; iconText = '📞 Zalo/SĐT: ';
                valueHtml = `<strong>${c.value}</strong>`;
                break;
            case 'email':
                iconHtml = '📧 Email: '; iconText = '📧 Email: ';
                valueHtml = `<a href="mailto:${c.value}" style="color: #1a73e8;">${c.value}</a>`;
                break;
            case 'facebook':
                iconHtml = '🌐 Facebook: '; iconText = '🌐 Facebook: ';
                valueHtml = `<a href="${c.value.startsWith('http') ? c.value : 'https://' + c.value}" style="color: #1a73e8;" target="_blank">${c.value}</a>`;
                break;
            case 'telegram':
                iconHtml = '💬 Telegram: '; iconText = '💬 Telegram: ';
                valueHtml = `<a href="${c.value.startsWith('http') ? c.value : 'https://t.me/' + c.value.replace('@', '')}" style="color: #1a73e8;" target="_blank">${c.value}</a>`;
                break;
            case 'website':
                iconHtml = '🌍 Website: '; iconText = '🌍 Website: ';
                valueHtml = `<a href="${c.value.startsWith('http') ? c.value : 'https://' + c.value}" style="color: #1a73e8;" target="_blank">${c.value}</a>`;
                break;
            case 'other':
            default:
                iconHtml = '📝 '; iconText = '📝 ';
                valueHtml = `<strong>${c.value}</strong>`;
                break;
        }

        html += `<p style="margin: 5px 0;">${iconHtml}${valueHtml}</p>\n`;
        text += `${iconText}${c.value}\n`;
    });

    return { html: html.trim(), text: text.trim() };
}
