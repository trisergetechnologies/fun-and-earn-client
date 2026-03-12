import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { ProductCardSkeleton } from './ProductCardSkeleton';

const CARD_GAP = 12;
const ROWS = 4;

export function ProductGridSkeleton() {
  const { contentPadding, productColumns, width } = useResponsive();
  const cardWidth =
    (width - 2 * contentPadding - (productColumns - 1) * CARD_GAP) / productColumns;

  const rows = Array.from({ length: ROWS }, (_, i) => i);
  const cols = Array.from({ length: productColumns }, (_, i) => i);

  return (
    <View style={[styles.grid, { paddingHorizontal: contentPadding }]}>
      {rows.map((row) => (
        <View key={row} style={styles.row}>
          {cols.map((col) => (
            <View
              key={col}
              style={[styles.cell, col < cols.length - 1 && { marginRight: CARD_GAP }]}
            >
              <ProductCardSkeleton width={cardWidth} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  cell: {},
});
