import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing } from '@/constants/DesignSystem';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: keyof typeof spacing | number;
  style?: ViewStyle;
}

export function Card({ children, elevated = true, padding = 'md', style }: CardProps) {
  const { colors } = useTheme();
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          padding: paddingValue,
          ...(elevated ? shadows.md : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});
