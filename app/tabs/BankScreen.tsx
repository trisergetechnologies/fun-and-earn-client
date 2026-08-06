import { Screen } from '@/components/Screen';
import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, Input } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { getToken } from '@/helpers/authStorage';
import { BankDetails, hasBankDetails } from '@/types/bank';
import { validateBankForm, BankFormErrors } from '@/utils/bankLabels';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

function BankInfoFooter() {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.infoContainer,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [styles.infoHeader, { opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={styles.infoHeaderLeft}>
          <View style={[styles.infoIcon, { backgroundColor: colors.backgroundSecondary }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textMuted} />
          </View>
          <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>About bank details</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded ? (
        <Text style={[styles.infoBody, { color: colors.textMuted, borderTopColor: colors.borderLight }]}>
          Your bank details are used only for wallet withdrawals. Make sure the account holder name
          matches your bank records and double-check the IFSC code before saving.
        </Text>
      ) : null}
    </View>
  );
}

const BankScreen = () => {
  const { colors } = useTheme();
  const { userProfile, refreshUserProfile, profileLoading } = useProfile();

  const savedDetails = userProfile?.eCartProfile?.bankDetails;
  const isLinked = hasBankDetails(savedDetails);

  const [isEditing, setIsEditing] = useState(false);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<BankFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showForm = !isLinked || isEditing;

  const populateForm = useCallback((details: BankDetails) => {
    setAccountHolderName(details.accountHolderName || '');
    setAccountNumber(details.accountNumber || '');
    setIfscCode(details.ifscCode || '');
    setUpiId(details.upiId || '');
  }, []);

  const clearForm = useCallback(() => {
    setAccountHolderName('');
    setAccountNumber('');
    setIfscCode('');
    setUpiId('');
    setErrors({});
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  const startEditing = () => {
    if (savedDetails && hasBankDetails(savedDetails)) {
      populateForm(savedDetails as BankDetails);
    }
    setErrors({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    clearForm();
  };

  const handleSaveOrUpdate = async () => {
    const payload: BankDetails = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.replace(/\D/g, ''),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
    };

    const nextErrors = validateBankForm(payload, !isLinked);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    const token = await getToken();

    try {
      const url = isLinked
        ? `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/updatebankdetails`
        : `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/addbankdetails`;
      const method = isLinked ? 'patch' : 'post';

      const response = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        await refreshUserProfile();
        setIsEditing(false);
        clearForm();
        Toast.show({
          type: 'success',
          text1: isLinked ? 'Bank details updated' : 'Bank details saved',
          text2: response.data.message,
        });
      } else {
        Alert.alert('Could not save', response.data.message || 'Please try again.');
      }
    } catch (error: unknown) {
      console.error('Bank save error:', axios.isAxiosError(error) ? error.response?.data : error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Something went wrong';
      Alert.alert('Could not save bank details', message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const performDelete = async () => {
    setDeleting(true);
    try {
      const token = await getToken();
      const res = await axios.delete(`${EXPO_PUBLIC_BASE_URL}/ecart/user/general/deletebankdetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        await refreshUserProfile();
        setIsEditing(false);
        clearForm();
        Toast.show({ type: 'success', text1: 'Bank details removed' });
      } else {
        Alert.alert('Delete failed', res.data.message || 'Please try again.');
      }
    } catch (error: unknown) {
      console.error('Bank delete error:', axios.isAxiosError(error) ? error.response?.data : error);
      Alert.alert('Delete failed', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove bank details',
      'You will need to add them again before withdrawing from your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: performDelete },
      ]
    );
  };

  const clearFieldError = (field: keyof BankDetails) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (profileLoading && !userProfile) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Bank details</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Used for wallet withdrawals to your account
            </Text>
          </View>

          {isLinked && !showForm && savedDetails ? (
            <Card padding={spacing.md} style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={[styles.summaryIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.summaryHeaderText}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>Linked account</Text>
                  <View style={[styles.linkedBadge, { backgroundColor: colors.success + '18' }]}>
                    <Text style={[styles.linkedBadgeText, { color: colors.success }]}>Active</Text>
                  </View>
                </View>
                <Pressable
                  onPress={startEditing}
                  style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.primary} />
                </Pressable>
              </View>

              <Text style={[styles.summaryName, { color: colors.text }]}>
                {savedDetails.accountHolderName}
              </Text>
              <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>
                Account: {savedDetails.accountNumber}
              </Text>
              <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>
                IFSC: {savedDetails.ifscCode}
              </Text>
              {savedDetails.upiId ? (
                <Text style={[styles.summaryLine, { color: colors.textMuted }]}>
                  UPI: {savedDetails.upiId}
                </Text>
              ) : null}
            </Card>
          ) : null}

          {showForm ? (
            <>
              {isLinked && isEditing ? (
                <Pressable
                  onPress={cancelEditing}
                  style={({ pressed }) => [styles.backRow, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
                  <Text style={[styles.backText, { color: colors.textSecondary }]}>Back to summary</Text>
                </Pressable>
              ) : null}

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ACCOUNT DETAILS</Text>
              <Card padding={spacing.md} style={styles.formCard}>
                <FieldLabel label="Account holder name" colors={colors} />
                <Input
                  leftIcon="person-outline"
                  placeholder="Name as on bank account"
                  value={accountHolderName}
                  onChangeText={(text) => {
                    setAccountHolderName(text);
                    clearFieldError('accountHolderName');
                  }}
                  error={Boolean(errors.accountHolderName)}
                />
                {errors.accountHolderName ? (
                  <FieldError message={errors.accountHolderName} colors={colors} />
                ) : null}

                <FieldLabel label="Account number" colors={colors} />
                <Input
                  leftIcon="card-outline"
                  placeholder="Bank account number"
                  keyboardType="number-pad"
                  value={accountNumber}
                  onChangeText={(text) => {
                    setAccountNumber(text.replace(/\D/g, ''));
                    clearFieldError('accountNumber');
                  }}
                  error={Boolean(errors.accountNumber)}
                />
                {errors.accountNumber ? (
                  <FieldError message={errors.accountNumber} colors={colors} />
                ) : null}

                <FieldLabel label="IFSC code" colors={colors} />
                <Input
                  leftIcon="business-outline"
                  placeholder="e.g. HDFC0001234"
                  autoCapitalize="characters"
                  value={ifscCode}
                  onChangeText={(text) => {
                    setIfscCode(text.toUpperCase());
                    clearFieldError('ifscCode');
                  }}
                  error={Boolean(errors.ifscCode)}
                />
                {errors.ifscCode ? <FieldError message={errors.ifscCode} colors={colors} /> : null}

                <FieldLabel label="UPI ID" colors={colors} />
                <Input
                  leftIcon="wallet-outline"
                  placeholder="yourname@bank"
                  autoCapitalize="none"
                  value={upiId}
                  onChangeText={(text) => {
                    setUpiId(text);
                    clearFieldError('upiId');
                  }}
                  error={Boolean(errors.upiId)}
                />
                {errors.upiId ? <FieldError message={errors.upiId} colors={colors} /> : null}
              </Card>

              <View style={styles.actions}>
                {isEditing ? (
                  <Button
                    title="Cancel"
                    onPress={cancelEditing}
                    variant="outline"
                    size="md"
                    style={styles.actionButton}
                    disabled={saving || deleting}
                  />
                ) : null}
                <Button
                  title={isLinked ? 'Update bank details' : 'Save bank details'}
                  onPress={handleSaveOrUpdate}
                  variant="primary"
                  size="md"
                  style={styles.actionButton}
                  loading={saving}
                  disabled={saving || deleting}
                  fullWidth={!isEditing}
                />
              </View>

              {isLinked && isEditing ? (
                <Button
                  title="Remove bank details"
                  onPress={handleDelete}
                  variant="dangerSoft"
                  size="md"
                  fullWidth
                  loading={deleting}
                  disabled={saving || deleting}
                  style={styles.deleteButton}
                />
              ) : null}
            </>
          ) : (
            <Button
              title="Remove bank details"
              onPress={handleDelete}
              variant="dangerSoft"
              size="md"
              fullWidth
              loading={deleting}
              disabled={deleting}
              style={styles.viewRemoveButton}
            />
          )}

          <BankInfoFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

function FieldLabel({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>;
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

export default BankScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryHeaderText: {
    flex: 1,
    gap: spacing.xxs,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  linkedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  linkedBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  editBtn: {
    padding: spacing.xxs,
  },
  summaryName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  summaryLine: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
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
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  formCard: {
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    marginBottom: spacing.lg,
  },
  viewRemoveButton: {
    marginBottom: spacing.lg,
  },
  infoContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  infoHeaderLeft: {
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
  infoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  infoBody: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
});
