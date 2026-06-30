import { requireProfile } from "@/lib/get-profile";
import { getCalendarRows } from "@/lib/dashboard-data";
import { CalendarGrid } from "@/components/calendar-grid";
import { IconCalendar } from "@/components/icons";

export default async function CalendarPage() {
  const { labels } = await requireProfile();
  const rows = await getCalendarRows();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center gap-3">
        <span className="page-icon">
          <IconCalendar className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-sm text-gray-500">Click an appointment to view details and update its status.</p>
        </div>
      </div>
      <CalendarGrid rows={rows} clientLabel={labels.client} />
    </div>
  );
}
