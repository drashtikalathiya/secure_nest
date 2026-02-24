import { IconFolder, IconPencil, IconTrash } from "@tabler/icons-react";
import { formatSize, getFolderTotals } from "../../utils/documentUtils";

export default function FolderCard({
  folder,
  canEdit,
  currentUserId,
  onSelect,
  onEdit,
  onDelete,
}) {
  const totals = getFolderTotals(folder.files || []);
  const canManage = canEdit && folder.created_by_user_id === currentUserId;

  return (
    <div
      key={folder.id}
      onClick={() => onSelect?.(folder.id)}
      className="relative rounded-2xl border cursor-pointer border-slate-800/80 bg-dashboard-card p-4 text-left transition hover:border-slate-700 hover:bg-slate-900/70"
    >
      {canManage ? (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(folder);
            }}
            className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Edit folder"
          >
            <IconPencil size={18} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(folder);
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-300"
            aria-label="Delete folder"
          >
            <IconTrash size={18} />
          </button>
        </div>
      ) : null}

      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-slate-500/20 text-sky-300 border-sky-500/60">
        <IconFolder size={20} />
      </span>
      <p className="text-sm font-semibold text-slate-100">{folder.name}</p>
      <p className="mt-1 text-xs text-slate-500">
        {totals.fileCount} file{totals.fileCount === 1 ? "" : "s"} •{" "}
        {formatSize(totals.totalSize)}
      </p>
    </div>
  );
}
