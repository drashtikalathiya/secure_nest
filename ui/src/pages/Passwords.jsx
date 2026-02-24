import {
  IconKey,
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import PasswordFormDrawer from "../components/password/PasswordFormDrawer";
import PasswordItem from "../components/password/PasswordItem";
import { useAuth } from "../context/AuthContext";
import {
  PASSWORD_CATEGORY_ICONS,
  PASSWORD_CATEGORY_OPTIONS,
} from "../constants/passwordsData";
import { getFamilyMembers } from "../services/usersApi";
import {
  createPassword,
  deletePassword,
  getPasswords,
  updatePassword,
} from "../services/passwordsApi";
import { PAGE_META } from "../constants/pageMeta";

const getRowKey = (item) => item.id || `${item.name}-${item.value}`;

const toPasswordItem = (record) => ({
  id: record.id,
  name: record.site_name || "Untitled",
  category: record.category || "Work",
  value: record.username_or_email || "",
  password: record.password_value || "",
  websiteUrl: record.website_url || "",
  visibility: record.visibility || "family",
  sharedWith: Array.isArray(record.shared_with_user_ids)
    ? record.shared_with_user_ids
    : [],
  createdByUserId: record.created_by_user_id || null,
  access: record.visibility === "private" ? "Only Owner" : "Shared",
});

export default function Passwords() {
  const { user } = useAuth();

  const [cards, setCards] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [modulePermissions, setModulePermissions] = useState({
    view: true,
    edit: false,
    delete: false,
  });
  const pageTitle = PAGE_META["/passwords"];
  const canEditPasswords = Boolean(modulePermissions.edit);

  const [form, setForm] = useState({
    name: "",
    category: PASSWORD_CATEGORY_OPTIONS[0] || "Work",
    websiteUrl: "",
    value: "",
    password: "",
    visibility: "family", // "private" | "family" | "specific"
    sharedWith: [],
  });

  const resetForm = useCallback(() => {
    setForm({
      name: "",
      category: PASSWORD_CATEGORY_OPTIONS[0] || "Work",
      websiteUrl: "",
      value: "",
      password: "",
      visibility: "family",
      sharedWith: [],
    });
    setEditingPasswordId(null);
  }, []);

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch (error) {
      toast.error("Copy failed");
    }
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [passwordRes, membersRes] = await Promise.all([
        getPasswords(),
        getFamilyMembers(),
      ]);

      const passwordData = passwordRes?.data || {};
      const items = Array.isArray(passwordData.items) ? passwordData.items : [];
      const mappedCards = items.map(toPasswordItem);
      setCards(mappedCards);
      setModulePermissions(
        passwordData.permissions || { view: true, edit: false, delete: false },
      );

      const members = Array.isArray(membersRes?.data) ? membersRes.data : [];
      const me = members.find((member) => member.email === user?.email);
      setCurrentUserId(me?.id || null);
    } catch (error) {
      setCards([]);
      setModulePermissions({ view: true, edit: false, delete: false });
      toast.error(error?.message || "Failed to load passwords.");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canEditPasswords || !modulePermissions.edit) {
      toast.error("You do not have permission to edit passwords.");
      return;
    }

    try {
      setSaveLoading(true);
      const payload = {
        name: form.name,
        category: form.category,
        websiteUrl: form.websiteUrl,
        value: form.value,
        password: form.password,
        visibility: form.visibility,
        sharedWith: form.sharedWith,
      };

      if (editingPasswordId) {
        await updatePassword(editingPasswordId, payload);
        toast.success("Password updated.");
      } else {
        await createPassword(payload);
        toast.success("Password saved.");
      }

      resetForm();
      setIsAddOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to save password.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeletePassword = async () => {
    if (!deleteTarget?.id) return;
    if (!canEditPasswords || !modulePermissions.delete) {
      toast.error("You do not have permission to delete passwords.");
      return;
    }

    try {
      setDeleteLoading(true);
      await deletePassword(deleteTarget.id);
      toast.success("Password deleted.");
      setDeleteTarget(null);
      await loadData();
    } catch (error) {
      toast.error(error?.message || "Failed to delete password.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditPassword = (item) => {
    setEditingPasswordId(item.id || null);
    setForm({
      name: item.name || "",
      category: item.category || PASSWORD_CATEGORY_OPTIONS[0] || "Work",
      websiteUrl: item.websiteUrl || "",
      value: item.value || "",
      password: item.password || "",
      visibility: item.visibility || "family",
      sharedWith: Array.isArray(item.sharedWith) ? item.sharedWith : [],
    });
    setIsAddOpen(true);
  };

  const toggleFavorite = (rowKey) => {
    setFavoriteKeys((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const categoryCounts = useMemo(() => {
    const counts = { "All Items": cards.length };
    cards.forEach((item) => {
      const category = item.category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [cards]);

  const availableCategories = useMemo(() => {
    const dynamicCategories = cards
      .map((item) => item.category)
      .filter(Boolean)
      .map((value) => value.trim());

    return Array.from(
      new Set([...PASSWORD_CATEGORY_OPTIONS, ...dynamicCategories]),
    ).filter(Boolean);
  }, [cards]);

  const categoryFilteredCards = useMemo(() => {
    if (activeCategory === "All Items") return cards;
    return cards.filter((item) => item.category === activeCategory);
  }, [activeCategory, cards]);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categoryFilteredCards.filter((item) => {
      const rowKey = getRowKey(item);
      const matchesSearch = !query || item.name.toLowerCase().includes(query);
      const matchesFavorite = !favoritesOnly || Boolean(favoriteKeys[rowKey]);

      return matchesSearch && matchesFavorite;
    });
  }, [categoryFilteredCards, favoriteKeys, favoritesOnly, searchQuery]);

  const categoryItems = ["All Items", ...availableCategories];

  return (
    <section>
      <PageHeader
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
        right={
          canEditPasswords ? (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)]"
            >
              <IconPlus size={16} />
              Add Password
            </button>
          ) : null
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

          {loading ? (
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-10 text-center text-sm text-slate-500">
              Loading passwords...
            </div>
          ) : (
            <>
              <div className="hidden space-y-3 lg:block">
                {filteredCards.length > 0 ? (
                  filteredCards.map((item) => {
                    const rowKey = getRowKey(item);
                    return (
                      <PasswordItem
                        key={rowKey}
                        item={item}
                        revealed={revealed}
                        setRevealed={setRevealed}
                        handleCopy={handleCopy}
                        isFavorite={Boolean(favoriteKeys[rowKey])}
                        onToggleFavorite={() => toggleFavorite(rowKey)}
                        canEdit={
                          canEditPasswords &&
                          modulePermissions.edit &&
                          item.createdByUserId === currentUserId
                        }
                        canDelete={
                          canEditPasswords &&
                          modulePermissions.delete &&
                          item.createdByUserId === currentUserId
                        }
                        onEdit={() => handleEditPassword(item)}
                        onDelete={() =>
                          setDeleteTarget({
                            id: item.id,
                            name: item.name,
                          })
                        }
                        variant="list"
                      />
                    );
                  })
                ) : (
                  <EmptyState
                    icon={IconKey}
                    title="No passwords found"
                    description="Save logins, secure notes, and credentials for your family. Everything stays end-to-end encrypted."
                    actionLabel="Add Password"
                    onAction={() => setIsAddOpen(true)}
                  />
                )}
              </div>

              <div className="space-y-4 lg:hidden">
                {filteredCards.length > 0 ? (
                  filteredCards.map((item) => {
                    const rowKey = getRowKey(item);
                    return (
                      <PasswordItem
                        key={rowKey}
                        item={item}
                        revealed={revealed}
                        setRevealed={setRevealed}
                        handleCopy={handleCopy}
                        isFavorite={Boolean(favoriteKeys[rowKey])}
                        onToggleFavorite={() => toggleFavorite(rowKey)}
                        canEdit={
                          canEditPasswords &&
                          modulePermissions.edit &&
                          item.createdByUserId === currentUserId
                        }
                        canDelete={
                          canEditPasswords &&
                          modulePermissions.delete &&
                          item.createdByUserId === currentUserId
                        }
                        onEdit={() => handleEditPassword(item)}
                        onDelete={() =>
                          setDeleteTarget({
                            id: item.id,
                            name: item.name,
                          })
                        }
                        variant="card"
                      />
                    );
                  })
                ) : (
                  <EmptyState
                    icon={IconKey}
                    title="No passwords found"
                    description="Save logins, secure notes, and credentials for your family. Everything stays end-to-end encrypted."
                    actionLabel="Add Password"
                    onAction={() => setIsAddOpen(true)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <PasswordFormDrawer
        isOpen={isAddOpen}
        onClose={() => {
          if (saveLoading) return;
          setIsAddOpen(false);
          resetForm();
        }}
        form={form}
        onChange={handleChange}
        onSubmit={handleSave}
        setForm={setForm}
        categoryOptions={
          availableCategories.length
            ? availableCategories
            : PASSWORD_CATEGORY_OPTIONS
        }
        saving={saveLoading}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Password?"
        message={`This will permanently remove "${
          deleteTarget?.name || "this password"
        }" from your vault.`}
        confirmLabel="Delete"
        confirmLoading={deleteLoading}
        onConfirm={handleDeletePassword}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
