import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Expense } from '../types';
import { colors } from '../theme/colors';
import { formatTime, formatAmount } from '../utils/helpers';

interface Props {
  expense: Expense;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: colors.categoryFood,
  Transport: colors.categoryTransport,
  Other: colors.categoryOther,
};

export default function ExpenseRow({ expense }: Props) {
  const catColor = CATEGORY_COLORS[expense.category ?? 'Other'] ?? colors.categoryOther;

  return (
    <View style={styles.row}>
      {/* Category dot */}
      <View style={[styles.dot, { backgroundColor: catColor }]} />

      {/* Middle: note / category + time */}
      <View style={styles.middle}>
        <Text style={styles.label} numberOfLines={1}>
          {expense.note || expense.category || 'Expense'}
        </Text>
        <Text style={styles.meta}>
          {formatTime(expense.createdAt)}
          {expense.category ? `  ·  ${expense.category}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <Text style={styles.amount}>
        {formatAmount(expense.amount, expense.currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    marginRight: 12,
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
  },
});
