import {
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

import {
  PASSWORD_ACCESS_STYLES,
  PASSWORD_CATEGORY_ICON_STYLES,
  PASSWORD_CATEGORY_ICONS,
  PASSWORD_FALLBACK_ICON,
  PASSWORD_SECURITY_LEVEL_STYLES,
} from "../../const/passwordsData";

export default function PasswordItem({
  item,
  revealed,
  setRevealed,
  handleCopy,
  getSecurityLevel,
  variant = "row", // "row" | "card"
}) {
  const rowKey = `${item.name}-${item.value}`;

  const CategoryIcon =
    PASSWORD_CATEGORY_ICONS[item.category] || PASSWORD_FALLBACK_ICON;

  const accent =
    PASSWORD_CATEGORY_ICON_STYLES[item.category] ||
    "bg-slate-700/70 text-slate-200";

  const securityLevel = getSecurityLevel(item.password);
  const securityStyle = PASSWORD_SECURITY_LEVEL_STYLES[securityLevel];

  const accessLabel = item.access || "Shared";
  const accessStyle =
    PASSWORD_ACCESS_STYLES[accessLabel] || "bg-slate-700/70 text-slate-200";

  const toggleReveal = () => {
    setRevealed((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  /* =========================
     DESKTOP TABLE ROW
  ========================== */
  if (variant === "row") {
    return (
      <tr className="border-b border-slate-800/60 text-sm text-slate-200">
        {/* Service */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
            >
              <CategoryIcon size={18} stroke={2} />
            </div>
            <div>
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-xs text-slate-500">{item.category}</p>
            </div>
          </div>
        </td>

        {/* Username */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">{item.value}</span>
            <button
              onClick={() => handleCopy(item.value)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
            >
              <IconCopy size={12} />
            </button>
          </div>
        </td>

        {/* Password */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-[0.16em] text-slate-300">
              {revealed[rowKey] ? item.password : "••••••••"}
            </span>

            <button
              onClick={toggleReveal}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
            >
              {revealed[rowKey] ? (
                <IconEyeOff size={13} />
              ) : (
                <IconEye size={13} />
              )}
            </button>

            <button
              onClick={() => handleCopy(item.password)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
            >
              <IconCopy size={12} />
            </button>
          </div>
        </td>

        {/* Security */}
        <td className="px-5 py-4">
          <div className="w-24 space-y-1">
            <div className="h-1.5 rounded-full bg-slate-800">
              <div
                className={`h-1.5 rounded-full ${securityStyle.bar}`}
                style={{ width: `${securityStyle.width}%` }}
              />
            </div>
            <p
              className={`text-[10px] font-semibold uppercase tracking-wide ${securityStyle.text}`}
            >
              {securityLevel}
            </p>
          </div>
        </td>

        {/* Access */}
        <td className="px-5 py-4">
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${accessStyle}`}
          >
            {accessLabel}
          </span>
        </td>

        {/* Actions */}
        <td className="px-5 py-4">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-400 hover:text-white">
            <IconDotsVertical size={14} />
          </button>
        </td>
      </tr>
    );
  }

  /* =========================
     MOBILE CARD
  ========================== */

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 space-y-4">
      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
          >
            <CategoryIcon size={18} stroke={2} />
          </div>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-xs text-slate-500">{item.category}</p>
          </div>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-400 hover:text-white">
          <IconDotsVertical size={14} />
        </button>
      </div>

      {/* Username */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          Username / Email
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{item.value}</span>
          <button
            onClick={() => handleCopy(item.value)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
          >
            <IconCopy size={13} />
          </button>
        </div>
      </div>

      {/* Password */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          Password
        </p>
        <div className="flex items-center justify-between">
          <span className="font-semibold tracking-widest text-slate-300">
            {revealed[rowKey] ? item.password : "••••••••"}
          </span>

          <div className="flex gap-2">
            <button
              onClick={toggleReveal}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
            >
              {revealed[rowKey] ? (
                <IconEyeOff size={14} />
              ) : (
                <IconEye size={14} />
              )}
            </button>

            <button
              onClick={() => handleCopy(item.password)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800/70 bg-slate-900/70 text-slate-500 hover:text-white"
            >
              <IconCopy size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between pt-2">
        <div className="w-28 space-y-1">
          <div className="h-1.5 rounded-full bg-slate-800">
            <div
              className={`h-1.5 rounded-full ${securityStyle.bar}`}
              style={{ width: `${securityStyle.width}%` }}
            />
          </div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-wide ${securityStyle.text}`}
          >
            {securityLevel}
          </p>
        </div>

        <span
          className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase ${accessStyle}`}
        >
          {accessLabel}
        </span>
      </div>
    </div>
  );
}
