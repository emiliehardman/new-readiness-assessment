import { getStatus } from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";

export default function StampBadge({
  score,
  size = 64,
}: {
  score: number;
  size?: number;
}) {
  const compact = size <= 42;

  if (!score) {
    const c = STATUS_COLORS.neutral;
    return (
      <div
        className={`inline-flex items-center rounded-full border font-semibold ${
          compact ? "gap-1.5 px-2.5 py-1 text-[11px]" : "gap-2 px-3 py-1.5 text-[12px]"
        }`}
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
      >
        <span
          className={compact ? "h-1.5 w-1.5 rounded-full" : "h-2 w-2 rounded-full"}
          style={{ background: c.fill }}
          aria-hidden="true"
        />
        Pending
      </div>
    );
  }

  const status = getStatus(score);
  const c = STATUS_COLORS[status.key];

  return (
    <div
      className={`inline-flex items-center rounded-full border font-semibold ${
        compact ? "gap-1.5 px-2.5 py-1 text-[11px]" : "gap-2 px-3 py-1.5 text-[12px]"
      }`}
      style={{ background: c.bg, borderColor: c.border, color: c.text }}
    >
      <span
        className={compact ? "h-1.5 w-1.5 rounded-full" : "h-2 w-2 rounded-full"}
        style={{ background: c.fill }}
        aria-hidden="true"
      />
      {status.label}
    </div>
  );
}