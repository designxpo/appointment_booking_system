/**
 * Slotnest brand mark — a rounded hexagon holding a stylised calendar check,
 * filled with the indigo→violet brand gradient. Pure SVG, scales to any size.
 */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fbLogo" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5a3f8" />
          <stop offset="1" stopColor="#5b58e8" />
        </linearGradient>
      </defs>
      <path
        d="M14.4 2.31a3.2 3.2 0 0 1 3.2 0l9.1 5.25a3.2 3.2 0 0 1 1.6 2.77v10.5a3.2 3.2 0 0 1-1.6 2.77l-9.1 5.26a3.2 3.2 0 0 1-3.2 0l-9.1-5.26a3.2 3.2 0 0 1-1.6-2.77v-10.5a3.2 3.2 0 0 1 1.6-2.77z"
        fill="url(#fbLogo)"
      />
      <path
        d="M11 15.6l3.1 3.1 6.4-6.4"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
