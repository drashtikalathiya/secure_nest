import { IconPlus } from "@tabler/icons-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 px-6 py-12 text-center ${className}`}
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/70 text-sky-200 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.9)]">
          {Icon ? <Icon size={36} /> : null}
        </div>
        <span className="absolute -bottom-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <IconPlus size={16} />
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-100">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-strong"
        >
          <IconPlus size={14} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
