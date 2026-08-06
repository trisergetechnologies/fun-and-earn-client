import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '@/components/ThemeContext';
import { getBannerAdUnitId } from '@/constants/adMobConfig';
import {
  addBannerVisibleSeconds,
  canShowBanner,
} from '@/services/adMobSettings';

type BannerAdModule = typeof import('react-native-google-mobile-ads');

/**
 * Adaptive banner strip for Wallet / Checkout.
 * Counts focused visible seconds against the daily budget and hides when exhausted.
 */
export function AdMobBannerSlot() {
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const [allowed, setAllowed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [ads, setAds] = useState<BannerAdModule | null>(null);
  const tickingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshAllowed = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setAllowed(false);
      return;
    }
    try {
      const gate = await canShowBanner();
      setAllowed(gate.ok);
    } catch {
      setAllowed(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    void (async () => {
      try {
        const mod = await import('react-native-google-mobile-ads');
        await mod.default().initialize();
        if (!cancelled) setAds(mod);
      } catch (err) {
        console.warn('[AdMob] banner module load failed', err);
        if (!cancelled) setLoadFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void refreshAllowed();
  }, [refreshAllowed, isFocused]);

  useEffect(() => {
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      tickingRef.current = false;
    };

    const maybeStart = (appState: AppStateStatus) => {
      const shouldTick =
        Platform.OS === 'android' &&
        allowed &&
        !loadFailed &&
        isFocused &&
        appState === 'active';

      if (!shouldTick) {
        stop();
        return;
      }
      if (tickingRef.current) return;
      tickingRef.current = true;
      intervalRef.current = setInterval(() => {
        void (async () => {
          try {
            const result = await addBannerVisibleSeconds(1);
            if (result.exhausted) {
              setAllowed(false);
              stop();
            }
          } catch {
            stop();
          }
        })();
      }, 1000);
    };

    maybeStart(AppState.currentState);
    const sub = AppState.addEventListener('change', maybeStart);
    return () => {
      sub.remove();
      stop();
    };
  }, [allowed, loadFailed, isFocused]);

  if (Platform.OS !== 'android' || !allowed || loadFailed || !ads) {
    return null;
  }

  const { BannerAd, BannerAdSize } = ads;
  const unitId = getBannerAdUnitId();

  return (
    <View
      style={[
        styles.strip,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        width={Math.floor(width)}
        onAdFailedToLoad={() => setLoadFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
