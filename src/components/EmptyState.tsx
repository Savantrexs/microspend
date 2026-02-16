import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = 'receipt-outline', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={56} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
});
