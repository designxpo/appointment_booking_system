/**
 * Decorative accents for the marketing site: violet light blooms and the
 * four-point sparkle stars that punctuate the reference designs. All purely
 * visual — aria-hidden, pointer-events-none.
 */

/** A soft, vivid radial light bloom. Position/size with `className`. */
export function Bloom({
  className = "",
  color = "rgba(124,121,246,0.45)",
  blur = 120,
}: {
  className?: string;
  color?: string;
  blur?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: color, filter: `blur(${blur}px)` }}
    />
  );
}

/** A four-point sparkle star with a soft glow. Position with `className`. */
export function Sparkle({
  className = "",
  size = 16,
  color = "#c7d2fe",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute animate-pulse-glow ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ filter: "drop-shadow(0 0 6px rgba(165,163,248,0.9))" }}
    >
      <path d="M12 0c.5 6.2 2.3 8 8.5 8.5-6.2.5-8 2.3-8.5 8.5-.5-6.2-2.3-8-8.5-8.5C9.7 8 11.5 6.2 12 0Z" />
    </svg>
  );
}
