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
        
        // Subscriptions due in next 7 days
        const dueSoonQuery = await DB.prepare(`
            SELECT COUNT(*) as count 
            FROM subscriptions 
            WHERE status = 'active' 
            AND next_due_date <= date('now', '+7 days')
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

        // 3. Due Soon List (Next 7 days)
        const dueSoonList = await DB.prepare(`
            SELECT s.id, m.full_name as member_name, p.name as plan_name, s.next_due_date, s.amount_due
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status != 'paused' 
            AND s.next_due_date >= date('now', 'localtime')
            AND s.next_due_date <= date('now', '+7 days', 'localtime')
            ORDER BY s.next_due_date ASC
            LIMIT 5
        `).all();

        // 4. Overdue List
        const overdueList = await DB.prepare(`
            SELECT s.id, m.full_name as member_name, p.name as plan_name, s.next_due_date, s.amount_due
            FROM subscriptions s
            JOIN members m ON s.member_id = m.id
            JOIN plans p ON s.plan_id = p.id
            WHERE s.status != 'paused' 
            AND s.next_due_date < date('now', 'localtime')
            ORDER BY s.next_due_date ASC
            LIMIT 5
        `).all();

        // 5. Plan Utilization
        const planUtilList = await DB.prepare(`
            SELECT p.id, p.name, p.max_slots, 
                (SELECT COUNT(*) FROM subscriptions s WHERE s.plan_id = p.id AND s.status != 'paused') as used_slots
            FROM plans p
            WHERE p.active = 1
        `).all();

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
                },
                dueSoonList: dueSoonList.results || [],
                overdueList: overdueList.results || [],
                planUtilList: planUtilList.results || []
            }
        });

    } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 500);
    }
};
