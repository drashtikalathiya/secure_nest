import { IconCloudUpload, IconSearch, IconUpload } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RightSlider from "../common/RightSlider";
import VisibilityAccessSelector from "../common/VisibilityAccessSelector";
import {
  DOCUMENT_CATEGORIES,
  ACCEPT_TYPES,
} from "../../constants/documentsData";

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
  isSubmitting = false,
  mode = "create",
  initialDocument = null,
}) {
  const fileInputRef = useRef(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [folderId, setFolderId] = useState(defaultFolderId || "");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [visibility, setVisibility] = useState("private");
  const [sharedWith, setSharedWith] = useState([]);
  const isEditMode = mode === "edit";

  const activeFolderId = useMemo(() => {
    if (folderId) return folderId;
    if (defaultFolderId) return defaultFolderId;
    return folderOptions?.[0]?.id || "";
  }, [defaultFolderId, folderId, folderOptions]);

  const handleReset = useCallback(() => {
    setDocumentTitle("");
    setCategory(DOCUMENT_CATEGORIES[0]);
    setFolderId(defaultFolderId || "");
    setSelectedFile(null);
    setDragActive(false);
    setVisibility("private");
    setSharedWith([]);
  }, [defaultFolderId]);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  useEffect(() => {
    if (!open) {
      handleReset();
      return;
    }
    if (!isEditMode || !initialDocument) return;

    setDocumentTitle(initialDocument.title || initialDocument.name || "");
    setCategory(initialDocument.category || DOCUMENT_CATEGORIES[0]);
    setFolderId(defaultFolderId || "");
    setVisibility(initialDocument.visibility || "private");
    setSharedWith(
      Array.isArray(initialDocument.sharedWith)
        ? initialDocument.sharedWith
        : [],
    );
  }, [defaultFolderId, handleReset, initialDocument, isEditMode, open]);

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
    if (isSubmitting) return;
    if (!activeFolderId || !documentTitle.trim()) return;
    if (visibility === "specific" && (!sharedWith || sharedWith.length === 0)) {
      toast.error("Select at least one member for specific access.");
      return;
    }

    if (isEditMode) {
      onUpdate?.({
        title: documentTitle.trim(),
        category,
        folderId: activeFolderId,
        file: selectedFile || null,
        fileName: selectedFile?.name || initialDocument?.name || "",
        fileType: selectedFile?.name
          ? getFileType(selectedFile.name)
          : initialDocument?.fileType || "FILE",
        sizeMb: selectedFile
          ? toMb(selectedFile.size)
          : initialDocument?.sizeMb || 0.1,
        visibility,
        sharedWith,
      });
    } else {
      if (!selectedFile) return;
      onUpload?.({
        title: documentTitle.trim(),
        category,
        folderId: activeFolderId,
        file: selectedFile,
        fileName: selectedFile.name,
        fileType: getFileType(selectedFile.name),
        sizeMb: toMb(selectedFile.size),
        visibility,
        sharedWith,
      });
    }
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
              {isEditMode
                ? "Replace file (optional)"
                : "Drag and drop your file here"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports PDF, PNG, JPG, DOC, and DOCX (max 25MB)
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
            ) : isEditMode && initialDocument?.name ? (
              <p className="mt-4 text-xs text-slate-300">
                Current:{" "}
                <span className="font-semibold">{initialDocument.name}</span>
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

          <VisibilityAccessSelector
            title="Who can see this document?"
            visibility={visibility}
            onVisibilityChange={setVisibility}
            sharedWith={sharedWith}
            onToggleMember={toggleMember}
          />
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
                disabled={isSubmitting}
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
                  (!isEditMode && !selectedFile) ||
                  isSubmitting
                }
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconUpload size={14} />
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Uploading..."
                  : isEditMode
                    ? "Save Changes"
                    : "Upload to Vault"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </RightSlider>
  );
}
