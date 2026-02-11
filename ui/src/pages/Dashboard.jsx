import { IconArrowBadgeRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/common/PageHeader";
import { VAULT_SECTIONS } from "../const/dashboardData";
import { PAGE_META } from "../const/pageMeta";
import { FAMILY_MEMBERS } from "../const/membersData";

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0];
  const activeMembers = FAMILY_MEMBERS?.length;
  const subtitle = PAGE_META["/dashboard"]?.subtitle;

  return (
    <div>
      <PageHeader
        title={`Welcome Back, ${displayName}`}
        subtitle={subtitle}
        right={
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
            <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-400/70 to-indigo-500/70 ring-2 ring-slate-900/80" />
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400/70 to-rose-500/70 ring-2 ring-slate-900/80" />
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400/70 to-teal-500/70 ring-2 ring-slate-900/80" />
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-[10px] font-semibold text-slate-200 ring-2 ring-slate-900/80">
                +2
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Active Members
              </p>
              <p className="text-xs font-semibold text-slate-200">
                {activeMembers} Family Members
              </p>
            </div>
          </div>
        }
      />
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
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
    </div>
  );
}
