import { supabase } from '../lib/supabase';
import { Expense, ExpenseInsert } from '../types';

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByCategory(category: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(expense: ExpenseInsert): Promise<Expense> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  async getSummaryByCategory(): Promise<
    Array<{ category: string; total: number; count: number }>
  > {
    const { data, error } = await supabase
      .from('expenses')
      .select('category, amount');

    if (error) throw error;

    const summary: Record<string, { total: number; count: number }> = {};
    (data || []).forEach((expense) => {
      if (!summary[expense.category]) {
        summary[expense.category] = { total: 0, count: 0 };
      }
      summary[expense.category].total += expense.amount;
      summary[expense.category].count += 1;
    });

    return Object.entries(summary).map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    }));
  },

  async getMonthlyTotal(): Promise<number> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', firstDay)
      .lte('date', lastDay);

    if (error) throw error;
    return (data || []).reduce((sum, e) => sum + e.amount, 0);
  },
};
