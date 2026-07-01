import { listClients } from "@/lib/owner-data";
import { getActivePlanMap } from "@/lib/plans-data";
import { ClientsTable } from "@/components/owner/clients-table";

export const dynamic = "force-dynamic";

export default async function OwnerClientsPage() {
  const [clients, planMap] = await Promise.all([listClients(), getActivePlanMap()]);
  const planNames = Object.fromEntries(
    Object.values(planMap).map((p) => [p.tier, p.name]),
  ) as Record<string, string>;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length} business{clients.length === 1 ? "" : "es"} on Slotnest. Click any
            row to manage its subscription.
          </p>
        </div>
      </header>
      <ClientsTable clients={clients} planNames={planNames} />
    </div>
  );
}
