import { Env } from './types';

export interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

export async function sendEmail(env: Env, payload: EmailPayload): Promise<boolean> {
    if (!env.GAS_WEBHOOK_URL || !env.GAS_WEBHOOK_SECRET) {
        console.warn('Email skipped: GAS_WEBHOOK_URL or GAS_WEBHOOK_SECRET not configured');
        return false;
    }

    try {
        const payloadWithSecret = { ...payload, secret: env.GAS_WEBHOOK_SECRET };

        const response = await fetch(env.GAS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadWithSecret)
        });

        if (!response.ok) {
            console.error('GAS Webhook failed:', await response.text());
            return false;
        }

        const result = await response.json() as any;
        return result.success === true;
    } catch (e) {
        console.error('Error sending email via GAS webhook:', e);
        return false;
    }
}
