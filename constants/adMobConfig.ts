/**
 * Flip to 'LIVE' before production / store builds.
 * TEST uses Google’s official sample ad unit IDs.
 */
export const ADMOB_MODE: 'TEST' | 'LIVE' = 'TEST';

/** Fallback defaults when server config is unavailable. */
export const DEFAULT_DAILY_LIMIT = 1;
/** Interstitial min gap between shows (30 minutes). */
export const DEFAULT_MIN_GAP_SECONDS = 30 * 60;
export const MID_SESSION_SHOW_CHANCE = 0.3;

export const MIN_DAILY_LIMIT = 1;
export const MAX_DAILY_LIMIT = 20;
export const MIN_GAP_SECONDS = 10;
export const MAX_GAP_SECONDS = 3 * 60 * 60; // 3 hours

/** Banner visible budget per day (10 minutes). */
export const DEFAULT_BANNER_VISIBLE_SECONDS = 10 * 60;
export const DEFAULT_BANNER_ENABLED = true;
export const MIN_BANNER_VISIBLE_SECONDS = 10;
export const MAX_BANNER_VISIBLE_SECONDS = 2 * 60 * 60; // 2 hours

/** Google sample interstitial (Android). Safe to click in TEST. */
const TEST_INTERSTITIAL_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712';

/** Dream Mart interstitial (AdMob). */
const LIVE_INTERSTITIAL_UNIT_ID = 'ca-app-pub-4791707828479682/3819563728';

/** Google sample banner (Android). */
const TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

/** Dream Mart banner (AdMob). */
const LIVE_BANNER_UNIT_ID = 'ca-app-pub-4791707828479682/9071890403';

/** Google sample rewarded (Android). Unused in current interstitial flow. */
const TEST_REWARDED_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

/** Dream Mart rewarded (AdMob). Stored for later opt-in flow. */
const LIVE_REWARDED_UNIT_ID = 'ca-app-pub-4791707828479682/2162921028';

export function getInterstitialAdUnitId(): string {
  return ADMOB_MODE === 'LIVE' ? LIVE_INTERSTITIAL_UNIT_ID : TEST_INTERSTITIAL_UNIT_ID;
}

export function getBannerAdUnitId(): string {
  return ADMOB_MODE === 'LIVE' ? LIVE_BANNER_UNIT_ID : TEST_BANNER_UNIT_ID;
}

export function getRewardedAdUnitId(): string {
  return ADMOB_MODE === 'LIVE' ? LIVE_REWARDED_UNIT_ID : TEST_REWARDED_UNIT_ID;
}

export function secondsToMinSec(totalSeconds: number): { minutes: number; seconds: number } {
  const total = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return {
    minutes: Math.floor(total / 60),
    seconds: total % 60,
  };
}

export function minSecToSeconds(minutes: number, seconds: number): number {
  const m = Math.max(0, Math.floor(Number(minutes) || 0));
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  return m * 60 + s;
}
