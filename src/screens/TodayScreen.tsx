import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { formatAmount, formatTime } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import type { Expense } from '../types';

export default function TodayScreen() {
  const { todayExpenses, currency, refreshToday } = useApp();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      refreshToday();
    }, [refreshToday]),
  );

  const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const renderItem = ({ item, index }: { item: Expense; index: number }) => {
    const catColor =
      item.category === 'Food'
        ? colors.categoryFood
        : item.category === 'Transport'
          ? colors.categoryTransport
          : colors.categoryOther;

    const isFirst = index === 0;
    const isLast = index === todayExpenses.length - 1;

    return (
      <View
        style={[
          styles.row,
          isFirst && styles.rowFirst,
          isLast && styles.rowLast,
        ]}
      >
        {index > 0 && <View style={styles.separator} />}
        <View style={styles.rowInner}>
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
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Today total header */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Today's spending</Text>
        <Text style={styles.totalAmount}>
          {formatAmount(total, currency)}
        </Text>
        <Text style={styles.totalCount}>
          {todayExpenses.length} expense{todayExpenses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Expense list */}
      {todayExpenses.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No expenses yet. Tap + to add."
        />
      ) : (
        <FlatList
          data={todayExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => (navigation as any).navigate('Add')}
      >
        <Ionicons name="add" size={30} color={colors.fabText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  totalCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  totalCount: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingBottom: 100,
  },
  row: {
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
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 38,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.fab,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
});
