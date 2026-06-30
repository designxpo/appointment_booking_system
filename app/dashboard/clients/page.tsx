import { requireProfile } from "@/lib/get-profile";
import { getLeads } from "@/lib/dashboard-data";
import { ClientsBoard } from "@/components/clients-board";
import { IconUsers } from "@/components/icons";

export default async function ClientsPage() {
  const { labels } = await requireProfile();
  const leads = await getLeads();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconUsers className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{labels.clientPlural}</h1>
          <p className="text-sm text-gray-500">
            {leads.length} {leads.length === 1 ? labels.client.toLowerCase() : labels.clientPlural.toLowerCase()} registered
          </p>
        </div>
      </div>
      <ClientsBoard
        leads={leads}
        clientLabel={labels.client}
        clientPlural={labels.clientPlural}
      />
    </div>
  );
}
