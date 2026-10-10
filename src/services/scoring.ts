import {
  AnswerEvaluation,
  InterviewCategory,
  InterviewSession,
  SessionScorecard,
  ScorecardItem,
  WeeklyFeedbackReport,
} from '../types';

export interface ScoreTier {
  range: string;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const SCORE_TIERS: Record<string, ScoreTier> = {
  EXCELLENT: {
    range: '90 - 100',
    label: 'Exceptional Performance',
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-700',
    description: 'Demonstrates deep conceptual mastery, rigorous correctness, and clear structured reasoning.',
  },
  STRONG: {
    range: '75 - 89',
    label: 'Strong Performance',
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-700',
    description: 'Consistently provides accurate, well-explained responses with minor omissions on edge cases.',
  },
  GOOD: {
    range: '60 - 74',
    label: 'Good Progress',
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    description: 'Understands core principles well, but could expand on trade-offs, architecture, or edge cases.',
  },
  DEVELOPING: {
    range: '40 - 59',
    label: 'Developing',
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-700',
    description: 'Basic awareness present, but contains conceptual gaps, partial inaccuracy, or lack of depth.',
  },
  NEEDS_WORK: {
    range: '0 - 39',
    label: 'Needs Foundational Practice',
    color: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-700',
    description: 'Significant gaps in fundamental concepts or incomplete responses. Focus on foundational study.',
  },
};

export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return SCORE_TIERS.EXCELLENT;
  if (score >= 75) return SCORE_TIERS.STRONG;
  if (score >= 60) return SCORE_TIERS.GOOD;
  if (score >= 40) return SCORE_TIERS.DEVELOPING;
  return SCORE_TIERS.NEEDS_WORK;
}

// Category-specific rubric weights
export function getCategoryWeights(category: InterviewCategory) {
  switch (category) {
    case 'Coding':
    case 'DSA':
      return {
        correctness: 0.40,
        depth: 0.25, // algorithmic complexity & approach
        relevance: 0.10,
        clarity: 0.10,
        reasoning: 0.15, // code quality & edge case handling
      };
    case 'HR / Behavioral':
      return {
        correctness: 0.15, // relevance to situation
        depth: 0.35, // STAR methodology depth (Situation, Task, Action, Result)
        relevance: 0.25,
        clarity: 0.25,
        reasoning: 0.00, // merged with depth
      };
    case 'SQL / DBMS':
      return {
        correctness: 0.40, // query accuracy & constraints
        depth: 0.20, // joins, indexing, normalization
        relevance: 0.20,
        clarity: 0.10,
        reasoning: 0.10, // performance & edge cases
      };
    default:
      // Standard Technical (Frontend, Backend, Full Stack, AI/ML, etc.)
      return {
        correctness: 0.35,
        relevance: 0.20,
        depth: 0.20,
        clarity: 0.10,
        reasoning: 0.15,
      };
  }
}

/**
 * Normalizes weights and computes transparent rubric score for an answer evaluation.
 */
export function calculateTransparentAnswerScore(
  evalData: Partial<AnswerEvaluation>,
  category: InterviewCategory
): number {
  const weights = getCategoryWeights(category);
  let totalWeight = 0;
  let weightedSum = 0;

  if (typeof evalData.correctnessScore === 'number') {
    weightedSum += evalData.correctnessScore * weights.correctness;
    totalWeight += weights.correctness;
  }
  if (typeof evalData.relevanceScore === 'number') {
    weightedSum += evalData.relevanceScore * weights.relevance;
    totalWeight += weights.relevance;
  }
  if (typeof evalData.depthScore === 'number') {
    weightedSum += evalData.depthScore * weights.depth;
    totalWeight += weights.depth;
  }
  if (typeof evalData.clarityScore === 'number') {
    weightedSum += evalData.clarityScore * weights.clarity;
    totalWeight += weights.clarity;
  }
  if (typeof evalData.reasoningScore === 'number' && weights.reasoning > 0) {
    weightedSum += evalData.reasoningScore * weights.reasoning;
    totalWeight += weights.reasoning;
  }

  if (totalWeight <= 0) {
    return evalData.overallScore || 0;
  }

  const normalized = Math.round(weightedSum / totalWeight);
  return Math.min(100, Math.max(0, normalized));
}

/**
 * Calculates overall session score strictly from valid evaluated answers.
 * Does NOT invent scores for skipped or unanswered questions.
 */
