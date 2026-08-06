import { useAuth } from '@/components/AuthContext';
import { useProfile } from '@/components/ProfileContext';
import SimpleSpinner from '@/components/SimpleSpinner';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { Button, Card, Input } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

const UpdateProfile = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateUser } = useAuth();
  const { userProfile, refreshUserProfile, profileLoading } = useProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshUserProfile();
    }, [refreshUserProfile])
  );

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    let hasError = false;

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Enter your full name');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setPhoneError('Enter a valid 10-digit phone number');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (hasError) return;

    setSaving(true);
    const token = await getToken();
    const updateUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/updateprofile`;

    try {
      const response = await axios.patch(
        updateUrl,
        { name: name.trim(), phone: phone.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await updateUser(name.trim(), phone.trim());
        await refreshUserProfile();
        Toast.show({
          type: 'success',
          text1: 'Profile updated',
          text2: response.data.message,
        });
        router.replace('/tabs/explore');
      } else {
        Alert.alert('Update failed', response.data.message || 'Please try again.');
      }
    } catch (error: unknown) {
      console.error('Failed to update profile:', axios.isAxiosError(error) ? error.response?.data : error);
      Alert.alert('Something went wrong', 'Could not update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading && !userProfile) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <SimpleSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Edit profile</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Update your personal information
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERSONAL INFO</Text>
          <Card padding={spacing.md} style={styles.formCard}>
            <FieldLabel label="Full name" colors={colors} />
            <Input
              leftIcon="person-outline"
              placeholder="Enter your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError('');
              }}
              error={Boolean(nameError)}
            />
            {nameError ? <FieldError message={nameError} colors={colors} /> : null}

            <FieldLabel label="Email address" colors={colors} />
            <Input
              leftIcon="mail-outline"
              placeholder="Email"
              value={email}
              editable={false}
            />
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              Email cannot be changed
            </Text>

            <FieldLabel label="Phone number" colors={colors} />
            <Input
              leftIcon="call-outline"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/\D/g, ''));
                if (phoneError) setPhoneError('');
              }}
              error={Boolean(phoneError)}
            />
            {phoneError ? <FieldError message={phoneError} colors={colors} /> : null}
          </Card>

          <Button
            title="Save changes"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={saving}
            leftIcon={<Ionicons name="save-outline" size={18} />}
          />
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

export default UpdateProfile;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: -2,
    marginBottom: spacing.xxs,
  },
});
