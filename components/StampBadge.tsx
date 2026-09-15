import { getStatus } from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";

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
      <div className="text-center" style={{ width: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
          <g transform="rotate(-6 50 50)">
            <circle cx="50" cy="50" r="42" fill="none" stroke={c.border} strokeWidth="2.5" />
            <circle cx="50" cy="50" r="34" fill="none" stroke={c.border} strokeWidth="1" strokeDasharray="2 3" />
          </g>
        </svg>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.text }}>
          Pending
        </div>
      </div>
    );
  }

  const status = getStatus(score);
  const c = STATUS_COLORS[status.key];
  const symbol = status.key === "green" ? "✓" : status.key === "amber" ? "~" : "!";

  return (
    <div className="text-center" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <g transform="rotate(-6 50 50)">
          <circle cx="50" cy="50" r="42" fill="none" stroke={c.fill} strokeWidth="2.5" />
          <circle cx="50" cy="50" r="34" fill="none" stroke={c.fill} strokeWidth="1" strokeDasharray="1.5 3" opacity="0.8" />
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontSize="30"
            fontWeight="700"
            fill={c.fill}
            fontFamily="var(--font-display)"
          >
            {symbol}
          </text>
        </g>
      </svg>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.text }}>
        {status.label}
      </div>
    </div>
  );
}
