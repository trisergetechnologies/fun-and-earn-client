import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import axios from 'axios';
import { getToken } from '@/helpers/authStorage';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import { Screen } from '@/components/Screen';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const ActivateScreen = () => {
  const { colors } = useTheme();
  const [referralCode, setReferralCode] = useState('');
  const [already, setAlready] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleActivate = async() => {
  if(!referralCode) return Alert.alert("Please enter referral code.");
  const token = await getToken();
  const activateUrl = `${EXPO_PUBLIC_BASE_URL}/auth/activateshortvideo`;
  try {
    const response = await axios.post(activateUrl, {
        referralCode: referralCode
    } ,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if(response.data.success){
        console.log(response.data)
        Alert.alert("Account activated successfullly, you can login into that application(with same Email Id and Password).");
        router.replace('/tabs/profile');
    }
    else{
      Alert.alert(response.data.message);
    }
  } catch (error: any) {
    Alert.alert("Something went wrong ! Please try again.")
    console.error('Failed to fetch addresses:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
  }
    
  };

  useEffect(()=>{
    if(user?.applications.includes('shortVideo')){
      setAlready(true);
    }
  }, [])

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Account Activate' }} />
      <Screen>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
            <Text style={[styles.title, { color: colors.text }]}>Activate Your Short Video Account</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                readOnly={already}
                placeholder={already ? 'Already Activated' : 'Enter Referral Code'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={referralCode}
                onChangeText={setReferralCode}
              />

              <TouchableOpacity disabled={already} style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleActivate}>
                <Text style={[styles.btnTxt, { color: colors.primaryContrast }]}>{already ? 'Already Activated' : 'Activate'}</Text>
              </TouchableOpacity>
              {already ? (
                <Text style={{ color: colors.error }}>
                  You are a ShorVideo user. You can log in to the application using the same email ID and password.
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
};

export default ActivateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'left',
    marginBottom: 24,
    marginTop: 4,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});
