import AddressList from '../../addressComponents/AddressList';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { spacing, typography } from '@/constants/DesignSystem';
import { getToken } from '@/helpers/authStorage';
import { Address } from '@/types/address';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const AddressScreen = () => {
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = useCallback(async () => {
    const token = await getToken();
    const fetchUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addresses`;

    const response = await axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      setAddresses(response.data.data ?? []);
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAddresses();
    } catch (error: unknown) {
      Alert.alert('Something went wrong', 'Could not load your addresses. Please try again.');
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch addresses:', error.response?.data || error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAddresses();
    } catch (error: unknown) {
      Alert.alert('Something went wrong', 'Could not refresh addresses.');
      if (axios.isAxiosError(error)) {
        console.error('Failed to refresh addresses:', error.response?.data || error.message);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateAddress = async (updatedAddress: Address) => {
    const isExisting = addresses.some((addr) => addr.slugName === updatedAddress.slugName);

    try {
      const token = await getToken();

      if (isExisting) {
        const updateUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/updateaddress/${updatedAddress.slugName}`;
        const res = await axios.patch(updateUrl, updatedAddress, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to update address');
        }
        Toast.show({
          type: 'success',
          text1: 'Address updated',
          text2: 'Your delivery address has been saved.',
        });
      } else {
        const addUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addaddress`;
        const res = await axios.post(addUrl, updatedAddress, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to add new address');
        }
        Toast.show({
          type: 'success',
          text1: 'Address added',
          text2: 'Your new address is ready for checkout.',
        });
      }

      await fetchAddresses();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : axios.isAxiosError(error)
            ? error.response?.data?.message
            : 'Something went wrong';
      Alert.alert('Could not save address', message || 'Please try again.');
      throw error;
    }
  };

  const handleDeleteAddress = async (slugName: string) => {
    const deleteUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/deleteaddress/${slugName}`;
    const token = await getToken();

    try {
      const res = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to delete address');
      }
      Toast.show({ type: 'success', text1: 'Address deleted' });
      await fetchAddresses();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : axios.isAxiosError(error)
            ? error.response?.data?.message
            : 'Something went wrong';
      Alert.alert('Could not delete address', message || 'Please try again.');
      throw error;
    }
  };

  const handleSetDefault = async (slugName: string) => {
    const address = addresses.find((addr) => addr.slugName === slugName);
    if (!address || address.isDefault) return;

    try {
      await handleUpdateAddress({ ...address, isDefault: true });
    } catch {
      // handleUpdateAddress already alerts
    }
  };

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.page}>
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>My addresses</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
              Manage delivery locations for checkout
            </Text>
          </View>

          <AddressList
            addresses={addresses}
            onUpdate={handleUpdateAddress}
            onDelete={handleDeleteAddress}
            onSetDefault={handleSetDefault}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
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
});

export default AddressScreen;
