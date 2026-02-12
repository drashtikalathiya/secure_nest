import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import {
  acceptInvitation,
  validateInvitationToken,
} from "../services/invitationsApi";
import { auth } from "../services/firebase";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Validating invitation...");
  const token = searchParams.get("token");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setMessage("Invalid invitation link.");
        return;
      }

      try {
        const result = await validateInvitationToken(token);
        const invite = result?.data;

        if (!invite?.valid) {
          setMessage("This invitation is no longer valid.");
          return;
        }

        const currentUser = auth.currentUser;
        const invitedEmail = String(invite.email || "").trim().toLowerCase();
        const currentEmail = String(currentUser?.email || "")
          .trim()
          .toLowerCase();
        const basePath = invite.has_account ? "/login" : "/signup";
        const next = `${basePath}?inviteToken=${encodeURIComponent(
          token,
        )}&email=${encodeURIComponent(invite.email)}`;

        if (currentUser) {
          if (currentEmail !== invitedEmail) {
            await signOut(auth);
            navigate(next, { replace: true });
            return;
          }

          try {
            const authToken = await currentUser.getIdToken();
            await acceptInvitation(token, authToken);
            toast.success("Invitation accepted.");
            navigate("/dashboard", { replace: true });
          } catch (acceptError) {
            if (
              acceptError?.message === "USER_NOT_FOUND" ||
              acceptError?.message === "User account was not found."
            ) {
              await signOut(auth);
              navigate(
                `/signup?inviteToken=${encodeURIComponent(
                  token,
                )}&email=${encodeURIComponent(invite.email)}`,
                { replace: true },
              );
              return;
            }
            throw acceptError;
          }
          return;
        }

        navigate(next, { replace: true });
      } catch (error) {
        setMessage(error?.message || "Failed to process invitation.");
      }
    };

    run();
  }, [navigate, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 text-center">
        <h1 className="text-xl font-semibold">Invitation</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>
      </div>
    </div>
  );
}
