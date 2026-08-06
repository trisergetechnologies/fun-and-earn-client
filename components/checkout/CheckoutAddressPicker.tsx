import { Button, Card } from '@/components/ui';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing, typography } from '@/constants/DesignSystem';
import { Address } from '@/types/address';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CheckoutAddressPickerProps {
  addresses: Address[];
  selectedSlug: string;
  onSelect: (slugName: string) => void;
  onManagePress: () => void;
}

function formatCityLine(address: Address) {
  return `${address.city}, ${address.state} – ${address.pincode}`;
}

function AddressSheetRow({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.sheetRow,
        {
          borderColor: selected ? colors.primary : colors.borderLight,
          backgroundColor: selected ? colors.primary + '10' : colors.card,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected ? <Ionicons name="checkmark" size={12} color={colors.primaryContrast} /> : null}
      </View>

      <View style={styles.sheetRowBody}>
        <View style={styles.titleRow}>
          <Text style={[styles.sheetRowTitle, { color: colors.text }]} numberOfLines={1}>
            {address.addressName}
          </Text>
          {address.isDefault ? (
            <View style={[styles.defaultBadge, { backgroundColor: colors.success + '18' }]}>
              <Text style={[styles.defaultBadgeText, { color: colors.success }]}>Default</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.sheetRowMeta, { color: colors.text }]} numberOfLines={1}>
          {address.fullName} · {address.phone}
        </Text>
        <Text style={[styles.sheetRowLine, { color: colors.textSecondary }]} numberOfLines={1}>
          {address.street}
        </Text>
        <Text style={[styles.sheetRowLine, { color: colors.textMuted }]} numberOfLines={1}>
          {formatCityLine(address)}
        </Text>
      </View>
    </Pressable>
  );
}

export function CheckoutAddressPicker({
  addresses,
  selectedSlug,
  onSelect,
  onManagePress,
}: CheckoutAddressPickerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);

  const selected = useMemo(
    () => addresses.find((a) => a.slugName === selectedSlug) ?? addresses[0] ?? null,
    [addresses, selectedSlug]
  );

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  const handleSelect = (slugName: string) => {
    onSelect(slugName);
    closeSheet();
  };

  const handleManage = () => {
    closeSheet();
    onManagePress();
  };

  if (addresses.length === 0) {
    return (
      <Card padding={spacing.lg} style={styles.emptyCard}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="location-outline" size={32} color={colors.textMuted} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No delivery address</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Add an address to continue with checkout.
        </Text>
        <Button title="Add address" onPress={onManagePress} variant="primary" size="md" />
      </Card>
    );
  }

  if (!selected) return null;

  return (
    <>
      <Card padding={spacing.md}>
        <View style={styles.summaryTop}>
          <Text style={[styles.deliveringLabel, { color: colors.textMuted }]}>DELIVERING TO</Text>
          <View style={styles.summaryActions}>
            <Pressable
              onPress={openSheet}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.actionLink, { color: colors.primary }]}>Change</Text>
            </Pressable>
            <Text style={[styles.actionDivider, { color: colors.border }]}>·</Text>
            <Pressable
              onPress={onManagePress}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.actionLink, { color: colors.primary }]}>Add new</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={openSheet}
          style={({ pressed }) => [styles.summaryBody, { opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Change delivery address"
        >
          <View style={[styles.pinWrap, { backgroundColor: colors.primary + '14' }]}>
            <Ionicons name="location" size={18} color={colors.primary} />
          </View>
          <View style={styles.summaryText}>
            <View style={styles.titleRow}>
              <Text style={[styles.summaryName, { color: colors.text }]} numberOfLines={1}>
                {selected.addressName}
              </Text>
              {selected.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: colors.success + '18' }]}>
                  <Text style={[styles.defaultBadgeText, { color: colors.success }]}>Default</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.summaryMeta, { color: colors.text }]} numberOfLines={1}>
              {selected.fullName} · {selected.phone}
            </Text>
            <Text style={[styles.summaryLine, { color: colors.textSecondary }]} numberOfLines={2}>
              {selected.street}
              {selected.landmark ? `, ${selected.landmark}` : ''}
            </Text>
            <Text style={[styles.summaryLine, { color: colors.textMuted }]} numberOfLines={1}>
              {formatCityLine(selected)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </Card>

      <Modal
        visible={sheetOpen}
        animationType="slide"
        transparent
        onRequestClose={closeSheet}
      >
        <View style={styles.sheetRoot}>
          <Pressable
            style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }]}
            onPress={closeSheet}
            accessibilityLabel="Close address picker"
          />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderColor: colors.borderLight,
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
              shadows.xl,
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Delivery address</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
                  Choose where this order should go
                </Text>
              </View>
              <Pressable
                onPress={closeSheet}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { backgroundColor: colors.backgroundSecondary, opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetList}
              contentContainerStyle={styles.sheetListContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {addresses.map((address) => (
                <AddressSheetRow
                  key={address.slugName}
                  address={address}
                  selected={selectedSlug === address.slugName}
                  onSelect={() => handleSelect(address.slugName)}
                />
              ))}
            </ScrollView>

            <Pressable
              onPress={handleManage}
              style={({ pressed }) => [
                styles.manageRow,
                {
                  borderColor: colors.borderLight,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.manageIcon, { backgroundColor: colors.primary + '14' }]}>
                <Ionicons name="add" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.manageText, { color: colors.primary }]}>
                Manage or add addresses
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  deliveringLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
  },
  summaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  actionLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionDivider: {
    fontSize: typography.fontSize.sm,
  },
  summaryBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pinWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  summaryName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  summaryMeta: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  summaryLine: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  defaultBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sheetRowBody: {
    flex: 1,
    gap: 2,
  },
  sheetRowTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sheetRowMeta: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  sheetRowLine: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  manageIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
