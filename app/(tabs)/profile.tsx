import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useEffect } from 'react';
import { useProfile } from '@/components/ProfileContext';


const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const {userProfile, refreshUserProfile} = useProfile();

  const handleLogout = async () => {
    console.log(handleLogout)
    await logout();         
    router.replace('/signin');
  };

  useEffect(() => {
      if (isAuthenticated === false) {
        logout();
        router.replace('/signin');
      }
      refreshUserProfile();
  }, [isAuthenticated]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.heading}>  </Text> */}
      <Image
        source={{ uri: 'https://avatar.iran.liara.run/public/boy' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{userProfile?.name}</Text>
      <Text style={{marginBottom: 24}}>{userProfile?.email}</Text>

      <View style={styles.options}>
        <Option icon={<Ionicons name="clipboard-outline" size={20} />} label="Your Orders" onPress={() => router.push('/orders')} />   

        <Option icon={<FontAwesome name="credit-card" size={18} />} label="Wallet Transactions" onPress={() => router.push('/transactions')} />
        <Option icon={<FontAwesome name="bank" size={18} />} label="Bank Details" onPress={() => router.push('/BankScreen')} />
        <Option icon={<Entypo name="edit" size={18} />} label="Edit Profile" onPress={() => router.push('/UpdateProfile')} />
        <Option icon={<Ionicons name="key" size={20} />} label="Change Password" onPress={() => router.push('/setting')} />
        <Option icon={<Entypo name="edit" size={18} />} label="Manage Address" onPress={() => router.push('/Address')} />        
        <Option icon={<Ionicons name="log-out-outline" size={20} />} label="Logout" onPress={handleLogout}/>
        <Option icon={<Ionicons name="play-outline" size={20} />} label="Activate Short Video" onPress={()=> router.push('/activate')}/>
        <Option icon={<Ionicons name="chatbubbles-outline" size={20} />} label="Customer Support" onPress={() => router.push('/CustomerSupport')} />
      </View>
    </ScrollView>
  );
};

const Option = ({ icon, label, onPress }: { icon: JSX.Element; label: string; onPress: () => void }) => (

  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.optionLeft}>
      {icon}
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#aaa" />
  </TouchableOpacity>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    marginTop:40
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  options: {
    width: '100%',
  },
  option: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 15,
    marginLeft: 10,
  },
});
