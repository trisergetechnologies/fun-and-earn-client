import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

function ThemedSuccessToast(props: any) {
  const { colors } = useTheme();
  return (
    <View style={[styles.toast, styles.success, { backgroundColor: colors.success }]}>
      <Ionicons name="checkmark-circle" size={22} color={colors.primaryContrast} />
      <View style={styles.textWrap}>
        <Text style={[styles.text1, { color: colors.primaryContrast }]} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 ? (
          <Text style={[styles.text2, { color: colors.primaryContrast, opacity: 0.9 }]} numberOfLines={2}>
            {props.text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ThemedErrorToast(props: any) {
  const { colors } = useTheme();
  return (
    <View style={[styles.toast, styles.error, { backgroundColor: colors.error }]}>
      <Ionicons name="close-circle" size={22} color={colors.primaryContrast} />
      <View style={styles.textWrap}>
        <Text style={[styles.text1, { color: colors.primaryContrast }]} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 ? (
          <Text style={[styles.text2, { color: colors.primaryContrast, opacity: 0.9 }]} numberOfLines={2}>
            {props.text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ThemedInfoToast(props: any) {
  const { colors } = useTheme();
  return (
    <View style={[styles.toast, styles.info, { backgroundColor: colors.primary }]}>
      <Ionicons name="information-circle" size={22} color={colors.primaryContrast} />
      <View style={styles.textWrap}>
        <Text style={[styles.text1, { color: colors.primaryContrast }]} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 ? (
          <Text style={[styles.text2, { color: colors.primaryContrast, opacity: 0.9 }]} numberOfLines={2}>
            {props.text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props: any) => <ThemedSuccessToast {...props} />,
  error: (props: any) => <ThemedErrorToast {...props} />,
  info: (props: any) => <ThemedInfoToast {...props} />,
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 52,
    maxWidth: '92%',
    ...shadows.md,
  },
  success: {},
  error: {},
  info: {},
  textWrap: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  text1: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  text2: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
