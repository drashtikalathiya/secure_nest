import { IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import ContactCard from "../components/contacts/ContactCard";
import ContactFormModal from "../components/contacts/ContactFormModal";
import { useAuth } from "../context/AuthContext";
import { useFamilyMembers } from "../context/FamilyMembersContext";
import {
  CATEGORY_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from "../constants/contactsData";
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
} from "../services/contactsApi";
import { PAGE_META } from "../constants/pageMeta";

const emptyNewContactForm = {
  name: "",
  relationship: RELATIONSHIP_OPTIONS[0],
  category: CATEGORY_OPTIONS[0],
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const toPhoneDigits = (value) =>
  String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);

export default function Contacts() {
  const { user } = useAuth();
  const { members, loading: membersLoading, refreshMembers } =
    useFamilyMembers();

  const [search, setSearch] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newContactForm, setNewContactForm] = useState(emptyNewContactForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modulePermissions, setModulePermissions] = useState({
    view: true,
    edit: false,
    delete: false,
  });
  const pageTitle = PAGE_META["/contacts"];
  const canEditContacts = Boolean(modulePermissions.edit);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allContacts;

    return allContacts.filter((item) =>
      `${item.name} ${item.relationship} ${item.category} ${item.phone} ${item.email} ${item.address} ${item.notes}`
        .toLowerCase()
        .includes(query),
    );
  }, [allContacts, search]);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contactsRes] = await Promise.all([getContacts()]);

      setAllContacts(contactsRes?.data?.items || []);
      setModulePermissions(
        contactsRes?.data?.permissions || {
          view: true,
          edit: false,
          delete: false,
        },
      );

      let membersList = members;
      if (!membersList.length && !membersLoading) {
        membersList = (await refreshMembers()) || [];
      }
      const me = membersList.find((member) => member.email === user?.email);
      setCurrentUserId(me?.id || null);
    } catch (error) {
      setModulePermissions({ view: true, edit: false, delete: false });
      toast.error(error?.message || "Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [members, membersLoading, refreshMembers, user?.email]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetFormState = () => {
    setNewContactForm(emptyNewContactForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    if (!canEditContacts || !modulePermissions.edit) {
      toast.error("You do not have permission to add contacts.");
      return;
    }
    resetFormState();
    setIsFormOpen(true);
  };

  const handleEdit = (item) => {
    if (!canEditContacts || !modulePermissions.edit) {
      toast.error("You do not have permission to edit contacts.");
      return;
    }
    setEditingId(item.id);
    setNewContactForm({
      name: item.name || "",
      relationship: item.relationship || RELATIONSHIP_OPTIONS[0],
      category: item.category || CATEGORY_OPTIONS[0],
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      notes: item.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canEditContacts || !modulePermissions.edit) {
      toast.error("You do not have permission to edit contacts.");
      return;
    }

    setSubmitLoading(true);
    try {
      if (!newContactForm.name.trim() || !newContactForm.phone.trim()) {
        toast.error("Contact name and phone number are required.");
        return;
      }

      const phoneDigits = toPhoneDigits(newContactForm.phone);
      if (phoneDigits.length !== 10) {
        toast.error("Phone number must be exactly 10 digits.");
        return;
      }

      const payload = {
        name: newContactForm.name.trim(),
        relationship: newContactForm.relationship.trim(),
        category: newContactForm.category.trim(),
        phone: phoneDigits,
        email: newContactForm.email.trim() || null,
        address: newContactForm.address.trim() || null,
        notes: newContactForm.notes.trim() || null,
      };

      if (editingId) {
        const response = await updateContact(editingId, payload);
        const updated = response?.data;
        setAllContacts((prev) =>
          prev.map((item) => (item.id === editingId ? updated : item)),
        );
        toast.success("Contact updated.");
      } else {
        const response = await createContact(payload);
        const created = response?.data;
        setAllContacts((prev) => [created, ...prev]);
        toast.success("Contact added.");
      }

      setIsFormOpen(false);
      resetFormState();
    } catch (error) {
      toast.error(error?.message || "Failed to save contact.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!canEditContacts || !modulePermissions.delete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteContact(deleteTarget.id);
      setAllContacts((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      );
      toast.success("Contact removed.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete contact.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section>
      <PageHeader
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
        right={
          canEditContacts ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-strong px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)]"
            >
              <IconPlus size={16} />
              Add New Contact
            </button>
          ) : null
        }
      />

      <div className="mt-4">
        <div className="relative">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search contacts by name, relation, or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-800/80 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 text-sm text-slate-400 mt-4">
            Loading contacts...
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4 mt-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              canDelete={
                canEditContacts &&
                modulePermissions.delete &&
                contact.created_by_user_id === currentUserId
              }
              canEdit={
                canEditContacts &&
                modulePermissions.edit &&
                contact.created_by_user_id === currentUserId
              }
              onEdit={handleEdit}
              onDelete={(item) =>
                setDeleteTarget({
                  id: item.id,
                  name: item.name,
                })
              }
            />
          ))}
          {!isLoading && filteredContacts.length === 0 ? (
            <EmptyState
              icon={IconUsers}
              title="No contacts found"
              description="Store family contacts, emergency numbers, and trusted advisors in one secure place."
              actionLabel="Add Contact"
              canAction={canEditContacts}
              onAction={() => setIsFormOpen(true)}
              className="md:col-span-3 xl:col-span-4"
            />
          ) : null}
        </div>
      </div>

      <ContactFormModal
        open={isFormOpen}
        editingId={editingId}
        newContactForm={newContactForm}
        setNewContactForm={setNewContactForm}
        relationshipOptions={RELATIONSHIP_OPTIONS}
        categoryOptions={CATEGORY_OPTIONS}
        submitLoading={submitLoading}
        onClose={() => {
          setIsFormOpen(false);
          resetFormState();
        }}
        onSubmit={handleSave}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove Contact?"
        message={`This will permanently remove "${deleteTarget?.name || ""}" from shared family emergency contacts.`}
        confirmLabel="Delete"
        confirmLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
