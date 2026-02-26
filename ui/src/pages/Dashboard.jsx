import { IconArrowBadgeRight, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/common/PageHeader";
import Spinner from "../components/common/Spinner";
import {
  QUICK_ACTIONS,
  MODULE_LABELS,
  MODULE_AVATAR,
  VAULT_SECTIONS,
} from "../constants/dashboardData";
import { PAGE_META } from "../constants/pageMeta";
import {
  getDashboardOverview,
  getDashboardRecentActivity,
} from "../services/dashboardApi";
import { canViewModule } from "../utils/permissions";

const ROUTE_MODULE_MAP = {
  "/passwords": "passwords",
  "/contacts": "contacts",
  "/documents": "documents",
};

const getInitials = (value) =>
  value
    ?.split(" ")
    .slice(0, 2)
    .map((c) => c[0]?.toUpperCase())
    .join("") || "VA";

const formatRelativeTime = (value) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "Just now";

  const m = Math.floor((Date.now() - date.getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 2880) return "Yesterday";
  return `${Math.floor(m / 1440)}d ago`;
};

export default function Dashboard() {
  const { user } = useAuth();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const subtitle = PAGE_META["/dashboard"]?.subtitle;

  const [overview, setOverview] = useState({
    members: 0,
    passwords: 0,
    contacts: 0,
    documents: 0,
  });

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const canAccess = useCallback(
    (route) => {
      const module = ROUTE_MODULE_MAP[route];
      return module ? canViewModule(user, module) : true;
    },
    [user],
  );

  const countByRoute = useMemo(
    () => ({
      "/members": overview.members,
      "/passwords": overview.passwords,
      "/contacts": overview.contacts,
      "/documents": overview.documents,
    }),
    [overview],
  );

  const visibleSections = useMemo(
    () => VAULT_SECTIONS.filter((section) => canAccess(section.to)),
    [canAccess],
  );

  const visibleQuickActions = useMemo(
    () => QUICK_ACTIONS.filter((action) => canAccess(action.to)),
    [canAccess],
  );

  const visibleActivity = useMemo(
    () => activity.filter((act) => canAccess(act.to)),
    [activity, canAccess],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setActivityLoading(true);
      try {
        const [overviewRes, activityRes] = await Promise.all([
          getDashboardOverview(),
          getDashboardRecentActivity(4),
        ]);

        if (!mounted) return;

        const overview = overviewRes?.data || {};
        setOverview({
          members: +overview.members || 0,
          passwords: +overview.passwords || 0,
          contacts: +overview.contacts || 0,
          documents: +overview.documents || 0,
        });

        const items = Array.isArray(activityRes?.data) ? activityRes.data : [];

        setActivity(
          items.map((item) => {
            const label = MODULE_LABELS[item.module] || "Activity";

            return {
              id: item.id,
              user: item.user_name || "Vault",
              action: item.action || "updated",
              target: item.target_label || label,
              meta: `${formatRelativeTime(item.created_at)} • ${label}`,
              to: item.route || "/dashboard",
              avatar: getInitials(item.user_name),
              avatarStyle:
                MODULE_AVATAR[item.module] || "bg-slate-800/80 text-slate-200",
            };
          }),
        );
      } catch {
        if (!mounted) return;
        setOverview({
          members: 0,
          passwords: 0,
          contacts: 0,
          documents: 0,
        });
        setActivity([]);
      } finally {
        if (mounted) setActivityLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title={`Welcome Back, ${displayName}`} subtitle={subtitle} />

      <section className="mt-5 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          const count = countByRoute[section.to] ?? 0;

          return (
            <div
              key={section.label}
              className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.badge}`}
                >
                  <Icon size={18} className={section.accent} />
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  {count}
                </span>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-white">
                {section.label}
              </h3>

              <p className="mt-1 text-xs text-slate-500">{count} total items</p>

              <Link
                to={section.to}
                className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-slate-400 hover:text-white"
              >
                <span className="text-xs font-semibold">Open</span>
                <IconArrowBadgeRight />
              </Link>
            </div>
          );
        })}
      </section>

      <section className="my-6 grid gap-4 items-start lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-800/80 bg-dashboard-card">
          <div className="border-b border-slate-800/80 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">
              Recent Vault Activity
            </h2>
          </div>

          <div className="divide-y divide-slate-800/80">
            {activityLoading ? (
              <div className="px-5 py-10 flex items-center justify-center">
                <Spinner size={30} />
              </div>
            ) : visibleActivity.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400">
                No recent activity found.
              </div>
            ) : (
              visibleActivity.map((activity) => (
                <Link
                  key={activity.id}
                  to={activity.to}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-slate-900/60"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.avatarStyle}`}
                  >
                    <span className="text-xs font-semibold">
                      {activity.avatar}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold text-white">
                        {activity.user}
                      </span>{" "}
                      {activity.action}{" "}
                      <span className="font-semibold text-sky-200">
                        {activity.target}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">{activity.meta}</p>
                  </div>

                  <IconChevronRight size={16} />
                </Link>
              ))
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-5">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>

          <div className="mt-4 space-y-3">
            {visibleQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  to={action.to}
                  className={`flex gap-3 rounded-xl border px-4 py-3 border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/80`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/30 text-sky-100`}
                  >
                    <Icon size={18} />
                  </span>

                  <span>
                    <span className="block text-xs font-semibold text-white">
                      {action.label}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {action.description}
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
