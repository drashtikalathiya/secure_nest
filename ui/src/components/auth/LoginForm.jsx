import { useState } from "react";
import { IconMail, IconEye, IconEyeOff, IconLogin2 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { firebaseLogin } from "../../services/firebaseAuth";
import { backendLogin } from "../../services/authApi";
import { validateLogin } from "../../utils/validators";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const clearFieldError = (field) => {
    setError((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin({ email, password });

    if (Object.keys(validationErrors).length) {
      setError(validationErrors);
      return;
    }

    try {
      const user = await firebaseLogin(email, password);
      const token = await user.getIdToken();
      const data = await backendLogin(token);
      const isSubscribed = Boolean(data?.data?.is_subscribed);

      toast.success("User login successfully!");

      navigate(isSubscribed ? "/dashboard" : "/subscription", { replace: true });
    } catch (err) {
      handleLoginError(err);
    }
  };

  const handleLoginError = (error) => {
    console.error("Login error:", error);

    if (!error?.code) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

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
      firebaseErrorMap[error.code] || "Login failed. Please try again.",
    );
  };

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-gray-400">
          Enter your credentials to access your secure vault.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
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
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
          </div>
          {error.email && (
            <p className="text-red-500 text-xs mt-1">{error.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          className="w-full h-11 bg-primary rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition"
        >
          Sign In <IconLogin2 size={18} />
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Don’t have an account?{" "}
        <span
          className="text-primary cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Create an account
        </span>
      </p>
    </>
  );
}
