import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  applications: string[];
  role: string;
  phone: string;
  referralCode: string;
};

type AuthContextType = {
  isAuthenticated: boolean | null;
  isAuthLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (name: string, phone: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthData = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('userData');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
          await logout();
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Failed to log in:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      setUser(null);
      setIsAuthenticated(false);
      console.log('Logout worked');
    } catch (e) {
      console.error('Logout failed:', e);
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

export default AuthProvider; // ✅ required for expo-router layout import
