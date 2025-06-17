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


const ProfileScreen = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    console.log(handleLogout)
    await logout();         
    router.replace('/signin');
  };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (isAuthenticated === false) {
  //       router.replace('/signin');
  //     }
  //   }, 50); 

  //   return () => clearTimeout(timeout);
  // }, [isAuthenticated]);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.heading}>  </Text> */}
      <Image
        source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user?.name}</Text>

      <View style={styles.options}>
        <Option icon={<Ionicons name="clipboard-outline" size={20} />} label="Your Orders" onPress={() => router.push('/orders')} />   

        <Option icon={<FontAwesome name="credit-card" size={18} />} label="Wallet Transactions" onPress={() => router.push('/transactions')} />
        <Option icon={<Ionicons name="chatbubbles-outline" size={20} />} label="Customer Support" onPress={() => router.push('/CustomerSupport')} />
        <Option icon={<Entypo name="edit" size={18} />} label="Edit Profile" onPress={() => router.push('/UpdateProfile')} />
        <Option icon={<Ionicons name="key" size={20} />} label="Change Password" onPress={() => router.push('/setting')} />
        <Option icon={<Entypo name="edit" size={18} />} label="Manage Address" onPress={() => router.push('/Address')} />        
        <Option icon={<Ionicons name="log-out-outline" size={20} />} label="Logout" onPress={handleLogout}/>
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
    marginBottom: 24,
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
