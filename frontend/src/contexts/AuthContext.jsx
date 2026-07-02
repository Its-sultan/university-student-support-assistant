import { createContext, useState, useCallback } from "react";
import { authService } from "@/services/authService";
import { tokenStore } from "@/services/tokenStore";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStore.getUser());

  const login = useCallback(async (username, password) => {
    const data = await authService.login(username, password);
    tokenStore.save(data.token, data.username);
    setUser(data.username);
    return data;
  }, []);

  const signup = useCallback(async (username, password) => {
    const data = await authService.signup(username, password);
    tokenStore.save(data.token, data.username);
    setUser(data.username);
    return data;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
