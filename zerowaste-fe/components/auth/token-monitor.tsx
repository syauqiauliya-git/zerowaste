import React, { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { useDispatch } from "react-redux";
import { getToken } from "@/lib/auth-storage";
import { fetchRole } from "@/store/slices/authSlice";

interface TokenMonitorProps {
  children: React.ReactNode;
}

export const TokenMonitor: React.FC<TokenMonitorProps> = ({ children }) => {
  const dispatch = useDispatch();
  const previousTokenRef = useRef<string | null>(null);

  // Monitor token changes and fetch role when token changes
  const checkTokenChange = useCallback(async () => {
    try {
      const currentToken = await getToken();
      if (currentToken !== previousTokenRef.current) {
        previousTokenRef.current = currentToken;
        if (currentToken) {
          // Token exists or changed, fetch role
          dispatch(fetchRole() as any);
        }
      }
    } catch (err) {
      console.error("Error checking token:", err);
    }
  }, [dispatch]);

  // Check token on mount
  useEffect(() => {
    checkTokenChange();
  }, [checkTokenChange]);

  // Check token when app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkTokenChange();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkTokenChange]);

  return <>{children}</>;
};

