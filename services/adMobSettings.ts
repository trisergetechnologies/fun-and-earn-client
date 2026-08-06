import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_BANNER_ENABLED,
  DEFAULT_BANNER_VISIBLE_SECONDS,
  DEFAULT_DAILY_LIMIT,
  DEFAULT_MIN_GAP_SECONDS,
  MAX_BANNER_VISIBLE_SECONDS,
  MAX_DAILY_LIMIT,
  MAX_GAP_SECONDS,
  MIN_BANNER_VISIBLE_SECONDS,
  MIN_DAILY_LIMIT,
  MIN_GAP_SECONDS,
} from '@/constants/adMobConfig';
import {
  consumeInterstitial as consumeInterstitialApi,
  fetchAdConfig,
  type MartAdConfigResponse,
} from '@/services/adMobApi';

const USAGE_KEY = '@dreammart/admob_usage_v2';
const LEGACY_USAGE_KEY = '@dreammart/admob_usage_v1';
const LEGACY_SETTINGS_KEY = '@dreammart/admob_settings_v1';
const SETTINGS_KEY = '@dreammart/admob_settings_v2';

export type AdMobSettings = {
  dailyLimit: number;
  minGapSeconds: number;
  bannerEnabled: boolean;
  bannerVisibleSecondsPerDay: number;
};

export type AdMobUsage = {
  date: string;
  /** Legacy local count — not source of truth; server usedToday wins. */
  shownCount: number;
  lastShownAt: number | null;
  bannerVisibleSecondsUsed: number;
};

type CachedPolicy = AdMobSettings & {
  usedToday: number;
  remainingToday: number;
  resetsAt: string | null;
  fetchedAt: number;
};

let policyCache: CachedPolicy | null = null;
/** True only after a successful GET /ads/config this session. Defaults alone must not serve ads. */
let policyFromServer = false;
let fetchInFlight: Promise<AdMobSettings> | null = null;
let clearedLegacyPolicy = false;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function clampDailyLimit(value: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_DAILY_LIMIT;
  return Math.min(MAX_DAILY_LIMIT, Math.max(MIN_DAILY_LIMIT, n));
}

export function clampMinGapSeconds(value: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_MIN_GAP_SECONDS;
  return Math.min(MAX_GAP_SECONDS, Math.max(MIN_GAP_SECONDS, n));
}

export function clampBannerVisibleSeconds(value: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_BANNER_VISIBLE_SECONDS;
  return Math.min(MAX_BANNER_VISIBLE_SECONDS, Math.max(MIN_BANNER_VISIBLE_SECONDS, n));
}

function defaultSettings(): AdMobSettings {
  return {
    dailyLimit: DEFAULT_DAILY_LIMIT,
    minGapSeconds: DEFAULT_MIN_GAP_SECONDS,
    bannerEnabled: DEFAULT_BANNER_ENABLED,
    bannerVisibleSecondsPerDay: DEFAULT_BANNER_VISIBLE_SECONDS,
  };
}

function emptyUsage(): AdMobUsage {
  return {
    date: todayKey(),
    shownCount: 0,
    lastShownAt: null,
    bannerVisibleSecondsUsed: 0,
  };
}

async function clearLegacyPolicyStorageOnce(): Promise<void> {
  if (clearedLegacyPolicy) return;
  clearedLegacyPolicy = true;
  try {
    await AsyncStorage.multiRemove([SETTINGS_KEY, LEGACY_SETTINGS_KEY]);
  } catch {
    /* ignore */
  }
}

function settingsFromCache(): AdMobSettings {
  if (!policyCache) return defaultSettings();
  return {
    dailyLimit: policyCache.dailyLimit,
    minGapSeconds: policyCache.minGapSeconds,
    bannerEnabled: policyCache.bannerEnabled,
    bannerVisibleSecondsPerDay: policyCache.bannerVisibleSecondsPerDay,
  };
}

