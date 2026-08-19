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
// of any size, including smaller libraries where one or two people hold
// what a larger institution might spread across a formal cabinet.
//
// Theoretical anchors:
//  - Kotter: urgency grounded in real conditions, a vision people can
//    repeat, empowering others to act, sustaining past the initial push.
//  - Bridges: transition is psychological, not procedural. Items ask about
//    the neutral zone, where people have let go of the old way but have
//    not yet inhabited the new one.
//  - Heifetz (adaptive leadership): the leader's job is to regulate
//    distress and hold a productive level of discomfort, not to remove it.
//    Avoiding conflict, over-smoothing, and deferring hard decisions are
//    the failure modes this instrument is designed to surface.
//  - ADKAR: awareness, desire, knowledge, ability, reinforcement, used to
//    check that staff-facing items cover more than information delivery.
//
// Item-writing principles:
//  - Every item describes something observable or answerable, so that
//    "rarely true" is a factual statement rather than a confession of bad
//    character.
//  - First person is used where the item interrogates the respondent's own
//    practice, judgment, or willingness. Third person is used where the
//    item describes a condition being observed in the organization.
//  - Items test whether leadership is being exercised, not whether it has
//    been softened. Consultation, slowing down, and dropping work are not
//    treated as automatic evidence of good change leadership.
//  - Present and ongoing tense throughout.
//  - Named examples are illustrative, never definitional, so items stay
//    answerable across very different kinds of initiative.
export const domains: Domain[] = [
  {
    id: "strategic",
    title: "Strategic clarity and case for change",
    short: "Strategic clarity",
    description:
      "Whether the reasons for this change and the picture of what it produces are clear enough to be repeated by others, and whether leadership is clear about what is genuinely open to influence and what is not.",
    items: [
      "I can explain why this change is necessary now in terms that connect to the work our staff actually do, not only to budget or institutional pressure.",
      "If I asked three staff members to describe what will be different when this is done, I would expect broadly similar answers.",
      "I am clear about which parts of this change are not open to negotiation, and I can explain why those parts hold.",
    ],
  },
  {
    id: "sponsorship",
    title: "Leadership sponsorship and decision-making",
    short: "Leadership",
    description:
      "Whether the people holding authority are backing this change with visible choices and moving decisions along, including an honest look at where leadership hesitation is itself a source of delay.",
    items: [
      "I can point to specific decisions or resource choices that visibly signal this change is a priority, beyond saying that it is one.",
      "Everyone working on this initiative knows who makes the final call, including where that authority is genuinely shared.",
      "I can name what slows decisions on this initiative, including my own hesitation or avoidance where that is a factor.",
    ],
  },
  {
    id: "communication",
    title: "Communication, trust, and meaning-making",
    short: "Communication",
    description:
      "Whether leaders know what staff actually understand and are telling each other, as distinct from what has been announced. People make sense of change collectively, and informal interpretation fills whatever space formal communication leaves open.",
    items: [
      "I know what staff actually believe about this change, including any misconceptions, because I have heard it from them rather than assumed it.",
      "I have told staff what is still undecided or unknown, rather than waiting until I have a complete answer to share.",
      "I have a realistic sense of how staff are interpreting this change among themselves, in the conversations that happen outside formal channels.",
    ],
  },
  {
    id: "managers",
    title: "Area lead and supervisor readiness",
    short: "Area leads",
    description:
      "Whether the people between senior leadership and frontline work, whatever their title, are equipped to lead their own teams through this change, and whether they are backed when that gets uncomfortable.",
    items: [
      "Area leads could explain this change to their teams in their own words, without relying on prepared talking points.",
      "Area leads have the information, authority, and backing they need to make judgment calls about this change in their own areas.",
      "When an area lead meets resistance from their team, I help them work through it rather than stepping in to smooth it over or leaving them to absorb it alone.",
    ],
  },
  {
    id: "staff",
    title: "Staff readiness, professional identity, and participation",
    short: "Staff readiness",
    description:
      "Whether the people whose work changes most understand what is being asked of them, are being built up to do it, and are being supported through the period where the old way is gone and the new one is not yet familiar.",
    items: [
      "Staff can describe how their own daily work will change, not just what the initiative is in the abstract.",
      "I have put conditions in place that let the people carrying the heaviest implementation work succeed, including time, authority, and access to me when something is not working.",
      "Our preparation accounts for the different levels of skill and training this change requires across roles, including student workers, part-time staff, and those whose jobs change most.",
    ],
  },
  {
    id: "capacity",
    title: "Operational capacity, resourcing, and pace",
    short: "Capacity",
    description:
      "Whether leadership has a grounded picture of what this change demands and is prepared to go after what it needs, including asking upward for money, positions, time, or a different timeline.",
    items: [
      "I have a realistic picture of what this change demands of people week to week, formed close enough to the work to be accurate.",
      "I know what I would need to ask for, whether that is money, positions, time, or a different timeline, to give this initiative the conditions it needs, and I am prepared to go ask for it.",
      "We identify dependencies and competing priorities before they become urgent, rather than discovering them as problems.",
    ],
  },
  {
    id: "ethics",
    title: "Ethics, risk, and institutional values",
    short: "Ethics & risk",
    description:
      "Whether leadership has looked squarely at what could go wrong and for whom, weighed this change against the library's obligations, and taken ownership of the risks rather than leaving them to be discovered downstream.",
    items: [
      "I can name what could go wrong with this change, and for whom, with enough specificity to act on rather than in general terms.",
      "I have considered how this change looks from vantage points other than my own, including the staff and users it affects most directly.",
      "For each significant risk I have identified, I can say what we are doing to reduce it or to prepare the people who will encounter it.",
    ],
  },
  {
    id: "reinforcement",
    title: "Assessment, reinforcement, and sustainment",
    short: "Sustainment",
    description:
      "Whether attention, measurement, and course correction continue past the point where the initial push is over and the change has to become ordinary practice.",
    items: [
      "We have planned for what happens after launch, including who keeps attention on this once the initial effort winds down.",
      "I can describe what we would see in day-to-day work six months from now that would tell us this change has genuinely taken hold.",
      "We have a regular point at which we review how implementation is going and can change course, even if that is an informal check-in with a small group.",
    ],
  },
];

export const TOTAL_ITEMS = domains.reduce((n, d) => n + d.items.length, 0);
