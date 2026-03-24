// puter.store.ts
import { create } from "zustand";

/* ============================
   Type Declarations
============================ */
declare global {
  interface Window {
    puter?: any;
  }
}

/* ============================
   Helper: Safe access to Puter.js
   Prevents SSR / window errors
============================ */
export const getPuter = (): Window["puter"] | null => {
  if (typeof window === "undefined") return null;
  return window.puter ?? null;
};

/* ============================
   Type Definitions
============================ */
export interface PuterUser {
  id: string;
  name: string;
  email?: string;
}

export interface FSItem {
  name: string;
  path: string;
  type: "file" | "folder";
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content:
    | string
    | Array<{ type: "file" | "text"; puter_path?: string; text?: string }>;
}

export interface AIResponse {
  text: string;
  data?: any;
}

export interface KVItem {
  key: string;
  value: string;
}

export interface PuterChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/* ----------------------------
   Auth Slice
---------------------------- */
export interface AuthSlice {
  user: PuterUser | null;
  isAuthenticated: boolean;

  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  getUser: () => Promise<PuterUser | null>;
}

/* ----------------------------
   Full Puter Store
---------------------------- */
export interface PuterStore {
  // Global UI State
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;

  // Auth slice
  auth: AuthSlice;

  // FS slice
  fs: {
    write: (path: string, data: string | File | Blob) => Promise<any>;
    read: (path: string) => Promise<any>;
    readDir: (path: string) => Promise<any>;
    upload: (files: File[] | Blob[]) => Promise<any>;
    delete: (path: string) => Promise<any>;
  };

  // AI slice
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      options?: PuterChatOptions
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      message: string
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean
    ) => Promise<string | undefined>;
  };

  // KV slice
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (pattern: string, returnValues?: boolean) => Promise<any>;
    flush: () => Promise<boolean | undefined>;
  };

  // Helpers
  setError: (msg: string) => void;
  clearError: () => void;
  init: () => void;
}

/* ============================
   Zustand Store
============================ */
export const usePuterStore = create<PuterStore>((set, get) => ({
  /* ----------------------------
     Global UI State
  ---------------------------- */
  isLoading: false,
  error: null,
  puterReady: false,

  /* ----------------------------
     Auth Slice
  ---------------------------- */
  auth: {
    user: null,
    isAuthenticated: false,

    // Sign In
    signIn: async () => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");

      set({ isLoading: true, error: null });
      try {
        await puter.auth.signIn();
        await get().auth.checkAuthStatus();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign in failed";
        get().setError(msg);
      }
    },

    // Sign Out
    signOut: async () => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");

      set({ isLoading: true, error: null });
      try {
        await puter.auth.signOut();
        set((state) => ({
          ...state,
          auth: { ...state.auth, user: null, isAuthenticated: false },
          isLoading: false,
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign out failed";
        get().setError(msg);
      }
    },

    // Check Auth Status
    checkAuthStatus: async (): Promise<boolean> => {
      const puter = getPuter();
      if (!puter) {
        get().setError("Puter.js not available");
        return false;
      }

      set({ isLoading: true, error: null });
      try {
        const isSignedIn = await puter.auth.isSignedIn();
        if (isSignedIn) {
          const user = await puter.auth.getUser();
          set((state) => ({
            ...state,
            auth: { ...state.auth, user, isAuthenticated: true },
            isLoading: false,
          }));
          return true;
        } else {
          set((state) => ({
            ...state,
            auth: { ...state.auth, user: null, isAuthenticated: false },
            isLoading: false,
          }));
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to check auth status";
        get().setError(msg);
        return false;
      }
    },

    // Refresh User
    refreshUser: async () => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");

      set({ isLoading: true, error: null });
      try {
        const user = await puter.auth.getUser();
        set((state) => ({
          ...state,
          auth: { ...state.auth, user, isAuthenticated: true },
          isLoading: false,
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to refresh user";
        get().setError(msg);
      }
    },

    // Get User
    getUser: async () => get().auth.user,
  },

  /* ----------------------------
     File System Slice
  ---------------------------- */
  fs: {
    write: async (path, data) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.fs.write(path, data);
    },
    read: async (path) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.fs.read(path);
    },
    readDir: async (path) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.fs.readdir(path);
    },
    upload: async (files) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.fs.upload(files);
    },
    delete: async (path) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.fs.delete(path);
    },
  },

  /* ----------------------------
     AI Slice
  ---------------------------- */
  ai: {
    chat: async (prompt, options) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.ai.chat(prompt, options);
    },
    feedback: async (path, message) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");

      return puter.ai.chat(
        [
          {
            role: "user",
            content: [
              { type: "file", puter_path: path },
              { type: "text", text: message },
            ],
          },
        ],
        { model: "claude-sonnet-4" }
      );
    },
    img2txt: async (image, testMode) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.ai.img2txt(image, testMode);
    },
  },

  /* ----------------------------
     KV Slice
  ---------------------------- */
  kv: {
    get: async (key) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.kv.get(key);
    },
    set: async (key, value) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.kv.set(key, value);
    },
    delete: async (key) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.kv.delete(key);
    },
    list: async (pattern, returnValues) => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.kv.list(pattern, returnValues ?? false);
    },
    flush: async () => {
      const puter = getPuter();
      if (!puter) return get().setError("Puter.js not available");
      return puter.kv.flush();
    },
  },

  /* ----------------------------
     Error Helpers
  ---------------------------- */
  setError: (msg) => set({ error: msg, isLoading: false }),
  clearError: () => set({ error: null }),

  /* ----------------------------
     Initialize Puter.js
     Wait until Puter is available or timeout after 10s
  ---------------------------- */
  init: () => {
    if (getPuter()) {
      set({ puterReady: true });
      get().auth.checkAuthStatus();
      return;
    }

    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        get().auth.checkAuthStatus();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) get().setError("Puter.js failed to load within 10 seconds");
    }, 10000);
  },
}));

/* =============================
   Helper: Return Object API
   Allows destructuring all slices at once
============================= */
export const getPuterAPI = () => {
  const state = usePuterStore.getState();
  return {
    auth: state.auth,
    fs: state.fs,
    ai: state.ai,
    kv: state.kv,
    isLoading: state.isLoading,
    error: state.error,
    puterReady: state.puterReady,
    setError: state.setError,
    clearError: state.clearError,
    init: state.init,
  };
};
