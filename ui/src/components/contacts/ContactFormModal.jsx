import RightSlider from "../common/RightSlider";
import { IconChevronDown } from "@tabler/icons-react";

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
    <RightSlider
      open={open}
      onClose={onClose}
      title={editingId ? "Edit Contact" : "Add New Contact"}
      subtitle="Critical contact details accessible during urgent situations."
      maxWidthClass="max-w-[460px]"
      panelClassName="bg-[#121f36]"
      closeAriaLabel="Close add contact form"
    >
      <form
        id="add-contact-form"
        onSubmit={onSubmit}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
      >
        <div className="flex flex-col gap-3">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Relationship
            </label>
            <div className="relative mt-2">
              <select
                value={newContactForm.relationship}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    relationship: event.target.value,
                  }))
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-sm text-slate-200 focus:border-sky-500/60 focus:outline-none"
              >
                {relationshipOptions.map((option) => (
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

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Primary Phone Number
            </span>
            <input
              type="text"
              value={newContactForm.phone}
              onChange={(event) =>
                setNewContactForm((prev) => ({
                  ...prev,
                  phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              inputMode="numeric"
              maxLength={10}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
              placeholder="10-digit number"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Category
            </label>
            <div className="relative mt-2">
              <select
                value={newContactForm.category}
                onChange={(event) =>
                  setNewContactForm((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
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

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
    </RightSlider>
  );
}