export function calculateSessionScore(session: InterviewSession): {
  overallScore: number;
  evaluatedCount: number;
  attemptedCount: number;
} {
  const evaluatedAnswers = Object.values(session.answers).filter(
    (ans) => ans.status === 'completed' && ans.evaluation && typeof ans.evaluation.overallScore === 'number'
  );

  const attemptedCount = Object.values(session.answers).filter(
    (ans) => ans.status === 'completed' || ans.status === 'submitted'
  ).length;

  if (evaluatedAnswers.length === 0) {
    return { overallScore: 0, evaluatedCount: 0, attemptedCount };
  }

  const sum = evaluatedAnswers.reduce(
    (acc, curr) => acc + (curr.evaluation?.overallScore ?? 0),
    0
  );

  const overallScore = Math.round(sum / evaluatedAnswers.length);
  return {
    overallScore,
    evaluatedCount: evaluatedAnswers.length,
    attemptedCount,
  };
}

/**
 * Calculates holistic Interview Readiness across multiple saved sessions.
 * Requires at least 2 completed sessions for a genuine statistical estimate.
 */
export function calculateReadinessEstimate(sessions: InterviewSession[]) {
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' && typeof s.overallScore === 'number' && s.completedQuestionCount > 0
  );

  if (completedSessions.length < 2) {
    return null; // Not enough data yet
  }

  // Weight recent sessions higher (exponential moving weights)
  let weightedScoreSum = 0;
  let weightSum = 0;
  const sorted = [...completedSessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  sorted.slice(0, 10).forEach((session, index) => {
    const weight = 1 / (1 + index * 0.25);
    weightedScoreSum += (session.overallScore || 0) * weight;
    weightSum += weight;
  });

  const avgRecentScore = Math.round(weightedScoreSum / weightSum);

  // Consistency metric (variance across last 5 sessions)
  const last5 = sorted.slice(0, 5).map((s) => s.overallScore || 0);
  const mean = last5.reduce((a, b) => a + b, 0) / last5.length;
  const variance = last5.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / last5.length;
  const isConsistent = Math.sqrt(variance) < 14;

  // Categories covered
  const categories = new Set(sorted.map((s) => s.config.category));
  const categoryBonus = Math.min(6, categories.size * 2);

  // Combined readiness score (0-100)
  const baseEstimate = Math.min(100, Math.round(avgRecentScore * 0.92 + (isConsistent ? 5 : 0) + categoryBonus));

  let level = 'Developing';
  let description = 'Making solid progress. Practice across more interview categories to build consistency.';

  if (baseEstimate >= 85) {
    level = 'High Readiness';
    description = 'High practice consistency and strong technical depth. You are well-prepared for real-world interviews.';
  } else if (baseEstimate >= 70) {
    level = 'Moderate Readiness';
    description = 'Solid technical foundation. Focus on edge-case reasoning, trade-offs, and behavioral STAR structure.';
  } else if (baseEstimate >= 50) {
    level = 'Developing Readiness';
    description = 'Developing interview skills. Focus on core syntax, architectural concepts, and concise explanations.';
  } else {
    level = 'Early Stage';
    description = 'Build conceptual foundations through structured practice and review model answers.';
  }

  const factors = [
    `Weighted average of last ${Math.min(10, sorted.length)} sessions: ${avgRecentScore}%`,
    `Session consistency: ${isConsistent ? 'Consistent (Low variance)' : 'Variable (Keep practicing)'}`,
    `Interview domains practiced: ${categories.size} categories`,
    `Total verified questions answered: ${sorted.reduce((acc, s) => acc + s.completedQuestionCount, 0)}`,
  ];

  return {
    score: baseEstimate,
    level,
    description,
    factors,
  };
}

/**
 * Builds the official Scorecard for an interview session.
 * 5 questions = 20 points per correct question (Max 100 points).
 * If the answer is correct: +20 points.
 * If wrong/incomplete/incorrect: 0 points (no score).
 */
export function generateSessionScorecard(session: InterviewSession): SessionScorecard {
  const totalQuestions = session.config.questionLimit || session.questions.length || 5;
  const pointsPerQuestion = Math.round(100 / totalQuestions); // exactly 20 for 5 questions

  let totalPointsEarned = 0;
  let correctCount = 0;
  const items: ScorecardItem[] = [];

  session.questions.forEach((q, idx) => {
    const ans = session.answers[q.id];
    const evalData = ans?.evaluation;

    // An answer is correct if marked isCorrect === true, or if overallScore >= 55 and correctness >= 50
    const isCorrect =
      ans?.status === 'completed' &&
      evalData !== undefined &&
      (evalData.isCorrect === true ||
        (typeof evalData.overallScore === 'number' &&
          evalData.overallScore >= 55 &&
          (evalData.correctnessScore ?? 50) >= 50));

    const pointsEarned = isCorrect ? pointsPerQuestion : 0;
    if (isCorrect) {
      correctCount += 1;
      totalPointsEarned += pointsEarned;
    }

    items.push({
      questionNumber: idx + 1,
      questionId: q.id,
      questionText: q.text,
      category: q.category,
      skill: q.skill || q.category,
      isCorrect,
      pointsEarned,
      maxPoints: pointsPerQuestion,
      candidateAnswer: ans?.answerText || '[No response provided]',
      strengths: evalData?.strengths || [],
      corrections: evalData?.corrections || [],
      improvementSuggestions: evalData?.improvementSuggestions || [],
      modelAnswer: evalData?.exampleAnswer || q.sampleAnswer,
    });
  });

  const maxPossiblePoints = totalQuestions * pointsPerQuestion;
  const percentage = Math.round((totalPointsEarned / (maxPossiblePoints || 100)) * 100);

  let grade = 'Needs Practice';
  if (percentage >= 90) grade = 'Grade A+ (Outstanding)';
  else if (percentage >= 80) grade = 'Grade A (Ready for Real Interviews)';
  else if (percentage >= 60) grade = 'Grade B (Proficient - Minor Gaps)';
  else if (percentage >= 40) grade = 'Grade C (Developing Foundations)';

  return {
    totalPointsEarned,
    maxPossiblePoints,
    percentage,
    correctCount,
    totalQuestions,
    grade,
    items,
  };
}

