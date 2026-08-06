import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  clearAuthTokens,
  getRefreshToken,
  getToken,
  saveAuthTokens,
} from '@/helpers/authStorage';
import { setSessionExpiredHandler } from '@/helpers/apiClient';
import { authLog, authLogToken } from '@/helpers/authLogger';

type User = {
  id: string;
  name: string;
  email: string;
  applications: string[];
  role: string;
  phone: string;
  referralCode: string;
};

type LoginOptions = {
  /** Access token preferred; falls back to session `token` for older backends. */
  token: string;
  accessToken?: string;
  refreshToken?: string | null;
  user: User;
};

type AuthContextType = {
  isAuthenticated: boolean | null;
  isAuthLoading: boolean;
  user: User | null;
  login: (tokenOrOptions: string | LoginOptions, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name: string, phone: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const logout = async () => {
    try {
      authLog('info', 'logout.start');
      await clearAuthTokens();
      await SecureStore.deleteItemAsync('userData');
      setUser(null);
      setIsAuthenticated(false);
      authLog('success', 'logout.ok');
    } catch (e) {
      authLog('error', 'logout.failed', { error: String(e) });
      console.error('Logout failed:', e);
    }
  };

  useEffect(() => {
    setSessionExpiredHandler(() => {
      authLog('warn', 'session.expired_handler_fired', {
        hint: 'Refresh failed; forcing logout from AuthContext',
      });
      return logout();
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    const loadAuthData = async () => {
      const token = await getToken();
      const refreshToken = await getRefreshToken();
      const storedUser = await SecureStore.getItemAsync('userData');

      authLog('info', 'boot.load_auth', {
        hasAccessToken: Boolean(token),
        hasRefreshToken: Boolean(refreshToken),
        hasUserData: Boolean(storedUser),
        ...authLogToken('accessToken', token),
        ...authLogToken('refreshToken', refreshToken),
      });

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          authLog('success', 'boot.restored_session', {
            userId: parsedUser?.id,
            email: parsedUser?.email,
            canSilentRefresh: Boolean(refreshToken),
          });
        } catch (e) {
          authLog('error', 'boot.parse_user_failed', { error: String(e) });
          console.error('Failed to parse stored user data:', e);
          await logout();
        }
      } else {
        setIsAuthenticated(false);
        authLog('info', 'boot.no_session');
      }
      setIsAuthLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (tokenOrOptions: string | LoginOptions, userData?: User) => {
    try {
      let accessToken: string;
      let refreshToken: string | null | undefined;
      let nextUser: User;
      let hadExplicitAccess = false;

      if (typeof tokenOrOptions === 'string') {
        accessToken = tokenOrOptions;
        nextUser = userData as User;
        refreshToken = undefined;
      } else {
        hadExplicitAccess = Boolean(tokenOrOptions.accessToken);
        accessToken = tokenOrOptions.accessToken || tokenOrOptions.token;
        refreshToken = tokenOrOptions.refreshToken;
        nextUser = tokenOrOptions.user;
      }

      await saveAuthTokens({ accessToken, refreshToken });
      await SecureStore.setItemAsync('userData', JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);

      authLog('success', 'login.tokens_saved', {
        userId: nextUser?.id,
        email: nextUser?.email,
        usedAccessTokenField: hadExplicitAccess,
        usedSessionTokenFallback: !hadExplicitAccess,
        hasRefreshToken: Boolean(refreshToken),
        ...authLogToken('accessToken', accessToken),
        ...authLogToken('refreshToken', refreshToken),
        hint: hadExplicitAccess
          ? 'New auth flow (access + refresh). Wait ~2m then use the app to test refresh.'
          : 'Fallback to session token only — silent refresh will not work until backend returns accessToken/refreshToken.',
      });
    } catch (e) {
      authLog('error', 'login.failed', { error: String(e) });
      console.error('Failed to log in:', e);
    }
  };

  const updateUser = async (name: string, phone: string) => {
    const updatedUser = user ? { ...user, name, phone } : user;
    setUser(updatedUser);
    if (updatedUser) {
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateUser,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthProvider;
