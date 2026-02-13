import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCamera,
  IconPlus,
  IconUser,
  IconMail,
  IconEye,
  IconEyeOff,
  IconLogin2,
} from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  firebaseSignup,
  updateFirebaseUserProfile,
} from "../../services/firebaseAuth";
import { backendSignup, getPostLoginPath } from "../../services/authApi";
import { uploadImageToCloudinary } from "../../services/cloudinaryApi";
import { validateSignup } from "../../utils/validators";
import toast from "react-hot-toast";

export default function SignupForm() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const inviteEmail = searchParams.get("email") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(inviteEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const profileInitials = useMemo(() => {
    const source = fullName.trim();
    if (!source) return "";
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [fullName]);

  const clearFieldError = (field) => {
    setError((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateSignup({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (Object.keys(validationErrors).length) {
      setError(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setError({});
      let uploadedPhotoUrl = null;

      if (profileImage) {
        const uploadRes = await uploadImageToCloudinary(profileImage);
        uploadedPhotoUrl = uploadRes.secure_url;
      }

      const firebaseUser = await firebaseSignup(email, password);

      const profilePayload = {
        displayName: fullName.trim(),
      };
      if (uploadedPhotoUrl) {
        profilePayload.photoURL = uploadedPhotoUrl;
      }
      await updateFirebaseUserProfile(firebaseUser, profilePayload);

      const idToken = await firebaseUser.getIdToken();

      const { data } = await backendSignup(idToken, {
        name: fullName,
        photo_url: uploadedPhotoUrl,
        inviteToken,
      });

      toast.success("User registered successfully!");

      navigate(inviteToken ? "/dashboard" : getPostLoginPath(data), {
        replace: true,
      });
    } catch (err) {
      console.error("Signup error:", err);

      if (err?.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please try another email.");
      } else {
        toast.error(err?.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Please select a valid image file.");
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Profile image must be 2MB or smaller.");
      return;
    }

    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }
    const nextPreview = URL.createObjectURL(file);
    setProfileImage(file);
    setProfilePreview(nextPreview);
  };

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">Create your account</h2>
        <p className="text-gray-400">
          Protect what matters most with SecureNest.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSignup}>
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-[#36527f] bg-[#0f1f3b] text-[#91a9cf] transition hover:border-primary-soft hover:text-white"
              aria-label="Upload profile photo"
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : profileInitials ? (
                <span className="text-2xl font-bold text-slate-200">
                  {profileInitials}
                </span>
              ) : (
                <IconCamera size={24} />
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition hover:bg-primary-strong"
              aria-label="Add profile photo"
            >
              <IconPlus size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="hidden"
            />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Add Profile Photo
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-400">Full Name</label>
          <div className="relative mt-1">
            <IconUser
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearFieldError("fullName");
              }}
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
          </div>
          {error.fullName && (
            <p className="text-red-500 text-xs mt-1">{error.fullName}</p>
          )}
        </div>

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
              autoComplete="new-password"
              placeholder="Create a strong password"
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
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

        <div>
          <label className="text-sm text-gray-400">Confirm Password</label>
          <div className="relative mt-1">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{error.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary-strong rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            "Creating Account..."
          ) : (
            <>
              Create Account <IconLogin2 size={18} />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Already have an account?{" "}
        <span
          className="text-primary cursor-pointer"
          onClick={() =>
            navigate(
              inviteToken
                ? `/login?inviteToken=${encodeURIComponent(
                    inviteToken,
                  )}&email=${encodeURIComponent(email)}`
                : "/login",
            )
          }
        >
          Log in
        </span>
      </p>
    </>
  );
}
