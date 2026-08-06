import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { Card } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SUPPORT_PHONE = '+91 8970948374';
const SUPPORT_PHONE_RAW = '8970948374';
const SUPPORT_EMAIL = 'ampdreammart@gmail.com';

function SupportRow({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Card padding={spacing.md} style={styles.supportCard}>
      <View style={styles.supportRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundSecondary }]}>{icon}</View>
        <View style={styles.supportText}>
          <Text style={[styles.supportTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.supportSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function CustomerSupport() {
  const { colors } = useTheme();

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE_RAW}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleChat = () => {
    Alert.alert('Chat support', 'Live chat is coming soon.');
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Customer support</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            We&apos;re here to help with orders, payments, and more
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACT US</Text>

        <SupportRow
          icon={<Ionicons name="call-outline" size={22} color={colors.success} />}
          title="Call us"
          subtitle={SUPPORT_PHONE}
          actionLabel="Call"
          onPress={handleCall}
        />

        <SupportRow
          icon={<MaterialIcons name="email" size={22} color={colors.primary} />}
          title="Email us"
          subtitle={SUPPORT_EMAIL}
          actionLabel="Email"
          onPress={handleEmail}
        />

        <SupportRow
          icon={<Ionicons name="chatbubbles-outline" size={22} color={colors.warning} />}
          title="Live chat"
          subtitle="Get real-time support"
          actionLabel="Start"
          onPress={handleChat}
        />

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FAQ</Text>
        <Card padding={spacing.md} style={styles.faqCard}>
          <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I track my order?</Text>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
            Open My orders from your profile to see status and delivery updates.
          </Text>

          <View style={[styles.faqDivider, { backgroundColor: colors.borderLight }]} />

          <Text style={[styles.faqQuestion, { color: colors.text }]}>Can I cancel my order?</Text>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
            Orders can be cancelled before they are shipped. Contact support if you need help.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    paddingTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  supportCard: {
    marginBottom: spacing.sm,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  actionBtn: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xxs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  faqCard: {
    marginTop: spacing.xxs,
  },
  faqQuestion: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xxs,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  faqDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
});
