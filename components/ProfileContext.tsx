import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import Constants from 'expo-constants';
const { BASE_URL } = Constants.expoConfig?.extra || {};
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useAuth } from './AuthContext';

interface Address {
  addressName: string;
  slugName?: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

interface ShortVideoProfile {
  watchTime: number;
  videoUploads: string[]; // Assuming ObjectId as string
}

interface ECartProfile {
  addresses: Address[];
  orders: string[]; // Assuming ObjectId as string
  bankDetails: BankDetails;
}

interface Wallets {
  shortVideoWallet: number;
  eCartWallet: number;
  rewardWallet: string[]; // Assuming ObjectId as string
}

export interface User {
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: 'user' | 'seller' | 'admin';
  applications: ('shortVideo' | 'eCart')[];
  state_address: string;
  referralCode?: string;
  referredBy?: string;
  shortVideoProfile?: ShortVideoProfile;
  eCartProfile?: ECartProfile;
  wallets: Wallets;
  isActive: boolean;
  token?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

type ProfileContextType = {
    userProfile: User | null;
    refreshUserProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const {isAuthenticated, isAuthLoading} = useAuth();
    const fetchUser = async () => {
        const token = await getToken();
        const profileUrl = `${BASE_URL}/ecart/user/general/getprofile`;
        try {
            const response = await axios.get(profileUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setUserProfile(response.data.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch User:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch User');
        }
    }

    useEffect(() => {
        if(isAuthLoading && !isAuthenticated) return
        fetchUser();
    }, []);
    const refreshUserProfile= async()=>{
        await fetchUser();
    }

    return (
        <ProfileContext.Provider value={{ userProfile, refreshUserProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error('useProfile must be used within ProfileProvider');
    return context;
};

// ✅ Fix: Add this line for Expo Router compatibility
export default ProfileProvider;
