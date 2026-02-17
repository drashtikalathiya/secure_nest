import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { backendLogin } from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const authVersionRef = useRef(0);

  useEffect(() => {
    let retryTimer = null;
    let nullUserTimer = null;

    const syncUserSession = async (currentUser, version, retryCount = 0) => {
      if (version !== authVersionRef.current) return;

      // No user can be transient during auth restore on refresh.
      if (!currentUser) {
        setLoading(true);
        nullUserTimer = setTimeout(() => {
          if (version !== authVersionRef.current) return;
          if (auth.currentUser) {
            syncUserSession(auth.currentUser, version);
            return;
          }
          setUser(null);
          setIsSubscribed(false);
          setLoading(false);
        }, 250);
        return;
      }

      try {
        setLoading(true);

        const token = await currentUser.getIdToken();
        const { data } = await backendLogin(token);

        const tokenResult = await currentUser.getIdTokenResult(true);

        const claims = tokenResult?.claims || {};
        const backendUser = data || {};

        const resolvedSubscription = Boolean(
          backendUser.is_subscribed ?? claims.is_subscribed,
        );

        const nextUser = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          name:
            currentUser.displayName ||
            backendUser.name ||
            claims.name ||
            currentUser.email?.split("@")?.[0],
          profile_photo_url:
            backendUser.profile_photo_url ||
            claims.profile_photo_url ||
            currentUser.photoURL ||
            "",
          role: backendUser.role || claims.role || null,
          is_subscribed: resolvedSubscription,
          family_owner_id: backendUser.family_owner_id || null,
        };

        if (version !== authVersionRef.current) return;

        setUser(nextUser);
        setIsSubscribed(resolvedSubscription);
      } catch (error) {
        console.error("Failed to sync user session:", error);

        const shouldRetry =
          error?.message === "USER_NOT_REGISTERED" ||
          error?.message === "User is not registered.";

        if (shouldRetry && retryCount < 5) {
          retryTimer = setTimeout(() => {
            syncUserSession(currentUser, version, retryCount + 1);
          }, 500);
          return;
        }

        setUser(null);
        setIsSubscribed(false);
      } finally {
        if (version === authVersionRef.current) {
          setLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (nullUserTimer) {
        clearTimeout(nullUserTimer);
        nullUserTimer = null;
      }
      authVersionRef.current += 1;
      const version = authVersionRef.current;
      syncUserSession(currentUser, version);
    });

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (nullUserTimer) clearTimeout(nullUserTimer);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSubscribed, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
