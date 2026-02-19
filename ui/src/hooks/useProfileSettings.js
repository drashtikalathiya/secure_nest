import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { auth } from "../services/firebase";
import { updateFirebaseUserProfile } from "../services/firebaseAuth";
import {
  getFamilyMembers,
  removeMyProfilePhoto,
  updateMyProfile,
  uploadMyProfilePhoto,
} from "../services/usersApi";

export function useProfileSettings(user, setUser) {
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    profilePhotoUrl: user?.profile_photo_url || "",
  });

  const [memberSince, setMemberSince] = useState("Member");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const withToken = async (fn) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const token = await auth.currentUser.getIdToken();
    return fn(token);
  };

  const resetForm = () => {
    setProfileForm({
      name: user?.name || "",
      profilePhotoUrl: user?.profile_photo_url || "",
    });
  };

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      profilePhotoUrl: user?.profile_photo_url || "",
    });
  }, [user?.name, user?.profile_photo_url]);

  useEffect(() => {
    const loadMemberDate = async () => {
      try {
        await withToken(async (token) => {
          const res = await getFamilyMembers(token);
          const members = Array.isArray(res?.data) ? res.data : [];
          const me = members.find((m) => m.email === user?.email);
          if (me?.created_at) {
            const date = new Date(me.created_at);
            setMemberSince(
              `Member since ${date.toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}`,
            );
          }
        });
      } catch {
        setMemberSince("Member");
      }
    };

    if (user?.email) loadMemberDate();
  }, [user?.email]);

  const profileImage = useMemo(
    () => profileForm.profilePhotoUrl || user?.profile_photo_url || "",
    [profileForm.profilePhotoUrl, user?.profile_photo_url],
  );

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB allowed.");
      return;
    }

    try {
      setUploadingPhoto(true);

      const res = await withToken((token) => uploadMyProfilePhoto(token, file));
      const nextPhotoUrl = res?.data?.profile_photo_url || "";

      setProfileForm((prev) => ({
        ...prev,
        profilePhotoUrl: nextPhotoUrl,
      }));

      await updateFirebaseUserProfile(auth.currentUser, {
        photoURL: nextPhotoUrl || null,
      });

      setUser((prev) => ({
        ...prev,
        profile_photo_url: nextPhotoUrl,
      }));

      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error?.message || "Upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = async () => {
    const previousPhotoUrl = profileForm.profilePhotoUrl || "";

    if (!previousPhotoUrl) return;

    setProfileForm((prev) => ({
      ...prev,
      profilePhotoUrl: "",
    }));

    try {
      await withToken((token) => removeMyProfilePhoto(token));

      await updateFirebaseUserProfile(auth.currentUser, {
        photoURL: null,
      });

      setUser((prev) => ({
        ...prev,
        profile_photo_url: "",
      }));

      toast.success("Profile photo removed.");
    } catch (error) {
      setProfileForm((prev) => ({
        ...prev,
        profilePhotoUrl: previousPhotoUrl,
      }));
      toast.error(error?.message || "Failed to remove photo.");
    }
  };

  const saveProfile = async () => {
    const trimmedName = profileForm.name.trim();
    const trimmedPhoto = profileForm.profilePhotoUrl.trim();

    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    try {
      setLoading(true);

      await withToken((token) =>
        updateMyProfile(token, {
          name: trimmedName,
          profilePhotoUrl: trimmedPhoto || null,
        }),
      );

      await updateFirebaseUserProfile(auth.currentUser, {
        displayName: trimmedName,
        photoURL: trimmedPhoto || null,
      });

      setUser((prev) => ({
        ...prev,
        name: trimmedName,
        profile_photo_url: trimmedPhoto || "",
      }));

      toast.success("Profile updated.");
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    profileForm,
    setProfileForm,
    profileImage,
    memberSince,
    isEditing,
    setIsEditing,
    loading,
    uploadingPhoto,
    fileInputRef,
    resetForm,
    saveProfile,
    handlePhotoUpload,
    removePhoto,
  };
}
