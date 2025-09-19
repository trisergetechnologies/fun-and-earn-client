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

const TermsAndConditionsModal = ({ visible, onClose }: Props) => {
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <SafeAreaView style={styles.overlay}>
                <View style={styles.modalCard}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Terms and Conditions</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.black} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.sectionTitle}>1. Introduction</Text>
                        <Text style={styles.section}>
                            Welcome to DreamMart! These Terms and Conditions govern your use of our mobile application and services. 
                            By accessing or using our platform, you agree to comply with these terms. Please read them carefully before making any purchases.
                        </Text>

                        <Text style={styles.sectionTitle}>2. Account Registration</Text>
                        <Text style={styles.section}>
                            To place an order, you may be required to register an account by providing accurate details such as your name, 
                            contact information, and a valid email address. You are responsible for maintaining the confidentiality of your account 
                            and all activities under it.
                        </Text>

                        <Text style={styles.sectionTitle}>3. Product Information</Text>
                        <Text style={styles.section}>
                            We strive to provide accurate descriptions, images, and pricing of products. However, we do not guarantee that all 
                            information is error-free. In case of discrepancies, we reserve the right to correct errors and update details without prior notice.
                        </Text>

                        <Text style={styles.sectionTitle}>4. Pricing & Payments</Text>
                        <Text style={styles.section}>
                            All prices are displayed in Indian Rupees (₹) unless stated otherwise. Prices may change without notice. 
                            Accepted payment methods include UPI, credit/debit cards, net banking, and wallets. Payment must be completed at the time of purchase.
                        </Text>
                        <Text style={styles.bullet}>• All transactions are secure and encrypted.</Text>
                        <Text style={styles.bullet}>• 18% GST may be applicable where required.</Text>
                        <Text style={styles.bullet}>• We reserve the right to cancel orders in case of payment failure.</Text>

                        <Text style={styles.sectionTitle}>5. Shipping & Delivery</Text>
                        <Text style={styles.section}>
                            Delivery timelines vary depending on your location and product availability. 
                            While we make every effort to deliver on time, delays may occur due to unforeseen circumstances.
                        </Text>
                        <Text style={styles.bullet}>• Estimated delivery times are shown at checkout.</Text>
                        <Text style={styles.bullet}>• We are not liable for delays caused by courier services.</Text>
                        <Text style={styles.bullet}>• Tracking information will be provided once the order is shipped.</Text>

                        <Text style={styles.sectionTitle}>6. Returns & Refunds</Text>
                        <Text style={styles.section}>
                            Products are eligible for return within{" "}
                            <Text style={{ fontWeight: '600', color: '#dc2626' }}>2 days of delivery</Text>.  
                            Please refer to our Return & Refund Policy for detailed steps. Refunds are processed within 5–7 business days 
                            after the returned item is received and approved.
                        </Text>

                        <Text style={styles.sectionTitle}>7. User Responsibilities</Text>
                        <Text style={styles.section}>
                            You agree not to misuse the platform for fraudulent activities, illegal purposes, or to harm other users. 
                            Any violations may lead to suspension or permanent termination of your account.
                        </Text>

                        <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
                        <Text style={styles.section}>
                            All logos, content, designs, and software are the intellectual property of DreamMart. 
                            You may not copy, reproduce, or distribute our content without prior written permission.
                        </Text>

                        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
                        <Text style={styles.section}>
                            DreamMart will not be held responsible for indirect, incidental, or consequential damages arising from 
                            the use of our platform, including but not limited to delivery delays, product defects, or technical errors.
                        </Text>

                        <Text style={styles.sectionTitle}>10. Termination</Text>
                        <Text style={styles.section}>
                            We reserve the right to suspend or terminate your account at our discretion if you breach these Terms 
                            and Conditions or engage in fraudulent or unlawful activities.
                        </Text>

                        <Text style={styles.sectionTitle}>11. Governing Law</Text>
                        <Text style={styles.section}>
                            These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the jurisdiction 
                            of the courts located in your city.
                        </Text>

                        <Text style={styles.sectionTitle}>12. Updates to Terms</Text>
                        <Text style={styles.section}>
                            We may update these Terms & Conditions from time to time. Any changes will be reflected in this section, and 
                            continued use of our services after changes constitutes acceptance.
                        </Text>

                        <Text style={styles.sectionTitle}>13. Contact Us</Text>
                        <Text style={styles.section}>
                            If you have any questions regarding these Terms, please contact us at{" "}
                            <Text style={styles.email}>ampdreammart@gmail.com</Text>.
                        </Text>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default TermsAndConditionsModal;

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
