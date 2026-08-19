"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Lock, RefreshCcw, Trash2 } from "lucide-react";
import { domains } from "@/lib/domains";
import { getStatus, type AggregateScores, type StatusKey } from "@/lib/scoring";
import { STATUS_COLORS } from "@/lib/statusColors";
import { downloadSubmissionsCsv } from "@/lib/csv";
import StampBadge from "@/components/StampBadge";
import AggregateGrid from "@/components/AggregateGrid";

type DomainAverage = {
  id: string;
  title: string;
  short: string;
  average: number;
  statusCounts: Record<StatusKey, number>;
  n: number;
};

type Submission = {
  id: number;
  createdAt: string;
  participant: string | null;
  institution: string | null;
  role: string | null;
  initiative: string | null;
  notes: string | null;
  domainScores: { id: string; short: string; average: number }[];
  aggregateScores: Record<string, { title: string; average: number }>;
  overall: number;
};

type ResultsPayload = {
  count: number;
  overallAverage: number;
  domainAverages: DomainAverage[];
  bucketAverages: Record<string, number>;
  submissions: Submission[];
};

export default function FacilitatorPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [clearing, setClearing] = useState(false);

  async function fetchResults(pw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setLoading(false);
        return;
      }
      setData(json);
      setAuthed(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    const count = data?.count ?? 0;
    const confirmed = window.confirm(
      `This will permanently delete all ${count} submission${count === 1 ? "" : "s"} currently in the database. Use this between workshop groups once you no longer need this group's results. Continue?`
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      const res = await fetch("/api/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not clear results.");
        return;
      }
      await fetchResults(password);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setClearing(false);
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6">
        <div className="w-full max-w-sm rounded-card border border-paper-card/15 bg-ink-light/40 p-8">
          <div className="mb-5 flex items-center gap-2 text-brass-light">
            <Lock size={18} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
              Facilitator access
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-paper-card">Cohort dashboard</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-paper-card/65">
            Enter the workshop passcode to view aggregated results across all participants.
          </p>
          <form
            className="mt-6 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              fetchResults(password);
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passcode"
              className="rounded-sm2 border border-paper-card/20 bg-paper-card/95 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-faint/60 focus:border-brass"
              autoFocus
            />
            {error && <div className="text-[13px] text-status-red">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-sm2 bg-brass px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:bg-brass-light disabled:opacity-60"
            >
              {loading ? "Checking…" : "View dashboard"}
            </button>
          </form>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-paper-card/60 hover:text-paper-card"
          >
            <ArrowLeft size={14} />
            Back to assessment
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const aggregateScores: AggregateScores = {
    leadership: { title: "Leadership", average: data.bucketAverages.leadership ?? 0 },
    success: { title: "Success", average: data.bucketAverages.success ?? 0 },
    delivery: { title: "Delivery", average: data.bucketAverages.delivery ?? 0 },
    readiness: { title: "Readiness", average: data.bucketAverages.readiness ?? 0 },
  };

  return (
    <div className="min-h-screen bg-paper pb-24">
      <header className="ruled-bg bg-ink px-6 pb-10 pt-8 text-paper-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-paper-card/60 hover:text-paper-card">
              <ArrowLeft size={14} />
              Assessment
            </Link>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-paper-card">Facilitator dashboard</h1>
            <p className="mt-1 text-[14px] text-paper-card/65">
              {data.count} submission{data.count === 1 ? "" : "s"} in this cohort.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => fetchResults(password)}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-card/25 px-4 py-2 text-[13px] font-medium text-paper-card/85 transition hover:border-brass-light hover:text-brass-light"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
            <button
              onClick={() => downloadSubmissionsCsv(data.submissions)}
              disabled={!data.count}
              className="inline-flex items-center gap-1.5 rounded-full bg-brass px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-brass-light disabled:opacity-50"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={handleClear}
              disabled={!data.count || clearing}
              className="inline-flex items-center gap-1.5 rounded-full border border-status-red px-4 py-2 text-[13px] font-semibold text-status-red transition hover:bg-status-red-bg disabled:opacity-40"
            >
              <Trash2 size={14} />
              {clearing ? "Clearing…" : "Clear results"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6">
        {data.count === 0 ? (
          <div className="-mt-5 rounded-card border border-dashed border-paper-rule bg-paper-card p-10 text-center">
            <p className="text-[14.5px] text-ink-faint">
              No submissions yet. Once participants complete the assessment and select
              &ldquo;Generate summary,&rdquo; their results will appear here.
            </p>
          </div>
        ) : (
          <>
            <section className="-mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-card border border-paper-rule bg-paper-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] text-ink-faint">Cohort overall readiness</div>
                    <div className="font-serif text-4xl font-semibold text-ink">
                      {data.overallAverage.toFixed(2)}
                    </div>
                  </div>
                  <StampBadge score={data.overallAverage} size={72} />
                </div>
              </div>
              <div className="rounded-card border border-paper-rule bg-paper-card p-6">
                <div className="mb-3 text-[13px] font-bold text-ink">Aggregate change profile</div>
                <AggregateGrid aggregateScores={aggregateScores} />
              </div>
            </section>

            <section className="mt-6 rounded-card border border-paper-rule bg-paper-card p-6 sm:p-7">
              <h2 className="font-serif text-lg font-semibold text-ink">Domain averages across the cohort</h2>
              <div className="mt-4 grid gap-2.5">
                {data.domainAverages.map((d) => {
                  const status = d.average ? getStatus(d.average) : { key: "neutral" as const, label: "No data" };
                  const c = STATUS_COLORS[status.key];
                  return (
                    <div
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-sm2 border p-3.5"
                      style={{ borderColor: c.border, background: d.average ? c.bg : STATUS_COLORS.neutral.bg }}
                    >
                      <div className="min-w-[180px]">
                        <div className="text-[14px] font-semibold text-ink">{d.title}</div>
                        <div className="text-[12.5px] text-ink-faint">{d.n} response{d.n === 1 ? "" : "s"}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2 font-mono text-[11.5px]">
                          <span style={{ color: STATUS_COLORS.green.text }}>{d.statusCounts.green} strength</span>
                          <span style={{ color: STATUS_COLORS.amber.text }}>{d.statusCounts.amber} at risk</span>
                          <span style={{ color: STATUS_COLORS.red.text }}>{d.statusCounts.red} high risk</span>
                        </div>
                        <div className="font-serif text-xl font-semibold text-ink">
                          {d.average ? d.average.toFixed(2) : "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 rounded-card border border-paper-rule bg-paper-card p-6 sm:p-7">
              <h2 className="font-serif text-lg font-semibold text-ink">Individual submissions</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-paper-rule font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                      <th className="py-2 pr-4">Submitted</th>
                      <th className="py-2 pr-4">Participant</th>
                      <th className="py-2 pr-4">Institution</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Initiative</th>
                      <th className="py-2 pr-4">Overall</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.submissions.map((s) => {
                      const status = s.overall ? getStatus(s.overall) : { key: "neutral" as const, label: "—" };
                      const c = STATUS_COLORS[status.key];
                      return (
                        <tr key={s.id} className="border-b border-paper-rule/70">
                          <td className="py-2.5 pr-4 text-ink-faint">
                            {new Date(s.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2.5 pr-4 text-ink">{s.participant || "—"}</td>
                          <td className="py-2.5 pr-4 text-ink-faint">{s.institution || "—"}</td>
                          <td className="py-2.5 pr-4 text-ink-faint">{s.role || "—"}</td>
                          <td className="py-2.5 pr-4 text-ink-faint">{s.initiative || "—"}</td>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-ink">
                            {s.overall ? s.overall.toFixed(2) : "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <span
                              className="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
                              style={{ borderColor: c.border, background: c.bg, color: c.text }}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
