import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { expenseService } from '../../services/expenseService';
import { CATEGORY_COLORS, CATEGORY_ICONS, Category, Expense } from '../../types';
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

  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'User';

  const maxCategory = categorySummary[0]?.total || 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingLabel}>Welcome back</Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
        </View>
      </View>

      {/* Monthly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>{format(new Date(), 'MMMM yyyy')} Spending</Text>
        <Text style={styles.summaryAmount}>
          LKR {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemValue}>{categorySummary.length}</Text>
            <Text style={styles.summaryItemLabel}>Categories</Text>
          </View>
          <View style={styles.summaryDividerV} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemValue}>{expenses.length}+</Text>
            <Text style={styles.summaryItemLabel}>Records</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown */}
      {categorySummary.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Category</Text>
          {categorySummary.slice(0, 5).map((item) => {
            const pct = (item.total / maxCategory) * 100;
            return (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryAmount}>
                      LKR {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
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
            <Ionicons name="receipt-outline" size={36} color="#333" />
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Tap the + tab to add your first expense</Text>
          </View>
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} style={styles.transactionRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>
                  {expense.title}
                </Text>
                <Text style={styles.transactionMeta}>
                  {expense.category} · {format(new Date(expense.date), 'MMM d')}
                </Text>
              </View>
              <Text style={styles.transactionAmount}>
                LKR {expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greetingLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#222',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDividerV: {
    width: 1,
    backgroundColor: '#222',
  },
  summaryItemValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    marginBottom: 14,
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
    color: '#ccc',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  barBg: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    marginBottom: 4,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  categoryCount: {
    fontSize: 11,
    color: '#444',
  },
  emptyCard: {
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1a1a1a',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#555',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
  },
});
