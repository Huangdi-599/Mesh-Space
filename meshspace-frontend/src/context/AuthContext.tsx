import { createContext } from 'react';
import type { User } from '@/types/user';



type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  authReady: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


