import { IconPencil, IconTrash } from "@tabler/icons-react";

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

export default function DocumentTable({
  files,
  variant = "recent",
  onEditClick,
  onDeleteClick,
  canManageFile,
}) {
  const showActions = Boolean(onEditClick || onDeleteClick);

  if (variant === "folder") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-800/80">
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_90px_80px] border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>File Name</span>
          <span>Date</span>
          <span>Size</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-slate-800/80">
          {files.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_90px_80px] items-center px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getFileBadgeClass(file.fileType)}`}
                >
                  {file.fileType}
                </span>
                <p className="truncate text-sm text-slate-100">{getDocumentLabel(file)}</p>
              </div>
              <p className="text-xs text-slate-400">{file.uploadedAt || "-"}</p>
              <p className="text-xs text-slate-400">{formatSize(file.sizeMb)}</p>
              <div className="flex items-center gap-1">
                {showActions && (canManageFile ? canManageFile(file) : true) ? (
                  <>
                    {onEditClick ? (
                      <button
                        type="button"
                        onClick={() => onEditClick(file)}
                        className="justify-self-start rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                        aria-label="Edit file"
                      >
                        <IconPencil size={14} />
                      </button>
                    ) : null}
                    {onDeleteClick ? (
                      <button
                        type="button"
                        onClick={() => onDeleteClick(file)}
                        className="justify-self-start rounded p-1 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
                        aria-label="Delete file"
                      >
                        <IconTrash size={14} />
                      </button>
                    ) : null}
                  </>
                ) : (
                  <span className="text-xs text-slate-500">View only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_80px] border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>File Name</span>
        <span>Folder</span>
        <span>Size</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-slate-800/80">
        {files.map((file) => (
          <div
            key={file.id}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_120px_80px] items-center px-4 py-3"
          >
            <p className="truncate text-sm text-slate-100">{getDocumentLabel(file)}</p>
            <p className="text-xs text-slate-400">{file.folderName || "-"}</p>
            <p className="text-xs text-slate-400">{formatSize(file.sizeMb)}</p>
            {showActions && (canManageFile ? canManageFile(file) : true) ? (
              <div className="flex items-center gap-1">
                {onEditClick ? (
                  <button
                    type="button"
                    onClick={() => onEditClick(file)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Edit file"
                  >
                    <IconPencil size={14} />
                  </button>
                ) : null}
                {onDeleteClick ? (
                  <button
                    type="button"
                    onClick={() => onDeleteClick(file)}
                    className="rounded p-1 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
                    aria-label="Delete file"
                  >
                    <IconTrash size={14} />
                  </button>
                ) : null}
              </div>
            ) : (
              <span className="text-xs text-slate-500">View only</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
