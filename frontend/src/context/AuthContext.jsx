import { createContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "library_token";

const decodeToken = (token) => {
  try {
    const [, payload] = token.split(".");
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = JSON.parse(window.atob(padded));
    return decoded;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!token) {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        setBootstrapping(false);
        return;
      }

      localStorage.setItem(TOKEN_KEY, token);

      try {
        const response = await getCurrentUser();
        setUser(response.user || decodeToken(token));
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setBootstrapping(false);
      }
    };

    syncUser();
  }, [token]);

  const login = async (payload) => {
    setLoading(true);
    try {
      const response = await loginUser(payload);
      setToken(response.token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      return await registerUser(payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutUser();
      }
    } catch (error) {
      // Ignore logout failures and clear local state anyway.
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      loading,
      bootstrapping,
      login,
      register,
      logout
    }),
    [bootstrapping, loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { TOKEN_KEY };
