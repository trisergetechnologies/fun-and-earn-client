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
};

type AuthContextType = {
  isAuthenticated: boolean | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
    setIsAuthenticated(false);
    console.log('logout worked');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ✅ Fix: Add this line for Expo Router compatibility
export default AuthProvider;
