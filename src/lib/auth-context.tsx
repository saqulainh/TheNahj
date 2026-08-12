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
    // 1. Load local stored user profile on mount
    const stored = localStorage.getItem("thenahj_user_profile");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse stored user profile", e);
      }
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 2. Fetch current Supabase session (handles OAuth callback tokens in hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supaUser = session.user;
        const profile: UserProfile = {
          id: supaUser.id,
          email: supaUser.email || "",
          name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Seeker of Wisdom",
          avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supaUser.email || supaUser.id)}`,
          createdAt: supaUser.created_at || new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem("thenahj_user_profile", JSON.stringify(profile));
      }
      setLoading(false);
    });

    // 3. Listen for auth changes (OAuth completion, sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const profile: UserProfile = {
          id: supaUser.id,
          email: supaUser.email || "",
          name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Seeker of Wisdom",
          avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supaUser.email || supaUser.id)}`,
          createdAt: supaUser.created_at || new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem("thenahj_user_profile", JSON.stringify(profile));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("thenahj_user_profile");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("thenahj_user_profile");
    if (supabase) {
      await supabase.auth.signOut();
    }
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
