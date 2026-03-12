import { useTheme } from '@/components/ThemeContext';
import { borderRadius, spacing, shadows } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              At DreamMart, owned and operated by <Text style={[styles.bold, { color: colors.text }]}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text>, your privacy is very important to us.
              This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our application or services.
              By using DreamMart, you agree to the practices described in this policy.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              We may collect the following types of information:
            </Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Personal details such as your name, email address, phone number, and delivery address.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Transaction details when you purchase products or services from us.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Technical information such as device type, operating system, IP address, and browsing activity.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Information collected through cookies and similar technologies to improve your shopping experience.</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              The information we collect may be used in the following ways:
            </Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• To process and deliver your orders efficiently.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• To personalize your shopping experience and recommend relevant products.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• To improve our app, website, and customer service.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• To send important updates such as order confirmations, shipping notifications, and promotional offers.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• To detect and prevent fraud or misuse of our platform.</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Cookies & Tracking</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              We use cookies and similar technologies to enhance user experience, analyze usage patterns, and deliver targeted advertisements.
              You may disable cookies in your device or browser settings, but this may limit some features of our service.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Protection & Security</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text> implements industry-standard security measures to protect your personal information.
              However, please note that no method of transmission over the internet or electronic storage is 100% secure.
              While we strive to protect your data, we cannot guarantee absolute security.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Sharing of Information</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              We respect your privacy and do not sell, trade, or rent your personal information to third parties.
              However, we may share information with trusted partners who assist us in operating our services, conducting business, or serving you,
              as long as those parties agree to keep your information confidential.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Third-Party Links</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              Our app or website may contain links to third-party websites.
              Please note that these sites have their own privacy policies, and we are not responsible for their practices or content.
              We encourage you to review their policies before sharing any information.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Children’s Privacy</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              DreamMart does not knowingly collect personal information from children under the age of 13.
              If we become aware that a child has provided us with personal data, we will take immediate steps to delete such information.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Retention of Information</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy,
              unless a longer retention period is required by law.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Your Rights</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              You have the right to:
            </Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Request access to the personal data we hold about you.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Request correction or deletion of your information.</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Opt out of marketing communications at any time.</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Changes to This Policy</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text> may update this Privacy Policy from time to time
              to reflect changes in our practices or legal obligations.
              We encourage you to review this page periodically for the latest information.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Contact Us</Text>
            <Text style={[styles.section, { color: colors.textSecondary }]}>
              If you have any questions about this Privacy Policy or how your information is handled, you can contact us at{" "}
              <Text style={[styles.email, { color: colors.primary }]}>ampdreammart@gmail.com</Text>.{"\n\n"}
              <Text style={[styles.bold, { color: colors.text }]}>AARUSH MP DREAMS (OPC) PRIVATE LIMITED</Text><Text>{'\n'}India</Text>
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PrivacyPolicyModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    borderRadius: borderRadius.xxl,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: spacing.xs },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: { padding: spacing.lg },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: 6,
  },
  section: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    marginLeft: spacing.sm,
    marginBottom: 6,
  },
  bold: { fontWeight: '600' },
  email: { fontWeight: '600' },
});
