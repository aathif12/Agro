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
import { CATEGORIES, Category, Expense } from '../../types';
import { format } from 'date-fns';

export const ExpensesScreen: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
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
    Alert.alert('Delete Expense', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await expenseService.delete(id);
          setExpenses((prev) => prev.filter((e) => e.id !== id));
        },
      },
    ]);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.expenseMeta}>
          {item.category} · {format(new Date(item.date), 'MMM d, yyyy')}
        </Text>
        {item.description ? (
          <Text style={styles.expenseDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>
          LKR {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.title)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <FlatList
        horizontal
        data={(['All', ...CATEGORIES] as (Category | 'All')[])}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterList}
        renderItem={({ item: cat }) => {
          const selected = selectedCategory === cat;
          return (
            <TouchableOpacity
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => handleCategoryChange(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryBarCount}>
          {expenses.length} record{expenses.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryBarTotal}>
          LKR {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={40} color="#333" />
              <Text style={styles.emptyTitle}>No expenses found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'All'
                  ? 'Add your first expense using the + tab'
                  : `No expenses in "${selectedCategory}"`}
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
    backgroundColor: '#000',
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterChipSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1a1a1a',
  },
  summaryBarCount: {
    color: '#666',
    fontSize: 13,
  },
  summaryBarTotal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1a1a1a',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  expenseMeta: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  expenseDesc: {
    fontSize: 12,
    color: '#444',
  },
  expenseRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },
  deleteBtn: {
    padding: 2,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#444',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
