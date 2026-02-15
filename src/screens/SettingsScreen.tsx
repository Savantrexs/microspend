import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { CURRENCIES, CURRENCY_SYMBOLS } from '../types';
import type { Currency } from '../types';
import { expensesToCSV } from '../utils/helpers';

type AdState = 'idle' | 'playing' | 'completed';

export default function SettingsScreen() {
  const { currency, setCurrency, allExpenses } = useApp();
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [adState, setAdState] = useState<AdState>('idle');

  // ---------- Currency selector ----------
  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
  };

  // ---------- Export CSV with mock ad gate ----------
  const handleExportPress = () => {
    if (allExpenses.length === 0) {
      Alert.alert('Nothing to export', 'Add some expenses first.');
      return;
    }
    setAdState('idle');
    setAdModalVisible(true);
  };

  const doExport = async () => {
    try {
      const csv = expensesToCSV(allExpenses);
      const file = new ExpoFile(Paths.cache, 'microspend_expenses.csv');
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(csv);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export expenses',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Exported', 'CSV file saved to cache.');
      }
    } catch {
      Alert.alert('Export failed', 'Something went wrong. Please try again.');
    }
  };

  const handleWatchAd = async () => {
    // Phase 1: Simulate ad playback (2–3 seconds)
    setAdState('playing');
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Phase 2: Show "Ad completed ✅" for 1 second
    setAdState('completed');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Phase 3: Close modal & export
    setAdModalVisible(false);
    setAdState('idle');
    await doExport();
  };

  const handleCancelAd = () => {
    if (adState === 'playing') return; // can't cancel during playback
    setAdModalVisible(false);
    setAdState('idle');
  };

  // ---------- Render ----------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Currency section */}
      <Text style={styles.sectionTitle}>Default Currency</Text>
      <View style={styles.card}>
        {CURRENCIES.map((c, idx) => {
          const isActive = c === currency;
          return (
            <React.Fragment key={c}>
              {idx > 0 && <View style={styles.separator} />}
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => handleCurrencyChange(c)}
                activeOpacity={0.6}
              >
                <Text style={styles.settingLabel}>
                  {CURRENCY_SYMBOLS[c]}  {c}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>

      {/* Export section */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleExportPress}
          activeOpacity={0.6}
        >
          <View style={styles.settingRowLeft}>
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.primary}
              style={styles.settingIcon}
            />
            <Text style={styles.settingLabel}>Export CSV</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* About section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>MicroSpend</Text>
          <Text style={styles.settingValue}>v1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.settingRow}>
          <Text style={styles.aboutText}>
            MicroSpend is a Savantrexs utility.
          </Text>
        </View>
      </View>

      {/* Mock Ad Modal */}
      <Modal
        visible={adModalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCancelAd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Icon changes per state */}
            {adState === 'completed' ? (
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            ) : (
              <Ionicons name="play-circle-outline" size={48} color={colors.primary} />
            )}

            {/* Title changes per state */}
            <Text style={styles.modalTitle}>
              {adState === 'completed'
                ? 'Ad completed ✅'
                : 'Watch a short ad to export'}
            </Text>

            {/* Body */}
            {adState === 'idle' && (
              <Text style={styles.modalSubtitle}>
                Watch a short ad to unlock CSV export of all your expenses.
              </Text>
            )}

            {/* State-specific controls */}
            {adState === 'playing' && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.modalLoadingText}>Playing ad…</Text>
              </View>
            )}

            {adState === 'completed' && (
              <Text style={styles.modalCompletedSubtitle}>
                Preparing your export…
              </Text>
            )}

            {adState === 'idle' && (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={handleCancelAd}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalWatch}
                  onPress={handleWatchAd}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalWatchText}>Watch Ad</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 20,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingValue: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  aboutText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
  modalCompletedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  modalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  modalLoadingText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalWatch: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalWatchText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
