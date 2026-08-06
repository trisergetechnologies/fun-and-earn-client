import { useTheme } from '@/components/ThemeContext';
import { Button, Input } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Address, AddressFormData } from '@/types/address';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (addressData: Address) => Promise<void>;
  onCancel: () => void;
}

type FormErrors = Partial<Record<keyof AddressFormData, string>>;

function validateForm(data: AddressFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.addressName.trim()) errors.addressName = 'Required';
  if (!data.fullName.trim()) errors.fullName = 'Required';
  if (!data.street.trim()) errors.street = 'Required';
  if (!data.city.trim()) errors.city = 'Required';
  if (!data.state.trim()) errors.state = 'Required';
  if (!/^\d{6}$/.test(data.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pincode';
  if (!/^\d{10}$/.test(data.phone.trim())) errors.phone = 'Enter a valid 10-digit phone';

  return errors;
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const { colors } = useTheme();
  const isEditing = Boolean(address);

  const [formData, setFormData] = useState<AddressFormData>({
    addressName: address?.addressName || '',
    fullName: address?.fullName || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = <K extends keyof AddressFormData>(name: K, value: AddressFormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        addressName: formData.addressName.trim(),
        fullName: formData.fullName.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        phone: formData.phone.trim(),
        slugName: address?.slugName || '',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {isEditing ? 'Edit address' : 'Add address'}
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
            Save where you want orders delivered
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACT</Text>
        <View style={styles.fieldGroup}>
          <FieldLabel label="Full name" colors={colors} />
          <Input
            leftIcon="person-outline"
            placeholder="Full name"
            value={formData.fullName}
            onChangeText={(text) => handleChange('fullName', text)}
            error={Boolean(errors.fullName)}
          />
          {errors.fullName ? <FieldError message={errors.fullName} colors={colors} /> : null}

          <FieldLabel label="Phone" colors={colors} />
          <Input
            leftIcon="call-outline"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text.replace(/\D/g, ''))}
            error={Boolean(errors.phone)}
          />
          {errors.phone ? <FieldError message={errors.phone} colors={colors} /> : null}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ADDRESS DETAILS</Text>
        <View style={styles.fieldGroup}>
          <FieldLabel label="Label" colors={colors} />
          <Input
            leftIcon="bookmark-outline"
            placeholder="Home, Work, etc."
            value={formData.addressName}
            onChangeText={(text) => handleChange('addressName', text)}
            error={Boolean(errors.addressName)}
          />
          {errors.addressName ? <FieldError message={errors.addressName} colors={colors} /> : null}

          <FieldLabel label="Street address" colors={colors} />
          <Input
            leftIcon="location-outline"
            placeholder="House no., street, area"
            value={formData.street}
            onChangeText={(text) => handleChange('street', text)}
            error={Boolean(errors.street)}
          />
          {errors.street ? <FieldError message={errors.street} colors={colors} /> : null}

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FieldLabel label="City" colors={colors} />
              <Input
                leftIcon="business-outline"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => handleChange('city', text)}
                error={Boolean(errors.city)}
              />
              {errors.city ? <FieldError message={errors.city} colors={colors} /> : null}
            </View>
            <View style={styles.halfField}>
              <FieldLabel label="State" colors={colors} />
              <Input
                placeholder="State"
                value={formData.state}
                onChangeText={(text) => handleChange('state', text)}
                error={Boolean(errors.state)}
              />
              {errors.state ? <FieldError message={errors.state} colors={colors} /> : null}
            </View>
          </View>

          <FieldLabel label="Pincode" colors={colors} />
          <Input
            leftIcon="keypad-outline"
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
            value={formData.pincode}
            onChangeText={(text) => handleChange('pincode', text.replace(/\D/g, ''))}
            error={Boolean(errors.pincode)}
          />
          {errors.pincode ? <FieldError message={errors.pincode} colors={colors} /> : null}
        </View>

        <Pressable
          onPress={() => handleChange('isDefault', !formData.isDefault)}
          style={({ pressed }) => [
            styles.defaultRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons
            name={formData.isDefault ? 'checkbox' : 'square-outline'}
            size={22}
            color={formData.isDefault ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.defaultLabel, { color: colors.textSecondary }]}>
            Set as default address
          </Text>
        </Pressable>

        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            size="md"
            style={styles.buttonHalf}
            disabled={submitting}
          />
          <Button
            title={isEditing ? 'Update' : 'Save address'}
            onPress={handleSubmit}
            variant="primary"
            size="md"
            style={styles.buttonHalf}
            loading={submitting}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function FieldError({
  message,
  colors,
}: {
  message: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return <Text style={[styles.fieldError, { color: colors.error }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  formSubtitle: {
    fontSize: typography.fontSize.base,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xxs,
    marginBottom: 2,
  },
  fieldError: {
    fontSize: typography.fontSize.xs,
    marginTop: -2,
    marginBottom: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  defaultLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
});
