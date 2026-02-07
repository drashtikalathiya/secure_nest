import { IconCheck } from "@tabler/icons-react";

export default function PlanCard({ plan, selected, onSelect, onSubscribe }) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border p-6 transition-all flex flex-col
        ${
          selected
            ? "border-primary ring-2 ring-primary bg-[#0f172a]"
            : "border-[#1f2a3a] bg-[#121a28] hover:border-primary/50"
        }`}
    >
      {plan.popular && (
        <span className="absolute top-4 right-4 text-xs bg-primary text-white px-3 py-1 rounded-full">
          MOST POPULAR
        </span>
      )}

      <div className="absolute top-4 left-4">
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6">{plan.title}</h2>
      <p className="text-gray-400 text-sm mt-1">{plan.description}</p>

      <div className="my-6">
        <span className="text-4xl font-bold">{plan.price}</span>
        <span className="text-gray-400 text-sm"> / 30 days</span>
      </div>

      <ul className="space-y-3 text-sm mb-6">
        {plan.features.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <IconCheck size={16} className="text-primary" />
            {item}
          </li>
        ))}
      </ul>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSubscribe(plan.price_id);
        }}
        className={`w-full h-11 mt-auto rounded-md font-semibold transition text-sm
          ${
            selected
              ? "bg-primary hover:bg-primary/90 opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
      >
        Select Plan for Your Nest
      </button>
    </div>
  );
}
