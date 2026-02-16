import { IconMail, IconSend, IconUserPlus, IconX } from "@tabler/icons-react";

const permissionItems = [
  {
    key: "view",
    label: "View family activities",
    description: "Allows member to see shared vault items.",
  },
  {
    key: "edit",
    label: "Edit shared content",
    description: "Allows member to create and edit shared records.",
  },
  {
    key: "delete",
    label: "Delete shared content",
    description: "Allows member to delete shared records.",
  },
];

export default function InviteMemberModal({
  open,
  email,
  onEmailChange,
  initialPermissions,
  onTogglePermission,
  onClose,
  onSubmit,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800/90 bg-dashboard-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
            <IconUserPlus size={20} className="text-primary" />
            Invite Family Member
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close invite modal"
          >
            <IconX size={14} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1.5 block text-[11px] text-sm font-semibold uppercase tracking-wide text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <IconMail
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="email"
                placeholder="e.g. member@family.com"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              An invitation link will be sent to this email.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/25 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Configure Initial Permissions
            </p>
            <div className="mt-3 space-y-3">
              {permissionItems.map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start gap-2.5"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(initialPermissions[item.key])}
                    onChange={() => onTogglePermission(item.key)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                  />
                  <span>
                    <span className="block text-xs font-semibold text-slate-200">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {item.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconSend size={14} />
            {loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
