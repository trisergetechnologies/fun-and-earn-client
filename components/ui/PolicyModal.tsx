import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius, shadows, spacing } from '@/constants/DesignSystem';
import { Ionicons } from '@expo/vector-icons';

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function PolicyModal({ visible, onClose, title, children }: PolicyModalProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  title: { fontSize: 20, fontWeight: '700' },
  content: { padding: spacing.lg },
});

/** Shared text styles for policy content - use with useTheme(). */
export const policyTextStyles = StyleSheet.create({
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
  bold: { fontWeight: '600' as const },
  email: { fontWeight: '600' as const },
});
