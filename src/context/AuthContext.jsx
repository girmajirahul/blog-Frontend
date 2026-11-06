
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "../api/auth";
import { setAuthToken } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);

  // Clear authentication data
  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    setAuthToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  // Save authentication data
  const saveAuth = useCallback((data) => {
    const { accessToken: token, user: userData } = data;

    if (!token) {
      throw new Error("Access token missing from response");
    }

    localStorage.setItem("accessToken", token);
    setAuthToken(token);
    setAccessToken(token);

    if (userData) {
      setUser(userData);
    }

    return userData;
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);

    if (!response.data.success || !response.data.accessToken) {
      throw new Error(response.data.message || "Login failed");
    }

    saveAuth(response.data);
    return response.data;
  }, [saveAuth]);

  // Register
  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);

    if (response.data.accessToken) {
      saveAuth(response.data);
    }

    return response.data;
  }, [saveAuth]);

  // Refresh session (also used after OAuth)
  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.refresh();
      const data = response.data;

      if (!data.success || !data.accessToken) {
        throw new Error("Session expired");
      }

      saveAuth(data);

      // Fetch user if refresh response does not include it
      if (!data.user) {
        const profileResponse = await authService.getMe();

        if (!profileResponse.data.user) {
          throw new Error("Unable to retrieve user profile");
        }

        setUser(profileResponse.data.user);
      }

      return true;
    } catch (error) {
      console.error("Session refresh failed:", error);
      clearAuth();
      return false;
    }
  }, [saveAuth, clearAuth]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // Update user profile
  const updateUser = useCallback((updatedUser) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updatedUser,
    }));
  }, []);

  // Initialize authentication
  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          setAuthToken(token);

          try {
            const response = await authService.getMe();

            if (active) {
              setUser(response.data.user);
              setAccessToken(token);
            }
          } catch {
            if (active) {
              await refreshSession();
            }
          }
        } else {
          if (active) {
            await refreshSession();
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: Boolean(user && accessToken),
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    refreshSession,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
