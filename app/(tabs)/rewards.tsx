import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const rewardOffers = [
  {
    id: '1',
    title: 'Get ₹1000 in your Short Video Wallet',
    code: 'GETSV1000',
    description: 'Valid once. You can use this in Short Videos.',
    isActive: true
  },
  {
    id: '2',
    title: 'Get ₹3000 in your Short Video Wallet',
    code: 'GETSV3000',
    description: 'Valid once. You can use this in Short Videos.',
    isActive: false
  },
];

const rewardPoints = 280;

const RewardScreen = () => {
  const renderHeader = () => (
    <View>
      <Text style={styles.header}>🎁 Your Rewards & Offers</Text>

      {/* <View style={styles.pointsCard}>
        <Ionicons name="wallet-outline" size={24} color="#10b981" />
        <View>
          <Text style={styles.pointsText}>Reward Points</Text>
          <Text style={styles.pointsValue}>{rewardPoints} pts</Text>
        </View>
      </View> */}

      <Text style={styles.sectionTitle}>Available Coupons</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.couponCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.couponTitle}>{item.title}</Text>
        <Text style={styles.couponCode}>
          Use Code: <Text style={styles.codeText}>{item.code}</Text>
        </Text>
        <Text style={styles.couponDesc}>{item.description}</Text>
      </View>
        {item.isActive ?
          <Text style={styles.couponCode}>
            <Text style={styles.activeGreen}>Active</Text>
          </Text> :
          <Text style={styles.couponCode}>
            <Text style={styles.activeRed}>Not Active</Text>
          </Text>
        }
      <TouchableOpacity disabled={item.isActive ? false : true} style={styles.applyButton}>
        <Text style={styles.applyText}>Copy Code</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <FlatList
        data={rewardOffers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaProvider>
  );
};

export default RewardScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
    marginTop: 30,
  },
  pointsCard: {
    backgroundColor: '#e6fff2',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop:12,
  },
  pointsText: {
    fontSize: 14,
    color: '#555',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  couponCode: {
    fontSize: 13,
    color: '#555',
  },
  codeText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  couponDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  activeGreen: {
    fontWeight: 'bold',
    color: 'green'
  },
  activeRed: {
    fontWeight: 'bold',
    color: 'red'
  }
});
