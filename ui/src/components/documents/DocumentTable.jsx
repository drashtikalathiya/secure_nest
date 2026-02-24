import { IconPencil, IconTrash } from "@tabler/icons-react";
import { formatSize, getDocumentLabel } from "../../utils/documentUtils";

function getFileBadgeClass(fileType) {
  if (fileType === "IMAGE") return "bg-sky-500/25 text-sky-200";
  if (fileType === "DOCX" || fileType === "DOC") {
    return "bg-violet-500/20 text-violet-200";
  }
  return "bg-rose-500/20 text-rose-200";
}

export default function DocumentTable({
  files,
  variant = "recent",
  onEditClick,
  onDeleteClick,
  onPreview,
  canManageFile,
}) {
  const showActions = Boolean(onEditClick || onDeleteClick);
  const isFolder = variant === "folder";
  const columns = isFolder
    ? "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_90px_80px]"
    : "grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_80px]";
  const headerLabels = isFolder
    ? ["File Name", "Date", "Size", "Actions"]
    : ["File Name", "Folder", "Size", "Actions"];

  const renderActions = (file) => {
    const canManage = canManageFile ? canManageFile(file) : true;
    if (!showActions) return null;
    if (!canManage) {
      return <span className="text-xs text-slate-500">View only</span>;
    }

    return (
      <div className="flex items-center gap-1">
        {onEditClick ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEditClick(file);
            }}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Edit file"
          >
            <IconPencil size={14} />
          </button>
        ) : null}
        {onDeleteClick ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteClick(file);
            }}
            className="rounded p-1 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
            aria-label="Delete file"
          >
            <IconTrash size={14} />
          </button>
        ) : null}
      </div>
    );
  };

  const renderRow = (file) => (
    <div
      key={file.id}
      onClick={() => onPreview?.(file)}
      className={`grid ${columns} items-center px-4 py-3 ${
        onPreview ? "cursor-pointer hover:bg-slate-900/40" : ""
      }`}
    >
      {isFolder ? (
        <>
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getFileBadgeClass(file.fileType)}`}
            >
              {file.fileType}
            </span>
            <p className="truncate text-sm text-slate-100">
              {getDocumentLabel(file)}
            </p>
          </div>
          <p className="text-xs text-slate-400">{file.uploadedAt || "-"}</p>
        </>
      ) : (
        <>
          <p className="truncate text-sm text-slate-100">
            {getDocumentLabel(file)}
          </p>
          <p className="text-xs text-slate-400">{file.folderName || "-"}</p>
        </>
      )}
      <p className="text-xs text-slate-400">{formatSize(file.sizeMb)}</p>
      {renderActions(file)}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80">
      <div
        className={`grid ${columns} border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500`}
      >
        {headerLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="divide-y divide-slate-800/80">
        {files.map((file) => renderRow(file))}
      </div>
    </div>
  );
}
