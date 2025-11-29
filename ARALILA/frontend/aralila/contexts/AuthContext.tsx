"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  school_name?: string;
  profile_pic?: string;
  ls_points: number;
  collected_badges: string[]; // <-- Add this
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

 const fetchUserProfile = async (token: string) => {
  try {
    const response = await fetch(`${env.backendUrl}/api/users/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      console.error("Token is invalid or expired");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      school_name: data.school_name,
      profile_pic: data.profile_pic,
      ls_points: data.ls_points,
      collected_badges: data.collected_badges || [], // <-- map collected badges
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        let token =
          session?.access_token || localStorage.getItem("access_token");

        if (session?.access_token) {
          localStorage.setItem("access_token", session.access_token);
          if (session.refresh_token) {
            localStorage.setItem("refresh_token", session.refresh_token);
          }
        }

        if (token) {
          const userData = await fetchUserProfile(token);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        localStorage.setItem("access_token", session.access_token);
        if (session.refresh_token) {
          localStorage.setItem("refresh_token", session.refresh_token);
        }

        const userData = await fetchUserProfile(session.access_token);
        setUser(userData);
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

      // Fetch complete user profile from Django backend
      const userData = await fetchUserProfile(response.session.access_token);
      setUser(userData);

      router.push("/student/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await fetchUserProfile(token);
      setUser(userData);
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
