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
//
// Item-writing principles used throughout:
//  - Each item describes something observable or answerable, not a virtue.
//    A leader should be able to answer "rarely true" without confessing to
//    bad character.
//  - First person ("I can name...") is used where the item interrogates the
//    respondent's own practice and knowledge. Third person ("Staff can...",
//    "Area leads have...") is used where the item describes a condition in
//    the organization that the respondent is observing.
//  - Present and ongoing tense throughout, since most respondents will be
//    mid-initiative rather than looking back on a finished one.
//  - Specific examples are illustrative, never the definition of the item,
//    so that items stay answerable across very different kinds of change.
export const domains: Domain[] = [
  {
    id: "strategic",
    title: "Strategic clarity and case for change",
    short: "Strategic clarity",
    description:
      "Whether the reasons for this change, the picture of what success looks like, and the tradeoffs it requires are clear enough to be described consistently by different people.",
    items: [
      "I can explain why this change is necessary now in terms that connect to the work our staff actually do, not only to budget or institutional pressure.",
      "If I asked three staff members to describe what will be different when this is done, I would expect broadly similar answers.",
      "I can name what we are choosing to do less of, or stop doing, to make room for this change.",
    ],
  },
  {
    id: "sponsorship",
    title: "Leadership sponsorship and decision-making",
    short: "Leadership",
    description:
      "Whether the people holding decision-making authority, whatever their titles, are backing this change with visible choices and moving decisions along. In a small library this may be one director working closely with a couple of area leads rather than a formal cabinet.",
    items: [
      "I can point to specific decisions or resource choices that visibly signal this change is a priority, beyond saying that it is one.",
      "Everyone working on this initiative knows who makes the final call, including where that authority is genuinely shared.",
      "Decisions on this initiative get made and communicated quickly enough to keep work moving, and I can name where they tend to stall.",
    ],
  },
  {
    id: "communication",
    title: "Communication, trust, and meaning-making",
    short: "Communication",
    description:
      "Whether what leaders are saying is reaching people accurately, and whether leaders know what staff actually understand as opposed to what has been announced.",
    items: [
      "I know what staff currently believe about this change, including any misconceptions, based on what they have told us rather than what we assume.",
      "We have told staff what is still undecided or unknown, not only what has been settled.",
      "I can identify which groups in the library are hearing about this secondhand rather than directly from us.",
    ],
  },
  {
    id: "managers",
    title: "Area lead and supervisor readiness",
    short: "Area leads",
    description:
      "Whether the people between senior leadership and frontline work, whatever their title, can carry this change into daily practice and are heard when they push back.",
    items: [
      "Area leads could explain this change to their teams in their own words, without relying on our messaging.",
      "Area leads have adapted how this change works in their own area, and those adaptations have held.",
      "I can name a specific concern an area lead has raised about this change, and say what happened as a result.",
    ],
  },
  {
    id: "staff",
    title: "Staff readiness, professional identity, and participation",
    short: "Staff readiness",
    description:
      "Whether the people whose daily work changes most understand what is coming, have had a hand in shaping it, and are being prepared for it from their actual starting points.",
    items: [
      "Staff can describe how their own daily work will change, not just what the initiative is in the abstract.",
      "I can name which staff carry the largest share of implementation work, and I have checked with them directly about whether the plan is workable.",
      "Our training and support plans account for the full range of starting points across staff, including those least comfortable with this change.",
    ],
  },
  {
    id: "capacity",
    title: "Operational capacity, resourcing, and pace",
    short: "Capacity",
    description:
      "Whether the time, staffing, and sequencing this change requires have been reckoned with honestly against everything the library is already committed to.",
    items: [
      "The time this change requires has been subtracted from something else, rather than added on top of existing workloads.",
      "I can name what would have to give if this initiative takes longer, costs more, or proves harder than planned.",
      "We identify dependencies and competing priorities before they become urgent, rather than discovering them as problems.",
    ],
  },
  {
    id: "ethics",
    title: "Ethics, risk, and institutional values",
    short: "Ethics & risk",
    description:
      "Whether the risks this change creates have been examined from vantage points other than leadership's, and whether the library's obligations to the people it serves have been weighed alongside the benefits.",
    items: [
      "I can name the specific risks this change creates for particular roles or groups in the library, rather than describing risk in general terms.",
      "I have considered how this change looks from vantage points other than my own, including the staff and patrons it affects most directly.",
      "For each significant risk we have identified, I can say what we are doing to reduce it or to prepare the people who will encounter it.",
    ],
  },
  {
    id: "reinforcement",
    title: "Assessment, reinforcement, and sustainment",
    short: "Sustainment",
    description:
      "Whether attention, measurement, and course correction are planned to continue past the point where the initial push is over.",
    items: [
      "We have planned for what happens after launch, including who keeps attention on this once the initial effort winds down.",
      "I can describe what we would see in day-to-day work six months from now that would tell us this change has genuinely taken hold.",
      "We have a regular point at which we review how implementation is going and can change course, even if that is an informal check-in with a small team.",
    ],
  },
];

export const TOTAL_ITEMS = domains.reduce((n, d) => n + d.items.length, 0);
