// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../services/auth.service';

type User = {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  followers: string[];
  following: string[];
  createdAt: string;
  updatedAt: string;
  avatar:string
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  // Set user when data changes or error occurs
  useEffect(() => {
    if (data) {
      setUser(data.data);
    } else if (isError) {
      setUser(null);
    }
  }, [data, isError]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading: isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthProvider, useAuth };
