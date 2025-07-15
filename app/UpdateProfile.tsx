import { useAuth } from '@/components/AuthContext';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Constants from 'expo-constants';
import { useProfile } from '@/components/ProfileContext';
const { BASE_URL } = Constants.expoConfig?.extra || {};

const UpdateProfile = () => {

  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuth();
    const {userProfile, refreshUserProfile} = useProfile();

  const [name, setName] = useState<string | undefined>(userProfile?.name);
  const [email, setEmail] = useState<string | undefined>(userProfile?.email);
  const [phone, setPhone] = useState<string | undefined>(userProfile?.phone);
  const [disabled, setDisabled] = useState<boolean>(false);

  const handleSave = async() => {

    if(!name || !email || !phone){
      return Alert.alert("No fields can be left incomplete.");
    }
    setDisabled(true);
    const token = await getToken();
    const updateUrl = `${BASE_URL}/ecart/user/general/updateprofile`;
    try {
      const response = await axios.patch(updateUrl, {
        name,
        phone
      } ,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        await updateUser(name, phone);
        Alert.alert(response.data.message);
        await refreshUserProfile();
        router.push('/(tabs)');
      }
      setDisabled(false);
      Alert.alert(response.data.message);
    } catch (error: any) {
      setDisabled(false);
      Alert.alert("Something went wrong");
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  };

      useEffect(() => {
          if (isAuthenticated === false) {
            router.replace('/signin');
          }
      }, [isAuthenticated]);

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>👤 Edit Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            readOnly={true}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
          <Text style={{color: 'red'}}>Can not update email</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity disabled={disabled} style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 30,
    color: '#111',
    marginTop: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
