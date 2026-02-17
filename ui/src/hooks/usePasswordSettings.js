import { useState } from "react";
import toast from "react-hot-toast";
import { changeFirebasePassword } from "../services/firebaseAuth";

export function usePasswordSettings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const validate = () => {
    if (!form.currentPassword) return "Current password required.";
    if (form.newPassword.length < 8)
      return "New password must be at least 8 characters.";
    if (form.newPassword !== form.confirmPassword)
      return "Passwords must match.";
    return null;
  };

  const changePassword = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);
      await changeFirebasePassword(form.currentPassword, form.newPassword);

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsEditing(false);
      toast.success("Password changed successfully.");
    } catch (err) {
      toast.error(err?.message || "Password change failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    isEditing,
    setIsEditing,
    changePassword,
  };
}
