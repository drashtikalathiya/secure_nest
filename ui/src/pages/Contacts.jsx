import {
  IconAlertCircle,
  IconPlus,
  IconSearch,
  IconShield,
  IconStar,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import PageHeader from "../components/common/PageHeader";
import PrimaryContactCard from "../components/contacts/PrimaryContactCard";
import ServiceContactCard from "../components/contacts/ServiceContactCard";
import ContactFormModal from "../components/contacts/ContactFormModal";
import { useAuth } from "../context/AuthContext";
import {
  QUICK_DIAL,
  RELATIONSHIP_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
} from "../const/contactsData";
import { auth } from "../services/firebase";
import {
  createContact,
  deleteContact,
  getContacts,
  updateContact,
} from "../services/contactsApi";

const emptyPrimaryForm = {
  name: "",
  relationship: RELATIONSHIP_OPTIONS[0],
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const emptyServiceForm = {
  name: "",
  category: SERVICE_CATEGORY_OPTIONS[0],
  phone: "",
  website: "",
  address: "",
  notes: "",
};

const openTel = (number) => {
  if (!number) return;
  window.location.href = `tel:${number}`;
};

const openSms = (number) => {
  if (!number) return;
  window.location.href = `sms:${number}`;
};

const openMail = (email) => {
  if (!email) return;
  window.location.href = `mailto:${email}`;
};

const getInitials = (name, email) => {
  const source = (name || "").trim();
  if (source) {
    const parts = source.split(/\s+/).slice(0, 2);
    return parts
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2);
  }

  return String(email || "")
    .slice(0, 2)
    .toUpperCase();
};

export default function Contacts() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const [search, setSearch] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [memberPermissions, setMemberPermissions] = useState({
    view: true,
    edit: false,
    delete: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState("primary");
  const [primaryForm, setPrimaryForm] = useState(emptyPrimaryForm);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const contactPermissions = isOwner
    ? { view: true, edit: true, delete: true }
    : memberPermissions;
  const canEdit = Boolean(contactPermissions.edit);
  const canDelete = Boolean(contactPermissions.delete);

  const primaryContacts = useMemo(
    () => allContacts.filter((item) => item.type !== "service"),
    [allContacts],
  );

  const services = useMemo(
    () => allContacts.filter((item) => item.type === "service"),
    [allContacts],
  );

  const filteredPrimaryContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return primaryContacts;

    return primaryContacts.filter((item) =>
      `${item.name} ${item.relationship} ${item.phone} ${item.email} ${item.address} ${item.notes}`
        .toLowerCase()
        .includes(query),
    );
  }, [primaryContacts, search]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;

    return services.filter((item) =>
      `${item.name} ${item.category} ${item.phone} ${item.address} ${item.notes}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, services]);

  const loadContacts = useCallback(async () => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await getContacts(token);

      setAllContacts(response?.data?.items || []);
      if (!isOwner) {
        setMemberPermissions(
          response?.data?.permissions || {
            view: true,
            edit: false,
            delete: false,
          },
        );
      }
    } catch (error) {
      toast.error(error?.message || "Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetFormState = () => {
    setPrimaryForm(emptyPrimaryForm);
    setServiceForm(emptyServiceForm);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetFormState();
    setFormType("primary");
    setIsFormOpen(true);
  };

  const handleCopy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch (error) {
      toast.error("Copy failed");
    }
  };

  const handleEditPrimary = (item) => {
    setFormType("primary");
    setEditingId(item.id);
    setPrimaryForm({
      name: item.name || "",
      relationship: item.relationship || RELATIONSHIP_OPTIONS[0],
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      notes: item.notes || "",
    });
    setServiceForm(emptyServiceForm);
    setIsFormOpen(true);
  };

  const handleEditService = (item) => {
    setFormType("service");
    setEditingId(item.id);
    setServiceForm({
      name: item.name || "",
      category: item.category || SERVICE_CATEGORY_OPTIONS[0],
      phone: item.phone || item.primaryPhone || "",
      website: item.website || "",
      address: item.address || "",
      notes: item.notes || "",
    });
    setPrimaryForm(emptyPrimaryForm);
    setIsFormOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!canEdit) {
      toast.error("You do not have permission to add or edit contacts.");
      return;
    }

    setSubmitLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();

      if (formType === "primary") {
        if (!primaryForm.name.trim() || !primaryForm.phone.trim()) {
          toast.error("Contact name and phone number are required.");
          return;
        }

        const payload = {
          type: "primary",
          name: primaryForm.name.trim(),
          relationship: primaryForm.relationship.trim(),
          phone: primaryForm.phone.trim(),
          email: primaryForm.email.trim() || null,
          address: primaryForm.address.trim() || null,
          notes: primaryForm.notes.trim() || null,
        };

        if (editingId) {
          const response = await updateContact(token, editingId, payload);
          const updated = response?.data;
          setAllContacts((prev) =>
            prev.map((item) => (item.id === editingId ? updated : item)),
          );
          toast.success("Primary contact updated.");
        } else {
          const response = await createContact(token, payload);
          const created = response?.data;
          setAllContacts((prev) => [created, ...prev]);
          toast.success("Primary contact added.");
        }
      } else {
        if (!serviceForm.name.trim() || !serviceForm.phone.trim()) {
          toast.error("Service name and phone number are required.");
          return;
        }

        const payload = {
          type: "service",
          name: serviceForm.name.trim(),
          category: serviceForm.category.trim(),
          phone: serviceForm.phone.trim(),
          website: serviceForm.website.trim() || null,
          address: serviceForm.address.trim() || null,
          notes: serviceForm.notes.trim() || null,
        };

        if (editingId) {
          const response = await updateContact(token, editingId, payload);
          const updated = response?.data;
          setAllContacts((prev) =>
            prev.map((item) => (item.id === editingId ? updated : item)),
          );
          toast.success("Service updated.");
        } else {
          const response = await createContact(token, payload);
          const created = response?.data;
          setAllContacts((prev) => [created, ...prev]);
          toast.success("Service added.");
        }
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
    if (!canDelete) {
      toast.error("You do not have permission to delete contacts.");
      return;
    }

    try {
      setDeleteLoading(true);
      const token = await auth.currentUser.getIdToken();
      await deleteContact(token, deleteTarget.id);
      setAllContacts((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      );
      toast.success(
        deleteTarget.type === "primary"
          ? "Primary contact removed."
          : "Service removed.",
      );
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
        title="Emergency Contacts"
        subtitle="Shared emergency contacts for all family members in this vault."
        right={
          canEdit ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.7)]"
            >
              <IconPlus size={16} />
              Add New Contact
            </button>
          ) : null
        }
      />

      <div className="grid gap-3 rounded-xl border border-red-600 bg-red-400/10 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/25 text-red-200">
            <IconAlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-200">
              {QUICK_DIAL.label}
            </p>
            <p className="text-xs text-rose-100/70">{QUICK_DIAL.hint}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openTel(QUICK_DIAL.primaryNumber)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          911
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800/90 px-5 py-4 mt-4 bg-dashboard-card">
        <div className="relative">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search contacts or services..."
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

        <div className="space-y-4 mt-4 ">
          <div className="flex items-center gap-2 text-slate-100">
            <IconStar size={20} className="text-sky-400" />
            <h3 className="text-xl font-semibold">Primary Contacts</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 ">
            {filteredPrimaryContacts.map((contact) => (
              <PrimaryContactCard
                key={contact.id}
                contact={contact}
                canEdit={canEdit}
                canDelete={canDelete}
                getInitials={getInitials}
                onEdit={handleEditPrimary}
                onDelete={(item) =>
                  setDeleteTarget({
                    id: item.id,
                    type: "primary",
                    name: item.name,
                  })
                }
                onCopy={handleCopy}
                onCall={openTel}
                onSms={openSms}
                onMail={openMail}
              />
            ))}
            {filteredPrimaryContacts.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 text-sm text-slate-400 md:col-span-2 xl:col-span-3">
                No primary contacts found.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2 text-slate-100">
            <IconShield size={20} className="text-cyan-400" />
            <h3 className="text-xl font-semibold">Additional Services</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredServices.map((service) => (
              <ServiceContactCard
                key={service.id}
                service={service}
                canEdit={canEdit}
                canDelete={canDelete}
                getInitials={getInitials}
                onCall={openTel}
                onEdit={handleEditService}
                onDelete={(item) =>
                  setDeleteTarget({
                    id: item.id,
                    type: "service",
                    name: item.name,
                  })
                }
              />
            ))}
            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 text-sm text-slate-400 md:col-span-2">
                No additional services found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <ContactFormModal
        open={isFormOpen}
        editingId={editingId}
        formType={formType}
        setFormType={setFormType}
        primaryForm={primaryForm}
        setPrimaryForm={setPrimaryForm}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        relationshipOptions={RELATIONSHIP_OPTIONS}
        serviceCategoryOptions={SERVICE_CATEGORY_OPTIONS}
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
