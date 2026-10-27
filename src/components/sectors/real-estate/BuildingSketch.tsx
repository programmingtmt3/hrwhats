/** Line drawing of two buildings, blueprint style (decorative). */
export function BuildingSketch({ className }: { className?: string }) {
  const towerWindows = [0, 1, 2, 3].flatMap((row) => [0, 1, 2].map((col) => [52 + col * 16, 40 + row * 16]));
  const lowWindows = [0, 1].flatMap((row) => [0, 1, 2, 3].map((col) => [122 + col * 19, 64 + row * 18]));

  return (
    <svg className={className} viewBox="0 0 240 120" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M8 110H232" />
        <rect x="40" y="28" width="60" height="82" />
        <rect x="110" y="52" width="92" height="58" />
        <path d="M70 28V18M62 18h16" />
        <rect x="64" y="94" width="12" height="16" />
        <rect x="148" y="94" width="16" height="16" />
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.7">
        {[...towerWindows, ...lowWindows].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" />
        ))}
      </g>
      {/* Dimension line above the low building. */}
      <g stroke="currentColor" strokeWidth="1" opacity="0.55">
        <path d="M110 42H202M110 38v8M202 38v8" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
