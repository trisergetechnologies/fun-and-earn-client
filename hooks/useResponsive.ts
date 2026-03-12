import { useWindowDimensions } from 'react-native';
import { breakpoints } from '@/constants/DesignSystem';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isPhone = width < breakpoints.tablet;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isDesktop = width >= breakpoints.desktop;
  const isWide = width >= breakpoints.wide;

  /** Number of product columns: 2 on phone, 3 on tablet, 4 on desktop. */
  const productColumns = isPhone ? 2 : isTablet ? 3 : 4;

  /** Horizontal padding for content (responsive). */
  const contentPadding = isPhone ? 16 : isTablet ? 24 : 32;

  /** Max content width for large screens (optional). */
  const maxContentWidth = isWide ? 1200 : undefined;

  return {
    width,
    height,
    isPhone,
    isTablet,
    isDesktop,
    isWide,
    productColumns,
    contentPadding,
    maxContentWidth,
  };
}
