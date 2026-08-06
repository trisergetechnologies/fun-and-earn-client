import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';

interface ProfileLegalFooterProps {
  onTerms: () => void;
  onPrivacy: () => void;
  onReturnRefund: () => void;
  onShipping: () => void;
}

export function ProfileLegalFooter({
  onTerms,
  onPrivacy,
  onReturnRefund,
  onShipping,
}: ProfileLegalFooterProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const links = [
    { label: 'Terms & Conditions', onPress: onTerms },
    { label: 'Privacy Policy', onPress: onPrivacy },
    { label: 'Return & Refund', onPress: onReturnRefund },
    { label: 'Shipping Policy', onPress: onShipping },
  ];

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card, borderColor: colors.borderLight },
        ]}
      >
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={({ pressed }) => [styles.header, { opacity: pressed ? 0.75 : 1 }]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSecondary }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
              Legal & policies
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>

        {expanded ? (
          <View style={[styles.links, { borderTopColor: colors.borderLight }]}>
            {links.map((link, index) => (
              <Pressable
                key={link.label}
                onPress={link.onPress}
                style={({ pressed }) => [
                  styles.linkRow,
                  index < links.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.borderLight,
                  },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.linkText, { color: colors.text }]}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <Text style={[styles.brandText, { color: colors.textMuted }]}>
        AARUSH MP DREAMS (OPC) PRIVATE LIMITED
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
  },
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  links: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  brandText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
