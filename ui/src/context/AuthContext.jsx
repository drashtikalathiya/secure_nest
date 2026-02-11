import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { backendLogin } from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const authSyncVersionRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const syncUserSession = async (currentUser, version) => {
      if (!currentUser) {
        if (!isMounted || version !== authSyncVersionRef.current) return;
        setUser(null);
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      if (!isMounted || version !== authSyncVersionRef.current) return;
      setUser(currentUser);
      setLoading(true);

      try {
        const token = await currentUser.getIdToken();
        const data = await backendLogin(token);
        const tokenResult = await currentUser.getIdTokenResult(true);
        const claims = tokenResult?.claims || {};
        const isSubscribed = Boolean(
          data?.data?.is_subscribed ?? claims.is_subscribed,
        );
        const nextUser = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          name:
            currentUser.displayName ||
            claims.name ||
            currentUser.email?.split("@")?.[0],
          role: claims.role || "member",
          is_subscribed: isSubscribed,
        };

        if (!isMounted || version !== authSyncVersionRef.current) return;
        setUser(nextUser);
        setIsSubscribed(nextUser.is_subscribed);
      } catch (error) {
        console.error("Failed to sync user session:", error);
        if (!isMounted || version !== authSyncVersionRef.current) return;
        setUser(null);
        setIsSubscribed(false);
      } finally {
        if (isMounted && version === authSyncVersionRef.current) {
          setLoading(false);
        }
      }
    };

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      authSyncVersionRef.current += 1;
      syncUserSession(currentUser, authSyncVersionRef.current);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSubscribed, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
