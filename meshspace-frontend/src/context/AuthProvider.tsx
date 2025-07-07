import { getCurrentUser } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { AuthContext} from "./AuthContext";
import type { User } from "@/types/user";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
  
    const { data, isFetching, isError } = useQuery({
      queryKey: ['me'],
      queryFn: getCurrentUser,
      retry: false,
    });
  
    useEffect(() => {
      if (!isFetching) {
        setAuthReady(true);
        if (data) {
          setUser(data.data);
        } else if (isError) {
          setUser(null);
        }
      }
    }, [isFetching, data, isError]);
  
    const logout = () => {
      setUser(null);
      localStorage.removeItem('accessToken');
    };
  
    return (
      <AuthContext.Provider value={{ user, setUser, loading: isFetching, logout, authReady }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export default AuthProvider;