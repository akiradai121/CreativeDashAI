import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Fetch current user
  const { 
    data: userData, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['/api/user'],
    onSuccess: (data) => {
      if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    },
    onError: () => {
      setUser(null);
    },
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: "Login successful",
        description: "Welcome back to Prompt2Book!",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (userData: SignupData) => {
      const response = await apiRequest("POST", "/api/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: "Account created",
        description: "Welcome to Prompt2Book!",
      });
    },
    onError: (error) => {
      toast({
        title: "Signup failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Login handler
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Signup handler
  const signup = async (userData: SignupData) => {
    await signupMutation.mutateAsync(userData);
  };

  // Logout handler
  const logout = () => {
    setUser(null);
  };

  // Effect to set user data once query completes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const authContextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
