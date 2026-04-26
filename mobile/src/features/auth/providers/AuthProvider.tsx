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

import { supabase } from "../../../lib/supabase";
import {
  unregisterExpoPushToken,
  useExpoPushToken,
} from "../../notifications/hooks";
import { clearAuthQueries } from "../constants/queryKeys";
import { setUnauthorizedHandler } from "../lib/unauthorized-handler";


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
        throw error;
      }
    } finally {
      setIsSigningOut(false);
    }
  }, [clearUserState, isSigningOut]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(currentSession);
      setIsAuthReady(true);
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
