import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { formatAmount } from '../utils/helpers';
import ExpenseRow from '../components/ExpenseRow';
import EmptyState from '../components/EmptyState';

export default function TodayScreen() {
  const { todayExpenses, currency } = useApp();
  const navigation = useNavigation();

  const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const renderItem = ({ item, index }: { item: typeof todayExpenses[0]; index: number }) => (
    <View>
      {index > 0 && <View style={styles.separator} />}
      <ExpenseRow expense={item} />
    </View>
  );

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
          title="No expenses yet"
          subtitle="Tap + to log your first spend"
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
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    paddingBottom: 100,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 38,
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
