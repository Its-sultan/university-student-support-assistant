// System logo: a lavender circle with two wave lines.
// `variant="badge"` (default) renders the gradient circle + white waves.
// `variant="mark"` renders only the waves (currentColor) for coloured backgrounds.
export default function Logo({ size = 40, variant = "badge", className = "" }) {
  const gid = "lavgrad";

  if (variant === "mark") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
        <path d="M13 27 q 9.5 -9 19 0 t 19 0" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" fill="none" />
        <path d="M13 38 q 9.5 9 19 0 t 19 0" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" fill="none" opacity="0.85" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <linearGradient id={gid} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b9a4fb" />
          <stop offset="1" stopColor="#7c5cf0" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${gid})`} />
      <path d="M13 27 q 9.5 -9 19 0 t 19 0" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M13 38 q 9.5 9 19 0 t 19 0" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.85" />
    </svg>
  );
}
