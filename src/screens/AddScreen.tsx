import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CURRENCY_SYMBOLS } from '../types';
import type { Category } from '../types';

const CATEGORY_ICONS: Record<Category, string> = {
  Food: 'fast-food-outline',
  Transport: 'car-outline',
  Other: 'ellipsis-horizontal-circle-outline',
};

const CATEGORY_COLORS: Record<Category, string> = {
  Food: colors.categoryFood,
  Transport: colors.categoryTransport,
  Other: colors.categoryOther,
};

export default function AddScreen() {
  const { addExpense, currency } = useApp();
  const navigation = useNavigation();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  // ---------- Inline validation ----------
  const parsed = parseFloat(amount);
  const amountIsValid = !isNaN(parsed) && parsed > 0;
  const showError = touched && !amountIsValid;
  const errorMessage =
    amount.length === 0
      ? 'Amount is required.'
      : 'Enter a valid amount greater than zero.';
  const canSave = amountIsValid && !saving;

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleaned;
    setAmount(sanitized);
    if (!touched) setTouched(true);
  };

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      await addExpense(parsed, note.trim() || null, category);
      setAmount('');
      setNote('');
      setCategory('Food');
      setTouched(false);
      (navigation as any).navigate('Today');
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount input */}
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={[styles.amountCard, showError && styles.amountCardError]}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={handleAmountChange}
            autoFocus={true}
          />
        </View>
        {showError && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {/* Note input */}
        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <View style={styles.noteCard}>
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.textTertiary}
            style={styles.noteIcon}
          />
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Coffee, parking meter…"
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
          />
        </View>

        {/* Category picker */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat === category;
            const accentColor = CATEGORY_COLORS[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && { backgroundColor: accentColor },
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat] as any}
                  size={20}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={styles.categoryIcon}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!canSave}
        >
          <Ionicons
            name={saving ? 'hourglass-outline' : 'checkmark-circle-outline'}
            size={22}
            color="#FFFFFF"
            style={styles.saveIcon}
          />
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Save Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  amountCardError: {
    borderColor: colors.danger,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
