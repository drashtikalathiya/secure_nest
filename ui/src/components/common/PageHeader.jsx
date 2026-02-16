export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}
