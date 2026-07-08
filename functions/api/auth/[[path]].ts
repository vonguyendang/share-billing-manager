import { Env } from '../../utils/types';
import { checkAuth, hashPassword, jsonResponse } from '../../utils/auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    
    // Login
    if (request.url.endsWith('/login')) {
        try {
            const body = await request.json() as any;
            const password = body.password;

            if (!password) {
                return jsonResponse({ success: false, error: 'Password required' }, 400);
            }

            const hashed = await hashPassword(password);
            
            // Check against env var
            if (hashed === env.ADMIN_PASSWORD_HASH) {
                // Set cookie
                const headers = new Headers();
                // 30 days expiration
                const maxAge = 30 * 24 * 60 * 60;
                headers.append('Set-Cookie', `admin_session=${env.ADMIN_COOKIE_SECRET}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`);
                headers.append('Content-Type', 'application/json');

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers
                });
            } else {
                return jsonResponse({ success: false, error: 'Invalid password' }, 401);
            }
        } catch (e) {
            return jsonResponse({ success: false, error: 'Bad request' }, 400);
        }
    }
    
    // Logout
    if (request.url.endsWith('/logout')) {
        const headers = new Headers();
        headers.append('Set-Cookie', `admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
        headers.append('Content-Type', 'application/json');

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers
        });
    }

    return jsonResponse({ success: false, error: 'Not found' }, 404);
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    // Check session validity
    if (context.request.url.endsWith('/session')) {
        const isValid = checkAuth(context.request, context.env);
        return jsonResponse({ success: true, valid: isValid });
    }
    return jsonResponse({ success: false, error: 'Not found' }, 404);
}
