import { IconX } from "@tabler/icons-react";

export default function RightSlider({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = "max-w-[460px]",
  panelClassName = "bg-[#121f36]",
  closeAriaLabel = "Close panel",
  children,
  footer,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70"
        aria-label={closeAriaLabel}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full ${maxWidthClass} flex-col border-l border-slate-800/80 ${panelClassName} shadow-2xl transition duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-800/80 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label={closeAriaLabel}
          >
            <IconX size={16} />
          </button>
        </div>

        {children}
        {footer}
      </aside>
    </div>
  );
}
