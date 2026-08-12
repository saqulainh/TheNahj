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
  updateAvatar: (avatarUrl: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  updateAvatar: async () => {},
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
    const customAvatar = localStorage.getItem("thenahj_custom_avatar");
    const stored = localStorage.getItem("thenahj_user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (customAvatar) parsed.avatarUrl = customAvatar;
        setUser(parsed);
      } catch (e) {
        console.warn("Failed to parse stored user profile", e);
      }
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // 2. Fetch current Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const supaUser = session.user;
        const savedAvatar = localStorage.getItem("thenahj_custom_avatar");
        const profile: UserProfile = {
          id: supaUser.id,
          email: supaUser.email || "",
          name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Seeker of Wisdom",
          avatarUrl: savedAvatar || supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supaUser.email || supaUser.id)}`,
          createdAt: supaUser.created_at || new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem("thenahj_user_profile", JSON.stringify(profile));
      }
      setLoading(false);
    });

    // 3. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const supaUser = session.user;
        const savedAvatar = localStorage.getItem("thenahj_custom_avatar");
        const profile: UserProfile = {
          id: supaUser.id,
          email: supaUser.email || "",
          name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Seeker of Wisdom",
          avatarUrl: savedAvatar || supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supaUser.email || supaUser.id)}`,
          createdAt: supaUser.created_at || new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem("thenahj_user_profile", JSON.stringify(profile));
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem("thenahj_user_profile");
        localStorage.removeItem("thenahj_custom_avatar");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateAvatar = async (newAvatarUrl: string) => {
    localStorage.setItem("thenahj_custom_avatar", newAvatarUrl);
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, avatarUrl: newAvatarUrl };
      localStorage.setItem("thenahj_user_profile", JSON.stringify(updated));
      return updated;
    });

    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { avatar_url: newAvatarUrl },
        });
      } catch (err) {
        console.warn("Failed to update Supabase user avatar metadata:", err);
      }
    }
  };

  const login = async (email: string, name?: string) => {
    const savedAvatar = localStorage.getItem("thenahj_custom_avatar");
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      avatarUrl: savedAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
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
      await login("demo.youth@thenahj.live", "Seeker of Wisdom");
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("thenahj_user_profile");
    localStorage.removeItem("thenahj_custom_avatar");
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, updateAvatar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
