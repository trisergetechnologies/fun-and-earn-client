import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'user_token';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

export const deleteToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token:', error);
  }
};

export const hasToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Error checking token existence:', error);
    return false;
  }
};
