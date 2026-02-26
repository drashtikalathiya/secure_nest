import { IconShieldCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();
  const resetFlagKey = "sn_reset_complete";

  useEffect(() => {
    const allowed = sessionStorage.getItem(resetFlagKey) === "1";
    if (!allowed) {
      navigate("/login", { replace: true });
      return;
    }
    sessionStorage.removeItem(resetFlagKey);
  }, [navigate]);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
        <IconShieldCheck size={28} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Password Reset Successful</h2>
        <p className="text-sm text-slate-400">
          Your account is now protected with your new credentials. You can now
          securely access your family vault and sensitive data.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="h-12 w-full rounded-xl bg-primary-strong text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        Back to Login
      </button>
    </div>
  );
}
