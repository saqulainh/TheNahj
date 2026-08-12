"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

function getSupabaseClient() {
  return supabase;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local stored user profile on mount
    const stored = localStorage.getItem("thenahj_user_profile");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse stored user profile", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, name?: string) => {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem("thenahj_user_profile", JSON.stringify(newUser));
  };

  const loginWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/profile` },
      });
    } else {
      // Demo OAuth fallback
      await login("demo.youth@thenahj.live", "Seeker of Wisdom");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("thenahj_user_profile");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
