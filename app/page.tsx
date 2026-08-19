"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw, Download, Save } from "lucide-react";
import { domains, SCALE } from "@/lib/domains";
import {
  emptyResponses,
  computeDomainScores,
  computeCompletion,
  computeOverall,
  computeAggregateScores,
  topStrengths,
  topPriorities,
  overallInterpretation,
  reflectionPrompts,
  getStatus,
  scoreToPercent,
  type Responses,
} from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";
import { exportResultsPdf } from "@/lib/pdf";
import StampBadge from "@/components/StampBadge";
import ProgressBar from "@/components/ProgressBar";
import AggregateGrid from "@/components/AggregateGrid";

type SaveState = "idle" | "saving" | "saved" | "error";

const META_FIELDS: Array<[keyof Metadata, string, string]> = [
  ["participant", "Participant name", "Optional"],
  ["institution", "Institution", "Optional"],
  ["role", "Role", "Dean, director, AUL, etc."],
  ["initiative", "Change initiative", "AI adoption, reorg, new service model…"],
];

type Metadata = {
  participant: string;
  institution: string;
  role: string;
  initiative: string;
  notes: string;
};

const EMPTY_META: Metadata = {
  participant: "",
  institution: "",
  role: "",
  initiative: "",
  notes: "",
};

export default function AssessmentPage() {
  const [meta, setMeta] = useState<Metadata>(EMPTY_META);
  const initialResponses = useMemo(() => emptyResponses(), []);
  const [responses, setResponses] = useState<Responses>(initialResponses);
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const domainScores = useMemo(() => computeDomainScores(responses), [responses]);
  const { percent: completion } = useMemo(() => computeCompletion(responses), [responses]);
  const overall = useMemo(() => computeOverall(domainScores), [domainScores]);
  const strengths = useMemo(() => topStrengths(domainScores), [domainScores]);
  const priorities = useMemo(() => topPriorities(domainScores), [domainScores]);
  const aggregateScores = useMemo(() => computeAggregateScores(domainScores), [domainScores]);
  const interpretation = useMemo(() => overallInterpretation(overall), [overall]);
  const prompts = useMemo(() => reflectionPrompts(strengths, priorities), [strengths, priorities]);

  function handleMetaChange(field: keyof Metadata, value: string) {
    setMeta((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelect(key: string, value: number) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setResponses(initialResponses);
    setMeta(EMPTY_META);
    setSubmitted(false);
    setSaveState("idle");
  }

  async function handleSubmit() {
    setSubmitted(true);
    setSaveState("saving");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: meta,
          responses,
          domainScores,
          aggregateScores,
          overall,
        }),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function handleDownload() {
    exportResultsPdf({
      metadata: meta,
      completedAt: new Date().toISOString(),
      overallScore: Number(overall.toFixed(2)),
      completion,
      overallInterpretation: interpretation,
      aggregateScores,
      domainScores: domainScores.map((d) => ({
        ...d,
        status: d.average ? getStatus(d.average).label : "Pending",
      })),
      strengths,
      priorities,
      reflectionPrompts: prompts,
    });
  }

  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <header className="ruled-bg bg-ink px-6 pb-16 pt-10 text-paper-card">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-light">
              Change management workshop instrument
            </div>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl font-semibold leading-[1.1] text-paper-card sm:text-5xl">
              Library Change Readiness Assessment
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-paper-card/70">
              A structured diagnostic for academic library leaders, built to show where a
              specific change initiative is genuinely ready to move, and where it isn&rsquo;t.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {/* Overlapping intro card */}
        <section className="-mt-10 rounded-card border border-paper-rule bg-paper-card p-7 shadow-paper sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-xl font-semibold text-ink">Before you begin</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-faint">
                Rate each statement for one specific change initiative, based on where things
                actually stand today rather than where you intend them to be. Most items ask
                whether you can name or point to something concrete, so &ldquo;Rarely true&rdquo;
                is a normal and useful answer, and the items where you hesitate are the ones
                worth bringing to the workshop. Where an item says &ldquo;we,&rdquo; read that as
                you together with whoever shares leadership responsibility for this initiative,
                which in a smaller library may be one or two colleagues. If a facilitator is
                running this as part of a cohort, your responses save automatically when you
                generate your summary.
              </p>
            </div>
            <div className="rounded-card border border-paper-rule bg-paper px-5 py-3 text-right">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Completion
              </div>
              <div className="font-serif text-3xl font-semibold text-ink">{completion}%</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {META_FIELDS.map(([field, label, placeholder]) => (
              <label key={field} className="block">
                <div className="mb-1.5 text-[13px] font-semibold text-ink">{label}</div>
                <input
                  value={meta[field]}
                  onChange={(e) => handleMetaChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-sm2 border border-paper-rule bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint/60 focus:border-brass"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block">
            <div className="mb-1.5 text-[13px] font-semibold text-ink">Context notes</div>
            <textarea
              value={meta.notes}
              onChange={(e) => handleMetaChange("notes", e.target.value)}
              placeholder="Describe the initiative, your local context, known pressures, or implementation challenges."
              rows={3}
              className="w-full resize-y rounded-sm2 border border-paper-rule bg-white px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint/60 focus:border-brass"
            />
          </label>

          <div className="mt-6 rounded-card border border-paper-rule bg-paper p-5">
            <div className="font-serif text-[15px] font-semibold text-ink">How to read your scores</div>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">
              Each statement is scored 1–3. Domain and bucket averages are interpreted against
              three bands:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12.5px]">
              <span
                className="rounded-full border px-3 py-1 font-medium"
                style={{ background: STATUS_COLORS.red.bg, borderColor: STATUS_COLORS.red.border, color: STATUS_COLORS.red.text }}
              >
                High risk: below 1.75
              </span>
              <span
                className="rounded-full border px-3 py-1 font-medium"
                style={{ background: STATUS_COLORS.amber.bg, borderColor: STATUS_COLORS.amber.border, color: STATUS_COLORS.amber.text }}
              >
                At risk: 1.75 to 2.49
              </span>
              <span
                className="rounded-full border px-3 py-1 font-medium"
                style={{ background: STATUS_COLORS.green.bg, borderColor: STATUS_COLORS.green.border, color: STATUS_COLORS.green.text }}
              >
                Strength: 2.5 and above
              </span>
            </div>
          </div>
        </section>

        {/* Domains + live results */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-start">
          <main className="grid gap-5">
            {domains.map((domain) => (
              <section
                key={domain.id}
                className="rounded-card border border-paper-rule bg-paper-card p-6 sm:p-7"
              >
                <h3 className="font-serif text-[21px] font-semibold text-ink">{domain.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">
                  {domain.description}
                </p>
                <div className="mt-5 grid gap-4">
                  {domain.items.map((item, idx) => {
                    const key = `${domain.id}-${idx}`;
                    return (
                      <div key={key} className="rounded-sm2 border border-paper-rule bg-white p-4 sm:p-5">
                        <div className="flex gap-3 text-[14.5px] font-medium leading-relaxed text-ink">
                          <span className="font-mono text-[13px] text-brass-dark">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span>{item}</span>
                        </div>
                        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          {SCALE.map((option) => {
                            const active = responses[key] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(key, option.value)}
                                className={`rounded-sm2 border px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition ${
                                  active
                                    ? "border-ink bg-ink text-paper-card"
                                    : "border-paper-rule bg-paper text-ink hover:border-ink-faint"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>

          <aside className="grid gap-6 self-start lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
            <div className="rounded-card border border-paper-rule bg-paper-card p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Current results</h2>
              <p className="mt-1 text-[13px] text-ink-faint">
                Live summary of domain scores and overall readiness.
              </p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[13px] text-ink-faint">Overall readiness</div>
                  <div className="font-serif text-4xl font-semibold text-ink">
                    {overall ? overall.toFixed(1) : "—"}
                  </div>
                </div>
                <StampBadge score={overall} />
              </div>
              <div className="mt-3">
                <ProgressBar value={overall ? scoreToPercent(overall) : 0} />
              </div>

              <div className="mt-5 grid gap-2.5">
                {domainScores.map((domain) => {
                  const status = domain.average ? getStatus(domain.average) : { key: "neutral" as const };
                  const c = STATUS_COLORS[status.key];
                  return (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between gap-3 rounded-sm2 border p-3"
                      style={{ borderColor: c.border, background: domain.average ? c.bg : STATUS_COLORS.neutral.bg }}
                    >
                      <div>
                        <div className="text-[13.5px] font-semibold text-ink">{domain.short}</div>
                        <div className="mt-0.5 text-[13px] text-ink-faint">
                          {domain.average ? domain.average.toFixed(1) : "Not scored yet"}
                        </div>
                      </div>
                      <StampBadge score={domain.average} size={42} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-card border border-paper-rule bg-paper-card p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Interpretation summary</h2>
              <p className="mt-1 text-[13px] text-ink-faint">Use this for discussion, debrief, or reflection.</p>

              {submitted ? (
                <div className="mt-5 grid gap-4">
                  <div className="rounded-sm2 border border-paper-rule bg-paper p-4">
                    <div className="text-[13px] font-bold text-ink">Overall interpretation</div>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-faint">{interpretation}</p>
                  </div>

                  <div className="rounded-sm2 border border-paper-rule bg-white p-4">
                    <div className="mb-3 text-[13px] font-bold text-ink">Aggregate change profile</div>
                    <AggregateGrid aggregateScores={aggregateScores} />
                    <div className="mt-3.5 space-y-1 text-[11.5px] leading-relaxed text-ink-faint">
                      <div><strong className="text-ink">Leadership</strong> = Leadership sponsorship + Communication.</div>
                      <div><strong className="text-ink">Success</strong> = Strategic clarity + Sustainment.</div>
                      <div><strong className="text-ink">Delivery</strong> = Area leads + Capacity.</div>
                      <div><strong className="text-ink">Readiness</strong> = Staff readiness + Ethics &amp; risk.</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[13px] font-bold text-ink">Relative strengths</div>
                    <div className="mt-2.5 grid gap-2">
                      {strengths.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between rounded-sm2 border p-3"
                          style={{ borderColor: STATUS_COLORS.green.border, background: STATUS_COLORS.green.bg }}
                        >
                          <div className="text-[13.5px] font-semibold text-ink">{d.short}</div>
                          <div className="font-mono text-[13.5px] font-bold" style={{ color: STATUS_COLORS.green.text }}>
                            {d.average.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[13px] font-bold text-ink">Priority attention areas</div>
                    <div className="mt-2.5 grid gap-2">
                      {priorities.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-sm2 border p-3"
                          style={{ borderColor: STATUS_COLORS.red.border, background: STATUS_COLORS.red.bg }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[13.5px] font-semibold text-ink">{d.short}</div>
                            <div className="font-mono text-[13.5px] font-bold" style={{ color: STATUS_COLORS.red.text }}>
                              {d.average.toFixed(1)}
                            </div>
                          </div>
                          <div className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">{d.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-sm2 border border-paper-rule bg-white p-4">
                    <div className="text-[13px] font-bold text-ink">Reflection prompts</div>
                    <ul className="mt-2.5 list-disc space-y-2 pl-4 text-[13.5px] leading-relaxed text-ink-faint">
                      {prompts.map((prompt, idx) => (
                        <li key={idx}>{prompt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-paper-rule pt-4">
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 rounded-sm2 border border-paper-rule bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink transition hover:border-ink-faint"
                    >
                      <Download size={15} />
                      Download PDF
                    </button>
                    <SaveStatus state={saveState} />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-sm2 border border-dashed border-paper-rule bg-paper p-5 text-[13.5px] leading-relaxed text-ink-faint">
                  Complete the assessment and select{" "}
                  <strong className="text-ink">Generate summary</strong> below to populate the
                  interpretation panel.
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Finish */}
        <section className="no-print mt-6 rounded-card border border-paper-rule bg-paper-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">Finish</h3>
              <p className="mt-1 text-[13.5px] text-ink-faint">
                Generate the interpretation summary after completing the assessment.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 rounded-sm2 bg-ink px-5 py-2.5 text-[14px] font-semibold text-paper-card transition hover:bg-ink-light"
              >
                Generate summary
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-sm2 px-4 py-2.5 text-[14px] font-medium text-ink-faint transition hover:text-ink"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>
        </section>
      </div>

      <Link
        href="/facilitator"
        className="no-print fixed bottom-5 right-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-paper-rule bg-paper-card/95 px-3.5 py-2 text-[12.5px] font-medium text-ink-faint shadow-paper backdrop-blur transition hover:border-ink-faint hover:text-ink"
      >
        Facilitator view
        <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === "saving") {
    return <span className="text-[12.5px] text-ink-faint">Saving to workshop results…</span>;
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: STATUS_COLORS.green.text }}>
        <Save size={13} />
        Saved to cohort results
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-[12.5px]" style={{ color: STATUS_COLORS.red.text }}>
        Couldn&rsquo;t save to the workshop database. Your local summary above is unaffected.
      </span>
    );
  }
  return null;
}
