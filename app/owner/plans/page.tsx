import { getAllPlanConfigs } from "@/lib/plans-data";
import { PlanEditor } from "@/components/owner/plan-editor";

export const dynamic = "force-dynamic";

export default async function OwnerPlansPage() {
  const plans = await getAllPlanConfigs();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Subscription tiers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit pricing, caps, and features. Changes go live on the marketing site and
          client billing instantly. Prices are in ₹ (INR), GST excluded.
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        {plans.map((p) => (
          <PlanEditor key={p.tier} plan={p} />
        ))}
      </div>
    </div>
  );
}
