import { useAuth } from "../contexts/AuthContext";
import { supabase } from "./supabase";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface AppAuthState {
  token: string | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AppUser) => void;
  clearSession: () => void;
  validateSession: () => Promise<void>;
}

export const useAppAuthStore = <T>(selector?: (state: AppAuthState) => T): T => {
  const { user, session } = useAuth();

  const state: AppAuthState = {
    token: session?.access_token || null,
    user: user ? { 
      id: user.id, 
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User", 
      email: user.email || "" 
    } : null,
    isAuthenticated: !!user,
    setSession: () => {}, // Managed by Supabase
    clearSession: async () => {
      await supabase.auth.signOut();
    },
    validateSession: async () => {}, // Managed by Supabase AuthProvider
  };

  return selector ? selector(state) : (state as unknown as T);
};
