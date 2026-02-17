import {
  IconCamera,
  IconDeviceMobile,
  IconEdit,
  IconKey,
  IconMail,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { useProfileSettings } from "../hooks/useProfileSettings";
import { usePasswordSettings } from "../hooks/usePasswordSettings";

export default function Settings() {
  const { user, setUser } = useAuth();
  const profile = useProfileSettings(user, setUser);
  const password = usePasswordSettings();
  return (
    <section className="pb-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your family's secure information and vault preferences."
      />

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-4 sm:p-5">
          {profile.isEditing ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-800 ring-2 ring-sky-500/30">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <IconUser size={28} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">Profile Photo</p>
                  <p className="text-xs text-slate-400">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => profile.fileInputRef.current?.click()}
                      disabled={profile.loading || profile.uploadingPhoto}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-strong px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <IconCamera size={13} />
                      {profile.uploadingPhoto ? "Uploading..." : "Upload New"}
                    </button>
                    <button
                      type="button"
                      onClick={profile.removePhoto}
                      disabled={
                        profile.loading ||
                        profile.uploadingPhoto ||
                        !profile.profileForm.profilePhotoUrl
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-medium text-slate-300">
                    Full Name
                    <input
                      type="text"
                      value={profile.profileForm.name}
                      onChange={(e) =>
                        profile.setProfileForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter full name"
                      className="mt-1.5 w-full rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-300">
                    Email Address
                    <div className="mt-1.5 flex w-full items-center gap-2 rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-2.5 text-sm text-slate-400">
                      <IconMail size={14} />
                      <span>{user?.email || "-"}</span>
                    </div>
                  </label>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <p className="text-xs text-slate-500">{profile.memberSince}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        profile.resetForm();
                        profile.setIsEditing(false);
                      }}
                      disabled={profile.loading}
                      className="rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      onClick={profile.saveProfile}
                      disabled={profile.loading}
                      className="rounded-lg bg-primary-strong px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profile.loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-sky-500/40"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-2 ring-sky-500/30">
                      <IconUser size={26} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-white">
                    {profile.profileForm.name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <p className="text-xs text-slate-500">
                    {profile.memberSince || "Member"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => profile.setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-strong px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                <IconEdit size={14} />
                Edit Profile
              </button>
            </div>
          )}

          <input
            ref={profile.fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => profile.handlePhotoUpload(e.target.files?.[0])}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                <IconKey size={18} />
              </span>
              <div>
                <p className="font-semibold text-slate-100">Master Password</p>
                <p className="text-xs text-slate-400">
                  Update your password regularly to keep your vault secure.
                </p>
              </div>
            </div>

            {password.isEditing ? (
              <>
                <div className="mt-4 space-y-2.5">
                  <input
                    type="password"
                    value={password.form.currentPassword}
                    onChange={(e) =>
                      password.setForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Current password"
                    className="w-full rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={password.form.newPassword}
                    onChange={(e) =>
                      password.setForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="New password"
                    className="w-full rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  />
                  <input
                    type="password"
                    value={password.form.confirmPassword}
                    onChange={(e) =>
                      password.setForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-slate-700/90 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      password.setForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      password.setIsEditing(false);
                    }}
                    disabled={password.loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={password.changePassword}
                    disabled={password.loading}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {password.loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => password.setIsEditing(true)}
                className="mt-4 w-full rounded-lg bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-sky-300 transition hover:bg-slate-800"
              >
                Change Password
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-5">
            <div className="flex items-center gap-3">
              <IconShieldLock size={18} />
              <p className="font-semibold text-slate-100">
                Two-Factor Authentication
              </p>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              2FA integration should be handled via Firebase multi-factor
              authentication.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <IconDeviceMobile size={14} />
              Authenticator App (Firebase MFA)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
