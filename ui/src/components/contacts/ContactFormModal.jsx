import { IconX } from "@tabler/icons-react";

export default function ContactFormModal({
  open,
  editingId,
  newContactForm,
  setNewContactForm,
  relationshipOptions,
  categoryOptions,
  submitLoading,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70"
        aria-label="Close add contact form"
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-slate-800/80 bg-[#121f36] shadow-2xl transition duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-800/80 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {editingId ? "Edit Contact" : "Add New Contact"}
            </h3>
            <p className="text-xs text-slate-400">
              Critical contact details accessible during urgent situations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close add contact form"
          >
            <IconX size={16} />
          </button>
        </div>

        <form
          id="add-contact-form"
          onSubmit={onSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
        >
          <div className="flex flex-col gap-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Full Name
              </span>
              <input
                type="text"
                value={newContactForm.name}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                placeholder="Enter full name"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Relationship
              </span>
              <select
                value={newContactForm.relationship}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    relationship: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/70 focus:outline-none"
              >
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Primary Phone Number
              </span>
              <input
                type="text"
                value={newContactForm.phone}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </span>
              <input
                type="email"
                value={newContactForm.email}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                placeholder="contact@example.com"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Category
              </span>
              <select
                value={newContactForm.category}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/70 focus:outline-none"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Physical Address
              </span>
              <input
                type="text"
                value={newContactForm.address}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                placeholder="Street address, City, State, ZIP"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Additional Notes or Instructions
              </span>
              <textarea
                rows={3}
                value={newContactForm.notes}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                placeholder="Enter any special instructions or emergency protocols..."
              />
            </label>
          </div>
        </form>

        <div className="space-y-2 border-t border-slate-800/80 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitLoading}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-contact-form"
              disabled={submitLoading}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitLoading ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
