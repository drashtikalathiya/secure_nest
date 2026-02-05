import { useState } from "react";
import {
  IconUser,
  IconMail,
  IconEye,
  IconEyeOff,
  IconLogin2,
  IconCaretDownFilled,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { firebaseSignup } from "../services/firebaseAuth";
import { backendSignup } from "../services/authApi";
import { validateSignup } from "../utils/validators";
import toast from "react-hot-toast";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("owner");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

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

    setError({});
    try {
      const user = await firebaseSignup(email, password);
      const token = await user.getIdToken();
      await backendSignup(token, {
        name: fullName,
        role,
      });
      toast.success("User registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("err", err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please try another email.");
      }
    }
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
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
          </div>
          {error.fullName && (
            <p className="text-red-500 text-xs mt-1">{error.fullName}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400">Role</label>
          <div className="relative mt-1">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] text-gray-300 focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
            >
              <option className="cursor-pointer" value="owner">
                Owner
              </option>
              <option className="cursor-pointer" value="member">
                Member
              </option>
            </select>

            <IconCaretDownFilled className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
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
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              placeholder="Create a strong password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
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

        <div>
          <label className="text-sm text-gray-400">Confirm Password</label>
          <div className="relative mt-1">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 pr-10 px-4 rounded-md bg-[#121a28] border border-[#1f2a3a] focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {error.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{error.confirmPassword}</p>
          )}
        </div>

        <button className="w-full h-11 bg-primary rounded-md font-semibold flex items-center justify-center gap-2">
          Create Account <IconLogin2 size={18} />
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Already have an account?{" "}
        <span
          className="text-primary cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Log in
        </span>
      </p>
    </>
  );
}
