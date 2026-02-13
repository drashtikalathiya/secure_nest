import { IconSend, IconSearch, IconX, IconUserPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import PageHeader from "../components/common/PageHeader";
import { ROLE_STYLES } from "../const/membersData";
import { useAuth } from "../context/AuthContext";
import {
  deleteFamilyMember,
  getFamilyMembers,
  updateMemberPermissions,
} from "../services/usersApi";
import { auth } from "../services/firebase";
import {
  cancelInvitation,
  createInvitation,
  getPendingInvitations,
  resendInvitation,
} from "../services/invitationsApi";

const getInitials = (name, email) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).slice(0, 2);
    return parts
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2);
  }

  return String(email || "")
    .slice(0, 2)
    .toUpperCase();
};

const normalizeMember = (member) => {
  const roleLabel = member.role === "owner" ? "Owner" : "Member";
  const name = member.name || member.email?.split("@")[0] || "Unknown";

  return {
    id: member.id,
    name,
    email: member.email,
    role: roleLabel,
    initials: getInitials(name, member.email),
    permissions:
      roleLabel === "Owner"
        ? { view: true, edit: true, delete: true }
        : {
            view: Boolean(member.permission_view),
            edit: Boolean(member.permission_edit),
            delete: Boolean(member.permission_delete),
          },
  };
};

const getMemberKey = (member) => member.id || member.email;

const getDefaultPermissions = (role) => ({
  view: true,
  edit: role === "Owner",
  delete: role === "Owner",
});

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

