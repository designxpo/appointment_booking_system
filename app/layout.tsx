import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const TITLE = "Slotnest — AI Receptionist & Smart Appointment Booking";
const DESCRIPTION =
  "Turn conversations into booked appointments. Slotnest is the AI receptionist that answers clients, checks live availability, and books 24/7 — for 40+ industries, with a built-in website builder.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Slotnest",
  },
  description: DESCRIPTION,
  keywords: [
    "AI receptionist",
    "appointment booking",
    "scheduling software",
    "AI scheduling",
    "online booking",
    "booking website builder",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Slotnest",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
