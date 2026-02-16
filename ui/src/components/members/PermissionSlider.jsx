import { IconInfoCircle } from "@tabler/icons-react";
import RightSlider from "../common/RightSlider";

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

const accessItems = [
  {
    key: "view",
    title: "View Access",
    subtitle: "Can see shared vault records.",
  },
  {
    key: "edit",
    title: "Edit Access",
    subtitle: "Can create and update shared records.",
  },
  {
    key: "delete",
    title: "Delete Access",
    subtitle: "Can remove shared records.",
  },
];

export default function PermissionSlider({
  open,
  member,
  permissions,
  saving,
  isOwnerRow,
  disableAllPermissions = false,
  onToggle,
  onClose,
  onSave,
}) {
  if (!open || !member) return null;

  return (
    <RightSlider
      open={open}
      onClose={onClose}
      title="Access Permissions"
      subtitle={`Manage permissions for ${member.name || member.email}`}
      maxWidthClass="max-w-[360px]"
      panelClassName="bg-[#121f36]"
      closeAriaLabel="Close permission drawer"
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Core Vault Access
        </p>

        <div className="space-y-3">
          {accessItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500">{item.subtitle}</p>
              </div>
              <Toggle
                checked={Boolean(permissions[item.key])}
                onToggle={() => onToggle(item.key)}
                disabled={disableAllPermissions || isOwnerRow || saving}
              />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-800/70 bg-sky-500/10 px-3 py-2 text-[11px] text-slate-300">
          <p className="inline-flex items-center gap-1.5">
            <IconInfoCircle size={14} className="text-sky-400" />
            Permission updates are logged for family owner visibility.
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-800/80 px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={disableAllPermissions || saving || isOwnerRow}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </RightSlider>
  );
}
