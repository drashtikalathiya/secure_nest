import { IconLock, IconUsers, IconUsersGroup } from "@tabler/icons-react";

const ACCESS_OPTIONS = [
  {
    key: "private",
    title: "Private",
    subtitle: "Only visible to me",
    icon: IconLock,
  },
  {
    key: "family",
    title: "Entire Family",
    subtitle: "Shared with all members",
    icon: IconUsersGroup,
  },
  {
    key: "specific",
    title: "Specific Members",
    subtitle: "Choose who can access",
    icon: IconUsers,
  },
];

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export default function VisibilityAccessSelector({
  title,
  visibility,
  onVisibilityChange,
  memberOptions = [],
  sharedWith = [],
  onToggleMember,
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-200">{title}</p>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {ACCESS_OPTIONS.map((option) => {
          const AccessIcon = option.icon;
          const isSelected = visibility === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onVisibilityChange(option.key)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                isSelected
                  ? "border-sky-500/60 bg-sky-500/10"
                  : "border-slate-800/70 bg-slate-900/60"
              }`}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                  isSelected
                    ? "bg-sky-500/20 text-sky-200"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                <AccessIcon size={14} />
              </span>
              <p className="mt-2 text-xs font-semibold text-slate-200">
                {option.title}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">{option.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/50">
        <p className="border-b border-slate-800/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Select Family Members
        </p>
        <div>
          {memberOptions.map((member) => {
            const checked = Boolean(sharedWith.includes(member.id));
            const disabled = visibility !== "specific";
            const relation = member.relation || member.role || "Member";

            return (
              <label
                key={member.id}
                className={`flex items-center justify-between border-b border-slate-800/60 px-3 py-2.5 last:border-b-0 ${
                  disabled ? "opacity-60" : "cursor-pointer"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-200">
                    {getInitials(member.name)}
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-200">
                      {member.name}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {relation}
                    </span>
                  </span>
                </span>

                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                  checked={checked}
                  onChange={() => onToggleMember(member.id)}
                  disabled={disabled}
                />
              </label>
            );
          })}

          {memberOptions.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-slate-500">
              No family members found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
