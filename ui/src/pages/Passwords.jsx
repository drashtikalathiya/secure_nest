import {
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import PasswordFormDrawer from "../components/password/PasswordFormDrawer";
import PasswordItem from "../components/password/PasswordItem";
import {
  PASSWORD_CATEGORY_ICONS,
  PASSWORD_CATEGORY_OPTIONS,
  PASSWORD_INITIAL_CARDS,
} from "../const/passwordsData";

const FAMILY_VISIBILITY_OPTIONS = [
  { id: "sarah", name: "Sarah Jenkins", relation: "Wife" },
  { id: "john", name: "John Doe", relation: "Brother" },
  { id: "emily", name: "Emily Jenkins", relation: "Daughter" },
];

export default function Passwords() {
  const [cards, setCards] = useState(PASSWORD_INITIAL_CARDS);
  const [revealed, setRevealed] = useState({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState(() => {
    const defaults = {};
    PASSWORD_INITIAL_CARDS.slice(0, 2).forEach((item) => {
      defaults[`${item.name}-${item.value}`] = true;
    });
    return defaults;
  });
  const [form, setForm] = useState({
    name: "",
    category: PASSWORD_CATEGORY_OPTIONS[0] || "Work",
    websiteUrl: "",
    value: "",
    password: "",
    visibility: "family", // "private" | "family" | "specific"
    sharedWith: ["sarah", "emily"],
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
      websiteUrl: form.websiteUrl.trim(),
      label: form.value.includes("@") ? "EMAIL" : "USERNAME",
      value: form.value.trim(),
      password: form.password || "password123",
      access: form.visibility === "private" ? "Only Owner" : "Shared",
    };

    setCards((prev) => [newCard, ...prev]);
    setForm({
      name: "",
      category: PASSWORD_CATEGORY_OPTIONS[0] || "Work",
      websiteUrl: "",
      value: "",
      password: "",
      visibility: "family",
      sharedWith: ["sarah", "emily"],
    });
    setIsAddOpen(false);
  };

  const toggleFavorite = (rowKey) => {
    setFavoriteKeys((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const categoryCounts = useMemo(() => {
    const counts = { "All Items": cards.length };
    PASSWORD_CATEGORY_OPTIONS.forEach((option) => {
      counts[option] = cards.filter((item) => item.category === option).length;
    });
    return counts;
  }, [cards]);

  const categoryFilteredCards = useMemo(() => {
    if (activeCategory === "All Items") return cards;
    return cards.filter((item) => item.category === activeCategory);
  }, [activeCategory, cards]);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categoryFilteredCards.filter((item) => {
      const rowKey = `${item.name}-${item.value}`;
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      const matchesFavorite = !favoritesOnly || Boolean(favoriteKeys[rowKey]);

      return matchesSearch && matchesFavorite;
    });
  }, [categoryFilteredCards, favoriteKeys, favoritesOnly, searchQuery]);

  const categoryItems = ["All Items", ...PASSWORD_CATEGORY_OPTIONS];

  return (
    <section>
      <PageHeader
        title="Passwords"
        subtitle="Favorite passwords with quick icon actions."
        right={
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)]"
          >
            <IconPlus size={16} />
            Add Password
          </button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] mt-4">
        <aside className="rounded-2xl border border-slate-800/80 bg-dashboard-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Categories
          </p>
          <div className="mt-3 space-y-1.5">
            {categoryItems.map((item) => {
              const CategoryIcon =
                item === "All Items"
                  ? IconLayoutGrid
                  : PASSWORD_CATEGORY_ICONS[item];
              const isActive = activeCategory === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveCategory(item)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                    isActive
                      ? "bg-sky-500/20 text-sky-100"
                      : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {CategoryIcon ? <CategoryIcon size={14} /> : null}
                    {item}
                  </span>
                  <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-400">
                    {categoryCounts[item] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="p-4 sm:p-5 lg:h-[calc(100vh-210px)] lg:overflow-y-auto">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <IconSearch
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Service Name..."
                className="w-full rounded-lg border border-slate-800/80 bg-slate-900/70 py-3 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setFavoritesOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                favoritesOnly
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-slate-800/80 bg-slate-900/70 text-slate-300 hover:text-white"
              }`}
            >
              <IconStar
                size={13}
                fill={favoritesOnly ? "currentColor" : "none"}
              />
              Favorites
            </button>
          </div>

          <div className="hidden space-y-3 lg:block">
            {filteredCards.length > 0 ? (
              filteredCards.map((item) => {
                const rowKey = `${item.name}-${item.value}`;
                return (
                  <PasswordItem
                    key={rowKey}
                    item={item}
                    revealed={revealed}
                    setRevealed={setRevealed}
                    handleCopy={handleCopy}
                    isFavorite={Boolean(favoriteKeys[rowKey])}
                    onToggleFavorite={() => toggleFavorite(rowKey)}
                    variant="list"
                  />
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-10 text-center text-sm text-slate-500">
                No passwords found.
              </div>
            )}
          </div>

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
                  isFavorite={Boolean(favoriteKeys[rowKey])}
                  onToggleFavorite={() => toggleFavorite(rowKey)}
                  variant="card"
                />
              );
            })}
          </div>
        </div>
      </div>

      <PasswordFormDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        form={form}
        onChange={handleChange}
        onSubmit={handleSave}
        setForm={setForm}
        familyOptions={FAMILY_VISIBILITY_OPTIONS}
        categoryOptions={PASSWORD_CATEGORY_OPTIONS}
      />
    </section>
  );
}
