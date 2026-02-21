import { useState } from "react";
import { IconChevronDown, IconEye, IconEyeOff } from "@tabler/icons-react";
import RightSlider from "../common/RightSlider";
import VisibilityAccessSelector from "../common/VisibilityAccessSelector";

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
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <RightSlider
      open={isOpen}
      onClose={onClose}
      title="Add Password"
      subtitle="Save credentials and control who can view them."
      maxWidthClass="max-w-[520px]"
      panelClassName="bg-[#121f36]"
      closeAriaLabel="Close add password form"
    >
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
            placeholder="username@example.com / user_name"
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
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800/80 hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/70 pt-4">
          <VisibilityAccessSelector
            title="Who can see this password?"
            visibility={form.visibility}
            onVisibilityChange={setVisibility}
            memberOptions={familyOptions}
            sharedWith={form.sharedWith || []}
            onToggleMember={toggleSharedMember}
          />
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
    </RightSlider>
  );
}
