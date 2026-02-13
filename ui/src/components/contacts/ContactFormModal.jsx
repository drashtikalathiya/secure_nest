import { IconBuildingStore, IconStar, IconX } from "@tabler/icons-react";

export default function ContactFormModal({
  open,
  editingId,
  formType,
  setFormType,
  primaryForm,
  setPrimaryForm,
  serviceForm,
  setServiceForm,
  relationshipOptions,
  serviceCategoryOptions,
  submitLoading,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-dashboard-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              {editingId ? "Edit Contact" : "Add New Contact"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              This information is shared with all family members.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close modal"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
          <button
            type="button"
            onClick={() => setFormType("primary")}
            className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
              formType === "primary"
                ? "bg-sky-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <IconStar size={14} />
            Primary Contact
          </button>
          <button
            type="button"
            onClick={() => setFormType("service")}
            className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
              formType === "service"
                ? "bg-sky-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <IconBuildingStore size={14} />
            Additional Service
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {formType === "primary" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Contact Name
                  </span>
                  <input
                    type="text"
                    value={primaryForm.name}
                    onChange={(event) =>
                      setPrimaryForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                    placeholder="e.g. Michael Thorne"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Relationship
                  </span>
                  <select
                    value={primaryForm.relationship}
                    onChange={(event) =>
                      setPrimaryForm((prev) => ({
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
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Phone Number
                  </span>
                  <input
                    type="text"
                    value={primaryForm.phone}
                    onChange={(event) =>
                      setPrimaryForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                    placeholder="(555) 000-0000"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email Address
                  </span>
                  <input
                    type="email"
                    value={primaryForm.email}
                    onChange={(event) =>
                      setPrimaryForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                    placeholder="contact@example.com"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Physical Address
                </span>
                <input
                  type="text"
                  value={primaryForm.address}
                  onChange={(event) =>
                    setPrimaryForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="123 Emergency St, Safety City, WA"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </span>
                <textarea
                  rows={3}
                  value={primaryForm.notes}
                  onChange={(event) =>
                    setPrimaryForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="e.g. Has spare key and can access home alarm panel."
                />
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Service Name
                  </span>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(event) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                    placeholder="e.g. SafeGuard Security"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Service Category
                  </span>
                  <select
                    value={serviceForm.category}
                    onChange={(event) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/70 focus:outline-none"
                  >
                    {serviceCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Phone Number
                </span>
                <input
                  type="text"
                  value={serviceForm.phone}
                  onChange={(event) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="(555) 000-0000"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Website / Portal
                </span>
                <input
                  type="url"
                  value={serviceForm.website}
                  onChange={(event) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      website: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="https://serviceprovider.com/portal"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Service Address
                </span>
                <input
                  type="text"
                  value={serviceForm.address}
                  onChange={(event) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      address: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="Business address or service center location"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </span>
                <textarea
                  rows={3}
                  value={serviceForm.notes}
                  onChange={(event) =>
                    setServiceForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  placeholder="e.g. Preferred technician and service entry notes."
                />
              </label>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              {submitLoading
                ? "Saving..."
                : formType === "primary"
                  ? "Save Contact"
                  : "Save Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
