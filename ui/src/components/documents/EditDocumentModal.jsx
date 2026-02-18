import { IconFileDescription, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function EditDocumentModal({ open, onClose, document, onSave }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setTitle("");
      return;
    }

    setName(document?.name || "");
    setTitle(document?.title || "");
  }, [document, open]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() && !title.trim()) return;

    onSave({
      name: name.trim(),
      title: title.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-dashboard-card shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <IconFileDescription size={18} className="text-sky-300" />
            Edit Document
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close edit document modal"
          >
            <IconX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Document Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Estate Planning"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Document Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Trust Agreement 2024"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
            />
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() && !title.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
