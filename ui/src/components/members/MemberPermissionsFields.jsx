import {
  IconAddressBook,
  IconChevronDown,
  IconFileDescription,
  IconInfoCircle,
  IconKey,
  IconMail,
  IconSend,
} from "@tabler/icons-react";
import RightSlider from "../common/RightSlider";

const accessItems = [
  {
    key: "passwordAccess",
    title: "Passwords",
    icon: IconKey,
  },
  {
    key: "contactsAccess",
    title: "Emergency Contacts",
    icon: IconAddressBook,
  },
  {
    key: "documentsAccess",
    title: "Legal Documents",
    icon: IconFileDescription,
  },
];

const managementItems = [
  {
    key: "inviteOthers",
    title: "Invite Others",
    subtitle: "Can send invitations to new members",
  },
  {
    key: "exportData",
    title: "Export Data",
    subtitle: "Authorized to download vault archives",
  },
];

function PermissionToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full border transition ${
        checked
          ? "border-sky-500/70 bg-sky-500/80"
          : "border-slate-700 bg-slate-900/60"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function PermissionFieldsContent({
  email,
  onEmailChange,
  permissions,
  onChangePermission,
  disabled = false,
  noticeText,
  showEmailField = false,
}) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
      {showEmailField ? (
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
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
              value={email || ""}
              onChange={(event) => onEmailChange?.(event.target.value)}
              className="w-full rounded-lg border border-slate-800/80 bg-slate-950/40 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            An invitation link will be sent to this email.
          </p>
        </div>
      ) : null}

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Core Vault Access
      </p>

      <div className="space-y-6">
        {accessItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
                <item.icon size={20} />
              </span>
              <p className="text-xs font-semibold text-slate-200">{item.title}</p>
            </div>

            <div className="relative">
              <select
                value={
                  permissions?.[item.key] === "view" ||
                  permissions?.[item.key] === "edit"
                    ? permissions[item.key]
                    : "none"
                }
                onChange={(event) =>
                  onChangePermission(item.key, event.target.value)
                }
                disabled={disabled}
                className="appearance-none rounded-md border border-slate-700 bg-slate-950/90 py-1.5 pl-2.5 pr-8 text-[11px] font-semibold text-slate-200 focus:border-sky-500/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="none">No Access</option>
                <option value="view">View Only</option>
                <option value="edit">Edit Access</option>
              </select>
              <IconChevronDown
                size={13}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Management Rights
      </p>

      <div className="space-y-4">
        {managementItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-200">{item.title}</p>
              <p className="text-[11px] text-slate-500">{item.subtitle}</p>
            </div>
            <PermissionToggle
              checked={Boolean(permissions?.[item.key])}
              onChange={(value) => onChangePermission(item.key, value)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {noticeText ? (
        <div className="rounded-lg border border-slate-800/70 bg-sky-500/10 px-3 py-2 text-[11px] text-slate-300">
          <p className="inline-flex items-center gap-1.5">
            <IconInfoCircle size={14} className="text-sky-400" />
            {noticeText}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function MemberPermissionsFields({
  open,
  mode = "permissions",
  member = null,
  email = "",
  onEmailChange,
  permissions,
  onChangePermission,
  loading = false,
  disableAllPermissions = false,
  isOwnerRow = false,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  const isInviteMode = mode === "invite";
  const title = isInviteMode ? "Invite Family Member" : "Access Permissions";
  const subtitle = isInviteMode
    ? "Set access permissions before sending invitation"
    : `Managing access for ${member?.name || member?.email || "member"}`;
  const noticeText = isInviteMode
    ? "These permissions will be applied when the member accepts invite."
    : "Changes to permissions are logged and visible to the owner.";
  const fieldsDisabled = isInviteMode
    ? loading
    : disableAllPermissions || isOwnerRow || loading;
  const actionDisabled = isInviteMode
    ? loading
    : disableAllPermissions || isOwnerRow || loading;

  return (
    <RightSlider
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidthClass="max-w-[360px]"
      panelClassName="bg-[#121f36]"
      closeAriaLabel={isInviteMode ? "Close invite drawer" : "Close permission drawer"}
    >
      <PermissionFieldsContent
        email={email}
        onEmailChange={onEmailChange}
        permissions={permissions}
        onChangePermission={onChangePermission}
        disabled={fieldsDisabled}
        noticeText={noticeText}
        showEmailField={isInviteMode}
      />

      <div className="space-y-2 border-t border-slate-800/80 px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={actionDisabled}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInviteMode ? <IconSend size={14} /> : null}
            {loading
              ? isInviteMode
                ? "Sending..."
                : "Saving..."
              : isInviteMode
                ? "Send Invite"
                : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </RightSlider>
  );
}
