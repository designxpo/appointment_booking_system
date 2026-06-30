import { notFound } from "next/navigation";
import { getManagedAppointment } from "@/action/manage";
import { ManageBooking } from "@/components/manage-booking";

/**
 * Client self-service page reached from the "manage your booking" link in
 * confirmation/reminder emails. Possession of the secret token is the auth.
 */
export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const appointment = await getManagedAppointment(token).catch(() => null);
  if (!appointment) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <ManageBooking token={token} appointment={appointment} />
      <p className="mt-4 text-center text-xs text-gray-400">
        Powered by Slotnest
      </p>
    </main>
  );
}
