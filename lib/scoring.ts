import { domains } from "./domains";

export type Responses = Record<string, number>;

export type DomainScore = {
  id: string;
  title: string;
  short: string;
  description: string;
  strengthNote: string;
  priorityNote: string;
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

// Narrative interpretation for each aggregate bucket, so the results view
// doesn't leave a number to speak for itself. Written for the realities of
// a smaller academic library: thin staffing, informal governance, people
// holding more than one role.
export const bucketNarratives: Record<
  keyof AggregateScores,
  { strong: string; attention: string }
> = {
  leadership: {
    strong:
      "Staff can see decisions being made and are hearing about this change directly from leadership, which is what keeps rumor and mixed messaging from filling the gap.",
    attention:
      "Either decisions on this initiative aren't visibly moving, or staff are filling in the gaps themselves with secondhand information. Both erode trust in the same way, and a small library can't out-communicate a lack of decisions.",
  },
  success: {
    strong:
      "The case for this change is landing, and there's a real plan to keep attention on it after launch, the combination that predicts whether it becomes permanent practice rather than a memory.",
    attention:
      "Either the case for this change isn't fully landing, or nothing is planned to keep it alive after the initial push. Initiatives that score low here often look successful at kickoff and quietly fade within a year, especially grant-funded or pilot work.",
  },
  delivery: {
    strong:
      "Area leads have real authority and the staffing math is realistic, so implementation is more likely to hold up under actual workload rather than good intentions alone.",
    attention:
      "Area leads may be trying to carry this change without enough authority, staffing, or time, especially if they're also doing frontline work themselves. This is where good ideas most often quietly stall in smaller academic libraries.",
  },
  readiness: {
    strong:
      "Staff understand how this affects their own daily work, and risks to specific people or users have been named and are being actively managed rather than discovered later.",
    attention:
      "Either staff don't yet see how this changes their own work, or risks to specific roles or users haven't been named clearly enough to act on. Both tend to surface later as resistance that looks personal but is actually structural.",
  },
};

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
      strengthNote: domain.strengthNote,
      priorityNote: domain.priorityNote,
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

// When the cutoff score is tied across domains, array order would
// otherwise decide arbitrarily which one "counts" as top-N. This extends
// the slice to include every domain tied at the cutoff, up to a hard cap,
// so a tie is represented as a tie rather than silently broken.
function extendForTies(sorted: DomainScore[], n: number, hardCap = 4): DomainScore[] {
  if (sorted.length <= n) return sorted;
  const cutoffValue = sorted[n - 1].average;
  let end = n;
  while (end < sorted.length && end < hardCap && sorted[end].average === cutoffValue) {
    end++;
  }
  return sorted.slice(0, end);
}

export function topStrengths(domainScores: DomainScore[], n = 3): DomainScore[] {
  const sorted = [...domainScores].filter((d) => d.average > 0).sort((a, b) => b.average - a.average);
  return extendForTies(sorted, n);
}

export function topPriorities(domainScores: DomainScore[], n = 3): DomainScore[] {
  const sorted = [...domainScores].filter((d) => d.average > 0).sort((a, b) => a.average - b.average);
  return extendForTies(sorted, n);
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

function joinNames(names: string[]): string {
  const lower = names.map((n) => n.toLowerCase());
  if (lower.length === 1) return lower[0];
  if (lower.length === 2) return `${lower[0]} and ${lower[1]}`;
  return `${lower.slice(0, -1).join(", ")}, and ${lower[lower.length - 1]}`;
}

export type PatternInsight = { title: string; body: string };

// Looks at combinations of domain scores rather than domains in isolation.
// A single low score is a gap; two specific domains landing a certain way
// together is often a recognizable pattern with its own likely cause and
// its own fix. Written from patterns that show up repeatedly in academic
// library change efforts, particularly at smaller, leaner institutions.
// Only runs once every domain has been scored, and returns at most two
// matches so a director isn't handed a wall of diagnosis.
export function patternInsights(domainScores: DomainScore[]): PatternInsight[] {
  if (!domainScores.length || domainScores.some((d) => d.average === 0)) return [];

  const map: Record<string, DomainScore> = {};
  domainScores.forEach((d) => {
    map[d.id] = d;
  });
  const keyOf = (id: string): StatusKey => {
    const d = map[id];
    return d ? getStatus(d.average).key : "neutral";
  };
  const isGreen = (id: string) => keyOf(id) === "green";
  const isRed = (id: string) => keyOf(id) === "red";

  const insights: PatternInsight[] = [];

  if (isGreen("sponsorship") && (isRed("managers") || isRed("staff"))) {
    insights.push({
      title: "Confident at the top, stretched at the point of delivery",
      body: "Leadership sponsorship is scoring as a strength, but the people actually carrying this change into daily work, area leads or staff, are scoring as high risk. In a smaller academic library, this combination often means leadership feels good about its own follow-through without yet seeing how thin things are at the point of delivery. The useful move isn't more sponsorship. It's going directly to an area lead or staff member this week and asking what the work actually looks like right now.",
    });
  }

  if (isGreen("strategic") && isRed("reinforcement")) {
    insights.push({
      title: "A strong launch with no plan to keep it alive",
      body: "The case for this change is landing, but there's no real plan for what happens after the initial push. This is a familiar pattern with grant-funded pilots and one-off initiatives in academic libraries: strong at kickoff, then quietly fading within a year once attention moves elsewhere. Naming who owns this after launch, even informally, is likely the single highest-leverage fix available here.",
    });
  }

  if ((isGreen("strategic") || isGreen("sponsorship")) && isRed("capacity")) {
    insights.push({
      title: "Real ambition outrunning real staffing",
      body: "Leadership's case and commitment are solid, but the time and staffing this change requires doesn't add up against everything the library is already doing. This is one of the most common failure patterns in libraries running lean, where most people already wear multiple hats. The fix is rarely willpower. It's a specific, named ask made upward, for money, time, or a position, before the schedule tightens further.",
    });
  }

  if (isRed("ethics") && (isRed("staff") || isRed("managers"))) {
    insights.push({
      title: "Risk sitting with the people least able to manage it",
      body: "Risk isn't yet being actively owned by leadership, and the people closest to the work, staff or area leads, are also showing strain. Left alone, these two gaps tend to compound: unmanaged risk quietly becomes frontline staff's problem to absorb, whether that's fielding upset patrons, handling a privacy concern, or covering a gap the plan didn't anticipate. Worth surfacing explicitly now rather than letting it be discovered downstream.",
    });
  }

  if (
    insights.length === 0 &&
    domainScores.every((d) => getStatus(d.average).key !== "red") &&
    domainScores.every((d) => getStatus(d.average).key !== "green")
  ) {
    insights.push({
      title: "Even, but nothing carrying real strength",
      body: "Nothing here is flagged as high risk, but nothing is a clear strength either. In change efforts, an evenly lukewarm profile often reflects polite compliance rather than genuine buy-in or genuine resistance: people are going along without anyone being especially invested. It may be more useful to deliberately push one domain, likely leadership sponsorship or communication, into a clear strength than to try to nudge everything slightly upward at once.",
    });
  }

  return insights.slice(0, 2);
}

export function reflectionPrompts(
  strengths: DomainScore[],
  priorities: DomainScore[]
): string[] {
  const prompts: string[] = [];

  if (priorities.length) {
    const lowestValue = priorities[0].average;
    const tiedLowest = priorities.filter((p) => p.average === lowestValue);
    const label = joinNames(tiedLowest.map((d) => d.short));

    if (tiedLowest.length > 1) {
      prompts.push(
        `${label} are tied for your lowest score, not one clearly ahead of the other. Both are pointing at something specific that isn't happening yet. Pick whichever feels more urgent: what's the actual obstacle, and what would you need to do differently to change it?`
      );
    } else {
      prompts.push(
        `Your lowest-scoring area is ${label}. That's not a close call, it's the data pointing at something specific that isn't happening yet. What's the actual obstacle, and what would you need to do differently to change it?`
      );
    }

    const nextPriority = priorities.find((p) => p.average > lowestValue);
    if (nextPriority) {
      prompts.push(
        `If ${nextPriority.short.toLowerCase()} does not improve, what is the first thing that would go wrong, and who would notice it first?`
      );
    } else if (tiedLowest.length > 1) {
      prompts.push(
        `Between the tied areas above, where would you personally start first, and what makes that one more urgent than the other right now?`
      );
    }
  }

  if (strengths.length) {
    const highestValue = strengths[0].average;
    const tiedHighest = strengths.filter((s) => s.average === highestValue);
    const label = joinNames(tiedHighest.map((d) => d.short));

    if (tiedHighest.length > 1) {
      prompts.push(
        `You scored highest on ${label}, tied together. What evidence do you have for that beyond your own vantage point, and would your staff rate both the same way?`
      );
    } else {
      prompts.push(
        `You scored highest on ${label}. What evidence do you have for that beyond your own vantage point, and would your staff rate it the same way?`
      );
    }
  }

  prompts.push(
    "What would you need to ask for, and of whom, to give this initiative the conditions it actually requires? What has stopped you from asking?"
  );
  prompts.push(
    "Where in this change are you avoiding a conversation, a decision, or a person, and what would it take to stop avoiding it?"
  );

  return prompts.slice(0, 5);
}
