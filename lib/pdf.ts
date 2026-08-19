import jsPDF from "jspdf";
import { getStatus, type AggregateScores, type DomainScore } from "./scoring";
import { STATUS_COLORS } from "./statusColors";

type Metadata = {
  participant: string;
  institution: string;
  role: string;
  initiative: string;
  notes: string;
};

type ExportPayload = {
  metadata: Metadata;
  completedAt: string;
  overallScore: number;
  completion: number;
  overallInterpretation: string;
  aggregateScores: AggregateScores;
  domainScores: (DomainScore & { status: string })[];
  strengths: DomainScore[];
  priorities: DomainScore[];
  reflectionPrompts: string[];
};

const INK = "#16212F";
const INK_FAINT = "#4A5A6C";
const PAPER_CARD = "#FBFAF5";
const PAPER = "#F1EFE6";
const PAPER_RULE = "#D8D3C4";
const BRASS = "#B68A3B";
const BRASS_LIGHT = "#E4CE9C";

export function exportResultsPdf(payload: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 62;
  let y = margin;

  const newPage = () => {
    doc.addPage();
    doc.setFillColor(PAPER);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    y = margin;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > bottomLimit) newPage();
  };

  const addWrappedText = (
    text: string,
    options: {
      fontSize?: number;
      lineHeight?: number;
      font?: "helvetica" | "times";
      fontStyle?: "normal" | "bold" | "italic";
      color?: string;
      spacingBefore?: number;
      spacingAfter?: number;
      indent?: number;
    } = {}
  ) => {
    const {
      fontSize = 10.5,
      lineHeight = 15,
      font = "helvetica",
      fontStyle = "normal",
      color = INK,
      spacingBefore = 0,
      spacingAfter = 0,
      indent = 0,
    } = options;

    y += spacingBefore;
    doc.setFont(font, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines: string[] = doc.splitTextToSize(text, maxWidth - indent);

    lines.forEach((line) => {
      ensureSpace(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    });

    y += spacingAfter;
  };

  // Small brass accent bar + label, echoing the app's section headers.
  const sectionHeader = (title: string, spacingBefore = 20) => {
    ensureSpace(30 + spacingBefore);
    y += spacingBefore;
    doc.setFillColor(BRASS);
    doc.rect(margin, y - 10, 3.5, 14, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(INK);
    doc.text(title, margin + 12, y);
    y += 20;
  };

  const card = (height: number, fill = PAPER_CARD, stroke = PAPER_RULE) => {
    doc.setFillColor(fill);
    doc.setDrawColor(stroke);
    doc.roundedRect(margin, y, maxWidth, height, 8, 8, "FD");
  };

  const statusChip = (x: number, yChip: number, label: string, key: keyof typeof STATUS_COLORS) => {
    const c = STATUS_COLORS[key];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const textW = doc.getTextWidth(label.toUpperCase());
    const chipW = textW + 16;
    doc.setFillColor(c.bg);
    doc.setDrawColor(c.border);
    doc.roundedRect(x, yChip, chipW, 15, 7, 7, "FD");
    doc.setTextColor(c.text);
    doc.text(label.toUpperCase(), x + 8, yChip + 10.5);
    return chipW;
  };

  // ---------- Header band ----------
  doc.setFillColor(PAPER);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  const bandHeight = 112;
  doc.setFillColor(INK);
  doc.rect(0, 0, pageWidth, bandHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(BRASS_LIGHT);
  doc.text("CHANGE MANAGEMENT WORKSHOP INSTRUMENT", margin, 36);
  doc.setFont("times", "bold");
  doc.setFontSize(23);
  doc.setTextColor(PAPER_CARD);
  doc.text("Library Change Readiness Assessment", margin, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#C9D0D8");
  const completedDate = new Date(payload.completedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Completed ${completedDate}  ·  ${payload.completion}% complete`, margin, 86);

  y = bandHeight + 30;

  // ---------- Participant context ----------
  sectionHeader("Participant context", 0);
  const contextRows: [string, string][] = [
    ["Participant", payload.metadata.participant || "Not provided"],
    ["Institution", payload.metadata.institution || "Not provided"],
    ["Role", payload.metadata.role || "Not provided"],
    ["Initiative", payload.metadata.initiative || "Not provided"],
  ];
  ensureSpace(72);
  card(72);
  const colW = (maxWidth - 24) / 2;
  contextRows.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = margin + 16 + col * (colW + 24);
    const rowY = y + 20 + row * 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(INK_FAINT);
    doc.text(label.toUpperCase(), x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(INK);
    const valueLines = doc.splitTextToSize(value, colW);
    doc.text(valueLines[0], x, rowY + 14);
  });
  y += 72 + 18;

  if (payload.metadata.notes) {
    addWrappedText(payload.metadata.notes, { color: INK_FAINT, fontSize: 10, spacingAfter: 10 });
  }

  // ---------- Overall interpretation ----------
  sectionHeader("Overall interpretation");
  const overallLabel = payload.overallScore ? payload.overallScore.toFixed(2) : "Not available";
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(INK);
  ensureSpace(40);
  doc.text(overallLabel, margin, y + 10);
  if (payload.overallScore) {
    const status = getStatus(payload.overallScore);
    statusChip(margin + doc.getTextWidth(overallLabel) + 16, y - 3, status.label, status.key);
  }
  y += 30;
  addWrappedText(payload.overallInterpretation, { color: INK_FAINT, spacingAfter: 6 });

  // ---------- Aggregate change profile ----------
  sectionHeader("Aggregate change profile");
  const buckets: [string, number][] = [
    ["Leadership", payload.aggregateScores.leadership.average],
    ["Success", payload.aggregateScores.success.average],
    ["Delivery", payload.aggregateScores.delivery.average],
    ["Readiness", payload.aggregateScores.readiness.average],
  ];
  const gap = 12;
  const boxWidth = (maxWidth - gap) / 2;
  const boxHeight = 74;
  ensureSpace(boxHeight * 2 + gap);
  buckets.forEach(([label, value], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = margin + col * (boxWidth + gap);
    const yBox = y + row * (boxHeight + gap);
    const status = getStatus(value);
    const c = STATUS_COLORS[status.key];
    doc.setFillColor(c.bg);
    doc.setDrawColor(c.border);
    doc.roundedRect(x, yBox, boxWidth, boxHeight, 8, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(INK);
    doc.text(label.toUpperCase(), x + 14, yBox + 20);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text(value ? value.toFixed(2) : "—", x + 14, yBox + 44);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(c.text);
    doc.text(status.label, x + 14, yBox + 60);
  });
  y += boxHeight * 2 + gap + 20;

  addWrappedText(
    "Leadership combines leadership sponsorship and communication. Success combines strategic clarity and sustainment. Delivery combines area lead readiness and operational capacity. Readiness combines staff readiness and ethics and risk.",
    { color: INK_FAINT, fontSize: 9.5, lineHeight: 13, spacingAfter: 4 }
  );

  // ---------- Domain scores ----------
  sectionHeader("Domain scores");
  payload.domainScores.forEach((d) => {
    ensureSpace(24);
    const status = d.average ? getStatus(d.average) : { key: "neutral" as const, label: "Pending" };
    const c = STATUS_COLORS[status.key];
    doc.setFillColor(c.fill);
    doc.circle(margin + 4, y - 3.5, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(INK);
    doc.text(d.title, margin + 16, y);
    const scoreLabel = d.average ? d.average.toFixed(2) : "—";
    doc.setFont("helvetica", "bold");
    doc.text(scoreLabel, pageWidth - margin - 70, y, { align: "right" });
    doc.setTextColor(c.text);
    doc.text(status.label, pageWidth - margin, y, { align: "right" });
    y += 20;
  });
  y += 6;

  // ---------- Strengths ----------
  sectionHeader("Relative strengths");
  if (payload.strengths.length) {
    payload.strengths.forEach((d) => {
      ensureSpace(22);
      const c = STATUS_COLORS.green;
      doc.setFillColor(c.fill);
      doc.rect(margin, y - 10, 3, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(INK);
      doc.text(d.short, margin + 12, y);
      doc.setTextColor(c.text);
      doc.text(d.average.toFixed(2), pageWidth - margin, y, { align: "right" });
      y += 18;
    });
  } else {
    addWrappedText("None yet", { color: INK_FAINT });
  }
  y += 4;

  // ---------- Priorities ----------
  sectionHeader("Priority attention areas");
  if (payload.priorities.length) {
    payload.priorities.forEach((d) => {
      ensureSpace(40);
      const c = STATUS_COLORS.red;
      doc.setFillColor(c.fill);
      doc.rect(margin, y - 10, 3, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(INK);
      doc.text(d.short, margin + 12, y);
      doc.setTextColor(c.text);
      doc.text(d.average.toFixed(2), pageWidth - margin, y, { align: "right" });
      y += 15;
      addWrappedText(d.description, { color: INK_FAINT, fontSize: 9.5, lineHeight: 13, indent: 12, spacingAfter: 6 });
    });
  } else {
    addWrappedText("None yet", { color: INK_FAINT });
  }

  // ---------- Reflection prompts ----------
  sectionHeader("Reflection prompts");
  if (payload.reflectionPrompts.length) {
    payload.reflectionPrompts.forEach((prompt) => {
      addWrappedText(`•  ${prompt}`, { color: INK_FAINT, spacingAfter: 4 });
    });
  } else {
    addWrappedText("None generated", { color: INK_FAINT });
  }

  // ---------- Footer on every page ----------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(PAPER_RULE);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(INK_FAINT);
    doc.text("Library Change Readiness Assessment", margin, pageHeight - 26);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 26, { align: "right" });
  }

  doc.save(`library-change-readiness-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
}
