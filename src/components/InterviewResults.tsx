import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Layers,
  BookOpen,
  BarChart3,
  TrendingUp,
  Info,
} from 'lucide-react';
import { InterviewSession, WeeklyFeedbackReport } from '../types';
import {
  generateSessionScorecard,
  generateWeeklyFeedback,
  getScoreTier,
} from '../services/scoring';
import { StorageService } from '../services/storage';

interface InterviewResultsProps {
  session: InterviewSession;
  allSessions?: InterviewSession[];
  onRetry: () => void;
  onNavigateRoadmap: () => void;
  onPracticeWeakAreas: (weakSkills: string[]) => void;
  onReturnDashboard: () => void;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({
  session,
  allSessions,
  onRetry,
  onNavigateRoadmap,
  onPracticeWeakAreas,
  onReturnDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'weekly' | 'analytics'>('scorecard');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(
    session.questions[0]?.id || null
  );

  // Compute official scorecard (5 questions, +20 points per correct answer, 0 for wrong)
  const scorecard = session.scorecard || generateSessionScorecard(session);
  const overallScore = session.overallScore ?? scorecard.totalPointsEarned;
  const scoreTier = getScoreTier(overallScore);

  // Load all sessions for weekly report calculation
  const sessionList = allSessions && allSessions.length > 0 ? allSessions : StorageService.getSessions();
  const sessionsWithCurrent = sessionList.some((s) => s.id === session.id)
    ? sessionList
    : [session, ...sessionList];
  const weeklyFeedback: WeeklyFeedbackReport = generateWeeklyFeedback(sessionsWithCurrent);

  const evaluatedAnswers = Object.values(session.answers).filter(
    (ans) => ans.status === 'completed' && ans.evaluation
  );

  // Compute dimension averages
  const relevanceAvg =
    evaluatedAnswers.length > 0
      ? Math.round(
          evaluatedAnswers.reduce((acc, a) => acc + (a.evaluation?.relevanceScore || 0), 0) /
            evaluatedAnswers.length
        )
      : 0;

  const correctnessAvg =
    evaluatedAnswers.length > 0
      ? Math.round(
          evaluatedAnswers.reduce((acc, a) => acc + (a.evaluation?.correctnessScore || 0), 0) /
            evaluatedAnswers.length
        )
      : 0;

  const depthAvg =
    evaluatedAnswers.length > 0
      ? Math.round(
          evaluatedAnswers.reduce((acc, a) => acc + (a.evaluation?.depthScore || 0), 0) /
            evaluatedAnswers.length
        )
      : 0;

  const clarityAvg =
    evaluatedAnswers.length > 0
      ? Math.round(
          evaluatedAnswers.reduce((acc, a) => acc + (a.evaluation?.clarityScore || 0), 0) /
            evaluatedAnswers.length
        )
      : 0;

  // Extract weak skills from questions that scored 0 points or < 70
  const weakSkillsSet = new Set<string>();
  scorecard.items.forEach((item) => {
    if (!item.isCorrect) {
      weakSkillsSet.add(item.skill || item.category);
    }
  });
  session.questions.forEach((q) => {
    const ans = session.answers[q.id];
    if (ans && ans.evaluation && ans.evaluation.overallScore < 70) {
      weakSkillsSet.add(q.skill || q.category);
    }
  });
  const weakSkills = Array.from(weakSkillsSet);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Completion Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Interview Session Completed & Evaluated</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interview Evaluation Report & Scorecard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {session.config.roundTitle ? (
              <span className="font-semibold text-indigo-600 mr-1">
                {session.config.roundTitle} &bull;
              </span>
            ) : null}
            {session.config.targetRole} &bull; {session.config.category} ({session.config.difficulty})
          </p>
        </div>

        {/* Scorecard Hero Circle */}
        <div className="mx-auto flex flex-col items-center justify-center p-2">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-indigo-600 bg-indigo-50/60 shadow-inner">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-black text-indigo-900">
                {scorecard.totalPointsEarned}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                / {scorecard.maxPossiblePoints || 100} PTS
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${scoreTier.badgeBg} ${scoreTier.badgeText}`}
            >
              {scorecard.grade}
            </span>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              {scorecard.correctCount} of {scorecard.totalQuestions} questions answered correctly (+20 pts each).
            </p>
          </div>
        </div>

        {/* Session Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs text-left">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block font-semibold">ACCURACY RATE</span>
            <span className="font-bold text-slate-800 text-sm">
              {scorecard.percentage}% ({scorecard.correctCount}/{scorecard.totalQuestions} Correct)
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block font-semibold">SESSION DURATION</span>
            <span className="font-bold text-slate-800 text-sm">
              {Math.max(1, Math.round(session.durationSeconds / 60))} minutes
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block font-semibold">EVALUATION ENGINE</span>
            <span className="font-bold text-slate-800 text-sm capitalize">
              {session.evaluationMode === 'ai' ? 'Gemini 3.8 Flash' : 'Deterministic Demo Engine'}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] text-slate-400 block font-semibold">SESSION DATE</span>
            <span className="font-bold text-slate-800 text-sm">
              {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Transparent Scoring Formula Notice */}
        <div className="rounded-xl bg-indigo-50/60 border border-indigo-200 p-3 text-xs text-indigo-900 flex items-start gap-2.5 text-left">
          <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">Transparent Scoring Rule:</strong> For every test, each question is evaluated individually. If the answer demonstrates correct technical concepts, <strong className="text-indigo-800">+20 points</strong> are awarded. If incorrect, incomplete, or off-topic, <strong className="text-rose-700">0 points</strong> are added (no score). Maximum score across 5 questions is 100 points.
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2 no-print shadow-xs">
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'scorecard'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Test Scorecard ({scorecard.totalPointsEarned}/100)</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'weekly'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Weekly Feedback & Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Rubric Dimensions & Notes</span>
        </button>
      </div>

      {/* TAB 1: OFFICIAL SCORECARD */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Question-by-Question Scorecard
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed evaluation breakdown: +20 points for correct responses, 0 points for incorrect answers.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500">
                  Score: <strong className="text-indigo-600 text-base">{scorecard.totalPointsEarned}</strong> / 100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {scorecard.items.map((item) => {
                const isExpanded = expandedQuestion === item.questionId;
                return (
                  <div
                    key={item.questionId}
                    className={`rounded-xl border transition overflow-hidden ${
                      item.isCorrect
                        ? 'border-emerald-200 bg-white hover:border-emerald-300'
                        : 'border-rose-200 bg-white hover:border-rose-300'
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedQuestion(isExpanded ? null : item.questionId)}
                      className="flex cursor-pointer items-center justify-between p-4 bg-white transition hover:bg-slate-50/60"
                    >
                      <div className="flex items-center gap-3 pr-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                            item.isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.questionNumber}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                            {item.questionText}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Skill: {item.skill}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black border ${
                            item.isCorrect
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          {item.isCorrect ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Correct (+20 Pts)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                              <span>Incorrect (0 Pts)</span>
                            </>
                          )}
                        </span>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3.5 text-xs">
                        {/* Candidate Answer */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Candidate's Submitted Answer:
                          </span>
                          <div className="rounded-xl bg-white border border-slate-200 p-3 text-slate-800 leading-relaxed font-mono text-[11px]">
                            {item.candidateAnswer}
                          </div>
                        </div>

                        {/* Model Answer */}
                        {item.modelAnswer && (
                          <div className="rounded-xl bg-indigo-50/50 border border-indigo-200 p-3 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                              Exemplary Model Answer:
                            </span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {item.modelAnswer}
                            </p>
                          </div>
                        )}

                        {/* Strengths & Corrections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {item.strengths.length > 0 && (
                            <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3 space-y-1">
                              <span className="font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Strengths Observed</span>
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-emerald-900/90 text-[11px]">
                                {item.strengths.map((str, i) => (
                                  <li key={i}>{str}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.corrections.length > 0 && (
                            <div className="rounded-xl bg-rose-50/60 border border-rose-200 p-3 space-y-1">
                              <span className="font-bold text-rose-800 flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Specific Corrections Needed</span>
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-rose-900/90 text-[11px]">
                                {item.corrections.map((corr, i) => (
                                  <li key={i}>{corr}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {item.improvementSuggestions.length > 0 && (
                          <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3 space-y-1">
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                              <Lightbulb className="h-3.5 w-3.5" />
                              <span>Improvement Tips</span>
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 text-[11px]">
                              {item.improvementSuggestions.map((tip, i) => (
                                <li key={i}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY FEEDBACK */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Weekly Performance Review
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {weeklyFeedback.weekLabel}
                </h3>
              </div>
              <div className="inline-block rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700">
                {weeklyFeedback.weeklyGrade}
              </div>
            </div>

            {/* Weekly Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">SESSIONS THIS WEEK</span>
                <span className="font-bold text-slate-800 text-sm">
                  {weeklyFeedback.sessionsCompleted} Mock Rounds
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">TOTAL QUESTIONS</span>
                <span className="font-bold text-slate-800 text-sm">
                  {weeklyFeedback.totalQuestionsAttempted} Questions Attempted
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">WEEKLY ACCURACY</span>
                <span className="font-bold text-slate-800 text-sm">
                  {weeklyFeedback.accuracyPercentage}% Correct Answers
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">TOTAL POINTS EARNED</span>
                <span className="font-bold text-slate-800 text-sm">
                  {weeklyFeedback.totalPointsEarned} / {weeklyFeedback.maxPointsPossible || 100} Pts
                </span>
              </div>
            </div>

            {/* Day by Day Activity Graph */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Last 7 Days Practice Activity & Accuracy</span>
              </h4>
              <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs">
                {weeklyFeedback.dayByDayBreakdown.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold">{item.day}</span>
                    <div className="h-16 w-full max-w-[36px] bg-slate-200 rounded-lg flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full bg-indigo-600 rounded-md transition-all"
                        style={{ height: `${Math.max(item.accuracy, item.questionsCount > 0 ? 15 : 0)}%` }}
                        title={`${item.questionsCount} questions (${item.accuracy}% accurate)`}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700">
                      {item.questionsCount > 0 ? `${item.accuracy}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Topics to Revise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Key Technical Strengths This Week</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-emerald-900">
                  {weeklyFeedback.keyStrengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Recommended Topics for Revision</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-900">
                  {weeklyFeedback.topicsToRevise.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable 5-Day Weekly Study Schedule */}
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-4 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-indigo-600" />
                <span>Personalized 5-Day Action Plan For Next Week</span>
              </h4>
              <div className="space-y-2">
                {weeklyFeedback.nextWeekActionPlan.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-white p-2.5 border border-indigo-100 text-xs text-slate-800"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[10px]">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RUBRIC DIMENSIONS & NOTES */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Dimensional Performance</h3>
              <p className="text-xs text-slate-500">
                Detailed category-weighted evaluation across key interview competencies
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Relevance & Directness</span>
                  <span className="font-bold text-slate-900">{relevanceAvg}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${relevanceAvg}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Technical Correctness</span>
                  <span className="font-bold text-slate-900">{correctnessAvg}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${correctnessAvg}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Conceptual Depth & Internals</span>
                  <span className="font-bold text-slate-900">{depthAvg}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${depthAvg}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Communication & Clarity</span>
                  <span className="font-bold text-slate-900">{clarityAvg}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${clarityAvg}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Identified Growth Areas */}
          {weakSkills.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Identified Topics for Growth
                </h3>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The session highlighted topics where reviewing fundamental concepts will boost your interview readiness:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {weakSkills.map((ws, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-white border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900"
                  >
                    {ws}
                  </span>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onPracticeWeakAreas(weakSkills)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
                >
                  <span>Practice Weak Areas in Next Session</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
        <button
          onClick={onReturnDashboard}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onNavigateRoadmap}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            <span>View Roadmap</span>
          </button>

          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retry Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