/**
 * Generates Weekly Feedback & Performance Report from past sessions.
 */
export function generateWeeklyFeedback(sessions: InterviewSession[]): WeeklyFeedbackReport {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter sessions in the last 7 days (or fallback to all sessions if fewer than 3)
  let weeklySessions = sessions.filter(
    (s) => s.status === 'completed' && new Date(s.createdAt) >= oneWeekAgo
  );
  if (weeklySessions.length === 0) {
    weeklySessions = sessions.filter((s) => s.status === 'completed').slice(0, 5);
  }

  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalPointsEarned = 0;
  let maxPointsPossible = 0;

  const strengthsSet = new Set<string>();
  const topicsToReviseSet = new Set<string>();

  // Day by day tracking (last 7 days)
  const daysMap: Record<string, { count: number; correct: number }> = {};
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
    daysMap[dayLabel] = { count: 0, correct: 0 };
  }

  weeklySessions.forEach((s) => {
    const card = s.scorecard || generateSessionScorecard(s);
    totalQuestionsAttempted += card.totalQuestions;
    totalCorrect += card.correctCount;
    totalPointsEarned += card.totalPointsEarned;
    maxPointsPossible += card.maxPossiblePoints;

    const sessionDate = new Date(s.createdAt);
    const dayLabel = `${dayNames[sessionDate.getDay()]} ${sessionDate.getDate()}`;
    if (daysMap[dayLabel]) {
      daysMap[dayLabel].count += card.totalQuestions;
      daysMap[dayLabel].correct += card.correctCount;
    }

    card.items.forEach((item) => {
      if (item.isCorrect) {
        strengthsSet.add(item.skill);
      } else {
        topicsToReviseSet.add(item.skill);
      }
    });
  });

  const accuracyPercentage =
    totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : 0;

  let weeklyGrade = 'Needs Practice';
  if (accuracyPercentage >= 85) weeklyGrade = 'Grade A (Strong Interview Readiness)';
  else if (accuracyPercentage >= 70) weeklyGrade = 'Grade B (Solid Weekly Progress)';
  else if (accuracyPercentage >= 50) weeklyGrade = 'Grade C (Foundations Developing)';
  else if (totalQuestionsAttempted > 0) weeklyGrade = 'Grade D (Revision Needed)';
  else weeklyGrade = 'No Sessions This Week';

  const keyStrengths =
    strengthsSet.size > 0
      ? Array.from(strengthsSet).slice(0, 4)
      : ['Consistently attempting timed mock interviews', 'Strong technical curiosity'];

  const topicsToRevise =
    topicsToReviseSet.size > 0
      ? Array.from(topicsToReviseSet).slice(0, 4)
      : ['Review edge cases and trade-offs', 'STAR behavioral structuring'];

  const nextWeekActionPlan = [
    `Day 1 & 2: Dedicate 30 mins to deep dive into ${topicsToRevise[0] || 'core technical concepts'}.`,
    `Day 3: Practice 1 timed mock interview targeting weak areas (aim for 5/5 correct).`,
    `Day 4: Review model answers for any question where you scored 0 points.`,
    `Day 5: Complete a comprehensive full-length mock round to lock in your score.`,
  ];

  const dayByDayBreakdown = Object.entries(daysMap).map(([day, val]) => ({
    day,
    questionsCount: val.count,
    accuracy: val.count > 0 ? Math.round((val.correct / val.count) * 100) : 0,
  }));

  const weekLabel = `Week of ${new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return {
    weekLabel,
    sessionsCompleted: weeklySessions.length,
    totalQuestionsAttempted,
    totalPointsEarned,
    maxPointsPossible,
    accuracyPercentage,
    weeklyGrade,
    keyStrengths,
    topicsToRevise,
    nextWeekActionPlan,
    dayByDayBreakdown,
  };
}
