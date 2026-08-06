import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeContext';

export const SCREEN_TOP_EXTRA = 12;

type ScreenEdge = 'top' | 'bottom';

interface ScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ScreenEdge[];
}

export function Screen({ children, style, edges = ['top'] }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: edges.includes('top') ? insets.top + SCREEN_TOP_EXTRA : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
