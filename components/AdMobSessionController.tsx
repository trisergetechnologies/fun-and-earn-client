import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { MID_SESSION_SHOW_CHANCE } from '@/constants/adMobConfig';
import { adMobInterstitial } from '@/services/adMobInterstitial';
import {
  getAdSettings,
  refreshAdSettingsFromServer,
} from '@/services/adMobSettings';

const HOME_PATH = '/tabs/explore';
const APP_OPEN_DEBOUNCE_MS = 2000;

function isHomePath(pathname: string): boolean {
  return pathname === HOME_PATH || pathname.startsWith(`${HOME_PATH}/`);
}

type TabSwitchListener = () => void;

const tabSwitchListeners = new Set<TabSwitchListener>();

/** Call after a successful tab navigation for mid-session random interstitial attempts. */
export function notifyAdMobTabSwitch(): void {
  tabSwitchListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

/**
 * Mount inside authenticated tabs layout. Handles Home/app-open shows and mid-session rolls.
 */
export function AdMobSessionController() {
  const pathname = usePathname();
  const lastAppOpenAttemptAt = useRef(0);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void refreshAdSettingsFromServer();
    adMobInterstitial.preload();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const tryAppOpen = () => {
      if (!isHomePath(pathnameRef.current)) return;
      const now = Date.now();
      if (now - lastAppOpenAttemptAt.current < APP_OPEN_DEBOUNCE_MS) return;
      lastAppOpenAttemptAt.current = now;
      void adMobInterstitial.tryShow('app_open');
    };

    if (isHomePath(pathname)) {
      tryAppOpen();
    }

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') tryAppOpen();
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onTabSwitch = () => {
      void (async () => {
        try {
          const settings = await getAdSettings();
          if (settings.dailyLimit <= 1) return;
          if (Math.random() >= MID_SESSION_SHOW_CHANCE) return;
          await adMobInterstitial.tryShow('mid_session');
        } catch (err) {
          console.warn('[AdMob] mid-session roll failed', err);
        }
      })();
    };

    tabSwitchListeners.add(onTabSwitch);
    return () => {
      tabSwitchListeners.delete(onTabSwitch);
    };
  }, []);

  return null;
}
