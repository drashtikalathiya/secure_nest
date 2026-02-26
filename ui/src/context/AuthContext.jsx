import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { backendLogin } from "../services/authApi";
import { clearAuthToken, setAuthToken } from "../services/apiClient";
import Loader from "../components/common/Loader";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const authVersionRef = useRef(0);
  const SIGNUP_IN_PROGRESS_KEY = "sn_signup_in_progress";
  const refreshSessionRef = useRef(async () => {});

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
          clearAuthToken();
          setUser(null);
          setIsSubscribed(false);
          setLoading(false);
        }, 250);
        return;
      }

      try {
        setLoading(true);
        if (sessionStorage.getItem(SIGNUP_IN_PROGRESS_KEY) === "1") {
          setLoading(false);
          return;
        }

        const token = await currentUser.getIdToken();
        setAuthToken(token);
        const { data } = await backendLogin();

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
          role: backendUser.role || claims.role || "",
          is_subscribed: resolvedSubscription,
          subscription_plan:
            backendUser.subscription_plan ||
            claims.subscription_plan ||
            "small",
          family_owner_id: backendUser.family_owner_id || "",
          permission_password_access_level:
            backendUser.permission_password_access_level ||
            claims.permission_password_access_level ||
            (backendUser.role === "owner" || claims.role === "owner"
              ? "edit"
              : "none"),
          permission_contacts_access_level:
            backendUser.permission_contacts_access_level ||
            claims.permission_contacts_access_level ||
            (backendUser.role === "owner" || claims.role === "owner"
              ? "edit"
              : "none"),
          permission_documents_access_level:
            backendUser.permission_documents_access_level ||
            claims.permission_documents_access_level ||
            (backendUser.role === "owner" || claims.role === "owner"
              ? "edit"
              : "none"),
          permission_invite_others: Boolean(
            backendUser.permission_invite_others ??
            claims.permission_invite_others ??
            false,
          ),
          permission_export_data: Boolean(
            backendUser.permission_export_data ??
            claims.permission_export_data ??
            true,
          ),
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

    refreshSessionRef.current = async () => {
      authVersionRef.current += 1;
      const version = authVersionRef.current;
      await syncUserSession(auth.currentUser, version);
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
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        loading,
        setUser,
        setIsSubscribed,
        refreshSession: () => refreshSessionRef.current(),
      }}
    >
      {loading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
