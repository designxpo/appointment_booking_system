import { requireProfile } from "@/lib/get-profile";
import { getCalendarRows } from "@/lib/dashboard-data";
import { AppointmentsTable } from "@/components/appointments-table";
import { IconList } from "@/components/icons";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { labels } = await requireProfile();
  const [{ q }, rows] = await Promise.all([searchParams, getCalendarRows()]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center gap-3">
        <span className="page-icon">
          <IconList className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{labels.appointmentPlural}</h1>
          <p className="text-sm text-gray-500">
            Manage and track all {labels.appointmentPlural.toLowerCase()}
          </p>
        </div>
      </div>
      <AppointmentsTable rows={rows} clientLabel={labels.client} initialQuery={q ?? ""} />
    </div>
  );
}
