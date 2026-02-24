import {
  IconDownload,
  IconFileDescription,
  IconLock,
  IconPencil,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { FILE_TYPE_CONFIG } from "../../constants/documentsData";
import { formatSize, getDocumentLabel } from "../../utils/documentUtils";

function getPreviewMeta(fileType = "") {
  const normalized = fileType.toUpperCase();
  return (
    FILE_TYPE_CONFIG[normalized] || {
      kind: "file",
      label: normalized || "FILE",
      icon: IconFileDescription,
      iconClassName: "text-slate-200",
      glowClassName: "bg-slate-500/10",
    }
  );
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
  onPreview,
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
  const previewMeta = getPreviewMeta(file?.fileType || "");
  const previewUrl = file?.previewUrl || "";
  const showImagePreview = previewMeta.kind === "image" && Boolean(previewUrl);

  const handlePreview = () => {
    onPreview?.(file);
  };

  return (
    <article
      onClick={handlePreview}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handlePreview();
        }
      }}
      role="button"
      tabIndex={0}
      className="cursor-pointer overflow-hidden rounded-2xl border border-slate-800/80 bg-dashboard-card shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)]"
    >
      <div className="relative flex h-36 items-center justify-center border-b border-slate-800/80 bg-slate-900/60">
        <div className="absolute inset-0">
          {showImagePreview ? (
            <>
              <img
                src={previewUrl}
                alt={getDocumentLabel(file)}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-slate-950/40" />
              <div
                className={`absolute -inset-6 blur-3xl ${previewMeta.glowClassName}`}
              />
            </>
          )}
        </div>
        {!showImagePreview ? (
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/60 backdrop-blur">
            {previewMeta.icon ? (
              <previewMeta.icon
                size={36}
                className={previewMeta.iconClassName}
              />
            ) : null}
          </div>
        ) : null}
        {file.category ? (
          <span className="absolute left-3 top-3 rounded-full border border-slate-700/70 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
            {file.category}
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
                onClick={(event) => {
                  event.stopPropagation();
                  onEditClick();
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                aria-label="Edit document"
              >
                <IconPencil size={18} />
              </button>
            ) : null}
            {onDeleteClick ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteClick();
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-300"
                aria-label="Delete document"
              >
                <IconTrash size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDownloadClick?.();
              }}
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
