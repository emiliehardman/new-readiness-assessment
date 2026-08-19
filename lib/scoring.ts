import { domains } from "./domains";

export type Responses = Record<string, number>;

export type DomainScore = {
  id: string;
  title: string;
  short: string;
  description: string;
  average: number;
};

export type AggregateBucket = { title: string; average: number };

export type AggregateScores = {
  leadership: AggregateBucket;
  success: AggregateBucket;
  delivery: AggregateBucket;
  readiness: AggregateBucket;
};

export type StatusKey = "green" | "amber" | "red" | "neutral";

export function emptyResponses(): Responses {
  const obj: Responses = {};
  domains.forEach((domain) => {
    domain.items.forEach((_, idx) => {
      obj[`${domain.id}-${idx}`] = 0;
    });
  });
  return obj;
}

export function getStatus(score: number): { label: string; key: StatusKey } {
  if (score >= 2.5) return { label: "Strength", key: "green" };
  if (score >= 1.75) return { label: "At risk", key: "amber" };
  return { label: "High risk", key: "red" };
}

export function scoreToPercent(score: number): number {
  return Math.max(0, Math.min(100, ((score - 1) / 2) * 100));
}

export function computeDomainScores(responses: Responses): DomainScore[] {
  return domains.map((domain) => {
    const vals = domain.items
      .map((_, idx) => responses[`${domain.id}-${idx}`])
      .filter((v) => v > 0);
    const average = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return {
      id: domain.id,
      title: domain.title,
      short: domain.short,
      description: domain.description,
      average,
    };
  });
}

export function computeCompletion(responses: Responses): {
  answered: number;
  total: number;
  percent: number;
} {
  const answered = Object.values(responses).filter(Boolean).length;
  const total = Object.keys(responses).length;
  const percent = total ? Math.round((answered / total) * 100) : 0;
  return { answered, total, percent };
}

export function computeOverall(domainScores: DomainScore[]): number {
  return domainScores.every((d) => d.average > 0)
    ? domainScores.reduce((a, b) => a + b.average, 0) / domainScores.length
    : 0;
}

export function computeAggregateScores(domainScores: DomainScore[]): AggregateScores {
  const map: Record<string, number> = {};
  domainScores.forEach((d) => {
    map[d.id] = d.average || 0;
  });
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    leadership: { title: "Leadership", average: avg([map.sponsorship, map.communication]) },
    success: { title: "Success", average: avg([map.strategic, map.reinforcement]) },
    delivery: { title: "Delivery", average: avg([map.managers, map.capacity]) },
    readiness: { title: "Readiness", average: avg([map.staff, map.ethics]) },
  };
}

export function topStrengths(domainScores: DomainScore[], n = 3): DomainScore[] {
  return [...domainScores]
    .filter((d) => d.average > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, n);
}

export function topPriorities(domainScores: DomainScore[], n = 3): DomainScore[] {
  return [...domainScores]
    .filter((d) => d.average > 0)
    .sort((a, b) => a.average - b.average)
    .slice(0, n);
}

export function overallInterpretation(overall: number): string {
  if (overall >= 2.5) {
    return "This initiative appears comparatively well-positioned, but the main question is whether strengths are durable under implementation pressure. Review at-risk areas for hidden fragility.";
  }
  if (overall >= 1.75) {
    return "This initiative shows mixed readiness. Progress is possible, but uneven sponsorship, capacity, or trust may create drag unless addressed directly.";
  }
  return "This initiative is at elevated risk. Before accelerating implementation, leaders should clarify the case for change, stabilize communication, and address core sponsorship or capacity gaps.";
}

export function reflectionPrompts(
  strengths: DomainScore[],
  priorities: DomainScore[]
): string[] {
  const prompts: string[] = [];
  const topPriority = priorities[0];
  const secondPriority = priorities[1];
  const topStrength = strengths[0];

  if (topPriority) {
    prompts.push(
      `What is one concrete action you could take in the next 30 days to strengthen ${topPriority.short.toLowerCase()}?`
    );
  }
  if (secondPriority) {
    prompts.push(
      `Where might weaknesses in ${secondPriority.short.toLowerCase()} slow implementation, and what early intervention would help?`
    );
  }
  if (topStrength) {
    prompts.push(
      `How can you use your relative strength in ${topStrength.short.toLowerCase()} to support weaker areas of this initiative?`
    );
  }
  prompts.push(
    "Where do people in your library likely have a different experience of this change than senior leadership does?"
  );
  prompts.push("What is still unclear, untested, or under-communicated in this initiative?");

  return prompts.slice(0, 5);
}
