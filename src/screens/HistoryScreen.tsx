import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const { allExpenses, currency, deleteExpense, refreshAll } = useApp();
  const [filter, setFilter] = useState<FilterOption>('All');

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll]),
  );

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

  const renderItem = ({
    item,
    index,
    section,
  }: {
    item: Expense;
    index: number;
    section: { data: Expense[] };
  }) => {
    const catColor =
      item.category === 'Food'
        ? colors.categoryFood
        : item.category === 'Transport'
          ? colors.categoryTransport
          : colors.categoryOther;

    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <View
        style={[
          styles.rowContainer,
          isFirst && styles.rowFirst,
          isLast && styles.rowLast,
        ]}
      >
        {index > 0 && <View style={styles.rowSeparator} />}
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
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
          title="No expenses found."
          subtitle={
            filter !== 'All'
              ? `No ${filter} expenses yet.`
              : undefined
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontVariant: ['tabular-nums'],
  },
  rowContainer: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 38,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
