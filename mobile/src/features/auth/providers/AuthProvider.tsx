import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { clearStoredSupabaseSession, supabase } from "../../../lib/supabase";
import {
  unregisterExpoPushToken,
  useExpoPushToken,
} from "../../notifications/hooks";
import { clearAuthQueries } from "../constants/queryKeys";
import { setUnauthorizedHandler } from "../lib/unauthorized-handler";
import {
  getAuthErrorMessageForLog,
  isInvalidRefreshTokenError,
} from "../utils/sessionErrors";

const AUTH_BOOTSTRAP_TIMEOUT_MS = 6000;

interface AuthContextValue {
  session: Session | null;
  isAuthReady: boolean;
  isSigningOut: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number) =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Auth bootstrap timed out"));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const clearUserState = useCallback(() => {
    clearAuthQueries(queryClient);
  }, [queryClient]);

  useExpoPushToken(isAuthReady && !!session?.user?.id, session?.user?.id);

  const signOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await unregisterExpoPushToken();
      clearUserState();
      const { error } = await supabase.auth.signOut();

      if (error) {
        if (isInvalidRefreshTokenError(error)) {
          await clearStoredSupabaseSession();
          setSession(null);
          return;
        }

        throw error;
      }
    } finally {
      setIsSigningOut(false);
    }
  }, [clearUserState, isSigningOut]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const {
          error,
          data: { session: currentSession },
        } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
        );

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          await clearStoredSupabaseSession();
          clearUserState();

          if (isMounted) {
            setSession(null);
          }

          return;
        }

        console.warn(
          "Auth bootstrap failed:",
          getAuthErrorMessageForLog(error),
        );
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsAuthReady(true);

      if (!nextSession) {
        clearUserState();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [clearUserState]);

  useEffect(() => {
    setUnauthorizedHandler(signOut);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthReady,
      isSigningOut,
      signOut,
    }),
    [isAuthReady, isSigningOut, session, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
