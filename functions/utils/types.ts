export interface Env {
    DB: D1Database;
    APP_URL: string;
    ADMIN_PASSWORD_HASH: string; // SHA-256 hex string
    ADMIN_COOKIE_SECRET: string; // Secret for signing cookie (optional for simple MVP, but good practice)
    GAS_WEBHOOK_URL: string;
    GAS_WEBHOOK_SECRET: string;
}

export type JsonResponse = {
    success: boolean;
    data?: any;
    error?: string;
};
