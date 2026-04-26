import { useAuthContext } from "../features/auth/providers/AuthProvider";

export const useAuth = () => {
  const { session, isAuthReady, isSigningOut, signOut } = useAuthContext();

  return {
    session,
    isAuthReady,
    isSigningOut,
    isAuthenticated: !!session,
    signOut,
  };
};
