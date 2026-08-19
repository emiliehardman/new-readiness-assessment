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

export function exportResultsPdf(payload: ExportPayload) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addWrappedText = (
    text: string,
    options: {
      fontSize?: number;
      lineHeight?: number;
      fontStyle?: "normal" | "bold" | "italic";
      spacingBefore?: number;
      spacingAfter?: number;
    } = {}
  ) => {
    const {
      fontSize = 11,
      lineHeight = 16,
      fontStyle = "normal",
      spacingBefore = 0,
      spacingAfter = 0,
    } = options;

    y += spacingBefore;
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor("#16212F");
    const lines: string[] = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += spacingAfter;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const drawAggregateBox = (
    x: number,
    yBox: number,
    width: number,
    height: number,
    label: string,
    value: number
  ) => {
    const status = getStatus(value);
    const c = STATUS_COLORS[status.key];

    doc.setFillColor(c.bg);
    doc.setDrawColor(c.border);
    doc.roundedRect(x, yBox, width, height, 10, 10, "FD");

    doc.setTextColor("#16212F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(label, x + 14, yBox + 22);

    doc.setFontSize(24);
    doc.text(value.toFixed(2), x + 14, yBox + 56);

    doc.setTextColor(c.text);
    doc.setFontSize(12);
    doc.text(status.label, x + 14, yBox + 80);
  };

  addWrappedText("Library Change Readiness Assessment", {
    fontSize: 18,
    lineHeight: 24,
    fontStyle: "bold",
    spacingAfter: 8,
  });

  addWrappedText(`Completed: ${new Date(payload.completedAt).toLocaleString()}`, { spacingAfter: 2 });
  addWrappedText(`Completion: ${payload.completion}%`, { spacingAfter: 2 });
  addWrappedText(
    `Overall readiness score: ${payload.overallScore ? payload.overallScore.toFixed(2) : "Not available"}`,
    { spacingAfter: 12 }
  );

  addWrappedText("Participant context", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  addWrappedText(`Participant: ${payload.metadata.participant || "Not provided"}`);
  addWrappedText(`Institution: ${payload.metadata.institution || "Not provided"}`);
  addWrappedText(`Role: ${payload.metadata.role || "Not provided"}`);
  addWrappedText(`Initiative: ${payload.metadata.initiative || "Not provided"}`);
  addWrappedText(`Context notes: ${payload.metadata.notes || "Not provided"}`, { spacingAfter: 10 });

  addWrappedText("Overall interpretation", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  addWrappedText(payload.overallInterpretation, { spacingAfter: 12 });

  addWrappedText("Aggregate change profile", { fontSize: 13, fontStyle: "bold", spacingAfter: 8 });

  ensureSpace(250);
  const gap = 12;
  const boxWidth = (maxWidth - gap) / 2;
  const boxHeight = 96;
  const leftX = margin;
  const rightX = margin + boxWidth + gap;

  drawAggregateBox(leftX, y, boxWidth, boxHeight, "Leadership", payload.aggregateScores.leadership.average);
  drawAggregateBox(rightX, y, boxWidth, boxHeight, "Success", payload.aggregateScores.success.average);
  drawAggregateBox(leftX, y + boxHeight + gap, boxWidth, boxHeight, "Delivery", payload.aggregateScores.delivery.average);
  drawAggregateBox(
    rightX,
    y + boxHeight + gap,
    boxWidth,
    boxHeight,
    "Readiness",
    payload.aggregateScores.readiness.average
  );
  y += boxHeight * 2 + gap + 16;

  addWrappedText("Aggregate bucket definitions", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  addWrappedText("Leadership = Leadership sponsorship and governance + Communication, trust, and meaning-making.");
  addWrappedText("Success = Strategic clarity and case for change + Assessment, reinforcement, and sustainment.");
  addWrappedText(
    "Delivery = Middle manager readiness and translation capacity + Operational capacity, resourcing, and pace."
  );
  addWrappedText(
    "Readiness = Staff readiness, professional identity, and participation + Ethics, risk, and institutional values.",
    { spacingAfter: 10 }
  );

  addWrappedText("Domain scores", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  payload.domainScores.forEach((d) => {
    addWrappedText(`${d.title}: ${d.average ? d.average.toFixed(2) : "Pending"} (${d.status})`);
  });
  y += 6;

  addWrappedText("Relative strengths", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  if (payload.strengths.length) {
    payload.strengths.forEach((d) => addWrappedText(`• ${d.short}: ${d.average.toFixed(2)}`));
  } else {
    addWrappedText("None yet");
  }
  y += 6;

  addWrappedText("Priority attention areas", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  if (payload.priorities.length) {
    payload.priorities.forEach((d) => addWrappedText(`• ${d.short}: ${d.average.toFixed(2)} — ${d.description}`));
  } else {
    addWrappedText("None yet");
  }
  y += 6;

  addWrappedText("Reflection prompts", { fontSize: 13, fontStyle: "bold", spacingAfter: 4 });
  if (payload.reflectionPrompts.length) {
    payload.reflectionPrompts.forEach((prompt) => addWrappedText(`• ${prompt}`));
  } else {
    addWrappedText("None generated");
  }

  doc.save(`library-change-readiness-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
}