function applyServerConfig(raw: Partial<MartAdConfigResponse>): AdMobSettings {
  const dailyLimit = clampDailyLimit(raw.dailyLimit ?? DEFAULT_DAILY_LIMIT);
  const usedToday = Math.max(0, Math.floor(Number(raw.usedToday) || 0));
  const remainingToday =
    typeof raw.remainingToday === 'number' && Number.isFinite(raw.remainingToday)
      ? Math.max(0, Math.floor(raw.remainingToday))
      : Math.max(0, dailyLimit - usedToday);

  const settings: AdMobSettings = {
    dailyLimit,
    minGapSeconds: clampMinGapSeconds(
      raw.minGapSeconds ?? DEFAULT_MIN_GAP_SECONDS
    ),
    bannerEnabled:
      raw.bannerEnabled === undefined
        ? DEFAULT_BANNER_ENABLED
        : Boolean(raw.bannerEnabled),
    bannerVisibleSecondsPerDay: clampBannerVisibleSeconds(
      raw.bannerVisibleSecondsPerDay ?? DEFAULT_BANNER_VISIBLE_SECONDS
    ),
  };

  policyCache = {
    ...settings,
    usedToday,
    remainingToday,
    resetsAt: typeof raw.resetsAt === 'string' ? raw.resetsAt : null,
    fetchedAt: Date.now(),
  };
  policyFromServer = true;
  return settings;
}

/**
 * Prefetch / refresh Mart ad policy from server into memory cache.
 * On failure keep last successful server cache or safe defaults — ads stay off until a successful fetch.
 */
export async function refreshAdSettingsFromServer(): Promise<AdMobSettings> {
  await clearLegacyPolicyStorageOnce();
  if (fetchInFlight) return fetchInFlight;

  fetchInFlight = (async () => {
    try {
      const data = await fetchAdConfig();
      return applyServerConfig(data);
    } catch (err) {
      console.warn('[AdMob] fetch config failed; ads disabled until online', err);
      // Keep prior successful server cache if any; otherwise defaults with ads gated off.
      return settingsFromCache();
    } finally {
      fetchInFlight = null;
    }
  })();

  return fetchInFlight;
}

export async function getAdSettings(): Promise<AdMobSettings> {
  await clearLegacyPolicyStorageOnce();
  if (policyCache) return settingsFromCache();
  return refreshAdSettingsFromServer();
}

/** Policy is server-owned; no-op retained for call-site safety. */
export async function setAdSettings(
  _next?: Partial<AdMobSettings>
): Promise<AdMobSettings> {
  return getAdSettings();
}

async function readUsageRaw(): Promise<AdMobUsage> {
  try {
    let raw = await AsyncStorage.getItem(USAGE_KEY);
    if (!raw) {
      const legacy = await AsyncStorage.getItem(LEGACY_USAGE_KEY);
      if (legacy) {
        raw = legacy;
      } else {
        return emptyUsage();
      }
    }
    const parsed = JSON.parse(raw) as Partial<AdMobUsage> & { date?: string };
    return {
      date: typeof parsed.date === 'string' ? parsed.date : todayKey(),
      shownCount: Math.max(0, Math.floor(Number(parsed.shownCount) || 0)),
      lastShownAt:
        typeof parsed.lastShownAt === 'number' && Number.isFinite(parsed.lastShownAt)
          ? parsed.lastShownAt
          : null,
      bannerVisibleSecondsUsed: Math.max(
        0,
        Math.floor(Number(parsed.bannerVisibleSecondsUsed) || 0)
      ),
    };
  } catch {
    return emptyUsage();
  }
}

export async function getUsage(): Promise<AdMobUsage> {
  const usage = await readUsageRaw();
  const today = todayKey();
  if (usage.date !== today) {
    const reset = emptyUsage();
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(reset));
    return reset;
  }
  return usage;
}

/**
 * Local pre-gate: require server policy, gap + cached remaining. Server consume is authoritative.
 */
