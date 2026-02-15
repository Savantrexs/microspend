import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { CURRENCIES, CURRENCY_SYMBOLS, CURRENCY_LABELS } from '../types';
import type { Currency } from '../types';
import { expensesToCSV } from '../utils/helpers';

type AdState = 'idle' | 'playing' | 'completed';

export default function SettingsScreen() {
  const { currency, setCurrency, allExpenses } = useApp();
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [adState, setAdState] = useState<AdState>('idle');

  // ---- Toast state ----
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(null));
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
        showToast('CSV saved to cache.');
      }
    } catch {
      showToast('Export cancelled.');
    }
  };

  const handleWatchAd = async () => {
    setAdState('playing');
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setAdState('completed');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setAdModalVisible(false);
    setAdState('idle');
    await doExport();
  };

  const handleCancelAd = () => {
    if (adState === 'playing') return;
    setAdModalVisible(false);
    setAdState('idle');
  };

  // ---------- Render ----------
  return (
    <View style={styles.flex}>
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
                  <View style={styles.currencyLeft}>
                    <Text style={styles.currencySymbolText}>
                      {CURRENCY_SYMBOLS[c]}
                    </Text>
                    <Text style={styles.settingLabel}>
                      {CURRENCY_LABELS[c]}
                    </Text>
                  </View>
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
          <View style={styles.aboutRow}>
            <Text style={styles.aboutText}>
              MicroSpend is a Savantrexs utility.
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.aboutRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.success}
              style={styles.privacyIcon}
            />
            <Text style={styles.privacyText}>
              All data stays on your device. No accounts. No tracking.
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
              {adState === 'completed' ? (
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              ) : (
                <Ionicons name="play-circle-outline" size={48} color={colors.primary} />
              )}

              <Text style={styles.modalTitle}>
                {adState === 'completed'
                  ? 'Ad completed ✅'
                  : 'Watch a short ad to export'}
              </Text>

              {adState === 'idle' && (
                <Text style={styles.modalSubtitle}>
                  Watch a short ad to unlock CSV export of all your expenses.
                </Text>
              )}

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

      {/* Toast overlay */}
      {toastMessage && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  currencySymbolText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    width: 32,
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
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  aboutText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  privacyIcon: {
    marginRight: 8,
  },
  privacyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 16,
  },
  // Toast
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
    minHeight: 48,
    justifyContent: 'center',
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
    minHeight: 48,
    justifyContent: 'center',
  },
  modalWatchText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
