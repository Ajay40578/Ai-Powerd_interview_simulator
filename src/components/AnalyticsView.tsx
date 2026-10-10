import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { InterviewSession } from '../types';
import { calculateReadinessEstimate, getScoreTier } from '../services/scoring';

interface AnalyticsViewProps {
  sessions: InterviewSession[];
  onStartPractice: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sessions,
  onStartPractice,
}) => {
  const [selectedSessionA, setSelectedSessionA] = useState<string>('');
  const [selectedSessionB, setSelectedSessionB] = useState<string>('');

  const completedSessions = sessions
    .filter((s) => s.status === 'completed' && typeof s.overallScore === 'number')
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const totalSessions = completedSessions.length;
  const readiness = calculateReadinessEstimate(sessions);

  // Average score
  const avgScore =
    totalSessions > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
            totalSessions
        )
      : 0;

  // Category aggregates
  const categoryMap: Record<string, { total: number; count: number }> = {};
  completedSessions.forEach((s) => {
    const c = s.config.category;
    if (!categoryMap[c]) categoryMap[c] = { total: 0, count: 0 };
    categoryMap[c].total += s.overallScore || 0;
    categoryMap[c].count += 1;
  });

  const categories = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    score: Math.round(data.total / data.count),
    sessions: data.count,
  }));

  // Skill aggregates from evaluated questions
  const skillMap: Record<string, { total: number; count: number }> = {};
  completedSessions.forEach((s) => {
    s.questions.forEach((q) => {
      const ans = s.answers[q.id];
      if (ans && ans.evaluation && typeof ans.evaluation.overallScore === 'number') {
        const sk = q.skill || q.category;
        if (!skillMap[sk]) skillMap[sk] = { total: 0, count: 0 };
        skillMap[sk].total += ans.evaluation.overallScore;
        skillMap[sk].count += 1;
      }
    });
  });

  const skillsList = Object.entries(skillMap)
    .map(([skill, d]) => ({
      skill,
      score: Math.round(d.total / d.count),
      attempts: d.count,
    }))
    .sort((a, b) => b.score - a.score);

  const strongSkills = skillsList.filter((s) => s.score >= 75);
  const weakSkills = skillsList.filter((s) => s.score < 65);

  const sessionA = completedSessions.find((s) => s.id === selectedSessionA);
  const sessionB = completedSessions.find((s) => s.id === selectedSessionB);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Performance Analytics</h2>
        <p className="text-xs text-slate-500">
          Track historical score trajectories, domain mastery, and interview consistency.
        </p>
      </div>

      {totalSessions === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Analytics Data Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You haven't completed any mock interviews yet. As soon as you finish a practice interview, deep score trends and skill analytics will appear here.
            </p>
          </div>
          <button
            onClick={onStartPractice}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
          >
            Start Your First Practice Session
          </button>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Total Evaluated Sessions
              </span>
              <span className="text-3xl font-extrabold text-slate-900">{totalSessions}</span>
              <p className="text-xs text-slate-500 mt-1">
                Average Score: <strong className="text-indigo-600">{avgScore}%</strong>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Interview Readiness Estimate
              </span>
              <span className="text-3xl font-extrabold text-slate-900">
                {readiness ? `${readiness.score}%` : 'Pending'}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {readiness ? readiness.level : 'Requires 2+ completed sessions'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Skill Coverage
              </span>
              <span className="text-3xl font-extrabold text-slate-900">
                {skillsList.length}
              </span>
              <p className="text-xs text-slate-500 mt-1">Distinct technical competencies assessed</p>
            </div>
          </div>

          {/* Score Trajectory SVG Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historical Score Progression</h3>
                <p className="text-xs text-slate-500">Every completed interview plotted chronologically</p>
              </div>
            </div>

            <div className="h-56 w-full pt-4">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 500 160">
                {/* Horizontal guide lines */}
                {[0, 25, 50, 75, 100].map((v) => {
                  const y = 140 - (v / 100) * 120;
                  return (
                    <g key={v}>
                      <line x1="30" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="20" y={y + 3} fill="#94a3b8" fontSize="9" textAnchor="end">
                        {v}%
                      </text>
                    </g>
                  );
                })}

                {/* Connecting Polyline */}
                {completedSessions.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={completedSessions
                      .map((s, idx) => {
                        const x = 50 + (idx / (completedSessions.length - 1)) * 410;
                        const y = 140 - ((s.overallScore || 0) / 100) * 120;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                )}

                {/* Data Points */}
                {completedSessions.map((s, idx) => {
                  const x =
                    completedSessions.length === 1
                      ? 250
                      : 50 + (idx / (completedSessions.length - 1)) * 410;
                  const y = 140 - ((s.overallScore || 0) / 100) * 120;
                  return (
                    <g key={s.id}>
                      <circle cx={x} cy={y} r="5.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                      <text
                        x={x}
                        y={y - 10}
                        fill="#1e1b4b"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {s.overallScore}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Strong vs Weak Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Strengths */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span>Top Demonstrated Skills (75%+)</span>
              </span>
              {strongSkills.length === 0 ? (
                <p className="text-xs text-slate-400">Complete more sessions to establish top skills.</p>
              ) : (
                <div className="space-y-2">
                  {strongSkills.map((sk) => (
                    <div key={sk.skill} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700">{sk.skill}</span>
                        <span className="font-bold text-emerald-700">{sk.score}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${sk.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Areas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-amber-600" />
                <span>Areas Needing Practice (&lt;65%)</span>
              </span>
              {weakSkills.length === 0 ? (
                <p className="text-xs text-slate-400">No weak areas identified yet. Great job!</p>
              ) : (
                <div className="space-y-2">
                  {weakSkills.map((sk) => (
                    <div key={sk.skill} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700">{sk.skill}</span>
                        <span className="font-bold text-amber-700">{sk.score}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${sk.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Session Comparison Selector */}
          {completedSessions.length >= 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Side-by-Side Session Comparison</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Baseline Session:
                  </label>
                  <select
                    value={selectedSessionA}
                    onChange={(e) => setSelectedSessionA(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="">Choose session...</option>
                    {completedSessions.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        #{i + 1} - {s.config.category} ({s.overallScore}%) - {new Date(s.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Comparison Session:
                  </label>
                  <select
                    value={selectedSessionB}
                    onChange={(e) => setSelectedSessionB(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="">Choose session...</option>
                    {completedSessions.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        #{i + 1} - {s.config.category} ({s.overallScore}%) - {new Date(s.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {sessionA && sessionB && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="text-left font-bold text-slate-700">Metric</div>
                    <div className="font-bold text-indigo-700">{sessionA.config.category}</div>
                    <div className="font-bold text-violet-700">{sessionB.config.category}</div>

                    <div className="text-left text-slate-500">Overall Score</div>
                    <div className="font-bold">{sessionA.overallScore}%</div>
                    <div className="font-bold">{sessionB.overallScore}%</div>

                    <div className="text-left text-slate-500">Difficulty</div>
                    <div className="capitalize">{sessionA.config.difficulty}</div>
                    <div className="capitalize">{sessionB.config.difficulty}</div>

                    <div className="text-left text-slate-500">Duration</div>
                    <div>{Math.round(sessionA.durationSeconds / 60)}m</div>
                    <div>{Math.round(sessionB.durationSeconds / 60)}m</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
