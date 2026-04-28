import { createContext, useContext, useEffect, useRef, useState } from "react";
import { FunctionsHttpError, supabase, type User } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

export function mapAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email.split("@")[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
  };
}

export const authService = {
  async sendOtp(email: string) {
    const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>("send-otp", {
      body: { email },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = await error.context.text(); } catch { /* ignore */ }
      }
      throw new Error(msg);
    }
    if (!data?.success) throw new Error(data?.error ?? "Не удалось отправить код");
  },

  async verifyOtp(email: string, code: string) {
    const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>("send-otp", {
      body: { email, code, action: "verify" },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = await error.context.text(); } catch { /* ignore */ }
      }
      throw new Error(msg);
    }
    if (!data?.success) throw new Error(data?.error ?? "Неверный код");
    return true;
  },

  async setPasswordAndUsername(password: string, username: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
      data: { username },
    });
    if (error || !data.user) throw error ?? new Error("Не удалось обновить пользователя");
    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error ?? new Error("Не удалось войти");
    return data.user;
  },

  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error || !data.user) throw error ?? new Error("Не удалось обновить пароль");
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const login = (nextUser: AuthUser) => setUser(nextUser);
  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  useEffect(() => {
    mounted.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted.current && session?.user) {
        login(mapAuthUser(session.user));
      }
      if (mounted.current) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current) return;

      if (event === "SIGNED_IN" && session?.user) {
        login(mapAuthUser(session.user));
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        login(mapAuthUser(session.user));
      } else if (event === "PASSWORD_RECOVERY") {
        setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
