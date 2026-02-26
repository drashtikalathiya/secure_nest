import { useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { firebaseConfirmPasswordReset } from "../../services/firebaseAuth";
import { validateResetPassword } from "../../utils/validators";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = useMemo(() => searchParams.get("oobCode") || "", [searchParams]);
  const resetFlagKey = "sn_reset_complete";

  useEffect(() => {
    if (!oobCode) {
      navigate("/login", { replace: true });
    }
  }, [navigate, oobCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!oobCode) {
      toast.error("Reset link is missing or invalid. Please request a new one.");
      return;
    }
    const validationErrors = validateResetPassword({
      password,
      confirmPassword,
    });
    if (Object.keys(validationErrors).length) {
      setError(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await firebaseConfirmPasswordReset(oobCode, password);
      sessionStorage.setItem(resetFlagKey, "1");
      toast.success("Password updated.");
      navigate("/reset-success");
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMap = {
        "auth/expired-action-code":
          "This reset link has expired. Please request a new one.",
        "auth/invalid-action-code":
          "This reset link is invalid. Please request a new one.",
        "auth/user-disabled": "This account has been disabled.",
      };
      toast.error(
        errorMap[error?.code] ||
          error?.message ||
          "Failed to update password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <IconShieldCheck size={26} />
        </div>
        <h2 className="text-2xl font-semibold">Reset Master Password</h2>
        <p className="text-sm text-slate-400">
          Create a new, high-entropy master password to secure your digital
          vault.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!oobCode && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
            Reset link is missing or invalid. Please request a new one.
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-slate-400">
            New Master Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              placeholder="Enter secure password"
              onChange={(event) => {
                setPassword(event.target.value);
                if (error.password) {
                  setError((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className="h-12 w-full rounded-xl border border-primary/30 bg-[#121a28] px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error.password && (
            <p className="text-red-500 text-xs mt-1">{error.password}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400">
            Confirm New Master Password
          </label>
          <div className="relative mt-2">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              autoComplete="new-password"
              placeholder="Re-type your password"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (error.confirmPassword) {
                  setError((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className="h-12 w-full rounded-xl border border-primary/30 bg-[#121a28] px-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {error.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !oobCode}
          className="h-12 w-full rounded-xl bg-primary-strong text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Master Password"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mx-auto inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <IconArrowLeft size={14} />
        Back to Login
      </button>
    </>
  );
}
