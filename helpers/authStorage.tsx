import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token:', error);
  }
};

export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete refresh token:', error);
  }
};

/** Persist access (+ optional refresh) from login/refresh responses. */
export const saveAuthTokens = async (params: {
  accessToken: string;
  refreshToken?: string | null;
}): Promise<void> => {
  await saveToken(params.accessToken);
  if (params.refreshToken) {
    await saveRefreshToken(params.refreshToken);
  }
};

export const clearAuthTokens = async (): Promise<void> => {
  await deleteToken();
  await deleteRefreshToken();
};

export const hasToken = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Error checking token existence:', error);
    return false;
  }
};
