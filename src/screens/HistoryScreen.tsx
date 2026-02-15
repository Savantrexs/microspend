import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { groupExpensesByDate, formatAmount, formatTime } from '../utils/helpers';
import { CATEGORIES } from '../types';
import type { Category, Expense } from '../types';
import EmptyState from '../components/EmptyState';

type FilterOption = 'All' | Category;
const FILTERS: FilterOption[] = ['All', ...CATEGORIES];

export default function HistoryScreen() {
  const { allExpenses, currency, deleteExpense } = useApp();
  const [filter, setFilter] = useState<FilterOption>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return allExpenses;
    return allExpenses.filter((e) => e.category === filter);
  }, [allExpenses, filter]);

  const sections = useMemo(() => {
    return groupExpensesByDate(filtered).map((g) => ({
      title: g.label,
      total: g.total,
      data: g.expenses,
    }));
  }, [filtered]);

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Delete expense',
      `Remove ${formatAmount(expense.amount, expense.currency)}${expense.note ? ` — "${expense.note}"` : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Expense }) => {
    const catColor =
      item.category === 'Food'
        ? colors.categoryFood
        : item.category === 'Transport'
          ? colors.categoryTransport
          : colors.categoryOther;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.dot, { backgroundColor: catColor }]} />
        <View style={styles.middle}>
          <Text style={styles.label} numberOfLines={1}>
            {item.note || item.category || 'Expense'}
          </Text>
          <Text style={styles.meta}>
            {formatTime(item.createdAt)}
            {item.category ? `  ·  ${item.category}` : ''}
          </Text>
        </View>
        <Text style={styles.amount}>
          {formatAmount(item.amount, item.currency)}
        </Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; total: number };
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionTotal}>
        {formatAmount(section.total, currency)}
      </Text>
    </View>
  );

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {sections.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No expenses found"
          subtitle={filter !== 'All' ? `No ${filter} expenses yet` : 'Start logging to see history'}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: colors.card,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  middle: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 54,
    marginHorizontal: 16,
  },
});
