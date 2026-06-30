import { requireProfile } from "@/lib/get-profile";
import { BillingPlans } from "@/components/billing-plans";

export default async function BillingPage() {
  const { profile } = await requireProfile();

  return (
    <div>
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="mt-1 text-sm text-gray-500">
        Subscriptions are paid monthly in USDT, wallet-to-wallet via MetaMask.
      </p>
      {profile.plan_expires_at && (
        <p className="mt-2 text-sm text-gray-600">
          Current period renews/expires on{" "}
          <strong>{new Date(profile.plan_expires_at).toLocaleDateString()}</strong>.
        </p>
      )}
      <BillingPlans currentPlan={profile.plan} />
    </div>
  );
}
