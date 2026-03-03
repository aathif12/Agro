import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { expenseService } from '../../services/expenseService';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Category,
  Expense,
} from '../../types';
import { format } from 'date-fns';

export const ExpensesScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(
    'All',
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async (cat: Category | 'All' = selectedCategory) => {
    try {
      const data =
        cat === 'All'
          ? await expenseService.getAll()
          : await expenseService.getByCategory(cat);
      setExpenses(data);
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
      loadExpenses(selectedCategory);
    }, [selectedCategory]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses(selectedCategory);
  };

  const handleCategoryChange = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setLoading(true);
    loadExpenses(cat);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await expenseService.delete(id);
            setExpenses((prev) => prev.filter((e) => e.id !== id));
          },
        },
      ],
    );
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const renderItem = ({ item }: { item: Expense }) => {
    const color = CATEGORY_COLORS[item.category] || '#6366F1';
    const icon = CATEGORY_ICONS[item.category] || 'ellipsis-horizontal';
    return (
      <View style={styles.expenseCard}>
        <View style={[styles.expenseIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.expenseMeta}>
            <View style={[styles.catBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.catBadgeText, { color }]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.expenseDate}>
              {format(new Date(item.date), 'MMM d, yyyy')}
            </Text>
          </View>
          {item.description ? (
            <Text style={styles.expenseDesc} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>
            LKR {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.title)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category filter row */}
      <FlatList
        horizontal
        data={(['All', ...CATEGORIES] as (Category | 'All')[])}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterList}
        renderItem={({ item: cat }) => {
          const isAll = cat === 'All';
          const color = isAll ? '#6366F1' : CATEGORY_COLORS[cat as Category];
          const selected = selectedCategory === cat;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selected && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => handleCategoryChange(cat)}
              activeOpacity={0.75}
            >
              {!isAll && (
                <Ionicons
                  name={CATEGORY_ICONS[cat as Category] as any}
                  size={14}
                  color={selected ? '#fff' : color}
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  { color: selected ? '#fff' : color },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryBarText}>
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryBarTotal}>
          Total: LKR{' '}
          {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            expenses.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color="#475569" />
              <Text style={styles.emptyTitle}>No expenses found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'All'
                  ? 'Add your first expense using the + tab'
                  : `No expenses in "${selectedCategory}" category`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  filterList: {
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  summaryBarText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  summaryBarTotal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  expenseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 5,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  catBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseDate: {
    fontSize: 11,
    color: '#64748B',
  },
  expenseDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
  deleteBtn: {
    padding: 4,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