export async function canShowAd(now = Date.now()): Promise<{
  ok: boolean;
  reason?: string;
  settings: AdMobSettings;
  usage: AdMobUsage;
}> {
  const [settings, usage] = await Promise.all([getAdSettings(), getUsage()]);

  if (!policyFromServer) {
    return { ok: false, reason: 'offline', settings, usage };
  }

  if (policyCache && policyCache.remainingToday <= 0) {
    return { ok: false, reason: 'quota', settings, usage };
  }

  if (usage.lastShownAt != null) {
    const gapMs = settings.minGapSeconds * 1000;
    if (now - usage.lastShownAt < gapMs) {
      return { ok: false, reason: 'gap', settings, usage };
    }
  }

  return { ok: true, settings, usage };
}

/** Update local lastShownAt only (interstitial count is server-side). */
export async function recordAdShown(now = Date.now()): Promise<AdMobUsage> {
  const usage = await getUsage();
  const next: AdMobUsage = {
    ...usage,
    date: todayKey(),
    lastShownAt: now,
  };
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Reserve one server slot, then caller should show the ad.
 * Updates in-memory remaining/used cache on success or exhaustion.
 */
export async function reserveInterstitialSlot(): Promise<{
  allowed: boolean;
  settings: AdMobSettings;
}> {
  const settings = await getAdSettings();
  try {
    const result = await consumeInterstitialApi();
    if (policyCache) {
      policyCache.usedToday = result.usedToday;
      policyCache.remainingToday = result.remainingToday;
      policyCache.dailyLimit = clampDailyLimit(result.dailyLimit);
    } else {
      policyCache = {
        ...settings,
        dailyLimit: clampDailyLimit(result.dailyLimit),
        usedToday: result.usedToday,
        remainingToday: result.remainingToday,
        resetsAt: null,
        fetchedAt: Date.now(),
      };
      policyFromServer = true;
    }
    return { allowed: result.allowed, settings: settingsFromCache() };
  } catch (err) {
    console.warn('[AdMob] consume failed', err);
    return { allowed: false, settings };
  }
}

export async function canShowBanner(): Promise<{
  ok: boolean;
  reason?: string;
  settings: AdMobSettings;
  usage: AdMobUsage;
  remainingSeconds: number;
}> {
  const [settings, usage] = await Promise.all([getAdSettings(), getUsage()]);
  if (!policyFromServer) {
    return {
      ok: false,
      reason: 'offline',
      settings,
      usage,
      remainingSeconds: 0,
    };
  }
  if (!settings.bannerEnabled) {
    return { ok: false, reason: 'disabled', settings, usage, remainingSeconds: 0 };
  }
  const remaining = Math.max(
    0,
    settings.bannerVisibleSecondsPerDay - usage.bannerVisibleSecondsUsed
  );
  if (remaining <= 0) {
    return { ok: false, reason: 'quota', settings, usage, remainingSeconds: 0 };
  }
  return { ok: true, settings, usage, remainingSeconds: remaining };
}

export async function addBannerVisibleSeconds(delta: number): Promise<{
  usage: AdMobUsage;
  settings: AdMobSettings;
  remainingSeconds: number;
  exhausted: boolean;
}> {
  const seconds = Math.max(0, Math.floor(Number(delta) || 0));
  const [settings, usage] = await Promise.all([getAdSettings(), getUsage()]);
  const nextUsed = Math.min(
    settings.bannerVisibleSecondsPerDay,
    usage.bannerVisibleSecondsUsed + seconds
  );
  const next: AdMobUsage = {
    ...usage,
    date: todayKey(),
    bannerVisibleSecondsUsed: nextUsed,
  };
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(next));
  const remainingSeconds = Math.max(0, settings.bannerVisibleSecondsPerDay - nextUsed);
  return {
    usage: next,
    settings,
    remainingSeconds,
    exhausted: remainingSeconds <= 0,
  };
}
