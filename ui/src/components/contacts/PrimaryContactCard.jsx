import {
  IconCopy,
  IconEdit,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";

export default function PrimaryContactCard({
  contact,
  canEdit,
  canDelete,
  getInitials,
  onEdit,
  onDelete,
  onCopy,
  onCall,
  onSms,
  onMail,
}) {
  return (
    <article className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-200">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={`${contact.name} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(contact.name) || <IconUsers size={18} />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-white">{contact.name}</h4>
            <div className="mt-1 inline-flex items-center rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
              {contact.relationship}
            </div>
            <p className="mt-2 text-xs text-slate-400">{contact.notes}</p>
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

      <div className="mt-4 space-y-2 text-xs text-slate-300">
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2">
          <p className="inline-flex items-center gap-2">
            <IconPhone size={14} className="text-slate-500" />
            {contact.phone}
          </p>
          <button
            type="button"
            onClick={() => onCopy(contact.phone)}
            className="text-slate-400 hover:text-white"
            aria-label="Copy phone number"
          >
            <IconCopy size={14} />
          </button>
        </div>
        {contact.address ? (
          <div className="rounded-lg border border-slate-800 bg-slate-950/30 px-3 py-2 text-slate-400">
            <p className="inline-flex items-center gap-2">
              <IconMapPin size={14} className="text-slate-500" />
              {contact.address}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onCall(contact.phone)}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500"
        >
          <IconPhone size={14} />
          Call
        </button>
        <button
          type="button"
          onClick={() => onSms(contact.phone)}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-600"
        >
          SMS
        </button>
        {contact.email ? (
          <button
            type="button"
            onClick={() => onMail(contact.email)}
            className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-700"
          >
            <IconMail size={14} />
            Email
          </button>
        ) : null}
      </div>
    </article>
  );
}
