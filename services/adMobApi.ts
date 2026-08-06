import { api } from '@/helpers/apiClient';

export type MartAdConfigResponse = {
  dailyLimit: number;
  minGapSeconds: number;
  bannerEnabled: boolean;
  bannerVisibleSecondsPerDay: number;
  usedToday: number;
  remainingToday: number;
  resetsAt: string;
};

export type MartAdConsumeResponse = {
  allowed: boolean;
  usedToday: number;
  remainingToday: number;
  dailyLimit: number;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function fetchAdConfig(): Promise<MartAdConfigResponse> {
  const res = await api.get<ApiEnvelope<MartAdConfigResponse>>(
    '/ecart/user/ads/config'
  );
  if (!res.data?.success || !res.data.data) {
    throw new Error(res.data?.message || 'Failed to fetch ad config');
  }
  return res.data.data;
}

export async function consumeInterstitial(): Promise<MartAdConsumeResponse> {
  const res = await api.post<ApiEnvelope<MartAdConsumeResponse>>(
    '/ecart/user/ads/consume'
  );
  if (!res.data?.success || !res.data.data) {
    throw new Error(res.data?.message || 'Failed to consume interstitial');
  }
  return res.data.data;
}
