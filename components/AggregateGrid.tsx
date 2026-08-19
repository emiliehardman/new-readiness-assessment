import { AggregateScores, getStatus } from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";

export default function AggregateGrid({ aggregateScores }: { aggregateScores: AggregateScores }) {
  const cards = [
    { key: "leadership", label: "Leadership", value: aggregateScores.leadership.average },
    { key: "success", label: "Success", value: aggregateScores.success.average },
    { key: "delivery", label: "Delivery", value: aggregateScores.delivery.average },
    { key: "readiness", label: "Readiness", value: aggregateScores.readiness.average },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const status = getStatus(card.value);
        const c = STATUS_COLORS[status.key];
        return (
          <div
            key={card.key}
            className="flex min-h-[104px] flex-col justify-between rounded-card border p-4"
            style={{ borderColor: c.border, background: c.bg }}
          >
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
              {card.label}
            </div>
            <div className="font-serif text-3xl font-semibold leading-none text-ink">
              {card.value.toFixed(2)}
            </div>
            <div className="text-sm font-semibold" style={{ color: c.text }}>
              {status.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
