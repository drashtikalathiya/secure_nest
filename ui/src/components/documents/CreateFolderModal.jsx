import {
  IconBriefcase,
  IconFileDescription,
  IconFolder,
  IconHeart,
  IconHome,
  IconShield,
  IconStar,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import VisibilityAccessSelector from "../common/VisibilityAccessSelector";

const COLOR_OPTIONS = [
  { key: "blue", className: "bg-blue-500" },
  { key: "emerald", className: "bg-emerald-500" },
  { key: "amber", className: "bg-amber-500" },
  { key: "rose", className: "bg-rose-500" },
  { key: "violet", className: "bg-violet-500" },
];

const ICON_OPTIONS = [
  { key: "folder", icon: IconFolder, label: "Folder" },
  { key: "briefcase", icon: IconBriefcase, label: "Briefcase" },
  { key: "heart", icon: IconHeart, label: "Health" },
  { key: "document", icon: IconFileDescription, label: "Document" },
  { key: "star", icon: IconStar, label: "Star" },
  { key: "home", icon: IconHome, label: "Home" },
  { key: "shield", icon: IconShield, label: "Shield" },
];

const DUMMY_MEMBERS = [
  { id: "m-1", name: "Drashti", relation: "Member" },
  { id: "m-2", name: "dinebuddychef", relation: "Member" },
  { id: "m-3", name: "sifipaf888", relation: "Member" },
];

export default function CreateFolderModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode = "create",
  initialFolder = null,
  familyOptions = [],
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].key);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].key);
  const [selectedAccess, setSelectedAccess] = useState("private");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!open) {
      setFolderName("");
      setSelectedColor(COLOR_OPTIONS[0].key);
      setSelectedIcon(ICON_OPTIONS[0].key);
      setSelectedAccess("private");
      setSelectedMembers([]);
      return;
    }

    if (mode === "edit" && initialFolder) {
      setFolderName(initialFolder.name || "");
      setSelectedColor(initialFolder.color || COLOR_OPTIONS[0].key);
      setSelectedIcon(initialFolder.icon || ICON_OPTIONS[0].key);
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
      color: selectedColor,
      icon: selectedIcon,
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
              <p className="text-xs font-semibold text-slate-400">
                Select Icon or Color
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedColor(option.key)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                      selectedColor === option.key
                        ? "border-sky-300"
                        : "border-transparent"
                    }`}
                    aria-label={`Select ${option.key} color`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full ${option.className}`}
                    />
                  </button>
                ))}

                {ICON_OPTIONS.slice(4).map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedIcon === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedIcon(option.key)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border transition ${
                        isSelected
                          ? "border-sky-500/60 bg-sky-500/20 text-sky-200"
                          : "border-slate-800/80 bg-slate-800/60 text-slate-400 hover:text-slate-200"
                      }`}
                      aria-label={`Select ${option.label} icon`}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <VisibilityAccessSelector
                title="Who can see this folder?"
                visibility={selectedAccess}
                onVisibilityChange={setSelectedAccess}
                memberOptions={familyOptions.length && familyOptions}
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
