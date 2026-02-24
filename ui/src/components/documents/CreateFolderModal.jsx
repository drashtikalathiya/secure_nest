import { IconFolder, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import VisibilityAccessSelector from "../common/VisibilityAccessSelector";

export default function CreateFolderModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode = "create",
  initialFolder = null,
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedAccess, setSelectedAccess] = useState("private");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!open) {
      setFolderName("");
      setSelectedAccess("private");
      setSelectedMembers([]);
      return;
    }

    if (mode === "edit" && initialFolder) {
      setFolderName(initialFolder.name || "");
      setSelectedAccess(initialFolder.visibility || "private");
      setSelectedMembers(
        Array.isArray(initialFolder.sharedWith) ? initialFolder.sharedWith : [],
      );
    }
  }, [initialFolder, mode, open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = folderName.trim();
    if (!trimmedName) return;

    const payload = {
      name: trimmedName,
      visibility: selectedAccess,
      sharedWith: selectedMembers,
    };

    if (mode === "edit") {
      onUpdate?.(payload);
    } else {
      onCreate?.(payload);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((item) => item !== memberId)
        : [...prev, memberId],
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-800/90 bg-[#141f35] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5">
          <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <IconFolder size={15} className="text-sky-400" />
            {mode === "edit" ? "Edit Folder" : "Create New Folder"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close create folder modal"
          >
            <IconX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-4 py-4">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">
                Folder Name
              </span>
              <input
                type="text"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="e.g. Summer Vacation 2024"
                className="w-full rounded-lg border border-sky-500/70 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </label>

            <div>
              <VisibilityAccessSelector
                title="Who can see this folder?"
                visibility={selectedAccess}
                onVisibilityChange={setSelectedAccess}
                sharedWith={selectedMembers}
                onToggleMember={toggleMember}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 bg-slate-950/25 px-4 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === "edit" ? "Save Changes" : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