function Toggle({ checked, onToggle, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative h-5 w-9 rounded-full border border-slate-700 transition ${
        checked ? "bg-sky-500/80" : "bg-slate-900/60"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition ${
          checked ? "left-4" : "left-1"
        }`}
      />
    </button>
  );
}

export default function Members() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [permissionLoadingById, setPermissionLoadingById] = useState({});
  const [permissions, setPermissions] = useState({});
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const normalizedMembers = members.map(normalizeMember);
    const normalizedInvites = pendingInvites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: "Pending",
      status: "pending",
      expires_at: invite.expires_at,
      created_at: invite.created_at,
    }));

    const allRows = [...normalizedMembers, ...normalizedInvites];
    if (!query) return allRows;

    return allRows.filter((row) =>
      String(row.name || row.email || "")
        .toLowerCase()
        .includes(query),
    );
  }, [members, pendingInvites, search]);

  const activeMembers = filteredMembers.filter(
    (row) => row.status !== "pending",
  );
  const visiblePendingInvites = filteredMembers.filter(
    (row) => row.status === "pending",
  );

  useEffect(() => {
    const normalizedMembers = members.map(normalizeMember);
    setPermissions((prev) => {
      const next = {};
      normalizedMembers.forEach((member) => {
        const key = getMemberKey(member);
        next[key] =
          prev[key] || member.permissions || getDefaultPermissions(member.role);
      });
      return next;
    });
  }, [members]);

  const loadData = useCallback(async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const [membersRes, invitesRes] = await Promise.all([
        getFamilyMembers(token),
        isOwner ? getPendingInvitations(token) : Promise.resolve({ data: [] }),
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

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setInviteLoading(true);
      const token = await auth.currentUser.getIdToken();
      await createInvitation(token, {
        email: inviteEmail.trim(),
        role: "member",
      });

      toast.success("Invitation sent.");
      setInviteEmail("");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResend = async (invitationId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      setActionLoadingById((prev) => ({ ...prev, [invitationId]: true }));
      await resendInvitation(token, invitationId);
      toast.success("Invitation resent.");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to resend invitation.");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleCancel = async (invitationId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      setActionLoadingById((prev) => ({ ...prev, [invitationId]: true }));
      await cancelInvitation(token, invitationId);
      toast.success("Invitation deleted.");
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to delete invitation.");
    } finally {
      setActionLoadingById((prev) => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleTogglePermission = async (member, key) => {
    const memberKey = getMemberKey(member);
    const current =
      permissions[memberKey] || getDefaultPermissions(member.role);
    const next = { ...current, [key]: !current[key] };

    setPermissions((prev) => ({
      ...prev,
      [memberKey]: next,
    }));
    setPermissionLoadingById((prev) => ({ ...prev, [memberKey]: true }));

    try {
      const token = await auth.currentUser.getIdToken();
      await updateMemberPermissions(token, member.id, next);
    } catch (error) {
      setPermissions((prev) => ({
        ...prev,
        [memberKey]: current,
      }));
      toast.error(error?.message || "Failed to update permissions.");
    } finally {
      setPermissionLoadingById((prev) => ({ ...prev, [memberKey]: false }));
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      setDeleteLoading(true);
      const token = await auth.currentUser.getIdToken();
      const memberKey = getMemberKey(memberToDelete);
      setActionLoadingById((prev) => ({ ...prev, [memberKey]: true }));
      await deleteFamilyMember(token, memberToDelete.id);
      toast.success("Member deleted.");
      setMemberToDelete(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to delete member.");
    } finally {
      const memberKey = getMemberKey(memberToDelete);
      setActionLoadingById((prev) => ({ ...prev, [memberKey]: false }));
      setDeleteLoading(false);
    }
  };

  return (
    <section>
      <PageHeader
        title="Family Members"
        subtitle="Owner + accepted members are active. Pending invites can be resent or deleted."
      />
      {isOwner ? (
        <div className="rounded-3xl border border-slate-800/70 bg-dashboard-card p-6">
          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                placeholder="family@example.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Initial Role
              </label>
              <div className="mt-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-2.5 text-sm font-medium text-slate-200">
                Member
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={inviteLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-strong px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
              >
                <IconSend size={16} />
                {inviteLoading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Current Members ({filteredMembers.length})
        </p>
        <div className="relative w-full max-w-sm">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search family..."
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/60 py-3 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 px-5 py-4 text-sm text-slate-300">
            Loading members...
          </div>
        ) : null}

        {!loading &&
        activeMembers.length === 0 &&
        visiblePendingInvites.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 px-5 py-4 text-sm text-slate-400">
            No members found.
          </div>
        ) : null}

        {activeMembers.map((member) => (
          <div
            key={member.id || member.email}
            className="flex flex-col gap-4 rounded-2xl border border-slate-800/90 bg-slate-900/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between relative"
          >
            <div className="flex items-start justify-between gap-3 sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-500/60 bg-transparent text-xl font-semibold text-slate-100">
                  {member.initials}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">
                      {member.name}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                        ROLE_STYLES[member.role]
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-slate-800/70 sm:hidden" />

            {(() => {
              const memberKey = getMemberKey(member);
              const memberPerms =
                permissions[memberKey] || getDefaultPermissions(member.role);
              const isOwnerRow = member.role === "Owner";
              const isPermissionLoading = Boolean(
                permissionLoadingById[memberKey],
              );
              const isDeleteLoading = Boolean(actionLoadingById[memberKey]);
              const disablePermissions =
                !isOwner || isOwnerRow || isPermissionLoading;
              const canDeleteMember = isOwner && !isOwnerRow;

              return (
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="grid flex-1 grid-cols-3 gap-3 text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:flex sm:items-center sm:gap-4">
                    <div className="flex flex-col text-xs items-center gap-2">
                      View
                      <Toggle
                        checked={memberPerms.view}
                        onToggle={() => handleTogglePermission(member, "view")}
                        disabled={disablePermissions}
                      />
                    </div>
                    <div className="flex flex-col text-xs items-center gap-2">
                      Edit
                      <Toggle
                        checked={memberPerms.edit}
                        onToggle={() => handleTogglePermission(member, "edit")}
                        disabled={disablePermissions}
                      />
                    </div>
                    <div className="flex flex-col text-xs items-center gap-2">
                      Delete
                      <Toggle
                        checked={memberPerms.delete}
                        onToggle={() =>
                          handleTogglePermission(member, "delete")
                        }
                        disabled={disablePermissions}
                      />
                    </div>
                  </div>
                  {canDeleteMember ? (
                    <button
                      type="button"
                      onClick={() => setMemberToDelete(member)}
                      disabled={isDeleteLoading}
                      className="flex h-6 w-6 absolute top-[-12px] right-[-6px]  rounded-full border border-rose-400  items-center justify-center text-rose-400 transition disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete member"
                    >
                      <IconX size={16} />
                    </button>
                  ) : null}
                </div>
              );
            })()}
          </div>
        ))}

        {visiblePendingInvites.map((invite) => {
          const isActionLoading = Boolean(actionLoadingById[invite.id]);
          return (
            <div
              key={invite.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-500/60 bg-transparent text-slate-100">
                  <IconUserPlus size={16} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-200">
                    {invite.email}
                  </p>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
                    Pending
                  </span>
                  <p className="w-full text-xs text-slate-500">
                    {formatTimeAgo(invite.created_at)}
                  </p>
                </div>
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
