import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { expenseService } from '../../services/expenseService';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Category,
  Expense,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySummary, setCategorySummary] = useState<
    Array<{ category: string; total: number; count: number }>
  >([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [allExpenses, summary, monthly] = await Promise.all([
        expenseService.getAll(),
        expenseService.getSummaryByCategory(),
        expenseService.getMonthlyTotal(),
      ]);
      setExpenses(allExpenses.slice(0, 5));
      setCategorySummary(summary.sort((a, b) => b.total - a.total));
      setMonthlyTotal(monthly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  const maxCategory = categorySummary[0]?.total || 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6366F1"
        />
      }
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{displayName} 👋</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
        </View>
      </View>

      {/* Monthly Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          {format(new Date(), 'MMMM yyyy')} Spending
        </Text>
        <Text style={styles.summaryAmount}>
          LKR {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={styles.summarySubtext}>
          {expenses.length} recent transactions tracked
        </Text>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="trending-up" size={18} color="#34D399" />
            <Text style={styles.summaryItemLabel}>Categories</Text>
            <Text style={styles.summaryItemValue}>{categorySummary.length}</Text>
          </View>
          <View style={styles.summaryDividerV} />
          <View style={styles.summaryItem}>
            <Ionicons name="receipt-outline" size={18} color="#60A5FA" />
            <Text style={styles.summaryItemLabel}>Total Records</Text>
            <Text style={styles.summaryItemValue}>{expenses.length}+</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {categorySummary.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {categorySummary.slice(0, 5).map((item) => {
            const color = CATEGORY_COLORS[item.category as Category] || '#6366F1';
            const icon = CATEGORY_ICONS[item.category as Category] || 'ellipsis-horizontal';
            const pct = (item.total / maxCategory) * 100;
            return (
              <View key={item.category} style={styles.categoryRow}>
                <View style={[styles.categoryIcon, { backgroundColor: color + '22' }]}>
                  <Ionicons name={icon as any} size={18} color={color} />
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryAmount}>
                      LKR {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${pct}%`, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryCount}>
                    {item.count} expense{item.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={40} color="#475569" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + tab to add your first expense
            </Text>
          </View>
        ) : (
          expenses.map((expense) => {
            const color = CATEGORY_COLORS[expense.category] || '#6366F1';
            const icon = CATEGORY_ICONS[expense.category] || 'ellipsis-horizontal';
            return (
              <View key={expense.id} style={styles.transactionRow}>
                <View
                  style={[styles.transactionIcon, { backgroundColor: color + '22' }]}
                >
                  <Ionicons name={icon as any} size={20} color={color} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle} numberOfLines={1}>
                    {expense.title}
                  </Text>
                  <Text style={styles.transactionCategory}>
                    {expense.category} • {format(new Date(expense.date), 'MMM d')}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  - LKR {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCard: {
    margin: 20,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#C7D2FE',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: '#C7D2FE',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ffffff33',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDividerV: {
    width: 1,
    backgroundColor: '#ffffff33',
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#C7D2FE',
  },
  summaryItemValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  barBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: 4,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 3,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F87171',
  },
});
