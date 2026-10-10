import React from 'react';
import {
  Play,
  FileText,
  Code,
  History,
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Compass,
  Clock,
  Layers,
  Terminal,
  Zap,
  Users,
  Briefcase,
} from 'lucide-react';
import { CandidateProfile, InterviewSession, InterviewRoundType } from '../types';
import { calculateReadinessEstimate, getScoreTier } from '../services/scoring';
import { INTERVIEW_ROUNDS } from '../services/interviewRounds';

interface DashboardProps {
  profile: CandidateProfile;
  sessions: InterviewSession[];
  activeSession?: InterviewSession | null;
  onNavigate: (tab: string, extraData?: any) => void;
  onReviewSession: (session: InterviewSession) => void;
  onResumeActiveSession?: () => void;
  onDiscardActiveSession?: () => void;
  onStartDemo?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  sessions,
  activeSession,
  onNavigate,
  onReviewSession,
  onResumeActiveSession,
  onDiscardActiveSession,
  onStartDemo,
}) => {
  // Compute genuine statistics strictly from saved completed sessions
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' && typeof s.overallScore === 'number'
  );

  const completedCount = completedSessions.length;

  const averageScore =
    completedCount > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
            completedCount
        )
      : 0;

  const readiness = calculateReadinessEstimate(sessions);

  // Compute practice streak (distinct calendar dates in recent history)
  const uniqueDates = new Set(
    completedSessions.map((s) => new Date(s.createdAt).toDateString())
  );
  const practiceStreak = uniqueDates.size;

  // Category breakdown
  const categoryStats: Record<string, { total: number; count: number }> = {};
  completedSessions.forEach((s) => {
    const cat = s.config.category;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, count: 0 };
    }
    categoryStats[cat].total += s.overallScore || 0;
    categoryStats[cat].count += 1;
  });

  const categoryEntries = Object.entries(categoryStats).map(([cat, data]) => ({
    category: cat,
    avg: Math.round(data.total / data.count),
    count: data.count,
  }));

  // Chronological score trend data (oldest to newest)
  const trendData = [...completedSessions]
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .slice(-7);

  const lastSession = completedSessions[0] || null;

  return (
    <div className="space-y-6">
      {/* Active Session Recovery Banner */}
      {activeSession && (activeSession.status === 'in_progress' || activeSession.status === 'evaluating') && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </span>
            <div>
              <span className="font-bold text-indigo-950 block text-xs sm:text-sm">
                Mock interview in progress
              </span>
              <span className="text-indigo-700">
                {activeSession.config.category} ({activeSession.config.targetRole}) • Question {activeSession.currentQuestionIndex + 1} of {activeSession.config.questionLimit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onDiscardActiveSession}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Discard
            </button>
            <button
              onClick={onResumeActiveSession}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Resume Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-0.5 text-xs font-medium text-indigo-200 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Target Role: {profile.targetRole} ({profile.experienceLevel})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {profile.displayName}!
            </h2>
            <p className="text-sm text-indigo-200 max-w-xl">
              {completedCount === 0
                ? 'Ready for your first practice session? Start a free mock interview now to establish your baseline.'
                : `You have completed ${completedCount} mock interview${
                    completedCount === 1 ? '' : 's'
                  }. Keep practicing to build high interview confidence.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onStartDemo && (
              <button
                onClick={onStartDemo}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-300/40 bg-indigo-700/60 hover:bg-indigo-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 cursor-pointer backdrop-blur-xs"
              >
                <Sparkles className="h-4 w-4 text-indigo-300" />
                <span>Try Demo Interview</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('wizard')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-900 shadow-sm transition hover:bg-indigo-50 active:scale-95 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current text-indigo-600" />
              <span>Start Custom Mock Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Presentation-Friendly Hackathon Demo Walkthrough Card */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800">
              <Sparkles className="h-3 w-3" />
              <span>Hackathon Presentation Flow</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Live Evaluator & Presenter Walkthrough
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              1. Choose an Interview Round & difficulty → 2. Real-time interview question → 3. Quick Submit Answer → 4. Scorecard point rule (+20 pts if correct, 0 if wrong) → 5. Adaptive follow-up question → 6. Official 5-Question Scorecard & Weekly Feedback report.
            </p>
          </div>
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              <span>Launch Demo Flow</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 7 Dedicated Interview Rounds Launcher Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
              <Layers className="h-3.5 w-3.5" /> Comprehensive Hiring Simulation
            </div>
            <h3 className="text-base font-bold text-slate-900">Types of Interview Rounds</h3>
            <p className="text-xs text-slate-500">
              Select any round to begin practicing. Each round evaluates distinct skills with tailored questions and rubrics.
            </p>
          </div>
          <button
            onClick={() => onNavigate('wizard')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition self-start sm:self-auto"
          >
            Open Wizard Configurator →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {INTERVIEW_ROUNDS.map((round) => (
            <div
              key={round.id}
              onClick={() => onNavigate('wizard', { round: round.id, category: round.defaultCategory })}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-indigo-300 hover:shadow-sm flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${round.badgeColor}`}
                  >
                    Round {round.roundNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {round.recommendedQuestions} Qs &bull; {round.recommendedDuration}m
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {round.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {round.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span className="text-[11px]">Start Round {round.roundNumber}</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interviews Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Completed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <History className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{completedCount}</div>
          <p className="text-xs text-slate-500 mt-1">
            {completedCount === 0 ? 'No sessions attempted yet' : 'Verified full sessions saved'}
          </p>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {completedCount > 0 ? `${averageScore}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {completedCount > 0
              ? getScoreTier(averageScore).label
              : 'Complete a session to get scored'}
          </p>
        </div>

        {/* Readiness Estimate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Readiness Estimate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {readiness ? `${readiness.score}%` : 'Pending'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {readiness ? readiness.level : 'Requires at least 2 sessions'}
          </p>
        </div>

        {/* Practice Streak */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Days</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{practiceStreak}</div>
          <p className="text-xs text-slate-500 mt-1">
            {practiceStreak === 1 ? '1 active day recorded' : `${practiceStreak} active days recorded`}
          </p>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('wizard')}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-indigo-400 hover:shadow-xs active:scale-98"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Play className="h-4 w-4 fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-800">Start Interview</span>
        </button>

        <button
          onClick={() => onNavigate('resume')}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-indigo-400 hover:shadow-xs active:scale-98"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FileText className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Analyze My Resume</span>
        </button>

        <button
          onClick={() => onNavigate('wizard', { category: 'Coding' })}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-indigo-400 hover:shadow-xs active:scale-98"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Code className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Practice Coding</span>
        </button>

        <button
          onClick={() => {
            if (lastSession) onReviewSession(lastSession);
            else onNavigate('history');
          }}
          disabled={!lastSession}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition ${
            lastSession
              ? 'hover:border-indigo-400 hover:shadow-xs active:scale-98 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Review Last Session</span>
        </button>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Trend (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Score Trend Over Time</h3>
              <p className="text-xs text-slate-500">Chronological performance across recent sessions</p>
            </div>
            {completedCount > 0 && (
              <span className="text-xs font-semibold text-indigo-600">
                Last {trendData.length} Sessions
              </span>
            )}
          </div>

          {completedCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <TrendingUp className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No score history yet</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Complete your first mock interview to see your score trajectory and trend analysis.
              </p>
              <button
                onClick={() => onNavigate('wizard')}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Begin First Interview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Responsive SVG Line Chart */}
              <div className="h-48 w-full">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 500 150">
                  {/* Grid Lines */}
                  {[0, 25, 50, 75, 100].map((v) => {
                    const y = 140 - (v / 100) * 120;
                    return (
                      <g key={v}>
                        <line
                          x1="30"
                          y1={y}
                          x2="480"
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                        <text
                          x="20"
                          y={y + 3}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="end"
                        >
                          {v}
                        </text>
                      </g>
                    );
                  })}

                  {/* Polyline */}
                  {trendData.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={trendData
                        .map((s, idx) => {
                          const x = 50 + (idx / (trendData.length - 1)) * 410;
                          const y = 140 - ((s.overallScore || 0) / 100) * 120;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Data Points */}
                  {trendData.map((s, idx) => {
                    const x =
                      trendData.length === 1
                        ? 250
                        : 50 + (idx / (trendData.length - 1)) * 410;
                    const y = 140 - ((s.overallScore || 0) / 100) * 120;
                    return (
                      <g key={s.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke="#4f46e5"
                          strokeWidth="2.5"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          fill="#312e81"
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

              <div className="flex justify-between text-[11px] text-slate-400 px-6">
                <span>Earliest Session</span>
                <span>Latest Session</span>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Category Performance</h3>
            <p className="text-xs text-slate-500">Average score by practice domain</p>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-6 text-center text-xs text-slate-500">
              <Layers className="h-6 w-6 text-slate-400 mx-auto mb-2" />
              Practice categories will be analyzed here once interviews are completed.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryEntries.map((c) => (
                <div key={c.category} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 truncate">{c.category}</span>
                    <span className="font-bold text-slate-900">{c.avg}% ({c.count} session{c.count > 1 ? 's' : ''})</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.avg >= 75
                          ? 'bg-emerald-500'
                          : c.avg >= 60
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${c.avg}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Coach Tip Card */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>AI Coach Tip</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              When answering technical questions, state the direct takeaway first, then describe the underlying data structures, and conclude with real-world trade-offs.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Interviews List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Mock Interviews</h3>
            <p className="text-xs text-slate-500">Saved practice sessions and reports</p>
          </div>
          {completedCount > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              View All History →
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center text-xs text-slate-500">
            No mock interview history yet. Click <strong>Start Mock Interview</strong> above to begin your first session!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.slice(0, 5).map((s) => {
              const tier = typeof s.overallScore === 'number' ? getScoreTier(s.overallScore) : null;
              return (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{s.config.targetRole}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {s.config.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
                        {s.config.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{s.completedQuestionCount} questions attempted</span>
                      <span>•</span>
                      <span>{Math.round(s.durationSeconds / 60)} mins</span>
                      <span>•</span>
                      <span className="uppercase font-semibold text-[10px] text-slate-500">{s.evaluationMode} mode</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {s.status === 'completed' && typeof s.overallScore === 'number' ? (
                      <div className="text-right">
                        <span className={`inline-block rounded-md border px-2 py-0.5 font-bold ${tier?.badgeBg} ${tier?.badgeText}`}>
                          {s.overallScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 font-semibold text-[11px]">
                        Incomplete
                      </span>
                    )}

                    <button
                      onClick={() => onReviewSession(s)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Review Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
