import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconSearch,
  IconBell,
  IconShieldLock,
  IconLogout,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { firebaseLogout } from "../../services/firebaseAuth";
import { useAuth } from "../../context/AuthContext";
import { NAV_ITEMS } from "../../const/navigation";
import { PAGE_META } from "../../const/pageMeta";
import { FAMILY_MEMBERS } from "../../const/dashboardData";

function BrandBlock({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-slate-900/60 px-4 py-3 ${className}`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
        <IconShieldLock size={22} stroke={2} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">SecureNest</p>
        <p className="text-xs text-slate-400">Family Security Vault</p>
      </div>
    </div>
  );
}

function NavItem({ item, onSelect }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onSelect}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? "bg-slate-800/80 text-sky-400"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isActive
                ? "bg-sky-500/20 text-sky-300"
                : "bg-slate-800/70 text-slate-300"
            }`}
          >
            <Icon size={18} stroke={1.8} />
          </span>
          <span className="font-medium">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "SecureNest";

  const meta = PAGE_META[location.pathname] || PAGE_META["/dashboard"];

  const title =
    location.pathname === "/dashboard"
      ? `Welcome Back, ${displayName}`
      : meta.title;

  const subtitle = meta.subtitle;
  const isDashboard = location.pathname === "/dashboard";
  const activeMembers = FAMILY_MEMBERS?.length;

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-slate-100">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 flex-col border-r border-slate-800/70 bg-background-dark px-5 py-4 lg:flex lg:w-72">
          <BrandBlock />

          <div className="mt-7 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-200">
                <IconLogout size={18} stroke={1.8} />
              </span>
              Logout
            </button>
          </div>
        </aside>

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/70"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            />
            <aside className="relative z-50 flex h-full w-72 max-w-[85%] flex-col border-r border-slate-800/70 bg-background-dark px-5 py-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <BrandBlock />
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/70 bg-slate-800/80 text-sky-300 transition hover:bg-slate-800/60 hover:text-white mt-3"
                >
                  <IconX size={18} />
                </button>
              </div>

              <div className="mt-7 space-y-2">
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.label}
                    item={item}
                    onSelect={() => setIsSidebarOpen(false)}
                  />
                ))}
              </div>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 text-red-200">
                    <IconLogout size={18} stroke={1.8} />
                  </span>
                  Logout
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-background-dark/90 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/50 text-slate-200 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <IconMenu2 size={18} />
                </button>
                <div className="relative flex w-full max-w-[360px] items-center sm:max-w-[420px] md:w-[320px] lg:w-[420px]">
                  <IconSearch
                    size={18}
                    className="absolute left-4 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search across all vault items..."
                    className="w-full rounded-2xl border border-slate-800/70 bg-slate-900/60 py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/50 text-slate-200">
                  <IconBell size={18} />
                </button>
                <button className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-left">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400/70 to-indigo-500/70" />
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-white">
                      Alexander Wright
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Vault Owner
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-white">{title}</h1>
                <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
              </div>

              {isDashboard ? (
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
              ) : null}
            </div>

            <div className="mt-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
