import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '@/components/ThemeContext';

/**
 * Premium three-dot loading indicator with staggered pulse animation.
 */
const SimpleSpinner = () => {
  const { colors } = useTheme();
  const dot1 = React.useRef(new Animated.Value(0.4)).current;
  const dot2 = React.useRef(new Animated.Value(0.4)).current;
  const dot3 = React.useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.4,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = createPulse(dot1, 0);
    const a2 = createPulse(dot2, 150);
    const a3 = createPulse(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { backgroundColor: colors.primary, opacity: dot1 }]} />
      <Animated.View style={[styles.dot, styles.dotMiddle, { backgroundColor: colors.primary, opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { backgroundColor: colors.primary, opacity: dot3 }]} />
    </View>
  );
};

export default SimpleSpinner;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotMiddle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
