import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import PasswordFormDrawer from "../components/password/PasswordFormDrawer";
import PasswordItem from "../components/password/PasswordItem";
import {
  PASSWORD_CATEGORY_ICONS,
  PASSWORD_CATEGORY_OPTIONS,
  PASSWORD_INITIAL_CARDS,
} from "../const/passwordsData";

const getSecurityLevel = (password = "") => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 6) return "Excellent";
  if (score >= 5) return "Strong";
  if (score >= 3) return "Moderate";
  return "Weak";
};

export default function Passwords() {
  const [cards, setCards] = useState(PASSWORD_INITIAL_CARDS);
  const [revealed, setRevealed] = useState({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [form, setForm] = useState({
    name: "",
    category: PASSWORD_CATEGORY_OPTIONS[0],
    value: "",
    password: "",
    notes: "",
    owner: "Alexander",
    access: "Full",
  });

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const newCard = {
      name: form.name.trim(),
      category: form.category,
      label: form.value.includes("@") ? "EMAIL" : "USERNAME",
      value: form.value.trim(),
      password: form.password || "password123",
      notes: form.notes,
      access: form.access === "Full" ? "Shared" : "Only Owner",
    };
    setCards((prev) => [newCard, ...prev]);
    setForm({
      name: "",
      category: PASSWORD_CATEGORY_OPTIONS[0],
      value: "",
      password: "",
      notes: "",
      owner: "Alexander",
      access: "Full",
    });
    setIsAddOpen(false);
  };

  const filteredCards = useMemo(() => {
    if (activeCategory === "All Items") return cards;
    return cards.filter((item) => item.category === activeCategory);
  }, [activeCategory, cards]);

  const totalItems = filteredCards.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const desktopCards = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCards.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredCards]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const strength = useMemo(() => {
    const score = Math.min(100, form.password.length * 10 + 30);
    return Math.max(20, score);
  }, [form.password]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Passwords"
        subtitle="Table view for fast password access and control."
        right={
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)]"
          >
            <IconPlus size={16} />
            Add Password
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {["All Items", ...PASSWORD_CATEGORY_OPTIONS].map((option) => {
          const CategoryIcon = PASSWORD_CATEGORY_ICONS[option];
          const isActive = activeCategory === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setActiveCategory(option)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-sky-400/50 bg-sky-500/20 text-sky-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500"
              }`}
            >
              {CategoryIcon ? <CategoryIcon size={14} stroke={2} /> : null}
              {option}
            </button>
          );
        })}
      </div>

      <div className="hidden min-h-[460px] lg:flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-[940px] w-full text-left">
            <thead className="bg-slate-900/80">
              <tr className="border-b border-slate-800/80 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                <th className="px-5 py-4 font-semibold">Service</th>
                <th className="px-5 py-4 font-semibold">Username / Email</th>
                <th className="px-5 py-4 font-semibold">Password</th>
                <th className="px-5 py-4 font-semibold">Security</th>
                <th className="px-5 py-4 font-semibold">Access</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {desktopCards.length > 0 ? (
                desktopCards.map((item) => {
                  const rowKey = `${item.name}-${item.value}`;
                  return (
                    <PasswordItem
                      key={rowKey}
                      item={item}
                      revealed={revealed}
                      setRevealed={setRevealed}
                      handleCopy={handleCopy}
                      getSecurityLevel={getSecurityLevel}
                      variant="row"
                    />
                  );
                })
              ) : (
                <tr className="border-b border-slate-800/60">
                  <td className="px-5 py-8 text-center text-sm text-slate-500" colSpan={6}>
                    No passwords found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-800/70 px-5 py-4 text-sm text-slate-500">
          <p>
            Showing {desktopCards.length} of {totalItems} passwords
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile View */}
      <div className="space-y-4 lg:hidden">
        {filteredCards.map((item) => {
          const rowKey = `${item.name}-${item.value}`;
          return (
            <PasswordItem
              key={rowKey}
              item={item}
              revealed={revealed}
              setRevealed={setRevealed}
              handleCopy={handleCopy}
              getSecurityLevel={getSecurityLevel}
              variant="card"
            />
          );
        })}
      </div>

      <PasswordFormDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        form={form}
        onChange={handleChange}
        onSubmit={handleSave}
        setForm={setForm}
        strength={strength}
        categoryOptions={PASSWORD_CATEGORY_OPTIONS}
      />
    </section>
  );
}
