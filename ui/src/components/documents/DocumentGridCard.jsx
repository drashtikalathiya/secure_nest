import { IconDownload, IconPencil, IconTrash } from "@tabler/icons-react";

function formatSize(sizeMb) {
  if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(2)} GB`;
  return `${(sizeMb || 0).toFixed(1)} MB`;
}

function getFileBadgeClass(fileType) {
  if (fileType === "IMAGE") return "bg-sky-500/25 text-sky-200";
  if (fileType === "DOCX" || fileType === "DOC") {
    return "bg-violet-500/20 text-violet-200";
  }
  return "bg-rose-500/20 text-rose-200";
}

function getDocumentLabel(file) {
  return file?.name || file?.title || "Untitled Document";
}

export default function DocumentGridCard({
  file,
  onDownloadClick,
  onEditClick,
  onDeleteClick,
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800/80 bg-dashboard-card">
      <div className="relative flex h-36 items-center justify-center border-b border-slate-800/80 bg-slate-900/50">
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold ${getFileBadgeClass(file.fileType)}`}
        >
          {file.fileType}
        </span>
        <span
          className={`absolute bottom-3 right-3 rounded px-2 py-0.5 text-[10px] font-bold ${getFileBadgeClass(file.fileType)}`}
        >
          {file.fileType}
        </span>
      </div>
      <div className="space-y-1.5 px-3 py-3">
        <p className="truncate text-sm font-semibold text-slate-100">
          {getDocumentLabel(file)}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Uploaded {file.uploadedAt || "-"} • {formatSize(file.sizeMb)}
          </p>
          <div className="flex items-center gap-1">
            {onEditClick ? (
              <button
                type="button"
                onClick={onEditClick}
                className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Edit document"
              >
                <IconPencil size={18} />
              </button>
            ) : null}
            {onDeleteClick ? (
              <button
                type="button"
                onClick={onDeleteClick}
                className="rounded p-1 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
                aria-label="Delete document"
              >
                <IconTrash size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDownloadClick}
              className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
              aria-label="Download document"
            >
              <IconDownload size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
