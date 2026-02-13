import { IconEdit, IconPhone, IconTrash } from "@tabler/icons-react";

export default function ServiceContactCard({
  service,
  canEdit,
  canDelete,
  getInitials,
  onCall,
  onEdit,
  onDelete,
}) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200">
          {service.logo ? (
            <img
              src={service.logo}
              alt={`${service.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(service.name)
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{service.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">{service.category}</p>
          <p className="mt-2 text-xs text-slate-400">{service.notes}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onCall(service.phone)}
          className="rounded-lg bg-sky-600 p-2 text-white hover:bg-sky-500"
          aria-label="Call service"
        >
          <IconPhone size={15} />
        </button>
        {canEdit ? (
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Edit service"
          >
            <IconEdit size={15} />
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(service)}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-rose-300"
            aria-label="Delete service"
          >
            <IconTrash size={15} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
