import { getStatus } from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";

// A diamond marker, chosen to read as distinct at a glance from the
// companion Leadership Capacity app's soft ring. Status is carried by
// both the symbol and the text label, never by color alone.
//
// The wrapper sizes to its content rather than to the diamond's width:
// labels like "HIGH RISK" are wider than a small 42px marker and can't
// wrap, so pinning the width would clip or spill them.
export default function StampBadge({
  score,
  size = 64,
}: {
  score: number;
  size?: number;
}) {
  if (!score) {
    const c = STATUS_COLORS.neutral;
    return (
      <div className="inline-flex flex-col items-center">
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
          <rect
            x="22" y="22" width="56" height="56"
            transform="rotate(45 50 50)"
            fill="none" stroke={c.border} strokeWidth="3" strokeDasharray="4 4"
          />
        </svg>
        <div className="whitespace-nowrap font-mono text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: c.text }}>
          Pending
        </div>
      </div>
    );
  }

  const status = getStatus(score);
  const c = STATUS_COLORS[status.key];
  const symbol = status.key === "green" ? "✓" : status.key === "amber" ? "~" : "!";

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <rect
          x="22" y="22" width="56" height="56"
          transform="rotate(45 50 50)"
          fill={c.bg} stroke={c.fill} strokeWidth="4"
        />
        <text
          x="50" y="61"
          textAnchor="middle"
          fontSize="30" fontWeight="700"
          fill={c.text}
          fontFamily="var(--font-display)"
        >
          {symbol}
        </text>
      </svg>
      <div className="whitespace-nowrap font-mono text-[11.5px] font-bold uppercase tracking-[0.12em]" style={{ color: c.text }}>
        {status.label}
      </div>
    </div>
  );
}
