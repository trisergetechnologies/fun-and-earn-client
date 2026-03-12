import { useTheme } from '@/components/ThemeContext';
import { PolicyModal, policyTextStyles } from '@/components/ui/PolicyModal';
import { Text } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TermsAndConditionsModal = ({ visible, onClose }: Props) => {
  const { colors } = useTheme();
  const s = policyTextStyles;
  return (
    <PolicyModal visible={visible} onClose={onClose} title="Terms and Conditions">
      <Text style={[s.sectionTitle, { color: colors.text }]}>1. Introduction</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            Welcome to DreamMart, owned and operated by AARUSH MP DREAMS (OPC) PRIVATE LIMITED!
                            These Terms and Conditions govern your use of our mobile application and services.
                            By accessing or using our platform, you agree to comply with these terms.
        Please read them carefully before making any purchases.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>2. Account Registration</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            To place an order, you may be required to register an account by providing accurate details such as your name,
                            contact information, and a valid email address. You are responsible for maintaining the confidentiality of your account
        and all activities under it.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>3. Product Information</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            We strive to provide accurate descriptions, images, and pricing of products. However, we do not guarantee that all
                            information is error-free. In case of discrepancies, AARUSH MP DREAMS (OPC) PRIVATE LIMITED reserves the right
        to correct errors and update details without prior notice.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>4. Pricing & Payments</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            All prices are displayed in Indian Rupees (₹) unless stated otherwise. Prices may change without notice.
        Accepted payment methods include UPI, credit/debit cards, net banking, and wallets. Payment must be completed at the time of purchase.
      </Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• All transactions are secure and encrypted.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• 18% GST may be applicable where required.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• We reserve the right to cancel orders in case of payment failure.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>5. Shipping & Delivery</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            Delivery timelines vary depending on your location and product availability.
                            While AARUSH MP DREAMS (OPC) PRIVATE LIMITED makes every effort to deliver on time,
        delays may occur due to unforeseen circumstances.
      </Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Estimated delivery times are shown at checkout.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• We are not liable for delays caused by courier services.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Tracking information will be provided once the order is shipped.</Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>6. Returns & Refunds</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        Products are eligible for return within{' '}
        <Text style={[s.bold, { color: colors.error }]}>2 days of delivery</Text>.
        Please refer to our Return & Refund Policy for detailed steps. Refunds are processed within 5–7 business days
        after the returned item is received and approved by AARUSH MP DREAMS (OPC) PRIVATE LIMITED.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>7. User Responsibilities</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            You agree not to misuse the platform for fraudulent activities, illegal purposes, or to harm other users.
        Any violations may lead to suspension or permanent termination of your account by AARUSH MP DREAMS (OPC) PRIVATE LIMITED.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>8. Intellectual Property</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            All logos, content, designs, and software are the intellectual property of AARUSH MP DREAMS (OPC) PRIVATE LIMITED
        and its brand DreamMart. You may not copy, reproduce, or distribute our content without prior written permission.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>9. Limitation of Liability</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            AARUSH MP DREAMS (OPC) PRIVATE LIMITED shall not be held responsible for indirect, incidental, or consequential damages
        arising from the use of our platform, including but not limited to delivery delays, product defects, or technical errors.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>10. Termination</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            AARUSH MP DREAMS (OPC) PRIVATE LIMITED reserves the right to suspend or terminate your account at its discretion
        if you breach these Terms and Conditions or engage in fraudulent or unlawful activities.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>11. Governing Law</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction
        of the courts located in your city.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>12. Updates to Terms</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
                            AARUSH MP DREAMS (OPC) PRIVATE LIMITED may update these Terms & Conditions from time to time.
        Any changes will be reflected in this section, and continued use of our services after changes constitutes acceptance.
      </Text>
      <Text style={[s.sectionTitle, { color: colors.text }]}>13. Contact Us</Text>
      <Text style={[s.section, { color: colors.textSecondary }]}>
        If you have any questions regarding these Terms, please contact us at{' '}
        <Text style={[s.email, { color: colors.primary }]}>ampdreammart@gmail.com</Text>.{'\n\n'}
        AARUSH MP DREAMS (OPC) PRIVATE LIMITED{'\n'}
        India
      </Text>
    </PolicyModal>
  );
};

export default TermsAndConditionsModal;
