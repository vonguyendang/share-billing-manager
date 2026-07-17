import { Env } from '../utils/types';
import { checkAuth } from '../utils/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    // Basic auth check from cookies
    const cookieHeader = context.request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=')) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { DB } = context.env;
        const url = new URL(context.request.url);
        const type = url.searchParams.get('type');

        if (!['members', 'subscriptions', 'payments', 'expenses'].includes(type || '')) {
            return new Response('Invalid type', { status: 400 });
        }

        let query = '';
        let headers = '';
        
        switch (type) {
            case 'members':
                query = "SELECT id, full_name, email, phone, note, active, created_at FROM members ORDER BY created_at DESC";
                headers = "ID,Full Name,Email,Phone,Note,Active,Created At\n";
                break;
            case 'subscriptions':
                query = `
                    SELECT s.id, m.full_name as member, p.name as plan, 
                           s.start_date, s.end_date, s.next_due_date, s.amount_due, 
                           s.billing_cycle_months, s.status, s.personal_note
                    FROM subscriptions s
                    JOIN members m ON s.member_id = m.id
                    JOIN plans p ON s.plan_id = p.id
                    ORDER BY s.next_due_date DESC
                `;
                headers = "ID,Member,Plan,Start Date,End Date,Next Due Date,Amount Due,Billing Cycle,Status,Personal Note\n";
                break;
            case 'payments':
                query = `
                    SELECT pr.id, m.full_name as member, p.name as plan, 
                           pr.amount, pr.status, pr.user_note, pr.created_at, pr.approved_at
                    FROM payment_requests pr
                    JOIN subscriptions s ON pr.subscription_id = s.id
                    JOIN members m ON s.member_id = m.id
                    JOIN plans p ON s.plan_id = p.id
                    ORDER BY pr.created_at DESC
                `;
                headers = "ID,Member,Plan,Amount,Status,User Note,Created At,Approved At\n";
                break;
            case 'expenses':
                query = "SELECT id, expense_date, description, amount, created_at FROM expenses ORDER BY expense_date DESC";
                headers = "ID,Expense Date,Description,Amount,Created At\n";
                break;
        }

        const result = await DB.prepare(query).all();
        
        // Convert to CSV
        let csvContent = headers;
        result.results.forEach((row: any) => {
            const values = Object.values(row).map(value => {
                let str = value ? String(value) : '';
                // Escape quotes and wrap in quotes if contains comma
                if (str.includes(',') || str.includes('"')) {
                    str = `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            });
            csvContent += values.join(',') + '\n';
        });

        // Return as downloadable file
        const filename = `export_${type}_${new Date().toISOString().split('T')[0]}.csv`;
        
        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};
