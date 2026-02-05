import { useState } from "react";
import { IconShieldCheck, IconClock } from "@tabler/icons-react";
import PlanCard from "../components/PlanCard";

const PLANS = [
  {
    id: "small",
    title: "Small Nest",
    price: "$9",
    description: "Perfect for couples or small families",
    features: [
      "Up to 3 members",
      "Encrypted Vault",
      "Shared Documents",
      "30 Days Validity",
    ],
  },
  {
    id: "family",
    title: "Family Nest",
    price: "$15",
    popular: true,
    description: "Best for secure family living",
    features: [
      "Up to 6 members",
      "Encrypted Vault",
      "Shared Documents",
      "Medical Records Storage",
      "Priority Support",
      "30 Days Validity",
    ],
  },
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState("family");

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-6 py-12 flex flex-col justify-center">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold">Choose your Nest</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Secure your family’s future with a plan that fits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </div>

      <div className="flex justify-center gap-8 mt-14 text-gray-400 text-xs">
        <div className="flex items-center gap-2">
          <IconShieldCheck size={16} /> AES-256 Bit Secure
        </div>
        <div className="flex items-center gap-2">
          <IconClock size={16} /> 30-Day Validity
        </div>
      </div>
    </div>
  );
}
