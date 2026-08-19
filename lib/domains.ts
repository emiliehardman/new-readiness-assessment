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

// 8 domains x 3 statements. Tightened from an original 4-item-per-domain
// version by merging the two most closely related statements in each
// domain, so every domain still covers the same ground in fewer items.
export const domains: Domain[] = [
  {
    id: "strategic",
    title: "Strategic clarity and case for change",
    short: "Strategic clarity",
    description:
      "Whether the library has articulated why change is necessary, what success would look like, and how the initiative aligns with institutional mission and local context.",
    items: [
      "Leaders can articulate a clear, compelling case for this change — why it matters for service, staffing, and institutional relevance.",
      "The desired future state is concrete enough that staff can picture what will be different.",
      "This initiative fits our institution's mission, size, and constraints rather than importing a model from elsewhere.",
    ],
  },
  {
    id: "sponsorship",
    title: "Leadership sponsorship and governance",
    short: "Leadership",
    description:
      "Whether the dean/director and other leaders are visibly sponsoring the change, making decisions, and aligning governance mechanisms.",
    items: [
      "Senior leadership visibly and consistently sponsors this change — through behavior, priorities, and resource choices, not just announcements.",
      "Leadership responsibilities for this initiative are clear across the dean/director, cabinet, and managers.",
      "Governance and consultation structures support timely decisions rather than stalling progress.",
    ],
  },
  {
    id: "communication",
    title: "Communication, trust, and meaning-making",
    short: "Communication",
    description:
      "Whether information is credible, timely, and adapted for how people at different levels of the library experience change.",
    items: [
      "Staff receive timely, honest communication — including what's not yet known — and rumors or mixed messages get addressed quickly.",
      "Messages are translated effectively for different groups rather than delivered as one generic announcement.",
      "Leaders communicate in ways that build trust rather than sounding defensive, evasive, or overly promotional.",
    ],
  },
  {
    id: "managers",
    title: "Middle manager readiness and translation capacity",
    short: "Managers",
    description:
      "Whether department heads and middle managers have the clarity, authority, and support to translate strategy into practice.",
    items: [
      "Middle managers understand the goals, timeline, and implications of the change well enough to explain it locally.",
      "Managers have enough authority to adapt implementation to the realities of their units.",
      "Managers have channels to raise concerns and workload pressures upward before problems escalate, rather than absorbing them silently.",
    ],
  },
  {
    id: "staff",
    title: "Staff readiness, professional identity, and participation",
    short: "Staff readiness",
    description:
      "Whether staff have opportunities to understand, shape, and prepare for the change, especially when it affects professional norms and work identity.",
    items: [
      "Staff understand how the change may alter workflows, expectations, or definitions of good work.",
      "Staff concerns are taken seriously, and the people who will carry the heaviest implementation burden have meaningful opportunities to inform the process.",
      "Training and support plans account for uneven technical fluency and different starting points across units.",
    ],
  },
  {
    id: "capacity",
    title: "Operational capacity, resourcing, and pace",
    short: "Capacity",
    description:
      "Whether the library has the staffing, time, sequencing, and operational discipline to implement change without destabilizing core services.",
    items: [
      "The pace and staffing assumptions behind this initiative are realistic and credible for a library of our size and model.",
      "Core services and obligations have been considered in the pacing of implementation.",
      "Dependencies, risks, and competing priorities are visible and actively managed.",
    ],
  },
  {
    id: "ethics",
    title: "Ethics, risk, and institutional values",
    short: "Ethics & risk",
    description:
      "Whether the change has been evaluated through the library's public-service values, including privacy, accessibility, equity, and reputational risk.",
    items: [
      "Relevant ethical and risk issues — accessibility, privacy, labor impact, reputational risk — were identified and discussed early enough to shape the initiative.",
      "Leaders can explain how this change aligns with the library's stated values and obligations.",
      "Risk is being managed explicitly rather than deferred to frontline staff or treated as someone else's problem.",
    ],
  },
  {
    id: "reinforcement",
    title: "Assessment, reinforcement, and sustainment",
    short: "Sustainment",
    description:
      "Whether the library is measuring adoption, learning from implementation, and reinforcing change beyond initial launch.",
    items: [
      "Leaders are treating this as an ongoing practice change — with reinforcement planned beyond the initial rollout — not a one-time announcement or training event.",
      "The library has clear indicators that will show whether the change is actually taking hold.",
      "Feedback loops are in place to identify implementation problems and adjust course.",
    ],
  },
];

export const TOTAL_ITEMS = domains.reduce((n, d) => n + d.items.length, 0);
