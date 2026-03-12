import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, typography } from '@/constants/DesignSystem';

interface BadgeProps {
  label: string;
  variant?: 'discount' | 'primary' | 'success' | 'error';
}

export function Badge({ label, variant = 'discount' }: BadgeProps) {
  const { colors } = useTheme();

  const variantBg: Record<string, string> = {
    discount: colors.discount,
    primary: colors.primary,
    success: colors.success,
    error: colors.error,
  };
  const bg = variantBg[variant] ?? colors.discount;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
