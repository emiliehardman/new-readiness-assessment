"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw, Download, Save, Lightbulb, Compass } from "lucide-react";
import { domains, SCALE } from "@/lib/domains";
import { unslugify } from "@/lib/slug";
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
  patternInsights,
  bucketNarratives,
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
  const [session, setSession] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // A workshop session, if this link came from a facilitator's generated
  // link (?session=...). Read directly from the URL rather than a form
  // field, since a value nobody has to type can't be mistyped.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("session");
    if (raw && raw.trim()) setSession(raw.trim());
  }, []);

  const domainScores = useMemo(() => computeDomainScores(responses), [responses]);
  const { percent: completion } = useMemo(() => computeCompletion(responses), [responses]);
  const overall = useMemo(() => computeOverall(domainScores), [domainScores]);
  const strengths = useMemo(() => topStrengths(domainScores), [domainScores]);
  const priorities = useMemo(() => topPriorities(domainScores), [domainScores]);
  const aggregateScores = useMemo(() => computeAggregateScores(domainScores), [domainScores]);
  const interpretation = useMemo(() => overallInterpretation(overall), [overall]);
  const prompts = useMemo(() => reflectionPrompts(strengths, priorities), [strengths, priorities]);
  const insights = useMemo(() => patternInsights(domainScores), [domainScores]);

  // Scroll the newly-rendered results section into view once it exists,
  // instead of jumping the page back to the top.
  useEffect(() => {
    if (submitted) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitted]);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    setSubmitted(true);
    setSaveState("saving");

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
          session,
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
      patternInsights: insights,
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
              A structured diagnostic for academic library leaders, built to show how ready a
              specific change initiative is to move and where there might be readiness concerns
              to confront.
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
                is a normal and useful answer, not something you should be afraid of. Where an
                item says &ldquo;we,&rdquo; read that as you together with whoever shares
                leadership responsibility for this initiative, if anyone.
              </p>
              {session ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3 py-1.5 text-[12px] font-medium text-brass-dark">
                  Workshop session: {unslugify(session)}
                  <span className="text-ink-faint">· your results save automatically to this session</span>
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-ink-faint">
                  Your results save automatically when you generate your summary below.
                </p>
              )}
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
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-ink">Context notes</span>
              <span className="text-[11.5px] font-normal text-ink-faint">
                Optional. Prints with your results in the PDF summary.
              </span>
            </div>
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

        {/* Domains + live sidebar */}
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

          {/* Live-updating sidebar: quick read only. Full results live in
              their own section below, not tucked in here, so people can
              actually find them after they finish. */}
          <aside className="grid gap-6 self-start lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
            <div className="rounded-card border border-paper-rule bg-paper-card p-6">
              <h2 className="font-serif text-lg font-semibold text-ink">Current results</h2>
              <p className="mt-1 text-[13px] text-ink-faint">
                Updates live as you answer. Your full summary appears below the form once you
                select Generate summary.
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
          </aside>
        </div>

        {/* Finish */}
        <section className="no-print mt-6 rounded-card border border-paper-rule bg-paper-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink">Finish</h3>
              <p className="mt-1 text-[13.5px] text-ink-faint">
                Generate your full summary after completing the assessment. It will appear below.
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

        {/* Full results, below the form, not squeezed into the sidebar */}
        {submitted && (
          <div ref={resultsRef} className="mt-6 scroll-mt-6">
            <section className="rounded-card border border-paper-rule bg-paper-card p-7 sm:p-8">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-dark">
                Your results
              </div>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
                <div className="flex items-end gap-5">
                  <StampBadge score={overall} size={76} />
                  <div>
                    <div className="text-[13px] text-ink-faint">Overall readiness</div>
                    <div className="font-serif text-5xl font-semibold leading-none text-ink">
                      {overall ? overall.toFixed(2) : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="no-print inline-flex items-center gap-1.5 rounded-sm2 border border-paper-rule bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink transition hover:border-ink-faint"
                  >
                    <Download size={15} />
                    Download PDF
                  </button>
                  <SaveStatus state={saveState} />
                </div>
              </div>

              <p className="mt-5 max-w-3xl text-[14.5px] leading-relaxed text-ink-faint">
                {interpretation}
              </p>

              <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-ink">Aggregate change profile</h3>
                <div className="mt-3">
                  <AggregateGrid aggregateScores={aggregateScores} wide />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["leadership", "Leadership sponsorship + Communication"],
                      ["success", "Strategic clarity + Sustainment"],
                      ["delivery", "Area leads + Capacity"],
                      ["readiness", "Staff readiness + Ethics & risk"],
                    ] as const
                  ).map(([key, composition]) => {
                    const bucket = aggregateScores[key];
                    const strong = bucket.average >= 2.5;
                    const narrative = strong ? bucketNarratives[key].strong : bucketNarratives[key].attention;
                    return (
                      <div key={key} className="rounded-sm2 border border-paper-rule bg-white p-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-[13.5px] font-semibold text-ink">{bucket.title}</div>
                          <div className="text-[11px] text-ink-faint">{composition}</div>
                        </div>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-faint">{narrative}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {insights.length > 0 && (
                <div className="mt-9">
                  <h3 className="font-serif text-lg font-semibold text-ink">What this combination suggests</h3>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    Patterns across two or more domains together, not just single scores in isolation.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {insights.map((insight, idx) => (
                      <div key={idx} className="rounded-sm2 border border-brass/40 bg-white p-4">
                        <div className="flex gap-2.5">
                          <Compass size={16} className="mt-0.5 shrink-0 text-brass-dark" />
                          <div>
                            <div className="text-[14px] font-semibold text-ink">{insight.title}</div>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-faint">{insight.body}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink">Where you&rsquo;re strong</h3>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    Worth protecting deliberately, not just noting.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {strengths.length ? (
                      strengths.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-sm2 border p-4"
                          style={{ borderColor: STATUS_COLORS.green.border, background: STATUS_COLORS.green.bg }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[14.5px] font-semibold text-ink">{d.short}</div>
                            <div className="flex items-baseline gap-1.5">
                              {strengths.filter((s) => s.average === d.average).length > 1 && (
                                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wide text-ink-faint">
                                  Tied
                                </span>
                              )}
                              <div className="font-mono text-[14px] font-bold" style={{ color: STATUS_COLORS.green.text }}>
                                {d.average.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2 border-t border-status-green-border/60 pt-3">
                            <Lightbulb size={15} className="mt-0.5 shrink-0" style={{ color: STATUS_COLORS.green.text }} />
                            <p className="text-[13px] leading-relaxed text-ink">{d.strengthNote}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-sm2 border border-dashed border-paper-rule p-4 text-[13px] text-ink-faint">
                        No standout strengths yet.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink">Where to focus</h3>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    A concrete next move for each, not just the gap.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {priorities.length ? (
                      priorities.map((d) => (
                        <div
                          key={d.id}
                          className="rounded-sm2 border p-4"
                          style={{ borderColor: STATUS_COLORS.red.border, background: STATUS_COLORS.red.bg }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[14.5px] font-semibold text-ink">{d.short}</div>
                            <div className="flex items-baseline gap-1.5">
                              {priorities.filter((p) => p.average === d.average).length > 1 && (
                                <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wide text-ink-faint">
                                  Tied
                                </span>
                              )}
                              <div className="font-mono text-[14px] font-bold" style={{ color: STATUS_COLORS.red.text }}>
                                {d.average.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-faint">{d.description}</p>
                          <div className="mt-3 flex gap-2 border-t border-status-red-border/60 pt-3">
                            <Lightbulb size={15} className="mt-0.5 shrink-0" style={{ color: STATUS_COLORS.red.text }} />
                            <p className="text-[13px] leading-relaxed text-ink">{d.priorityNote}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-sm2 border border-dashed border-paper-rule p-4 text-[13px] text-ink-faint">
                        No standout priorities yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-9 rounded-sm2 border border-paper-rule bg-white p-5">
                <h3 className="font-serif text-lg font-semibold text-ink">Reflection prompts</h3>
                <p className="mt-1 text-[13px] text-ink-faint">
                  Good starting points for a discussion with your peers or a conversation with your own team.
                </p>
                <div className="mt-4 grid gap-3">
                  {prompts.map((prompt, idx) => (
                    <div key={idx} className="rounded-sm2 border border-paper-rule bg-paper p-3.5">
                      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-brass-dark">
                        {prompt.label}
                      </div>
                      <div className="mt-1 text-[14px] leading-relaxed text-ink">{prompt.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
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
