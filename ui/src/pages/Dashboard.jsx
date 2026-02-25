import { IconArrowBadgeRight, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/common/PageHeader";
import {
  QUICK_ACTIONS,
  RECENT_ACTIVITY,
  VAULT_SECTIONS,
} from "../constants/dashboardData";
import { PAGE_META } from "../constants/pageMeta";
import { getDashboardOverview } from "../services/dashboardApi";
import { canViewModule } from "../utils/permissions";

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0];
  const subtitle = PAGE_META["/dashboard"]?.subtitle;
  const [overviewCounts, setOverviewCounts] = useState({
    members: 0,
    passwords: 0,
    contacts: 0,
    documents: 0,
  });
  const visibleVaultSections = VAULT_SECTIONS.filter((section) => {
    if (section.to === "/passwords") return canViewModule(user, "passwords");
    if (section.to === "/contacts") return canViewModule(user, "contacts");
    if (section.to === "/documents") return canViewModule(user, "documents");
    return true;
  });

  const canAccessRoute = (route) => {
    if (route === "/passwords") return canViewModule(user, "passwords");
    if (route === "/contacts") return canViewModule(user, "contacts");
    if (route === "/documents") return canViewModule(user, "documents");
    return true;
  };

  const visibleActivity = RECENT_ACTIVITY.filter((item) =>
    canAccessRoute(item.to),
  );

  const visibleQuickActions = QUICK_ACTIONS.filter((item) =>
    canAccessRoute(item.to),
  );

  const countByRoute = useMemo(
    () => ({
      "/members": overviewCounts.members,
      "/passwords": overviewCounts.passwords,
      "/contacts": overviewCounts.contacts,
      "/documents": overviewCounts.documents,
    }),
    [overviewCounts],
  );

  useEffect(() => {
    let isActive = true;

    const loadOverview = async () => {
      try {
        const overviewRes = await getDashboardOverview();
        if (!isActive) return;
        const overview = overviewRes?.data || {};
        setOverviewCounts({
          members: Number(overview.members) || 0,
          passwords: Number(overview.passwords) || 0,
          contacts: Number(overview.contacts) || 0,
          documents: Number(overview.documents) || 0,
        });
      } catch (error) {
        if (!isActive) return;
        setOverviewCounts({
          members: 0,
          passwords: 0,
          contacts: 0,
          documents: 0,
        });
      }
    };

    loadOverview();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title={`Welcome Back, ${displayName}`} subtitle={subtitle} />
      <section>
        <div className="mt-5 grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
          {visibleVaultSections.map((section) => {
            const Icon = section.icon;
            const sectionCount =
              typeof countByRoute[section.to] === "number"
                ? countByRoute[section.to]
                : section.count;
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
                    {sectionCount}
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

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-800/80 bg-dashboard-card shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent Vault Activity
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest updates across passwords, documents, contacts, and
                members.
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-800/80">
            {visibleActivity.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-900/60"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${item.avatarStyle}`}
                >
                  <span className="text-xs font-semibold">{item.avatar}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-white">
                      {item.actor}
                    </span>{" "}
                    <span className="text-slate-400">{item.action}</span>{" "}
                    <span className="font-semibold text-sky-200">
                      {item.target}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800/80 bg-slate-900/60 text-slate-400">
                  <IconChevronRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-5 shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
            <span className="rounded-full border border-slate-800/80 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Vault
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {visibleQuickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${item.tone}`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconTone}`}
                  >
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-white">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
