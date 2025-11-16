"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  school_name?: string;
  profile_pic?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata.first_name,
          last_name: session.user.user_metadata.last_name,
          full_name: session.user.user_metadata.full_name,
          school_name: session.user.user_metadata.school_name,
          profile_pic: session.user.user_metadata.profile_pic,
        });
        // Mirror tokens for backend calls
        localStorage.setItem("access_token", session.access_token);
        if (session.refresh_token) {
          localStorage.setItem("refresh_token", session.refresh_token);
        }
      } else {
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          first_name: session.user.user_metadata.first_name,
          last_name: session.user.user_metadata.last_name,
          full_name: session.user.user_metadata.full_name,
          school_name: session.user.user_metadata.school_name,
          profile_pic: session.user.user_metadata.profile_pic,
        });
        localStorage.setItem("access_token", session.access_token);
        if (session.refresh_token) {
          localStorage.setItem("refresh_token", session.refresh_token);
        }
      } else {
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      // Mirror tokens immediately after password login
      localStorage.setItem("access_token", response.session.access_token);
      if (response.session.refresh_token) {
        localStorage.setItem("refresh_token", response.session.refresh_token);
      }
      setUser({
        id: response.user.id,
        email: response.user.email,
        first_name: response.user.user_metadata.first_name,
        last_name: response.user.user_metadata.last_name,
        full_name: response.user.user_metadata.full_name,
        school_name: response.user.user_metadata.school_name,
      });
      router.push("/student/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
