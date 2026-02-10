import {
  IconUserPlus,
  IconSend,
  IconSearch,
  IconChevronDown,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { FAMILY_MEMBERS, ROLE_STYLES } from "../const/membersData";

const INVITE_META = "Invitation sent 2 hours ago";

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
  const [search, setSearch] = useState("");
  const [permissions, setPermissions] = useState(() => {
    return FAMILY_MEMBERS.reduce((acc, member) => {
      acc[member.email] = member.permissions || {
        view: member.role === "Owner",
        edit: member.role === "Owner",
        delete: member.role === "Owner",
      };
      return acc;
    }, {});
  });

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return FAMILY_MEMBERS;
    return FAMILY_MEMBERS.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [search]);

  const activeMembers = filteredMembers.filter(
    (member) => member.status !== "Invited",
  );
  const invitedMembers = filteredMembers.filter(
    (member) => member.status === "Invited",
  );

  return (
    <section>
      <PageHeader
        title="Family Members"
        subtitle="Invite, manage roles, and control access for your family."
      />
      <div className="rounded-3xl border border-slate-800/70 bg-dashboard-card p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
            <IconUserPlus size={16} />
          </span>
          Invite New Member
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              placeholder="family@example.com"
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Initial Role
            </label>
            <div className="relative mt-2">
              <select className="w-full cursor-pointer appearance-none rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-2.5 pr-9 text-sm text-slate-200 focus:border-sky-500/60 focus:outline-none">
                <option>Member</option>
                <option>Owner</option>
              </select>
              <IconChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)] lg:w-auto"
            >
              <IconSend size={16} />
              Send Invitation
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {activeMembers.map((member) => {
          const memberPerms = permissions[member.email] || {
            view: false,
            edit: false,
            delete: false,
          };
          const isOwner = member.role === "Owner";

          const updatePermission = (key) => {
            if (isOwner) return;
            setPermissions((prev) => ({
              ...prev,
              [member.email]: {
                ...memberPerms,
                [key]: !memberPerms[key],
              },
            }));
          };

          return (
            <div
              key={member.email}
              className="flex flex-col gap-4 rounded-2xl border border-slate-800/90 bg-slate-900/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start justify-between gap-3 sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
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
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/70 text-slate-400 transition hover:text-white sm:hidden"
                  aria-label="Member actions"
                >
                  <IconDotsVertical size={16} />
                </button>
              </div>

              <div className="h-px w-full bg-slate-800/70 sm:hidden" />

              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="grid flex-1 grid-cols-3 gap-3 text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:flex sm:items-center sm:gap-4">
                  <div className="flex flex-col items-center gap-2">
                    View
                    <Toggle
                      checked={memberPerms.view}
                      onToggle={() => updatePermission("view")}
                      disabled={isOwner}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    Edit
                    <Toggle
                      checked={memberPerms.edit}
                      onToggle={() => updatePermission("edit")}
                      disabled={isOwner}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    Delete
                    <Toggle
                      checked={memberPerms.delete}
                      onToggle={() => updatePermission("delete")}
                      disabled={isOwner}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-800/80 bg-slate-900/70 text-slate-400 transition hover:text-white sm:flex"
                  aria-label="Member actions"
                >
                  <IconDotsVertical size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {invitedMembers.map((invite) => (
          <div
            key={invite.email}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 px-5 py-4"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-200">
                  {invite.email}
                </p>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase text-amber-300">
                  Pending
                </span>
              </div>
              <p className="text-xs text-slate-500">{INVITE_META}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button className="text-sky-400 hover:text-sky-300">
                Resend
              </button>
              <button className="text-rose-400 hover:text-rose-300">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
