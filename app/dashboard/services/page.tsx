import { requireProfile } from "@/lib/get-profile";
import { getServicesList } from "@/lib/dashboard-data";
import { ServicesBoard } from "@/components/services-board";
import { IconTag } from "@/components/icons";

export default async function ServicesPage() {
  const { labels } = await requireProfile();
  const services = await getServicesList();
  const active = services.filter((s) => s.is_active).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconTag className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{labels.servicePlural}</h1>
          <p className="text-sm text-gray-500">
            {active} active · {services.length} total
          </p>
        </div>
      </div>
      <ServicesBoard services={services} serviceLabel={labels.service} />
    </div>
  );
}
