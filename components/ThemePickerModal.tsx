import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeContext';
import { ThemePreference } from '@/constants/Theme';
import { borderRadius, shadows, spacing, typography } from '@/constants/DesignSystem';

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

type ThemeOption = {
  id: ThemePreference;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'system',
    label: 'System default',
    description: 'Follows your device setting',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Bright and clean',
    icon: 'sunny-outline',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Comfortable in low light',
    icon: 'moon-outline',
  },
];

export function ThemePickerModal({ visible, onClose }: ThemePickerModalProps) {
  const { colors, isDark, themePreference, setThemePreference } = useTheme();

  const handleSelect = (preference: ThemePreference) => {
    setThemePreference(preference);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={isDark ? 55 : 65}
          tint={isDark ? 'dark' : 'light'}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close theme picker" />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
            },
            shadows.xl,
          ]}
        >
          <View style={[styles.accent, { backgroundColor: colors.primary }]} />

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={styles.hero}>
            <View style={[styles.heroIconRing, { backgroundColor: colors.primaryTint }]}>
              <Ionicons name="color-palette-outline" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Choose how Dream Mart looks for you
            </Text>
          </View>

          <View style={[styles.optionsCard, { borderColor: colors.borderLight }]}>
            {THEME_OPTIONS.map((option, index) => {
              const selected = themePreference === option.id;
              const isLast = index === THEME_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      borderLeftWidth: 3,
                      borderLeftColor: selected ? colors.primary : 'transparent',
                      backgroundColor: selected ? colors.primaryTint : 'transparent',
                    },
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.borderLight,
                    },
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: colors.backgroundSecondary }]}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                  </View>

                  <View style={styles.optionBody}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primary : colors.backgroundSecondary,
                      },
                    ]}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={14} color={colors.primaryContrast} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
    zIndex: 1,
    elevation: 24,
  },
  accent: {
    height: 3,
    width: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroIconRing: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  optionsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: 17,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
