import {
  IconSearch,
  IconTrash,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import PageHeader from "../components/common/PageHeader";
import MemberPermissionsFields from "../components/members/MemberPermissionsFields";
import { useAuth } from "../context/AuthContext";
import {
  cancelInvitation,
  createInvitation,
  getPendingInvitations,
  resendInvitation,
} from "../services/invitationsApi";
import {
  deleteFamilyMember,
  getFamilyMembers,
  updateMemberPermissions,
} from "../services/usersApi";
import { PAGE_META } from "../constants/pageMeta";

const ROLE_STYLES = {
  Owner: "bg-sky-500/20 text-sky-300",
  Member: "bg-slate-800/70 text-slate-300",
};

const normalizeAccessLevel = (value, fallback = "none") => {
  if (value === "none" || value === "view" || value === "edit") {
    return value;
  }

  return fallback;
};

const normalizeMember = (member) => {
  const roleLabel = member.role === "owner" ? "Owner" : "Member";
  const name = member.name || member.email?.split("@")[0] || "Unknown";

  return {
    id: member.id,
    name,
    email: member.email,
    role: roleLabel,
    profile_photo_url: member.profile_photo_url || "",
    created_at: member.created_at,
    permissions:
      roleLabel === "Owner"
        ? {
            passwordAccess: "edit",
            contactsAccess: "edit",
            documentsAccess: "edit",
            inviteOthers: true,
            exportData: true,
          }
        : {
            passwordAccess: normalizeAccessLevel(
              member.permission_password_access_level,
            ),
            contactsAccess: normalizeAccessLevel(
              member.permission_contacts_access_level,
            ),
            documentsAccess: normalizeAccessLevel(
              member.permission_documents_access_level,
            ),
            inviteOthers: Boolean(member.permission_invite_others),
            exportData: Boolean(member.permission_export_data),
          },
  };
};

const getMemberKey = (member) => member.id || member.email;

const getDefaultPermissions = (role) => ({
  passwordAccess: role === "Owner" ? "edit" : "view",
  contactsAccess: role === "Owner" ? "edit" : "view",
  documentsAccess: role === "Owner" ? "edit" : "view",
  inviteOthers: role === "Owner",
  exportData: true,
});

const getInviteDefaultPermissions = () => ({
  passwordAccess: "view",
  contactsAccess: "view",
  documentsAccess: "view",
  inviteOthers: false,
  exportData: true,
});

const formatJoinedDate = (value) => {
  if (!value) return "Joined recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Joined recently";

  return `Joined ${date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
};

const formatTimeAgo = (value) => {
  if (!value) return "Invitation pending";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invitation pending";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (minutes < 60) {
    return `Invitation sent ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Invitation sent ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `Invitation sent ${days} day${days === 1 ? "" : "s"} ago`;
};

export default function Members() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeSliderMode, setActiveSliderMode] = useState(null);
  const [activeSliderMember, setActiveSliderMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePermissions, setInvitePermissions] = useState(
    getInviteDefaultPermissions(),
  );
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteActionLoadingById, setInviteActionLoadingById] = useState({});

  const [permissions, setPermissions] = useState({});
  const [permissionDraft, setPermissionDraft] = useState({
    passwordAccess: "view",
    contactsAccess: "view",
    documentsAccess: "view",
    inviteOthers: false,
    exportData: true,
  });
  const [permissionSaving, setPermissionSaving] = useState(false);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const pageTitle = PAGE_META["/members"];

  const resetInviteForm = () => {
    setInviteEmail("");
    setInvitePermissions(getInviteDefaultPermissions());
  };

  const normalizedMembers = useMemo(
    () => members.map(normalizeMember),
    [members],
  );

  const filteredActiveMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return normalizedMembers;

    return normalizedMembers.filter((row) =>
      `${row.name} ${row.email}`.toLowerCase().includes(query),
    );
  }, [normalizedMembers, search]);

  const filteredPendingInvites = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pendingInvites;

    return pendingInvites.filter((invite) =>
      String(invite.email || "")
        .toLowerCase()
        .includes(query),
    );
  }, [pendingInvites, search]);

  const activeBadgeCount = `${filteredActiveMembers.length} / ${normalizedMembers.length}`;

  useEffect(() => {
    setPermissions((prev) => {
      const next = {};
      normalizedMembers.forEach((member) => {
        const key = getMemberKey(member);
        next[key] =
          prev[key] || member.permissions || getDefaultPermissions(member.role);
      });
      return next;
    });
  }, [normalizedMembers]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        getFamilyMembers(),
        isOwner ? getPendingInvitations() : Promise.resolve({ data: [] }),
      ]);

      setMembers(membersRes?.data || []);
      setPendingInvites(invitesRes?.data || []);
    } catch (error) {
      toast.error(error?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenPermissions = (member) => {
    const memberKey = getMemberKey(member);
    setActiveSliderMember(member);
    setActiveSliderMode("permissions");
    setPermissionDraft(
      permissions[memberKey] || getDefaultPermissions(member.role),
    );
  };

  const handleChangeDraftPermission = (key, value) => {
    setPermissionDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSavePermissionChanges = async () => {
    if (!activeSliderMember) return;
    if (activeSliderMember.role === "Owner") {
      setActiveSliderMode(null);
      setActiveSliderMember(null);
      return;
    }

    try {
      setPermissionSaving(true);
      await updateMemberPermissions(activeSliderMember.id, permissionDraft);

      const memberKey = getMemberKey(activeSliderMember);
      setPermissions((prev) => ({
        ...prev,
        [memberKey]: permissionDraft,
      }));

      toast.success("Permissions updated.");
      setActiveSliderMode(null);
      setActiveSliderMember(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to update permissions.");
    } finally {
      setPermissionSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setInviteLoading(true);
      await createInvitation({
        email: inviteEmail.trim(),
        role: "member",
        ...invitePermissions,
      });

      toast.success("Invitation sent.");
      resetInviteForm();
      setActiveSliderMode(null);
      setActiveSliderMember(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInvitePermissionChange = (key, value) => {
    setInvitePermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResend = async (invitationId) => {
    try {
      setInviteActionLoadingById((prev) => ({ ...prev, [invitationId]: true }));
      await resendInvitation(invitationId);
      toast.success("Invitation resent.");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to resend invitation.");
    } finally {
      setInviteActionLoadingById((prev) => ({
        ...prev,
        [invitationId]: false,
      }));
    }
  };

  const handleCancel = async (invitationId) => {
    try {
      setInviteActionLoadingById((prev) => ({ ...prev, [invitationId]: true }));
      await cancelInvitation(invitationId);
      toast.success("Invitation deleted.");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to delete invitation.");
    } finally {
      setInviteActionLoadingById((prev) => ({
        ...prev,
        [invitationId]: false,
      }));
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteFamilyMember(memberToDelete.id);
      toast.success("Member deleted.");
      setMemberToDelete(null);
      setActiveSliderMode(null);
      setActiveSliderMember(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to delete member.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section>
      <div>
        <PageHeader
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
          right={
            isOwner ? (
              <button
                type="button"
                onClick={() => {
                  resetInviteForm();
                  setActiveSliderMode("invite");
                  setActiveSliderMember(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2 text-xs font-semibold text-white"
              >
                <IconUserPlus size={16} />
                Invite Member
              </button>
            ) : null
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <IconSearch
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search member by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-800/80 bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50 hidden md:block">
        <div className="grid grid-cols-[1.4fr_0.8fr_1.4fr_0.8fr] border-b border-slate-800/80 bg-[#17253f] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          <span>Member</span>
          <span>Role</span>
          <span>Email Address</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="px-4 py-5 text-sm text-slate-400">
            Loading members...
          </div>
        ) : filteredActiveMembers.length === 0 ? (
          <div className="px-4 py-5 text-sm text-slate-400">
            No members found.
          </div>
        ) : (
          filteredActiveMembers.map((member) => (
            <div
              key={member.id || member.email}
              className="grid grid-cols-[1.4fr_0.8fr_1.4fr_0.8fr] items-center border-b border-slate-800/60 px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {member.profile_photo_url ? (
                  <img
                    src={member.profile_photo_url}
                    alt={member.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                    <IconUser size={14} />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatJoinedDate(member.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                    ROLE_STYLES[member.role]
                  }`}
                >
                  {member.role}
                </span>
              </div>

              <p className="text-xs text-slate-300">{member.email}</p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPermissions(member)}
                  className="rounded-md border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  Permissions
                </button>
                {isOwner && member.role !== "Owner" ? (
                  <button
                    type="button"
                    onClick={() => setMemberToDelete(member)}
                    className="rounded-md p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    aria-label="Remove member"
                  >
                    <IconTrash size={14} />
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Active Members
          </p>
          <span className="rounded-full bg-sky-500/20 text-sky-300 px-2 py-0.5 text-[10px] font-semibold">
            {activeBadgeCount}
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-5 text-sm text-slate-400">
            Loading members...
          </div>
        ) : filteredActiveMembers.length === 0 ? (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-5 text-sm text-slate-400">
            No members found.
          </div>
        ) : (
          filteredActiveMembers.map((member) => (
            <article
              key={member.id || member.email}
              className="rounded-xl border border-slate-800/80 bg-slate-900/55 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {member.profile_photo_url ? (
                    <img
                      src={member.profile_photo_url}
                      alt={member.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <IconUser size={16} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold text-white">
                        {member.name}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          ROLE_STYLES[member.role]
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-400">
                      {member.email}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatJoinedDate(member.created_at)}
                    </p>
                  </div>
                </div>
                {isOwner && member.role !== "Owner" ? (
                  <button
                    type="button"
                    onClick={() => setMemberToDelete(member)}
                    className="rounded-md p-1.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                    aria-label="Remove member"
                  >
                    <IconTrash size={14} />
                  </button>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleOpenPermissions(member)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold bg-slate-800/80 text-sky-400"
              >
                Permissions
              </button>
            </article>
          ))
        )}
      </div>

      {filteredPendingInvites.length > 0 ? (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pending Invitations
          </p>
          {filteredPendingInvites.map((invite) => {
            const isActionLoading = Boolean(inviteActionLoadingById[invite.id]);

            return (
              <div
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-slate-700/80 bg-slate-900/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {invite.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTimeAgo(invite.created_at)}
                  </p>
                </div>
                {isOwner ? (
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => handleResend(invite.id)}
                      disabled={isActionLoading}
                      className="text-sky-400 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(invite.id)}
                      disabled={isActionLoading}
                      className="text-rose-400 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <MemberPermissionsFields
        open={Boolean(activeSliderMode)}
        mode={activeSliderMode || "permissions"}
        member={activeSliderMember}
        email={inviteEmail}
        permissions={
          activeSliderMode === "invite" ? invitePermissions : permissionDraft
        }
        onEmailChange={setInviteEmail}
        onChangePermission={(key, value) => {
          if (activeSliderMode === "invite") {
            handleInvitePermissionChange(key, value);
            return;
          }
          handleChangeDraftPermission(key, value);
        }}
        disableAllPermissions={!isOwner}
        isOwnerRow={activeSliderMember?.role === "Owner"}
        onClose={() => {
          if (activeSliderMode === "invite" && inviteLoading) return;
          if (activeSliderMode === "permissions" && permissionSaving) return;
          if (activeSliderMode === "invite") {
            resetInviteForm();
          }
          setActiveSliderMode(null);
          setActiveSliderMember(null);
        }}
        onSubmit={() => {
          if (activeSliderMode === "invite") {
            handleSendInvite();
            return;
          }
          handleSavePermissionChanges();
        }}
        loading={
          activeSliderMode === "invite" ? inviteLoading : permissionSaving
        }
      />

      <ConfirmModal
        open={Boolean(memberToDelete)}
        title="Remove Member?"
        message={`Are you sure you want to remove ${
          memberToDelete?.name || memberToDelete?.email || "this member"
        } from the vault?`}
        confirmLabel="Remove Member"
        cancelLabel="Cancel"
        onConfirm={handleDeleteMember}
        onCancel={() => setMemberToDelete(null)}
        confirmLoading={deleteLoading}
      />
    </section>
  );
}
