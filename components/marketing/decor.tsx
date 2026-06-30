/**
 * Decorative accents for the marketing site: violet light blooms and the
 * four-point sparkle stars that punctuate the reference designs. All purely
 * visual — aria-hidden, pointer-events-none. Motion is gentle and respects
 * prefers-reduced-motion (disabled in globals.css).
 */

/** A soft, vivid radial light bloom that slowly breathes. Position with `className`. */
export function Bloom({
  className = "",
  color = "rgba(124,121,246,0.45)",
  blur = 120,
  delay = 0,
  still = false,
}: {
  className?: string;
  color?: string;
  blur?: number;
  /** Stagger the breathing so multiple blooms drift out of sync (seconds). */
  delay?: number;
  /** Disable motion for this bloom. */
  still?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${still ? "" : "animate-glow-pulse"} ${className}`}
      style={{ background: color, filter: `blur(${blur}px)`, animationDelay: `${delay}s` }}
    />
  );
}

/** A four-point sparkle star that twinkles. Position with `className`. */
export function Sparkle({
  className = "",
  size = 16,
  color = "#c7d2fe",
  delay = 0,
}: {
  className?: string;
  size?: number;
  color?: string;
  delay?: number;
}) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute animate-twinkle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ filter: "drop-shadow(0 0 6px rgba(165,163,248,0.9))", animationDelay: `${delay}s` }}
    >
      <path d="M12 0c.5 6.2 2.3 8 8.5 8.5-6.2.5-8 2.3-8.5 8.5-.5-6.2-2.3-8-8.5-8.5C9.7 8 11.5 6.2 12 0Z" />
    </svg>
  );
}
