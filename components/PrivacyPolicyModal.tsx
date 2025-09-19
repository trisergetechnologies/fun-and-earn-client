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
              At DreamMart, your privacy is very important to us. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our application or services. By using DreamMart, you agree to the practices described in this policy.
            </Text>

            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.section}>
              We may collect the following types of information:
            </Text>
            <Text style={styles.bullet}>• Personal details such as your name, email address, phone number, and delivery address.</Text>
            <Text style={styles.bullet}>• Transaction details when you purchase products or services from us.</Text>
            <Text style={styles.bullet}>• Technical information such as device type, operating system, IP address, and browsing activity.</Text>
            <Text style={styles.bullet}>• Information collected through cookies and similar technologies to improve your shopping experience.</Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.section}>
              The information we collect may be used in the following ways:
            </Text>
            <Text style={styles.bullet}>• To process and deliver your orders efficiently.</Text>
            <Text style={styles.bullet}>• To personalize your shopping experience and recommend relevant products.</Text>
            <Text style={styles.bullet}>• To improve our app, website, and customer service.</Text>
            <Text style={styles.bullet}>• To send important updates such as order confirmations, shipping notifications, and promotional offers.</Text>
            <Text style={styles.bullet}>• To detect and prevent fraud or misuse of our platform.</Text>

            <Text style={styles.sectionTitle}>3. Cookies & Tracking</Text>
            <Text style={styles.section}>
              We use cookies and similar technologies to enhance user experience, analyze usage patterns, and deliver targeted advertisements. You may disable cookies in your device or browser settings, but this may limit some features of our service.
            </Text>

            <Text style={styles.sectionTitle}>4. Data Protection & Security</Text>
            <Text style={styles.section}>
              We implement industry-standard security measures to protect your personal information. However, please note that no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </Text>

            <Text style={styles.sectionTitle}>5. Sharing of Information</Text>
            <Text style={styles.section}>
              We respect your privacy and do not sell, trade, or rent your personal information to third parties. However, we may share information with trusted partners who assist us in operating our services, conducting business, or serving you, as long as those parties agree to keep your information confidential.
            </Text>

            <Text style={styles.sectionTitle}>6. Third-Party Links</Text>
            <Text style={styles.section}>
              Our app or website may contain links to third-party websites. Please note that these sites have their own privacy policies, and we are not responsible for their practices or content. We encourage you to review their policies before sharing any information.
            </Text>

            <Text style={styles.sectionTitle}>7. Children’s Privacy</Text>
            <Text style={styles.section}>
              DreamMart does not knowingly collect personal information from children under the age of 13. If we become aware that a child has provided us with personal data, we will take immediate steps to delete such information.
            </Text>

            <Text style={styles.sectionTitle}>8. Retention of Information</Text>
            <Text style={styles.section}>
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </Text>

            <Text style={styles.sectionTitle}>9. Your Rights</Text>
            <Text style={styles.section}>
              You have the right to:
            </Text>
            <Text style={styles.bullet}>• Request access to the personal data we hold about you.</Text>
            <Text style={styles.bullet}>• Request correction or deletion of your information.</Text>
            <Text style={styles.bullet}>• Opt out of marketing communications at any time.</Text>

            <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
            <Text style={styles.section}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. We encourage you to review this page periodically for the latest information.
            </Text>

            <Text style={styles.sectionTitle}>11. Contact Us</Text>
            <Text style={styles.section}>
              If you have any questions about this Privacy Policy or how your information is handled, you can contact us at{" "}
              <Text style={styles.email}>ampdreammart@gmail.com</Text>.
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
