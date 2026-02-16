import {
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconStar,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import {
  PASSWORD_CATEGORY_ICON_STYLES,
  PASSWORD_CATEGORY_ICONS,
} from "../../const/passwordsData";

export default function PasswordItem({
  item,
  revealed,
  setRevealed,
  handleCopy,
  isFavorite = false,
  onToggleFavorite,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  variant = "list", // "list" | "card"
}) {
  const rowKey = item.id || `${item.name}-${item.value}`;

  const CategoryIcon = PASSWORD_CATEGORY_ICONS[item.category];

  const accent =
    PASSWORD_CATEGORY_ICON_STYLES[item.category] ||
    "bg-slate-700/70 text-slate-200";

  const toggleReveal = () => {
    setRevealed((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  if (variant === "list") {
    return (
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-800/70 bg-dashboard-card px-4 py-3 text-sm text-slate-200">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
          >
            <CategoryIcon size={17} stroke={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {item.name}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs text-slate-500">{item.value}</p>
              <button
                type="button"
                onClick={() => handleCopy(item.value)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-800/80 hover:text-white"
                aria-label="Copy username or email"
              >
                <IconCopy size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex min-h-9 min-w-[170px] items-center gap-2 rounded-lg bg-slate-950/60 px-3">
            <span className="truncate font-semibold tracking-[0.16em] text-slate-300">
              {revealed[rowKey] ? item.password : "••••••••••••"}
            </span>
            <button
              type="button"
              onClick={toggleReveal}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-white"
              aria-label={revealed[rowKey] ? "Hide password" : "Show password"}
            >
              {revealed[rowKey] ? (
                <IconEyeOff size={13} />
              ) : (
                <IconEye size={13} />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleCopy(item.password)}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-white"
              aria-label="Copy password"
            >
              <IconCopy size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button
            type="button"
            onClick={onToggleFavorite}
            className="flex h-8 w-8 items-center justify-center rounded-md text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
            aria-label="Favorite"
          >
            <IconStar size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            disabled={!canEdit}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-800/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Edit"
          >
            <IconPencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Delete"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
        >
          <CategoryIcon size={18} stroke={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{item.name}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="truncate text-xs text-slate-500">{item.value}</p>
            <button
              type="button"
              onClick={() => handleCopy(item.value)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-800/80 hover:text-white"
              aria-label="Copy username or email"
            >
              <IconCopy size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex min-h-9 flex-1 items-center gap-2 rounded-lg bg-slate-950/60 px-3">
          <span className="truncate font-semibold tracking-[0.14em] text-slate-300">
            {revealed[rowKey] ? item.password : "••••••••••••"}
          </span>
          <button
            type="button"
            onClick={toggleReveal}
            className="ml-auto flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:text-white"
            aria-label={revealed[rowKey] ? "Hide password" : "Show password"}
          >
            {revealed[rowKey] ? (
              <IconEyeOff size={14} />
            ) : (
              <IconEye size={14} />
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(item.password)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800/80 hover:text-white"
          aria-label="Copy password"
        >
          <IconCopy size={13} />
        </button>
      </div>

      <div className="flex items-center justify-between text-slate-500">
        <button
          type="button"
          onClick={onToggleFavorite}
          className="flex h-8 w-8 items-center justify-center rounded-md text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          aria-label="Favorite"
        >
          <IconStar size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-800/80 hover:text-white"
          aria-label="Owner"
        >
          <IconUser size={14} />
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={!canEdit}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-800/80 hover:text-white"
          aria-label="Edit"
        >
          <IconPencil size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Delete"
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
