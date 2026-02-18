import {
  IconBriefcase,
  IconFileDescription,
  IconFolder,
  IconHeart,
  IconHome,
  IconLock,
  IconUsersGroup,
  IconShield,
  IconStar,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

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

const ACCESS_OPTIONS = [
  {
    key: "private",
    title: "Private",
    description: "Only visible to me",
    icon: IconLock,
  },
  {
    key: "family",
    title: "Entire Family",
    description: "Shared with all members",
    icon: IconUsersGroup,
  },
  {
    key: "specific",
    title: "Specific Members",
    description: "Choose who can access",
    icon: IconUsers,
  },
];

const DUMMY_MEMBERS = [
  { id: "m-1", name: "Drashti", role: "Member" },
  { id: "m-2", name: "dinebuddychef", role: "Member" },
  { id: "m-3", name: "sifipaf888", role: "Member" },
];

export default function CreateFolderModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode = "create",
  initialFolder = null,
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].key);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].key);
  const [selectedAccess, setSelectedAccess] = useState(ACCESS_OPTIONS[0].key);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (!open) {
      setFolderName("");
      setSelectedColor(COLOR_OPTIONS[0].key);
      setSelectedIcon(ICON_OPTIONS[0].key);
      setSelectedAccess(ACCESS_OPTIONS[0].key);
      setSelectedMembers([]);
      return;
    }

    if (mode === "edit" && initialFolder) {
      setFolderName(initialFolder.name || "");
      setSelectedColor(initialFolder.color || COLOR_OPTIONS[0].key);
      setSelectedIcon(initialFolder.icon || ICON_OPTIONS[0].key);
      setSelectedAccess(initialFolder.visibility || ACCESS_OPTIONS[0].key);
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
              <span className="text-xs font-semibold text-slate-400">Folder Name</span>
              <input
                type="text"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="e.g. Summer Vacation 2024"
                className="w-full rounded-lg border border-sky-500/70 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </label>

            <div>
              <p className="text-xs font-semibold text-slate-400">Select Icon or Color</p>
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
                    <span className={`h-5 w-5 rounded-full ${option.className}`} />
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
              <p className="text-xs font-semibold text-slate-300">Who can see this folder?</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ACCESS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedAccess === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedAccess(option.key)}
                      className={`rounded-lg border p-3 text-left transition ${
                        isSelected
                          ? "border-sky-500/70 bg-sky-500/10"
                          : "border-slate-800/80 bg-slate-900/40"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                            isSelected
                              ? "bg-sky-500/20 text-sky-200"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon size={14} />
                        </span>
                        <span
                          className={`h-3 w-3 rounded-full border ${
                            isSelected
                              ? "border-sky-400 bg-sky-400"
                              : "border-slate-600"
                          }`}
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate-100">{option.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-slate-800/80 bg-[#101b30] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Select Family Members
                </p>
                <div className="mt-2 divide-y divide-slate-800/70 overflow-hidden rounded-lg border border-slate-800/70">
                  {DUMMY_MEMBERS.map((member) => {
                    const checked = selectedMembers.includes(member.id);
                    const disabled = selectedAccess !== "specific";
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center justify-between px-3 py-2.5 ${
                          disabled ? "opacity-50" : "cursor-pointer"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-200">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-200">
                              {member.name}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {member.role}
                            </span>
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={checked}
                          onChange={() => toggleMember(member.id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
                        />
                      </label>
                    );
                  })}
                </div>
                {selectedAccess !== "specific" ? (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Enable <span className="text-slate-300">Specific Members</span> to choose individual access.
                  </p>
                ) : null}
              </div>
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
