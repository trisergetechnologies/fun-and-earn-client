import { Card } from '@/components/ui';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Address } from '@/types/address';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  showActions?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}: AddressCardProps) {
  const { colors } = useTheme();

  return (
    <Card
      padding={spacing.md}
      style={[
        styles.card,
        address.isDefault && {
          borderWidth: 1,
          borderColor: colors.primary + '55',
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{address.addressName}</Text>
            {address.isDefault ? (
              <View style={[styles.defaultBadge, { backgroundColor: colors.success + '18' }]}>
                <Text style={[styles.defaultBadgeText, { color: colors.success }]}>Default</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={[styles.name, { color: colors.text }]}>{address.fullName}</Text>
        <Text style={[styles.line, { color: colors.textSecondary }]}>{address.street}</Text>
        {address.landmark ? (
          <Text style={[styles.line, { color: colors.textMuted }]}>Landmark: {address.landmark}</Text>
        ) : null}
        <Text style={[styles.line, { color: colors.textSecondary }]}>
          {address.city}, {address.state} – {address.pincode}
        </Text>
        {address.country ? (
          <Text style={[styles.line, { color: colors.textMuted }]}>{address.country}</Text>
        ) : null}
        <Text style={[styles.phone, { color: colors.textMuted }]}>{address.phone}</Text>
      </View>

      {showActions ? (
        <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
          <View style={styles.actions}>
            {!address.isDefault ? (
              <Pressable
                onPress={onSetDefault}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.75 : 1 }]}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>Make default</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.75 : 1 }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  details: {
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  line: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  phone: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xxs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xxs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  iconBtn: {
    padding: spacing.xxs,
  },
});

