import { useTheme } from '@/components/ThemeContext';
import { Button, EmptyState } from '@/components/ui';
import { spacing, typography } from '@/constants/DesignSystem';
import { Address } from '@/types/address';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

interface AddressListProps {
  addresses: Address[];
  onUpdate: (address: Address) => Promise<void>;
  onDelete: (slugName: string) => Promise<void>;
  onSetDefault: (slugName: string) => Promise<void>;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function AddressList({
  addresses,
  onUpdate,
  onDelete,
  onSetDefault,
  refreshing = false,
  onRefresh,
}: AddressListProps) {
  const { colors } = useTheme();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  const closeForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = async (addressData: Address) => {
    await onUpdate(addressData);
    closeForm();
  };

  const confirmDelete = (slugName: string, label: string) => {
    Alert.alert('Delete address', `Remove "${label}" from saved addresses?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(slugName).catch(() => undefined);
        },
      },
    ]);
  };

  if (showForm) {
    return (
      <View style={styles.formScreen}>
        <Pressable
          onPress={closeForm}
          style={({ pressed }) => [styles.backRow, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Back to addresses</Text>
        </Pressable>
        <AddressForm address={editingAddress} onSubmit={handleSubmit} onCancel={closeForm} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title="No saved addresses"
          subtitle="Add one for faster checkout and delivery."
          style={styles.emptyState}
          action={
            <Button
              title="Add new address"
              onPress={() => setShowForm(true)}
              variant="primary"
              size="md"
            />
          }
        />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              ) : undefined
            }
          >
            {addresses.map((address) => (
              <AddressCard
                key={address.slugName}
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => confirmDelete(address.slugName, address.addressName)}
                onSetDefault={() => onSetDefault(address.slugName)}
              />
            ))}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
            <Button
              title="Add new address"
              onPress={() => setShowForm(true)}
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Ionicons name="add" size={20} />}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formScreen: {
    flex: 1,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
