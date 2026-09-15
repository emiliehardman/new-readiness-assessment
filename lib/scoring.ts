import { domains } from "./domains";

export type Responses = Record<string, number>;

export type DomainScore = {
  id: string;
  title: string;
  short: string;
  description: string;
  strengthNote: string;
  priorityNote: string;
  reflectionPrompt: string;
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
      reflectionPrompt: domain.reflectionPrompt,
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

// Strengths and priorities are defined by actual status band, not by rank.
// An earlier version took "the top 3, extended for ties" independently in
// each direction, which could pull a merely middling, at-risk domain into
// BOTH lists at once if enough scores clustered together. Filtering by
// status makes that structurally impossible: a domain can't be green and
// red at the same time. If nothing genuinely qualifies, the list is empty,
// which is the honest answer rather than a manufactured top 3.
export function topStrengths(domainScores: DomainScore[], max = 4): DomainScore[] {
  return domainScores
    .filter((d) => d.average > 0 && getStatus(d.average).key === "green")
    .sort((a, b) => b.average - a.average)
    .slice(0, max);
}

export function topPriorities(domainScores: DomainScore[], max = 4): DomainScore[] {
  return domainScores
    .filter((d) => d.average > 0 && getStatus(d.average).key === "red")
    .sort((a, b) => a.average - b.average)
    .slice(0, max);
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

export type ReflectionPrompt = { label: string; question: string };

// Every prompt is labeled and specific, never a template with a domain name
// dropped in. When domains tie for lowest or highest, each tied domain gets
// its own labeled question rather than forcing them into one merged
// sentence, which is what produced confusing or hollow phrasing before.
export function reflectionPrompts(
  strengths: DomainScore[],
  priorities: DomainScore[]
): ReflectionPrompt[] {
  const prompts: ReflectionPrompt[] = [];

  if (priorities.length) {
    const lowestValue = priorities[0].average;
    priorities
      .filter((p) => p.average === lowestValue)
      .slice(0, 2)
      .forEach((domain) => {
        prompts.push({ label: domain.short, question: domain.reflectionPrompt });
      });
  }

  if (strengths.length) {
    const highestValue = strengths[0].average;
    strengths
      .filter((s) => s.average === highestValue)
      .slice(0, 2)
      .forEach((domain) => {
        prompts.push({ label: domain.short, question: domain.reflectionPrompt });
      });
  }

  prompts.push({
    label: "Resourcing",
    question:
      "What would you need to ask for, and of whom, to give this initiative the conditions it actually requires? What has stopped you from asking?",
  });
  prompts.push({
    label: "Avoidance",
    question:
      "Where in this change are you avoiding a conversation, a decision, or a person, and what would it take to stop avoiding it?",
  });

  return prompts.slice(0, 6);
}

// Looks at combinations of domain scores rather than domains in isolation.
// A single low score is a gap; two specific domains landing a certain way
// together is often a recognizable pattern with its own likely cause and
// its own fix. Written from patterns that show up repeatedly in academic
// library change efforts, particularly at smaller, leaner institutions.
// Only runs once every domain has been scored, and returns at most two
// matches so a director isn't handed a wall of diagnosis.
export type PatternInsight = { title: string; body: string };

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
