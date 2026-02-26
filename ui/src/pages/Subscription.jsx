import { useEffect, useState } from "react";
import { IconShieldCheck, IconClock } from "@tabler/icons-react";
import PlanCard from "../components/PlanCard";
import {
  createCheckoutSession,
  fetchSubscriptionPlans,
} from "../services/billingApi";
import toast from "react-hot-toast";

const handleSubscribe = async (priceId) => {
  try {
    if (!priceId) {
      toast.error("Plan is unavailable. Try again later.");
      return;
    }
    const { url } = await createCheckoutSession(priceId);

    window.location.href = url;
  } catch (error) {
    console.log("Error", error);
  }
};

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState("family");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const { data } = await fetchSubscriptionPlans();
        if (!isActive) return;
        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error?.message || "Failed to load plans.");
        setPlans([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1220] text-white px-6 py-12 flex flex-col justify-center">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold">Choose your Nest</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Secure your family’s future with a plan that fits your needs.
        </p>
      </div>

      {plans.length ? (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              onSubscribe={handleSubscribe}
              subscribeDisabled={loading || !plan.price_id}
              subscribeLabel={
                loading ? "Loading..." : "Select Plan for Your Nest"
              }
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl text-center text-sm text-slate-300">
          {loading ? "Loading plans..." : "No subscription plans available."}
        </div>
      )}

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
