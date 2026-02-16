import {
  IconChevronDown,
  IconEye,
  IconLock,
  IconUsers,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

export default function PasswordFormDrawer({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  setForm,
  familyOptions = [],
  categoryOptions = [],
  saving = false,
}) {
  const toggleSharedMember = (id) => {
    setForm((prev) => {
      const current = new Set(prev.sharedWith || []);
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }

      return {
        ...prev,
        sharedWith: Array.from(current),
      };
    });
  };

  const setVisibility = (value) => {
    setForm((prev) => ({ ...prev, visibility: value }));
  };

  const visibilityCards = [
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

  return (
    <div
      className={`fixed inset-0 z-50 transition duration-300 mt-0 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70"
        aria-label="Close add password form"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col border-l border-slate-800/80 bg-[#121f36] shadow-2xl transition duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-800/80 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">Add Password</h3>
            <p className="text-xs text-slate-400">
              Save credentials and control who can view them.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/70 bg-slate-900/70 text-slate-400 hover:text-white"
            aria-label="Close add password form"
          >
            <IconX size={16} />
          </button>
        </div>

        <form
          id="add-password-form"
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
          onSubmit={onSubmit}
        >
          {/* <div className="grid gap-3 sm:grid-cols-2"> */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Site Name
            </label>
            <input
              value={form.name}
              onChange={onChange("name")}
              placeholder="e.g. Netflix"
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>
              <div className="relative mt-2">
                <select
                  value={form.category}
                  onChange={onChange("category")}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-200 focus:border-sky-500/60 focus:outline-none"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Website URL
              </label>
              <div className="relative mt-2">
                <input
                  value={form.websiteUrl}
                  onChange={onChange("websiteUrl")}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
                />
              </div>
            </div>
          </div>
          {/* </div> */}

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Username / Email
            </label>
            <input
              value={form.value}
              onChange={onChange("value")}
              placeholder="username@example.com"
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                value={form.password}
                onChange={onChange("password")}
                type="password"
                className="w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
              />
              <IconEye
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/70 pt-4">
            <p className="text-sm font-semibold text-slate-200">
              Who can see this password?
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {visibilityCards.map((option) => {
                const Icon = option.icon;
                const isActive = form.visibility === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setVisibility(option.key)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-sky-500/60 bg-sky-500/10"
                        : "border-slate-800/70 bg-slate-900/60"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? "text-sky-300" : "text-slate-500"}
                    />
                    <p className="mt-2 text-xs font-semibold text-slate-200">
                      {option.title}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {option.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/50">
              <p className="border-b border-slate-800/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Select Family Members
              </p>
              <div>
                {familyOptions.map((member) => {
                  const checked = Boolean(
                    (form.sharedWith || []).includes(member.id),
                  );
                  const disabled = form.visibility !== "specific";

                  return (
                    <label
                      key={member.id}
                      className={`flex items-center justify-between border-b border-slate-800/60 px-3 py-2.5 last:border-b-0 ${
                        disabled ? "opacity-60" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-200">
                          {getInitials(member.name)}
                        </span>
                        <span>
                          <span className="block text-xs font-semibold text-slate-200">
                            {member.name}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {member.relation}
                          </span>
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                        checked={checked}
                        onChange={() => toggleSharedMember(member.id)}
                        disabled={disabled}
                      />
                    </label>
                  );
                })}
                {familyOptions.length === 0 ? (
                  <div className="px-3 py-3 text-[11px] text-slate-500">
                    No family members found.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </form>

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
              type="submit"
              form="add-password-form"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Password"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
