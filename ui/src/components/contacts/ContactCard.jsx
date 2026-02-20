import {
  IconEdit,
  IconHeartHandshake,
  IconHome,
  IconKey,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShield,
  IconStethoscope,
  IconTrash,
  IconGavel,
} from "@tabler/icons-react";

const CATEGORY_ICON_MAP = {
  "Medical Emergency": IconStethoscope,
  "Legal Guardian": IconGavel,
  "Neighbor / Keyholder": IconKey,
  "Security Provider": IconShield,
  Family: IconHome,
};

export default function ContactCard({
  contact,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  const CategoryIcon =
    CATEGORY_ICON_MAP[contact.category] || IconHeartHandshake;

  return (
    <article className="rounded-2xl border border-slate-800/80 border-l-[3px] border-l-sky-500/90 bg-dashboard-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start flex-col gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800/90 text-sm font-semibold text-slate-200">
            <CategoryIcon size={18} className="text-sky-300" />
          </div>
          <div className="flex min-w-0 items-start flex-col gap-2">
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-slate-800/70 text-slate-300">
              {contact.relationship}
            </div>
            <div className="inline-flex items-center rounded-md bg-sky-500/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-300">
              {contact.category || contact.relationship || "Contact"}
            </div>
            <h4 className="text-xl font-semibold text-white">{contact.name}</h4>
          </div>
        </div>

        {canEdit || canDelete ? (
          <div className="flex items-center gap-1">
            {canEdit ? (
              <button
                type="button"
                onClick={() => onEdit(contact)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Edit contact"
              >
                <IconEdit size={15} />
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(contact)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-300"
                aria-label="Delete contact"
              >
                <IconTrash size={15} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-2 text-xs text-slate-300">
        {contact.phone ? (
          <div className="rounded-lg px-1 py-1">
            <p className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <IconPhone size={12} />
              </span>
              <span className="text-sm text-slate-200">{contact.phone}</span>
            </p>
          </div>
        ) : null}

        {contact.address ? (
          <div className="rounded-lg px-1 py-1 text-slate-400">
            <p className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <IconMapPin size={12} />
              </span>
              {contact.address}
            </p>
          </div>
        ) : null}
        {contact.email ? (
          <div className="rounded-lg px-1 py-1 text-slate-400">
            <p className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                <IconMail size={12} />
              </span>
              {contact.email}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
