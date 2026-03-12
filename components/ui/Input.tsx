import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  error?: boolean;
}

export function Input({ leftIcon, error, style, placeholderTextColor, ...props }: InputProps) {
  const { colors } = useTheme();
  const color = error ? colors.error : colors.text;
  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={[styles.wrap, { borderColor, backgroundColor: colors.card }]}>
      {leftIcon ? (
        <Ionicons
          name={leftIcon}
          size={20}
          color={colors.textMuted}
          style={styles.leftIcon}
        />
      ) : null}
      <TextInput
        placeholderTextColor={placeholderTextColor ?? colors.textMuted}
        style={[styles.input, { color }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.normal,
  },
});
