// api.js - Simple wrapper for fetch
export async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const res = await fetch(`/api${endpoint}`, options);
    const data = await res.json();
    
    // Auto redirect to login on 401
    if (res.status === 401 && !endpoint.startsWith('/auth')) {
        window.location.reload();
    }
    
    if (!data.success) {
        throw new Error(data.error || 'API Error');
    }
    
    return data;
}
