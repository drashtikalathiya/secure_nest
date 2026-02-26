import { useState } from "react";
import { IconMail, IconEye, IconEyeOff, IconLogin2 } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { firebaseLogin } from "../../services/firebaseAuth";
import { backendLogin, getPostLoginPath } from "../../services/authApi";
import { acceptInvitation } from "../../services/invitationsApi";
import { validateLogin } from "../../utils/validators";
import toast from "react-hot-toast";
import { setAuthToken } from "../../services/apiClient";

export default function LoginForm() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const inviteEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const clearFieldError = (field) => {
    setError((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleLoginError = (error) => {
    console.error("Login error:", error);

    const firebaseErrorMap = {
      "auth/user-not-found":
        "Account not found. Please create an account first.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/user-disabled": "This account has been disabled. Contact support.",
    };

    toast.error(
      firebaseErrorMap[error?.code] ||
        error?.message ||
        "Login failed. Please try again.",
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const validationErrors = validateLogin({ email, password });

    if (Object.keys(validationErrors).length) {
      setError(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const firebaseUser = await firebaseLogin(email, password);
      const idToken = await firebaseUser.getIdToken();
      setAuthToken(idToken);

      if (inviteToken) {
        await acceptInvitation(inviteToken);
        toast.success("Invitation accepted successfully!");
      }

      const { data } = await backendLogin();

      toast.success("User login successfully!");

      navigate(getPostLoginPath(data), { replace: true });
    } catch (err) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-gray-400">
          Enter your credentials to access your secure vault.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-400">Email Address</label>
          <div className="relative mt-1">
            <IconMail
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              value={email}
              readOnly={Boolean(inviteEmail)}
              autoComplete="email"
              placeholder="name@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              className="h-12 w-full rounded-xl border border-primary/30 bg-[#121a28] px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/60"
            />
          </div>
          {error.email && (
            <p className="text-red-500 text-xs mt-1">{error.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Password</label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-semibold text-primary hover:text-primary/85"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              className="h-12 w-full rounded-xl border border-primary/30 bg-[#121a28] px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error.password && (
            <p className="text-red-500 text-xs mt-1">{error.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary-strong rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? (
            "Signing In..."
          ) : (
            <>
              Sign In <IconLogin2 size={18} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Don’t have an account?{" "}
        <span
          className="text-primary cursor-pointer"
          onClick={() =>
            navigate(
              inviteToken
                ? `/signup?inviteToken=${encodeURIComponent(
                    inviteToken,
                  )}&email=${encodeURIComponent(email)}`
                : "/signup",
            )
          }
        >
          Create an account
        </span>
      </p>
    </>
  );
}
