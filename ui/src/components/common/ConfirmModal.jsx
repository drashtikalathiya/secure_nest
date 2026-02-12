import { IconAlertTriangleFilled } from "@tabler/icons-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmLoading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-dashboard-card p-6 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-900/35 text-rose-400">
          <IconAlertTriangleFilled size={22} />
        </div>

        <h3 className="mt-4 text-center text-2xl font-semibold text-white">
          {title}
        </h3>
        <p className="mt-3 text-center text-sm text-slate-400">{message}</p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLoading ? "Removing..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirmLoading}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
