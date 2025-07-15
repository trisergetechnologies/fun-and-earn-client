import { Colors } from '@/constants/Colors';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
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
import Constants from 'expo-constants';
import axios from 'axios';
import { getToken } from '@/helpers/authStorage';
import { useAuth } from '@/components/AuthContext';
const { BASE_URL } = Constants.expoConfig?.extra || {};

const ActivateScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const [already, setAlready] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleActivate = async() => {
  if(!referralCode) return Alert.alert("Please enter referral code.");
  const token = await getToken();
  const activateUrl = `${BASE_URL}/auth/activateshortvideo`;
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
        router.push('/profile');
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Activate Your Short Video Account</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                readOnly={already}
                placeholder={already ? "Already Activated": "Enter Referral Code"}
                placeholderTextColor="#666"
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
              />

              <TouchableOpacity disabled={already} style={styles.button} onPress={handleActivate}>
                <Text style={styles.btnTxt}>{already? "Already Activated" :"Activate"}</Text>
              </TouchableOpacity>
              {already ?
                <Text style={{color: 'red'}}>You are a ShorVideo user. You can log in to the application using the same email ID and password.</Text>
              : ''}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ActivateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollWrapper: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'left',
    marginBottom: 24,
    marginTop: 4,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 15,
    color: Colors.black,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
