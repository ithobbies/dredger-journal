import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from 'react';
import api from "../api/axios";

// тип пользователя (можете расширить)
interface User {
  id: number;
  username: string;
  groups: string[];                 // имена групп-ролей
}

// что отдаёт хук useAuth()
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
export const useAuth = () => useContext(AuthContext)!;

/* ─────────────────────────── Provider ─────────────────────────── */

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ----- helper ----- */
  const saveTokens = (access: string, refresh: string) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  };
  const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  /* ----- попытка авто-логина при старте ----- */
  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/user/")                 // access-токен подставится в axios-интерсепторе
      .then((r) => setUser(r.data))
      .catch(() => {
        clearTokens();                    // токен протух → чистим и остаёмся anon
      })
      .finally(() => setLoading(false));
  }, []);

  /* ----- login / logout ----- */
  const login = async (username: string, password: string) => {
    const { data } = await api.post("/auth/login/", { username, password });
    saveTokens(data.access, data.refresh);

    const me = await api.get("/auth/user/").then((r) => r.data);
    setUser(me);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  /* ----- refresh-токен интерсептор (401 catch) ----- */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        if (
          err.response?.status === 401 &&
          !err.config._retry &&
          localStorage.getItem("refresh")
        ) {
          err.config._retry = true;

          try {
            const { data } = await api.post("/auth/refresh/", {
              refresh: localStorage.getItem("refresh"),
            });
            saveTokens(data.access, data.refresh);

            err.config.headers.Authorization = `Bearer ${data.access}`;
            return api(err.config);       // повторяем исходный запрос
          } catch {
            clearTokens();
            setUser(null);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  /* ----- context-value ----- */
  const value: AuthCtx = { user, loading, login, logout };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
