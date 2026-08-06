import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/constants/DesignSystem';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'dangerSoft';

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
  const scale = useSharedValue(1);

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string; shadow?: boolean }> = {
    primary: { bg: colors.primary, text: colors.primaryContrast, shadow: true },
    secondary: { bg: colors.primaryTint, text: colors.primary, shadow: false },
    outline: { bg: colors.primaryTint, text: colors.primary, border: colors.primary, shadow: false },
    ghost: { bg: 'transparent', text: colors.text, shadow: false },
    success: { bg: colors.success, text: colors.primaryContrast, shadow: true },
    danger: { bg: colors.error, text: colors.primaryContrast, shadow: true },
    dangerSoft: { bg: colors.errorMuted, text: colors.error, border: colors.border, shadow: false },
  };

  const sizePadding = { sm: spacing.sm, md: spacing.md, lg: spacing.lg }[size];
  const sizeFontSize = { sm: typography.fontSize.sm, md: typography.fontSize.md, lg: typography.fontSize.lg }[size];

  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  const renderLeftIcon = () => {
    if (!leftIcon || !React.isValidElement(leftIcon)) return leftIcon ?? null;
    return React.cloneElement(leftIcon as React.ReactElement<{ color?: string }>, {
      color: v.text,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => { if (!isDisabled) scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      style={[styles.pressable, fullWidth && { width: '100%' }]}
    >
      <Animated.View
        style={[
          styles.base,
          animatedStyle,
          {
            backgroundColor: v.bg,
            borderWidth: v.border ? 1.5 : 0,
            borderColor: v.border,
            paddingVertical: sizePadding,
            paddingHorizontal: size === 'sm' ? spacing.md : spacing.xl,
            opacity: isDisabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : undefined,
          },
          v.shadow ? shadows.sm : undefined,
          style,
        ]}
      >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {renderLeftIcon()}
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
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
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
