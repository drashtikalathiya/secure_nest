import { IconChevronDown, IconX } from "@tabler/icons-react";

export default function PasswordFormDrawer({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
  setForm,
  strength,
  categoryOptions,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition duration-300 ${
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
        className={`absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-slate-800/80 bg-slate-900/95 p-6 shadow-2xl transition duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Add New Item</h3>
            <p className="text-xs text-slate-400">
              Fill in the details to secure a new credential.
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
          className="mt-6 flex-1 space-y-4 overflow-y-auto"
          onSubmit={onSubmit}
        >
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Service Name
            </label>
            <input
              value={form.name}
              onChange={onChange("name")}
              placeholder="e.g. Netflix, Amazon"
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Category
            </label>
            <div className="relative mt-2">
              <select
                value={form.category}
                onChange={onChange("category")}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 focus:border-sky-500/60 focus:outline-none"
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
              Username / Email
            </label>
            <input
              value={form.value}
              onChange={onChange("value")}
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              value={form.password}
              onChange={onChange("password")}
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
            <div className="mt-3 h-2 w-full rounded-full bg-slate-800/80">
              <div
                className="h-2 rounded-full bg-emerald-400"
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={onChange("notes")}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Owner & Sharing
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Alexander (Me)", "Sarah", "+ Add Family"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    label === "Alexander (Me)"
                      ? "border-sky-500/50 bg-sky-500/20 text-sky-200"
                      : "border-slate-800/70 bg-slate-900/70 text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Access Level
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className={`rounded-xl border px-3 py-3 text-left text-xs ${
                  form.access === "View"
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-200"
                    : "border-slate-800/70 bg-slate-900/70 text-slate-400"
                }`}
                onClick={() => setForm((prev) => ({ ...prev, access: "View" }))}
              >
                <p className="font-semibold text-slate-200">View Only</p>
                <p className="text-[10px] text-slate-500">
                  Can see and copy, cannot edit.
                </p>
              </button>
              <button
                type="button"
                className={`rounded-xl border px-3 py-3 text-left text-xs ${
                  form.access === "Full"
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-200"
                    : "border-slate-800/70 bg-slate-900/70 text-slate-400"
                }`}
                onClick={() => setForm((prev) => ({ ...prev, access: "Full" }))}
              >
                <p className="font-semibold text-slate-200">Full Access</p>
                <p className="text-[10px] text-slate-500">
                  Can view, edit and delete.
                </p>
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800/70 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-800/70 bg-slate-900/70 py-2 text-sm text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-password-form"
            className="flex-1 rounded-xl bg-primary-strong py-2 text-sm font-semibold text-white"
          >
            Save Item
          </button>
        </div>
      </aside>
    </div>
  );
}
