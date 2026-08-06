import { getToken } from '@/helpers/authStorage';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, Input } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const handleChangePassword = async () => {
    const nextErrors: typeof errors = {};

    if (!currentPassword) nextErrors.current = 'Enter your current password';
    if (!newPassword || newPassword.length < 6) {
      nextErrors.next = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) nextErrors.confirm = 'Confirm your new password';
    else if (newPassword !== confirmPassword) nextErrors.confirm = 'Passwords do not match';
    if (currentPassword && newPassword && currentPassword === newPassword) {
      nextErrors.next = 'New password must differ from current password';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    const token = await getToken();
    const updateUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/changepassword`;

    try {
      const res = await axios.patch(
        updateUrl,
        { oldPassword: currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Password updated',
          text2: res.data.message,
        });
        router.replace('/tabs/profile');
      } else {
        Alert.alert('Update failed', res.data.message || 'Please try again.');
      }
    } catch (error: unknown) {
      console.error('Change password error:', axios.isAxiosError(error) ? error.response?.data : error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Something went wrong';
      Alert.alert('Could not change password', message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Change password</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Keep your account secure with a strong password
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SECURITY</Text>
          <Card padding={spacing.md} style={styles.formCard}>
            <FieldLabel label="Current password" colors={colors} />
            <Input
              leftIcon="lock-closed-outline"
              placeholder="Enter current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                if (errors.current) setErrors((e) => ({ ...e, current: undefined }));
              }}
              error={Boolean(errors.current)}
            />
            {errors.current ? <FieldError message={errors.current} colors={colors} /> : null}

            <FieldLabel label="New password" colors={colors} />
            <Input
              leftIcon="key-outline"
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.next) setErrors((e) => ({ ...e, next: undefined }));
              }}
              error={Boolean(errors.next)}
            />
            {errors.next ? <FieldError message={errors.next} colors={colors} /> : null}

            <FieldLabel label="Confirm new password" colors={colors} />
            <Input
              leftIcon="shield-checkmark-outline"
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
              }}
              error={Boolean(errors.confirm)}
            />
            {errors.confirm ? <FieldError message={errors.confirm} colors={colors} /> : null}
          </Card>

          <Button
            title="Update password"
            onPress={handleChangePassword}
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={saving}
            leftIcon={<Ionicons name="key-outline" size={18} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
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
});
