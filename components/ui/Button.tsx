import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/constants/DesignSystem';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth,
  leftIcon,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: colors.primaryContrast },
    secondary: { bg: colors.primaryTint, text: colors.primary },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', text: colors.text },
    success: { bg: colors.success, text: colors.primaryContrast },
    danger: { bg: colors.error, text: colors.primaryContrast },
  };

  const sizePadding = { sm: spacing.sm, md: spacing.md, lg: spacing.lg }[size];
  const sizeFontSize = { sm: typography.fontSize.sm, md: typography.fontSize.md, lg: typography.fontSize.lg }[size];

  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border,
          paddingVertical: sizePadding,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.xl,
          opacity: isDisabled ? 0.6 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        variant !== 'ghost' && shadows.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {leftIcon ?? null}
          <Text
            style={[
              styles.text,
              {
                color: v.text,
                fontSize: sizeFontSize,
                marginLeft: leftIcon ? spacing.xs : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  text: {
    fontWeight: typography.fontWeight.bold,
  },
});
