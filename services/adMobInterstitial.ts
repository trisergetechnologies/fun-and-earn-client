import { Platform } from 'react-native';
import type { InterstitialAd } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '@/constants/adMobConfig';
import {
  canShowAd,
  recordAdShown,
  reserveInterstitialSlot,
} from '@/services/adMobSettings';

type ShowReason = 'app_open' | 'mid_session';

class AdMobInterstitialManager {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private ad: InterstitialAd | null = null;
  private loaded = false;
  private showing = false;
  private creating = false;
  private unsubscribers: Array<() => void> = [];

  isSupported(): boolean {
    return Platform.OS === 'android';
  }

  async init(): Promise<void> {
    if (!this.isSupported()) return;
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const { default: mobileAds } = await import('react-native-google-mobile-ads');
        await mobileAds().initialize();
        this.initialized = true;
        await this.createAndLoad();
      } catch (err) {
        console.warn('[AdMob] initialize failed', err);
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  private clearListeners(): void {
    this.unsubscribers.forEach((u) => {
      try {
        u();
      } catch {
        /* ignore */
      }
    });
    this.unsubscribers = [];
  }

  private async createAndLoad(): Promise<void> {
    if (!this.isSupported() || !this.initialized || this.creating) return;

    this.creating = true;
    this.clearListeners();
    this.loaded = false;

    try {
      const { InterstitialAd, AdEventType } = await import(
        'react-native-google-mobile-ads'
      );
      const unitId = getInterstitialAdUnitId();
      const ad = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      this.ad = ad;

      this.unsubscribers.push(
        ad.addAdEventListener(AdEventType.LOADED, () => {
          this.loaded = true;
        })
      );
      this.unsubscribers.push(
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          this.showing = false;
          this.loaded = false;
          void this.createAndLoad();
        })
      );
      this.unsubscribers.push(
        ad.addAdEventListener(AdEventType.ERROR, (error) => {
          this.loaded = false;
          this.showing = false;
          console.warn('[AdMob] interstitial error', error);
        })
      );

      ad.load();
    } catch (err) {
      console.warn('[AdMob] create/load failed', err);
      this.ad = null;
      this.loaded = false;
    } finally {
      this.creating = false;
    }
  }

  private waitUntilLoaded(timeoutMs: number): Promise<boolean> {
    if (this.loaded) return Promise.resolve(true);
    const start = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        if (this.loaded) {
          resolve(true);
          return;
        }
        if (Date.now() - start >= timeoutMs) {
          resolve(false);
          return;
        }
        setTimeout(tick, 200);
      };
      tick();
    });
  }

  async tryShow(reason: ShowReason): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      await this.init();
      if (this.showing) return false;

      const gate = await canShowAd();
      if (!gate.ok) return false;

      if (!this.ad || !this.loaded) {
        await this.createAndLoad();
        const ready = await this.waitUntilLoaded(8000);
        if (!ready || !this.ad) return false;
      }

      const reserved = await reserveInterstitialSlot();
      if (!reserved.allowed) return false;

      this.showing = true;
      try {
        await this.ad.show();
        await recordAdShown();
        if (__DEV__) {
          console.log(`[AdMob] showed interstitial (${reason})`);
        }
        return true;
      } catch (showErr) {
        // Slot already consumed server-side — same tradeoff as Reels.
        console.warn('[AdMob] show failed after consume', showErr);
        this.showing = false;
        void this.createAndLoad();
        return false;
      }
    } catch (err) {
      this.showing = false;
      console.warn('[AdMob] tryShow failed', err);
      void this.createAndLoad();
      return false;
    }
  }

  preload(): void {
    if (!this.isSupported()) return;
    void this.init();
  }
}

export const adMobInterstitial = new AdMobInterstitialManager();
