import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { auth } from "../services/firebase";
import { updateFirebaseUserProfile } from "../services/firebaseAuth";
import {
  removeMyProfilePhoto,
  updateMyProfile,
  uploadMyProfilePhoto,
} from "../services/usersApi";
import { useFamilyMembers } from "../context/FamilyMembersContext";

export function useProfileSettings(user, setUser) {
  const { members, loading: membersLoading, refreshMembers } =
    useFamilyMembers();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    profilePhotoUrl: user?.profile_photo_url || "",
  });

  const [memberSince, setMemberSince] = useState("Member");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState("");
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);

  const resetForm = () => {
    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    setProfileForm({
      name: user?.name || "",
      profilePhotoUrl: user?.profile_photo_url || "",
    });
    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setRemovePhotoRequested(false);
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
        let membersList = members;
        if (!membersList.length && !membersLoading) {
          membersList = (await refreshMembers()) || [];
        }
        const me = membersList.find((m) => m.email === user?.email);
        if (me?.created_at) {
          const date = new Date(me.created_at);
          setMemberSince(
            `Member since ${date.toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}`,
          );
        }
      } catch {
        setMemberSince("Member");
      }
    };

    if (user?.email) loadMemberDate();
  }, [members, membersLoading, refreshMembers, user?.email]);

  const profileImage = useMemo(
    () =>
      pendingPhotoPreview ||
      profileForm.profilePhotoUrl ||
      user?.profile_photo_url ||
      "",
    [pendingPhotoPreview, profileForm.profilePhotoUrl, user?.profile_photo_url],
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

    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }

    const nextPreview = URL.createObjectURL(file);
    setPendingPhotoFile(file);
    setPendingPhotoPreview(nextPreview);
    setRemovePhotoRequested(false);
  };

  const removePhoto = async () => {
    const previousPhotoUrl = profileForm.profilePhotoUrl || "";

    if (pendingPhotoPreview) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }

    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setRemovePhotoRequested(true);
    setProfileForm((prev) => ({
      ...prev,
      profilePhotoUrl: "",
    }));

    if (!previousPhotoUrl) return;
  };

  const saveProfile = async () => {
    const trimmedName = profileForm.name.trim();

    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    try {
      setLoading(true);

      let nextPhotoUrl = profileForm.profilePhotoUrl.trim();

      if (pendingPhotoFile) {
        setUploadingPhoto(true);
        const res = await uploadMyProfilePhoto(pendingPhotoFile);
        nextPhotoUrl = res?.data?.profile_photo_url || "";
      } else if (removePhotoRequested) {
        await removeMyProfilePhoto();
        nextPhotoUrl = "";
      }

      await updateMyProfile({
        name: trimmedName,
        profilePhotoUrl: nextPhotoUrl || null,
      });

      await updateFirebaseUserProfile(auth.currentUser, {
        displayName: trimmedName,
        photoURL: nextPhotoUrl || null,
      });

      setUser((prev) => ({
        ...prev,
        name: trimmedName,
        profile_photo_url: nextPhotoUrl || "",
      }));

      if (pendingPhotoPreview) {
        URL.revokeObjectURL(pendingPhotoPreview);
      }
      setPendingPhotoFile(null);
      setPendingPhotoPreview("");
      setRemovePhotoRequested(false);

      toast.success("Profile updated.");
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || "Update failed.");
    } finally {
      setUploadingPhoto(false);
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
    pendingPhotoFile,
    pendingPhotoPreview,
    removePhotoRequested,
    fileInputRef,
    resetForm,
    saveProfile,
    handlePhotoUpload,
    removePhoto,
  };
}
