import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageResizeMode,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';

const PLACEHOLDER = 'https://via.placeholder.com/400x400.png?text=No+Image';

interface ProductImageCarouselProps {
  images: string[];
  height?: number;
  containerWidth?: number;
  borderRadius?: number;
  resizeMode?: ImageResizeMode;
  enableCarousel?: boolean;
}

export function ProductImageCarousel({
  images,
  height,
  containerWidth,
  borderRadius = 12,
  resizeMode = 'cover',
  enableCarousel = true,
}: ProductImageCarouselProps) {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  const slideWidth = containerWidth ?? screenWidth - 48;
  const displayHeight = height ?? (containerWidth ? containerWidth : 200);

  const urls = images?.filter(Boolean) ?? [];
  const displayUrls = urls.length > 0 ? urls : [PLACEHOLDER];
  const showCarousel = enableCarousel && displayUrls.length > 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / slideWidth);
    if (i !== index) setIndex(i);
  };

  if (!showCarousel) {
    return (
      <View
        style={[
          styles.wrap,
          {
            height: displayHeight,
            borderRadius,
            backgroundColor: colors.backgroundSecondary,
            width: containerWidth ?? '100%',
          },
        ]}
      >
        <Image
          source={{ uri: displayUrls[0] }}
          style={styles.image}
          resizeMode={resizeMode}
        />
      </View>
    );
  }

  return (
    <View style={{ width: containerWidth ?? '100%' }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ height: displayHeight, width: slideWidth }}
        nestedScrollEnabled
      >
        {displayUrls.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={[
              styles.slide,
              {
                width: slideWidth,
                height: displayHeight,
                borderRadius,
                backgroundColor: colors.backgroundSecondary,
              },
            ]}
          >
            <Image source={{ uri }} style={styles.image} resizeMode={resizeMode} />
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
  wrap: {
    overflow: 'hidden',
    width: '100%',
  },
  slide: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
