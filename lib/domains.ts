export type Domain = {
  id: string;
  title: string;
  short: string;
  description: string;
  items: string[];
};

export const SCALE = [
  { value: 1, label: "Rarely true" },
  { value: 2, label: "Sometimes true" },
  { value: 3, label: "Consistently true" },
] as const;

// 8 domains x 3 statements, written for academic library leadership teams
// of any size, including smaller libraries where one or two people handle
// what a larger institution might split across a formal cabinet.
export const domains: Domain[] = [
  {
    id: "strategic",
    title: "Strategic clarity and case for change",
    short: "Strategic clarity",
    description:
      "Whether the library has articulated why change is necessary, what success would look like, and how the initiative aligns with institutional mission and local context.",
    items: [
      "Leaders can clearly explain why this change matters for service, staffing, and the library's relevance to campus.",
      "The desired future state is concrete enough that staff can picture what will be different.",
      "This initiative fits our library's mission, size, and constraints rather than importing a model built for a much larger institution.",
    ],
  },
  {
    id: "sponsorship",
    title: "Leadership sponsorship and decision-making",
    short: "Leadership",
    description:
      "Whether the people who hold decision-making authority for the library, whatever their titles, are visibly sponsoring the change and making timely decisions. In a small library this may be one director working closely with a couple of area leads rather than a formal cabinet.",
    items: [
      "Library leadership visibly and consistently sponsors this change through their behavior, priorities, and resource choices, not just announcements.",
      "It's clear who has the authority to make decisions about this initiative, whether that's a single director, a small leadership team, or area managers sharing responsibility.",
      "Decisions get made in a reasonable timeframe, even when consultation is informal or the decision-making group is small.",
    ],
  },
  {
    id: "communication",
    title: "Communication, trust, and meaning-making",
    short: "Communication",
    description:
      "Whether information is credible, timely, and adapted for how people at different levels of the library experience change.",
    items: [
      "Staff receive timely, honest communication, including what's not yet known, and rumors or mixed messages get addressed quickly.",
      "Messages are adapted for different groups rather than delivered as one generic announcement to everyone.",
      "Leaders communicate in ways that build trust rather than sounding defensive, evasive, or overly promotional.",
    ],
  },
  {
    id: "managers",
    title: "Area lead and supervisor readiness",
    short: "Area leads",
    description:
      "Whether the people between senior leadership and frontline staff, whether their title is manager, coordinator, supervisor, or team lead, have the clarity, authority, and support to carry the change into daily practice.",
    items: [
      "Area leads and supervisors understand the goals, timeline, and implications of the change well enough to explain it to their teams.",
      "Area leads have enough authority to adapt implementation to the realities of their own area, even when they're also doing frontline work themselves.",
      "Area leads have a real channel to raise concerns and workload pressure upward before problems escalate, rather than absorbing them silently.",
    ],
  },
  {
    id: "staff",
    title: "Staff readiness, professional identity, and participation",
    short: "Staff readiness",
    description:
      "Whether staff have opportunities to understand, shape, and prepare for the change, especially when it affects professional norms and work identity.",
    items: [
      "Staff understand how the change may alter workflows, expectations, or what counts as good work in their role.",
      "Staff concerns are taken seriously, and the people who will carry the heaviest implementation burden have real opportunities to inform the process.",
      "Training and support plans account for uneven technical fluency and different starting points across staff, including student workers and part-time employees where relevant.",
    ],
  },
  {
    id: "capacity",
    title: "Operational capacity, resourcing, and pace",
    short: "Capacity",
    description:
      "Whether the library has the staffing, time, sequencing, and operational discipline to implement change without destabilizing core services like reference, instruction, or circulation.",
    items: [
      "The pace and staffing assumptions behind this initiative are realistic for a library our size, where most people already wear multiple hats.",
      "Core public services and existing obligations have been factored into the pacing of implementation.",
      "Dependencies, risks, and competing priorities are visible and actively managed rather than discovered as problems arise.",
    ],
  },
  {
    id: "ethics",
    title: "Ethics, risk, and institutional values",
    short: "Ethics & risk",
    description:
      "Whether the change has been evaluated through the library's public-service values, including privacy, accessibility, equity, and reputational risk.",
    items: [
      "Relevant ethical and risk issues, such as accessibility, patron privacy, staff workload, and reputational risk, were identified early enough to shape the initiative.",
      "Leaders can explain how this change aligns with the library's stated values and its obligations to students, faculty, and the community it serves.",
      "Risk is being managed explicitly by leadership rather than deferred to frontline staff or treated as someone else's problem.",
    ],
  },
  {
    id: "reinforcement",
    title: "Assessment, reinforcement, and sustainment",
    short: "Sustainment",
    description:
      "Whether the library is measuring adoption, learning from implementation, and reinforcing change beyond initial launch.",
    items: [
      "Leaders are treating this as an ongoing practice change, with reinforcement planned beyond the initial rollout, rather than a one-time announcement or training event.",
      "The library has clear indicators that will show whether the change is actually taking hold in day-to-day work.",
      "Feedback loops are in place to identify implementation problems and adjust course, even if that just means regular check-ins with a small team.",
    ],
  },
];

export const TOTAL_ITEMS = domains.reduce((n, d) => n + d.items.length, 0);
