import { Env } from '../utils/types';
import { checkAuth, jsonResponse } from '../utils/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!checkAuth(context.request, context.env)) {
        return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    try {
        const { DB } = context.env;
        
        // Count active plans
        const plansQuery = await DB.prepare("SELECT COUNT(*) as count FROM plans WHERE active = 1").first<{count: number}>();
        
        // Count active members
        const membersQuery = await DB.prepare("SELECT COUNT(*) as count FROM members WHERE active = 1").first<{count: number}>();
        
        // Subscriptions due in next 14 days
        const dueSoonQuery = await DB.prepare(`
            SELECT COUNT(*) as count 
            FROM subscriptions 
            WHERE status = 'active' 
            AND next_due_date <= date('now', '+14 days')
        `).first<{count: number}>();

        // Pending payments
        const pendingQuery = await DB.prepare(`
            SELECT COUNT(*) as count 
            FROM payment_requests 
            WHERE status = 'pending'
        `).first<{count: number}>();
        
        // Budget calculations
        // 1. Total Cost per month from all active plans
        const costQuery = await DB.prepare(`
            SELECT SUM(total_price / renewal_cycle_months) as amount
            FROM plans
            WHERE active = 1
        `).first<{amount: number}>();
        
        const totalMonthlyCost = costQuery?.amount || 0;

        // 2. Expected Revenue per month from all active subscriptions
        const revenueQuery = await DB.prepare(`
            SELECT SUM(amount_due / billing_cycle_months) as amount
            FROM subscriptions
            WHERE status IN ('active', 'pending_payment')
        `).first<{amount: number}>();

        const totalMonthlyRevenue = revenueQuery?.amount || 0;

        return jsonResponse({
            success: true,
            data: {
                activePlans: plansQuery?.count || 0,
                activeMembers: membersQuery?.count || 0,
                dueSoonSubscriptions: dueSoonQuery?.count || 0,
                pendingPayments: pendingQuery?.count || 0,
                budget: {
                    monthlyCost: Math.round(totalMonthlyCost),
                    monthlyRevenue: Math.round(totalMonthlyRevenue),
                    netProfit: Math.round(totalMonthlyRevenue - totalMonthlyCost)
                }
            }
        });

    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
