import {
  IconDownload,
  IconFileDescription,
  IconFileTypePdf,
  IconLock,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { formatSize, getPreviewType } from "../../utils/documentUtils";

export default function DocumentPreviewModal({
  open,
  file,
  onClose,
  onDownload,
  canDownload = true,
}) {
  if (!open || !file) return null;

  const previewType = getPreviewType(file.fileType || "");
  const previewUrl = file.previewUrl || "";
  const hasPreview =
    Boolean(previewUrl) && (previewType === "image" || previewType === "pdf");
  const fileLabel = file?.title || file?.name || "Untitled Document";

  return (
    <div
      className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm lg:items-center lg:justify-center lg:px-6 lg:py-6"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full flex-col overflow-hidden border border-slate-800/80 bg-[#0f1b2d] shadow-2xl lg:h-auto lg:max-h-[calc(100vh-3rem)] lg:max-w-6xl lg:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/60 text-slate-200">
              {previewType === "pdf" ? (
                <IconFileTypePdf size={22} className="text-rose-300" />
              ) : (
                <IconFileDescription size={22} className="text-sky-200" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-100">
                {fileLabel}
              </p>
              <p className="text-xs text-slate-400">
                {formatSize(file.sizeMb)} • Uploaded on {file.uploadedAt || "-"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close preview"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-y-auto lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="bg-[#0b1220] p-5">
            <div className="flex h-[60vh] min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40 lg:h-[520px] lg:min-h-0">
              {hasPreview ? (
                previewType === "image" ? (
                  <img
                    src={previewUrl}
                    alt={fileLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <iframe
                    title={fileLabel}
                    src={previewUrl}
                    className="h-full w-full"
                  />
                )
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-200">
                    <IconFileDescription size={30} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-100">
                    Preview not available
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Download the file to view the full contents.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="border-l border-slate-800/80 bg-[#0f1b2d] p-5">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Quick Actions
                </p>
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => onDownload?.(file)}
                    disabled={!canDownload}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${
                      canDownload
                        ? "bg-primary text-white hover:bg-primary-strong"
                        : "cursor-not-allowed bg-slate-800/70 text-slate-500"
                    }`}
                    aria-disabled={!canDownload}
                  >
                    <IconDownload size={14} />
                    Download
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Security Details
                </p>
                <div className="mt-3 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <IconShieldCheck size={14} className="text-emerald-300" />
                    <span>End-to-End Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconLock size={14} className="text-emerald-300" />
                    <span>Access limited by vault rules</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
