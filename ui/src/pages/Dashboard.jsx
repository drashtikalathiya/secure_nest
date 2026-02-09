import { IconDots, IconArrowBadgeRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { VAULT_SECTIONS } from "../const/dashboardData";

export default function Dashboard() {
  return (
    <section className=" rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Vault Overview</h2>
        <button className="text-xs font-semibold text-sky-400 hover:text-sky-300">
          Manage All
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4">
        {VAULT_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.label}
              className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-4 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.badge}`}
                >
                  <Icon size={18} className={section.accent} />
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  {section.count}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">
                {section.label}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{section.meta}</p>
              <Link
                to={section.to}
                className="mt-4 flex w-full items-center justify-between border-t border-slate-800/80 pt-3 text-slate-400 transition hover:text-white"
              >
                <span className="text-xs font-semibold">Open</span>
                <span className="text-xl">
                  <IconArrowBadgeRight />
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
