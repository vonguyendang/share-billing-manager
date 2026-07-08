import { Env, JsonResponse } from './types';

// Helper to generate JSON response
export function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

// Simple SHA-256 hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random hex string for tokens
export function generateToken(length: number = 32): string {
    const array = new Uint8Array(length / 2);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check if admin is authenticated via cookie
export function checkAuth(request: Request, env: Env): boolean {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return false;
    
    // In a real app with JWT, verify signature here. 
    // For this MVP, we just check if the session cookie exists and matches a known format/secret.
    // For simplicity, we just look for `admin_session=true`
    // To make it secure, let's use the ADMIN_COOKIE_SECRET as the cookie value
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, v];
        })
    );
    
    return cookies['admin_session'] === env.ADMIN_COOKIE_SECRET;
}
