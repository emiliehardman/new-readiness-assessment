import { domains } from "./domains";

type DomainScoreLite = { id: string; average: number };

type Submission = {
  id: number;
  createdAt: string;
  participant: string | null;
  institution: string | null;
  role: string | null;
  initiative: string | null;
  overall: number;
  domainScores: DomainScoreLite[];
};

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadSubmissionsCsv(submissions: Submission[]) {
  const headers = [
    "Submitted at",
    "Participant",
    "Institution",
    "Role",
    "Initiative",
    "Overall",
    ...domains.map((d) => d.short),
  ];

  const rows = submissions.map((s) => {
    const domainMap = Object.fromEntries(s.domainScores.map((d) => [d.id, d.average]));
    return [
      new Date(s.createdAt).toISOString(),
      s.participant ?? "",
      s.institution ?? "",
      s.role ?? "",
      s.initiative ?? "",
      s.overall?.toFixed(2) ?? "",
      ...domains.map((d) => (domainMap[d.id] ? domainMap[d.id].toFixed(2) : "")),
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `library-change-readiness-cohort-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
