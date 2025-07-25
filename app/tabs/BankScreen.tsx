import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { getToken } from '@/helpers/authStorage';
import { useProfile } from '@/components/ProfileContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const BankScreen = () => {
  const {userProfile, refreshUserProfile} = useProfile();

  const [bankDetails, setBankDetails] = useState<any>(null);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const router = useRouter();



  const handleSaveOrUpdate = async () => {
    const token = await getToken();
    try {
      const payload = {
        accountHolderName,
        accountNumber,
        ifscCode,
        upiId,
      };

      const url = bankDetails ? `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/updatebankdetails` : `${EXPO_PUBLIC_BASE_URL}/ecart/user/general/addbankdetails`;
      const method = bankDetails ? 'patch' : 'post';
      const response = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        refreshUserProfile();
        Alert.alert(response.data.message);
        router.replace('/(public)/signin');
      } else {
        Alert.alert(response.data.message || 'Failed');
      }
    } catch (error: any) {
      Alert.alert("Something Went Wrong");
      console.error(error?.response?.data || error.message);
      Alert.alert('Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const res = await axios.delete(`${EXPO_PUBLIC_BASE_URL}/ecart/user/general/deletebankdetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setBankDetails(null);
        setAccountHolderName('');
        setAccountNumber('');
        setIfscCode('');
        setUpiId('');
        Alert.alert('Bank details removed.');
        router.replace('/(public)/signin');
      }
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      Alert.alert('Delete failed');
    }
  };

  const loadData=()=>{
        if(userProfile?.eCartProfile?.bankDetails){
        setAccountHolderName(userProfile?.eCartProfile?.bankDetails?.accountHolderName);
        setAccountNumber(userProfile?.eCartProfile?.bankDetails?.accountNumber);
        setIfscCode(userProfile?.eCartProfile?.bankDetails?.ifscCode);
        setUpiId(userProfile?.eCartProfile?.bankDetails?.upiId);
    }
  }

  useEffect(() => {
    refreshUserProfile();
    setBankDetails(userProfile?.eCartProfile?.bankDetails);
    loadData();
  }, []);

  return (
    <>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollWrapper} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>
              {bankDetails ? 'Update Your Bank Details' : 'Add Your Bank Details'}
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Account Holder Name"
                placeholderTextColor="#666"
                style={styles.input}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
              />
              <TextInput
                placeholder="Account Number"
                placeholderTextColor="#666"
                style={styles.input}
                keyboardType="number-pad"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
              <TextInput
                placeholder="IFSC Code"
                placeholderTextColor="#666"
                style={styles.input}
                value={ifscCode}
                onChangeText={setIfscCode}
                autoCapitalize="characters"
              />
              <TextInput
                placeholder="UPI ID"
                placeholderTextColor="#666"
                style={styles.input}
                value={upiId}
                onChangeText={setUpiId}
              />

              <TouchableOpacity style={styles.button} onPress={handleSaveOrUpdate}>
                <Text style={styles.btnTxt}>{bankDetails ? 'Update' : 'Add'} Bank Details</Text>
              </TouchableOpacity>

              {bankDetails && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteTxt}>Delete Bank Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default BankScreen;


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
  deleteBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'red',
    alignItems: 'center',
  },
  deleteTxt: {
    color: 'red',
    fontWeight: '600',
  },
});
