import { useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

interface UseSessionOptions {
  autoRefresh?: boolean;
  refreshThreshold?: number; // minutes before expiration to refresh
}

export function useSession(options: UseSessionOptions = {}) {
  const { 
    user, 
    accessToken, 
    refreshToken, 
    isLoading, 
    refreshAccessToken, 
    logout 
  } = useAuth();
  
  const { autoRefresh = true, refreshThreshold = 5 } = options;

  // Parse JWT to get expiration time
  const getTokenExpiration = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }, []);

  // Check if token is about to expire
  const isTokenExpiringSoon = useCallback((token: string): boolean => {
    const expiration = getTokenExpiration(token);
    if (!expiration) return true;
    
    const now = Date.now();
    const timeUntilExpiration = expiration - now;
    const thresholdMs = refreshThreshold * 60 * 1000; // Convert minutes to milliseconds
    
    return timeUntilExpiration <= thresholdMs;
  }, [getTokenExpiration, refreshThreshold]);

  // Auto-refresh token if needed
  useEffect(() => {
    if (!autoRefresh || !accessToken || !refreshToken) {
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        if (isTokenExpiringSoon(accessToken)) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        // The refreshAccessToken function will handle clearing auth state
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Set up interval to check periodically
    const interval = setInterval(checkAndRefreshToken, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [accessToken, refreshToken, autoRefresh, isTokenExpiringSoon, refreshAccessToken]);

  // Validate session by checking if user exists and token is valid
  const isValidSession = useCallback((): boolean => {
    if (!user || !accessToken) {
      return false;
    }

    const expiration = getTokenExpiration(accessToken);
    if (!expiration) {
      return false;
    }

    return Date.now() < expiration;
  }, [user, accessToken, getTokenExpiration]);

  // Get time until token expiration
  const getTimeUntilExpiration = useCallback((): number | null => {
    if (!accessToken) {
      return null;
    }

    const expiration = getTokenExpiration(accessToken);
    if (!expiration) {
      return null;
    }

    return Math.max(0, expiration - Date.now());
  }, [accessToken, getTokenExpiration]);

  // Manual session validation (useful for API calls)
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      return false;
    }

    try {
      // If token is expiring soon, try to refresh
      if (refreshToken && isTokenExpiringSoon(accessToken)) {
        await refreshAccessToken();
        return true;
      }

      return isValidSession();
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  }, [accessToken, refreshToken, isTokenExpiringSoon, refreshAccessToken, isValidSession]);

  // Get authorization header for API calls
  const getAuthHeader = useCallback((): string | null => {
    if (!accessToken || !isValidSession()) {
      return null;
    }
    return `Bearer ${accessToken}`;
  }, [accessToken, isValidSession]);

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && isValidSession(),
    isValidSession: isValidSession(),
    timeUntilExpiration: getTimeUntilExpiration(),
    validateSession,
    getAuthHeader,
    logout,
  };
}