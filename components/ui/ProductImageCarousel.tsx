import React, { useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTheme } from "@/components/ThemeContext";

const PLACEHOLDER =
  "https://via.placeholder.com/400x400.png?text=No+Image";

interface ProductImageCarouselProps {
  images: string[];
  height?: number;
  borderRadius?: number;
}

export function ProductImageCarousel({
  images,
  height = 200,
  borderRadius = 12,
}: ProductImageCarouselProps) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const width = Dimensions.get("window").width;
  const slideWidth = width - 48;
  const urls = images?.filter(Boolean) ?? [];
  const displayUrls = urls.length > 0 ? urls : [PLACEHOLDER];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / slideWidth);
    if (i !== index) setIndex(i);
  };

  if (displayUrls.length === 1) {
    return (
      <View style={[styles.wrap, { height, borderRadius, backgroundColor: colors.backgroundSecondary }]}>
        <Image source={{ uri: displayUrls[0] }} style={styles.image} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ height }}
      >
        {displayUrls.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={[styles.slide, { width: slideWidth, height, borderRadius, backgroundColor: colors.backgroundSecondary }]}
          >
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {displayUrls.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.primary : colors.borderLight },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", width: "100%" },
  slide: { overflow: "hidden", marginRight: 0 },
  image: { width: "100%", height: "100%" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
