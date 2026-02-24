import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  IconSearch,
  IconBell,
  IconShieldLock,
  IconLogout,
  IconMenu2,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { firebaseLogout } from "../../services/firebaseAuth";
import { NAV_ITEMS } from "../../constants/navigation";
import { useAuth } from "../../context/AuthContext";
import { canViewModule } from "../../utils/permissions";
import { clearAuthToken } from "../../services/apiClient";

function BrandBlock({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
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
  const { user } = useAuth();
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.moduleKey) return true;
    return canViewModule(user, item.moduleKey);
  });

  const displayName = user?.name?.trim() || user?.email?.split("@")?.[0];
  const roleLabel =
    user?.role === "owner"
      ? "Vault Owner"
      : user?.role === "member"
        ? "Family Member"
        : "Member";

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      clearAuthToken();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="app-shell h-screen bg-background-dark text-slate-100">
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden h-screen w-64 flex-col border-r border-slate-800/70 px-5 py-4 lg:flex lg:w-72">
          <BrandBlock />

          <div className="mt-7 space-y-2">
            {visibleNavItems.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-800/80 px-3 py-2 text-sm font-medium text-sky-400 transition hover:border-sky-500/60 hover:bg-slate-800/20"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
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
                {visibleNavItems.map((item) => (
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
                  className="flex w-full items-center gap-3 rounded-xl border border-sky-500/30 bg-slate-800/80 px-3 py-2 text-sm font-medium text-sky-400 transition"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
                    <IconLogout size={18} stroke={1.8} />
                  </span>
                  Logout
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex h-screen flex-1 flex-col">
          <header className="z-20 border-b border-slate-800/70 bg-background-dark/90 px-5 py-4 backdrop-blur sm:px-6">
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
                <div className="flex items-center gap-3 px-3 py-2 text-left border-l border-slate-800/80">
                  <div className="hidden md:block">
                    <p className="text-xs font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      {roleLabel}
                    </p>
                  </div>
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-sky-500/40"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                      <IconUser size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="no-scrollbar flex-1 overflow-y-auto px-4 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
