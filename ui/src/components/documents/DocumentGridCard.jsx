import {
  IconDownload,
  IconLock,
  IconPencil,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";

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
  return file?.title || file.name;
}

function getOwnerInitials(value = "") {
  const cleaned = value.trim();
  if (!cleaned) return "?";
  return cleaned
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function DocumentGridCard({
  file,
  onDownloadClick,
  onEditClick,
  onDeleteClick,
}) {
  const visibility = file?.visibility || "family";
  const isPrivate = visibility === "private";
  const isFamily = visibility === "family";
  const sharedProfiles = Array.isArray(file?.sharedWithProfiles)
    ? file.sharedWithProfiles
    : [];
  const sharedNames = sharedProfiles
    .map((profile) => profile.name)
    .filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800/80 bg-dashboard-card shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)]">
      <div className="relative flex h-36 items-center justify-center border-b border-slate-800/80 bg-slate-900/60">
        <span
          className={`rounded px-2.5 py-1 text-[11px] font-bold ${getFileBadgeClass(file.fileType)}`}
        >
          {file.fileType}
        </span>
        {file.category ? (
          <span className="absolute left-3 top-3 rounded-full border border-slate-700/70 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
            {file.category}
          </span>
        ) : null}
        {isPrivate ? (
          <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/70 text-slate-300">
            <IconLock size={14} />
          </span>
        ) : null}
      </div>
      <div className="space-y-2 px-3 py-3">
        <p className="truncate text-sm font-semibold text-slate-100">
          {getDocumentLabel(file)}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{file.uploadedAt || "-"}</span>
          <span>{formatSize(file.sizeMb)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isPrivate ? (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                <IconLock size={14} />
              </span>
            ) : isFamily ? (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-200">
                <IconUsersGroup size={14} />
              </span>
            ) : (
              <div className="flex -space-x-2">
                {sharedProfiles.slice(0, 3).map((profile) =>
                  profile.photoUrl ? (
                    <img
                      key={profile.id || profile.name}
                      src={profile.photoUrl}
                      alt={profile.name}
                      title={profile.name}
                      className="h-7 w-7 rounded-full border-2 border-[#101827] object-cover"
                    />
                  ) : (
                    <span
                      key={profile.id || profile.name}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101827] bg-slate-800 text-[10px] font-semibold text-slate-200"
                      title={profile.name}
                    >
                      {getOwnerInitials(profile.name)}
                    </span>
                  ),
                )}
                {sharedNames.length > 3 ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#101827] bg-slate-800 text-[10px] font-semibold text-slate-200">
                    +{sharedNames.length - 3}
                  </span>
                ) : null}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                {isPrivate ? "Private" : isFamily ? "Family" : ""}
              </p>
            </div>
          </div>
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
