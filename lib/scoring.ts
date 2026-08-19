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
    return "Across most domains, the groundwork for this change appears to be in place. The useful question now is which of these strengths would hold up under real implementation pressure, and whether any high scores reflect confidence that has not yet been tested against what staff would say.";
  }
  if (overall >= 1.75) {
    return "This initiative shows uneven readiness. There is enough in place to move, but the gaps are likely to show up as friction once implementation is underway. The lower-scoring domains below are worth examining before the pace picks up.";
  }
  return "Several foundations for this change are not yet solid. This is a common and workable place to be early on, but the lower-scoring domains below point to work worth doing before implementation accelerates, particularly anything involving clarity, capacity, or what staff currently understand.";
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
      `Your lowest-scoring area is ${topPriority.short.toLowerCase()}. What specifically made you hesitate on those items, and is that something you have said out loud to anyone yet?`
    );
  }
  if (secondPriority) {
    prompts.push(
      `If ${secondPriority.short.toLowerCase()} does not improve, what is the first thing that would go wrong, and who would notice it first?`
    );
  }
  if (topStrength) {
    prompts.push(
      `You scored highest on ${topStrength.short.toLowerCase()}. What evidence do you have for that beyond your own vantage point, and would your staff rate it the same way?`
    );
  }
  prompts.push(
    "Which group in your library experiences this change most differently from how leadership experiences it, and how would you know?"
  );
  prompts.push(
    "What is the question about this initiative you would least like to be asked in an all-staff meeting?"
  );

  return prompts.slice(0, 5);
}
