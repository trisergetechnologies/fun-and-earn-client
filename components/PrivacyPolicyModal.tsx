import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal = ({ visible, onClose }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.section}>
              When raising a request on our site, as appropriate, you may be asked to enter your name, email address, phone number or other details to help you with your experience.
            </Text>

            <Text style={styles.sectionTitle}>When do we collect information?</Text>
            <Text style={styles.section}>
              We collect information from you when you raise a request to contact, fill out a form or enter information on our site.
            </Text>

            <Text style={styles.sectionTitle}>How do we use your information?</Text>
            <Text style={styles.section}>
              We may use the information we collect from you when you register, make a purchase, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:
            </Text>

            <Text style={styles.bullet}>• To personalize user’s experience and to allow us to deliver the type of content and product offerings in which you are most interested.</Text>
            <Text style={styles.bullet}>• To administer a contest, promotion, survey or other site feature.</Text>
            <Text style={styles.bullet}>• To send periodic emails regarding your order or other products and services.</Text>

            <Text style={styles.sectionTitle}>Third Party Disclosure</Text>
            <Text style={styles.section}>
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.
            </Text>

            <Text style={styles.sectionTitle}>Third Party Links</Text>
            <Text style={styles.section}>
              We do not include or offer third party products or services on our website.
            </Text>

            <Text style={styles.sectionTitle}>Contacting Us</Text>
            <Text style={styles.section}>
              If there are any questions regarding this privacy policy, you may contact us at <Text style={styles.email}>info@aarushmp.com</Text>.
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default PrivacyPolicyModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 20,
    maxHeight: '85%',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.black,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
    color: Colors.black,
  },
  section: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 6,
  },
  email: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
