import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

type User = { id: number; username: string; roles: string[] } | null;
type Ctx = { user: User; login: (u: string, p: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  const fetchProfile = async () => {
    const { data } = await api.get("/auth/user/");
    setUser(data);
  };

  const login = async (username: string, password: string) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (localStorage.getItem("access")) fetchProfile().catch(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
