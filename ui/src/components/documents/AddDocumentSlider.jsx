import {
  IconCloudUpload,
  IconLock,
  IconSearch,
  IconUpload,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import RightSlider from "../common/RightSlider";

const DOCUMENT_CATEGORIES = [
  "Identity",
  "Legal",
  "Property",
  "Medical",
  "Insurance",
  "Finance",
  "Personal",
];

const ACCEPT_TYPES = ".pdf,.png,.jpg,.jpeg,.doc,.docx";
const OWNER_OPTIONS = [
  {
    key: "alex",
    label: "Alex (Me)",
    initial: "A",
    tone: "bg-amber-300 text-slate-900",
  },
  {
    key: "jane",
    label: "Jane",
    initial: "J",
    tone: "bg-pink-500/30 text-pink-200",
  },
  {
    key: "billy",
    label: "Billy",
    initial: "B",
    tone: "bg-blue-500/30 text-blue-200",
  },
  { key: "family", label: "Entire Family", icon: IconUsersGroup },
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

const MEMBER_OPTIONS = [
  { id: "alex", name: "Alex", role: "Owner" },
  { id: "jane", name: "Jane", role: "Member" },
  { id: "billy", name: "Billy", role: "Member" },
];

function getFileType(fileName = "") {
  const extension = fileName.split(".").pop()?.toUpperCase();
  if (!extension) return "FILE";
  if (["JPG", "JPEG", "PNG"].includes(extension)) return "IMAGE";
  if (extension === "DOC") return "DOC";
  if (extension === "DOCX") return "DOCX";
  return extension;
}

function toMb(sizeInBytes = 0) {
  return Number((sizeInBytes / (1024 * 1024)).toFixed(2));
}

export default function AddDocumentSlider({
  open,
  onClose,
  folderOptions,
  defaultFolderId,
  onUpload,
  onUpdate,
  mode = "create",
  initialDocument = null,
}) {
  const fileInputRef = useRef(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [folderId, setFolderId] = useState(defaultFolderId || "");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(OWNER_OPTIONS[0].key);
  const [visibility, setVisibility] = useState(ACCESS_OPTIONS[0].key);
  const [sharedWith, setSharedWith] = useState([]);
  const isEditMode = mode === "edit";

  const activeFolderId = useMemo(() => {
    if (folderId) return folderId;
    if (defaultFolderId) return defaultFolderId;
    return folderOptions?.[0]?.id || "";
  }, [defaultFolderId, folderId, folderOptions]);

  const handleReset = () => {
    setDocumentTitle("");
    setCategory(DOCUMENT_CATEGORIES[0]);
    setFolderId(defaultFolderId || "");
    setSelectedFile(null);
    setDragActive(false);
    setSelectedOwner(OWNER_OPTIONS[0].key);
    setVisibility(ACCESS_OPTIONS[0].key);
    setSharedWith([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    if (!isEditMode || !initialDocument) return;

    setDocumentTitle(initialDocument.title || initialDocument.name || "");
    setFolderId(defaultFolderId || "");
    setSelectedOwner(initialDocument.owner || OWNER_OPTIONS[0].key);
    setVisibility(initialDocument.visibility || ACCESS_OPTIONS[0].key);
    setSharedWith(Array.isArray(initialDocument.sharedWith) ? initialDocument.sharedWith : []);
  }, [defaultFolderId, initialDocument, isEditMode, open]);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (!documentTitle.trim()) {
      const raw = file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(raw);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  const toggleMember = (memberId) => {
    setSharedWith((prev) =>
      prev.includes(memberId)
        ? prev.filter((item) => item !== memberId)
        : [...prev, memberId],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!activeFolderId || !documentTitle.trim()) return;

    if (isEditMode) {
      onUpdate?.({
        title: documentTitle.trim(),
        category,
        folderId: activeFolderId,
        fileName: selectedFile?.name || initialDocument?.title || "",
        fileType:
          selectedFile?.name
            ? getFileType(selectedFile.name)
            : initialDocument?.fileType || "FILE",
        sizeMb: selectedFile ? toMb(selectedFile.size) : initialDocument?.sizeMb || 0.1,
        owner: selectedOwner,
        visibility,
        sharedWith,
      });
    } else {
      if (!selectedFile) return;
      onUpload?.({
        title: documentTitle.trim(),
        category,
        folderId: activeFolderId,
        fileName: selectedFile.name,
        fileType: getFileType(selectedFile.name),
        sizeMb: toMb(selectedFile.size),
        owner: selectedOwner,
        visibility,
        sharedWith,
      });
    }

    handleClose();
  };

  return (
    <RightSlider
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Edit Document" : "Add New Document"}
      subtitle={
        isEditMode
          ? "Update file details and permissions for this document."
          : "Securely upload files to your family vault. All documents are end-to-end encrypted."
      }
      maxWidthClass="max-w-[560px]"
      panelClassName="bg-[#0f1d33]"
      closeAriaLabel="Close add document panel"
    >
      <form
        id="add-document-form"
        onSubmit={handleSubmit}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="no-scrollbar flex-1 min-h-0 space-y-4 overflow-y-auto px-5 py-4">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              if (isEditMode) return;
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (isEditMode) return;
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (isEditMode) return;
              setDragActive(false);
            }}
            onDrop={handleDrop}
            className={`rounded-xl border border-dashed px-4 py-10 text-center transition ${
              dragActive
                ? "border-sky-400/80 bg-sky-500/10"
                : "border-slate-700/80 bg-slate-900/35"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
              <IconCloudUpload size={20} />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-200">
              {isEditMode ? "Replace file (optional)" : "Drag and drop your file here"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports PDF, PNG, JPG, and DOCX (max 25MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong"
            >
              <IconSearch size={14} />
              {isEditMode ? "Replace File" : "Browse Files"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_TYPES}
              onChange={(event) => handleFile(event.target.files?.[0])}
              className="hidden"
            />

            {selectedFile ? (
              <p className="mt-4 text-xs text-slate-300">
                Selected:{" "}
                <span className="font-semibold">{selectedFile.name}</span>
              </p>
            ) : isEditMode && initialDocument?.title ? (
              <p className="mt-4 text-xs text-slate-300">
                Current:{" "}
                <span className="font-semibold">{initialDocument.title}</span>
              </p>
            ) : null}
          </div>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Document Title
            </span>
            <input
              type="text"
              value={documentTitle}
              onChange={(event) => setDocumentTitle(event.target.value)}
              placeholder="e.g. Trust Agreement 2024"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/70 focus:outline-none"
              >
                {DOCUMENT_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Destination Folder
              </span>
              <select
                value={activeFolderId}
                onChange={(event) => setFolderId(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-sky-500/70 focus:outline-none"
              >
                {folderOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              Who does this document belong to?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {OWNER_OPTIONS.map((option) => {
                const isSelected = selectedOwner === option.key;
                const OwnerIcon = option.icon || IconUser;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedOwner(option.key)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10 text-sky-100"
                        : "border-slate-800/80 bg-slate-900/50 text-slate-300 hover:text-slate-100"
                    }`}
                  >
                    {option.initial ? (
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${option.tone}`}
                      >
                        {option.initial}
                      </span>
                    ) : (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700/70 text-slate-200">
                        <OwnerIcon size={12} />
                      </span>
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              Who can see this document?
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {ACCESS_OPTIONS.map((option) => {
                const AccessIcon = option.icon;
                const isSelected = visibility === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setVisibility(option.key)}
                    className={`rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? "border-sky-500/70 bg-sky-500/10"
                        : "border-slate-800/80 bg-slate-900/40"
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                        isSelected
                          ? "bg-sky-500/20 text-sky-200"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <AccessIcon size={14} />
                    </span>
                    <p className="mt-2 text-xs font-semibold text-slate-100">
                      {option.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-xl border border-slate-800/80 bg-[#101b30] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Select Family Members
              </p>
              <div className="mt-2 divide-y divide-slate-800/70 overflow-hidden rounded-lg border border-slate-800/70">
                {MEMBER_OPTIONS.map((member) => {
                  const checked = sharedWith.includes(member.id);
                  const disabled = visibility !== "specific";
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
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-800/80 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              End-to-End Encrypted
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-document-form"
                disabled={
                  !documentTitle.trim() ||
                  !activeFolderId ||
                  (!isEditMode && !selectedFile)
                }
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconUpload size={14} />
                {isEditMode ? "Save Changes" : "Upload to Vault"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </RightSlider>
  );
}
