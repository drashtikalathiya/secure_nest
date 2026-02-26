import { useState } from "react";
import { IconArrowLeft, IconMail, IconRotate2 } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { backendForgotPassword } from "../../services/authApi";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await backendForgotPassword(trimmedEmail);
      setSent(true);
      toast.success("Reset link sent. Check your email.");
    } catch (error) {
      console.error("Password reset email error:", error);
      toast.error(
        error?.message || "Failed to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <IconRotate2 size={26} />
        </div>
        <h2 className="text-2xl font-semibold">Forgot password?</h2>
        <p className="text-sm text-slate-400">
          Enter your email address and we will send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400">
            Email address
          </label>
          <div className="relative mt-2">
            <IconMail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="e.g. family@example.com"
              onChange={(event) => {
                setEmail(event.target.value);
                if (sent) setSent(false);
              }}
              className="h-12 w-full rounded-xl border border-primary/30 bg-[#121a28] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary/60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-primary-strong text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Sending..." : sent ? "Resend Link" : "Send Reset Link"}
        </button>
      </form>

      {sent && (
        <p className="text-xs text-center text-slate-400">
          You will receive a reset link within a few minutes.
        </p>
      )}

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
