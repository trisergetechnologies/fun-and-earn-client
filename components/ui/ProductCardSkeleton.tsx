import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';
import { borderRadius } from '@/constants/DesignSystem';

interface ProductCardSkeletonProps {
  width: number;
}

export function ProductCardSkeleton({ width }: ProductCardSkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <View style={[styles.card, { width, backgroundColor: colors.card }]}>
      <Animated.View
        style={[
          styles.image,
          { backgroundColor: colors.backgroundSecondary, opacity },
        ]}
      />
      <View style={styles.details}>
        <Animated.View
          style={[styles.line1, { backgroundColor: colors.backgroundSecondary, opacity }]}
        />
        <Animated.View
          style={[styles.line2, { backgroundColor: colors.backgroundSecondary, opacity }]}
        />
        <Animated.View
          style={[styles.priceLine, { backgroundColor: colors.backgroundSecondary, opacity }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 0.92,
  },
  details: {
    padding: 12,
  },
  line1: {
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  line2: {
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
    width: '70%',
  },
  priceLine: {
    height: 16,
    borderRadius: 4,
    width: 80,
  },
});
