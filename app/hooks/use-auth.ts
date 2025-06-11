import { useState, useEffect, useCallback } from "react";
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  RegisterFormData,
  AuthResponse, 
  AuthErrorResponse,
  RefreshTokenResponse 
} from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest | RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    error: null,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (storedAccessToken && storedUser) {
        setState({
          user: JSON.parse(storedUser),
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const saveAuthState = useCallback((user: User, accessToken: string, refreshToken?: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse | AuthErrorResponse = await response.json();

      if (data.success) {
        const { user, token } = data.data;
        saveAuthState(user, token);
        setState({
          user,
          accessToken: token,
          refreshToken: null, // Login endpoint doesn't return refresh token separately
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error.message,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "ログインに失敗しました。ネットワーク接続を確認してください。",
      }));
    }
  }, [saveAuthState]);

  const register = useCallback(async (data: RegisterRequest | RegisterFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData: AuthResponse | AuthErrorResponse = await response.json();

      if (responseData.success) {
        const { user, token } = responseData.data;
        saveAuthState(user, token);
        setState({
          user,
          accessToken: token,
          refreshToken: null,
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: responseData.error.message,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "ユーザー登録に失敗しました。ネットワーク接続を確認してください。",
      }));
    }
  }, [saveAuthState]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (state.accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${state.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearAuthState();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
      // Force redirect to login page
      window.location.href = "/login";
    }
  }, [state.accessToken, clearAuthState]);

  const refreshAccessToken = useCallback(async () => {
    if (!state.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: state.refreshToken,
        }),
      });

      const data: RefreshTokenResponse | AuthErrorResponse = await response.json();

      if (data.success) {
        const { accessToken, refreshToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        setState(prev => ({
          ...prev,
          accessToken,
          refreshToken,
        }));
      } else {
        // If refresh fails, clear auth state and redirect to login
        clearAuthState();
        setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: null,
        });
        throw new Error(data.error.message);
      }
    } catch (error) {
      clearAuthState();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
      throw error;
    }
  }, [state.refreshToken, clearAuthState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
    clearError,
  };
}