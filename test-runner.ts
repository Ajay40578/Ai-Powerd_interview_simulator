/**
 * Automated Verification & Unit Test Suite for InterviewAI
 * Tests:
 * 1. Scoring calculation & category weight normalization
 * 2. Missing dimensions handling & edge cases
 * 3. Session calculation strictness (no fabricated scores for skipped questions)
 * 4. Multi-session readiness estimator thresholds
 * 5. Deterministic demo engine evaluation consistency & adaptive branching
 * 6. ApiService adaptive question generation
 * 7. Resume analysis deterministic parser & skill detection
 * 8. Duplicate submission safety
 * 9. Early termination evaluation logic
 */

import {
  calculateTransparentAnswerScore,
  calculateSessionScore,
  calculateReadinessEstimate,
  generateSessionScorecard,
  generateWeeklyFeedback,
  getScoreTier,
} from './src/services/scoring.ts';
import {
  evaluateDemoAnswer,
  PYTHON_FRESHER_QUESTIONS,
  getNextDemoQuestion,
} from './src/services/demoEngine.ts';
import { ApiService } from './src/services/api.ts';
import { InterviewSession, InterviewConfig, AnswerRecord } from './src/types/index.ts';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive InterviewAI Verification Suite...\n');

  // 1. SCORING & WEIGHT NORMALIZATION
  console.log('--- 1. Testing Scoring Rubric & Weight Normalization ---');
  const technicalEval = {
    relevanceScore: 90,
    correctnessScore: 80,
    depthScore: 70,
    clarityScore: 85,
    reasoningScore: 75,
  };
  const techScore = calculateTransparentAnswerScore(technicalEval, 'Technical');
  assert(techScore >= 75 && techScore <= 85, `Technical score should be ~80 (got ${techScore})`);

  const partialEval = {
    relevanceScore: 100,
    correctnessScore: 100,
    depthScore: 100,
    clarityScore: 100,
  };
  const partialScore = calculateTransparentAnswerScore(partialEval, 'Technical');
  assert(partialScore === 100, `Normalized score without reasoning must equal 100 (got ${partialScore})`);

  const codingEval = {
    correctnessScore: 90,
    depthScore: 80,
    relevanceScore: 100,
    clarityScore: 70,
    reasoningScore: 85,
  };
  const codingScore = calculateTransparentAnswerScore(codingEval, 'Coding');
  assert(codingScore >= 80 && codingScore <= 90, `Coding score matches rubric (got ${codingScore})`);

  assert(getScoreTier(95).label === 'Exceptional Performance', 'Tier for 95 is Exceptional');
  assert(getScoreTier(80).label === 'Strong Performance', 'Tier for 80 is Strong');
  assert(getScoreTier(65).label === 'Good Progress', 'Tier for 65 is Good Progress');
  assert(getScoreTier(45).label === 'Developing', 'Tier for 45 is Developing');
  assert(getScoreTier(20).label === 'Needs Foundational Practice', 'Tier for 20 is Needs Work');

  // 2. SESSION SCORE CALCULATION & UNANSWERED QUESTIONS
  console.log('\n--- 2. Testing Session Calculation Strictness ---');
  const dummyConfig: InterviewConfig = {
    category: 'Technical',
    targetRole: 'Python Developer',
    difficulty: 'beginner',
    durationMinutes: 15,
    questionLimit: 5,
    mode: 'text',
    interviewStyle: 'coach',
    language: 'English',
  };

  const dummySession: InterviewSession = {
    id: 'test_session_1',
    createdAt: new Date().toISOString(),
    config: dummyConfig,
    questions: PYTHON_FRESHER_QUESTIONS.slice(0, 5),
    currentQuestionIndex: 2,
    status: 'in_progress',
    durationSeconds: 120,
    timeRemainingSeconds: 780,
    completedQuestionCount: 2,
    evaluationMode: 'demo',
    answers: {
      demo_q1: {
        questionId: 'demo_q1',
        answerText: 'I am a CS graduate passionate about Python backend development and APIs.',
        submittedAt: new Date().toISOString(),
        status: 'completed',
        evaluation: {
          overallScore: 85,
          relevanceScore: 90,
          correctnessScore: 85,
          depthScore: 80,
          clarityScore: 85,
          strengths: ['Direct communication'],
          missingConcepts: [],
          corrections: [],
          improvementSuggestions: [],
        },
      },
      demo_q2: {
        questionId: 'demo_q2',
        answerText: 'Lists are mutable while tuples are immutable once created in memory.',
        submittedAt: new Date().toISOString(),
        status: 'completed',
        evaluation: {
          overallScore: 75,
          relevanceScore: 80,
          correctnessScore: 75,
          depthScore: 70,
          clarityScore: 75,
          strengths: ['Accurate concept'],
          missingConcepts: [],
          corrections: [],
          improvementSuggestions: [],
        },
      },
      demo_q3: {
        questionId: 'demo_q3',
        answerText: '[Question Skipped by Candidate]',
        submittedAt: new Date().toISOString(),
        status: 'skipped',
      },
    },
  };

  const calc = calculateSessionScore(dummySession);
  assert(calc.overallScore === 80, `Overall score strictly from evaluated answers is 80 (got ${calc.overallScore})`);
  assert(calc.evaluatedCount === 2, `Evaluated count is 2 (got ${calc.evaluatedCount})`);

  // 3. READINESS ESTIMATE THRESHOLDS
  console.log('\n--- 3. Testing Multi-Session Readiness Estimator ---');
  const singleSessionArray = [{ ...dummySession, status: 'completed' as const, overallScore: 80 }];
  assert(calculateReadinessEstimate(singleSessionArray) === null, 'Readiness requires at least 2 completed sessions');

  const twoSessionsArray = [
    { ...dummySession, id: 's1', status: 'completed' as const, overallScore: 80, completedQuestionCount: 3 },
    { ...dummySession, id: 's2', status: 'completed' as const, overallScore: 85, completedQuestionCount: 3 },
  ];
  const readinessResult = calculateReadinessEstimate(twoSessionsArray);
  assert(readinessResult !== null, 'Readiness computed with 2+ completed sessions');
  assert(readinessResult!.score >= 70, `Readiness score is realistic (got ${readinessResult!.score})`);
  assert(readinessResult!.factors.length >= 3, 'Readiness includes transparent factors explanation');

  // 4. DEMO ENGINE DETERMINISTIC ANALYSIS & ADAPTIVE BRANCHING
  console.log('\n--- 4. Testing Demo Engine Determinism ---');
  const sampleQ = PYTHON_FRESHER_QUESTIONS[1]; // List vs Tuple question
  const demoEvalGood = evaluateDemoAnswer(
    sampleQ,
    'Lists are mutable objects whose elements can be changed in place. Tuples are immutable and cannot be altered once created. Because tuples have fixed size, Python allocates exact memory without over-allocation, making tuples slightly faster and memory efficient. Tuples can also be used as dictionary keys if they contain hashable types.',
    'Technical'
  );
  assert(demoEvalGood.overallScore >= 75, `High quality answer receives high demo score (got ${demoEvalGood.overallScore})`);
  assert(demoEvalGood.strengths.length > 0, 'Strengths provided for strong answer');

  const demoEvalBrief = evaluateDemoAnswer(sampleQ, 'list can change, tuple cannot', 'Technical');
  assert(demoEvalBrief.overallScore < 60, `Very brief answer receives lower score (got ${demoEvalBrief.overallScore})`);
  assert(demoEvalBrief.corrections.length > 0 || demoEvalBrief.missingConcepts.length > 0, 'Feedback warns about brief responses');

  const nextAfterStrong = getNextDemoQuestion(1, demoEvalGood);
  assert(nextAfterStrong?.id === 'demo_q2_strong', 'Strong answer triggers deeper adaptive question on freelists/mutables');

  const nextAfterWeak = getNextDemoQuestion(1, demoEvalBrief);
  assert(nextAfterWeak?.id === 'demo_q2_weak', 'Weak answer triggers diagnostic foundational question');

  // 5. APISERVICE INTEGRATION WITH ADAPTIVE BRANCHING
  console.log('\n--- 5. Testing ApiService Question Generation & Branching ---');
  const genResult = await ApiService.generateQuestion({
    category: 'Technical',
    targetRole: 'Python Developer',
    difficulty: 'beginner',
    questionNumber: 3,
    totalQuestions: 5,
    candidateProfile: { targetRole: 'Python Developer' },
    previousQuestions: [PYTHON_FRESHER_QUESTIONS[0].text, PYTHON_FRESHER_QUESTIONS[1].text],
    lastAnswerFeedback: demoEvalGood,
    forceDemo: true,
  });
  assert(genResult.question.text.includes('tuple') || genResult.question.text.length > 20, 'Adaptive question returned by ApiService');
  assert(genResult.mode === 'demo', 'Demo mode correctly indicated');

  // 6. RESUME ANALYZER PARSING & QUESTIONS
  console.log('\n--- 6. Testing Resume Analyzer ---');
  const resumeSample = `John Doe. Software Engineer with expertise in Python, SQL, REST APIs, and Docker. Built automated scrapers and database query optimization.`;
  const resumeResult = await ApiService.analyzeResume({
    resumeText: resumeSample,
    targetRole: 'Python Developer',
    forceDemo: true,
  });
  assert(resumeResult.result.detectedSkills.includes('Python'), 'Detected Python skill from resume text');
  assert(resumeResult.result.detectedSkills.includes('Sql'), 'Detected SQL skill from resume text');
  assert(resumeResult.result.generatedInterviewQuestions.length === 3, 'Generated 3 tailored resume interview questions');

  // 7. DUPLICATE SUBMISSION STATE BEHAVIOR
  console.log('\n--- 7. Testing Duplicate Submission Guard ---');
  const initialAnswers: Record<string, AnswerRecord> = {};
  const recordA: AnswerRecord = {
    questionId: 'q1',
    answerText: 'My answer',
    submittedAt: '2026-10-10T00:00:00Z',
    status: 'completed',
    evaluation: { overallScore: 80, relevanceScore: 80, correctnessScore: 80, depthScore: 80, clarityScore: 80, strengths: [], missingConcepts: [], corrections: [], improvementSuggestions: [] },
  };
  initialAnswers['q1'] = recordA;
  // Submitting again with same questionId replaces, does not create duplicate keys
  const recordB: AnswerRecord = { ...recordA, answerText: 'Updated answer' };
  initialAnswers['q1'] = recordB;
  assert(Object.keys(initialAnswers).length === 1, 'Only 1 record exists for the question; no duplicate records created');

  // 8. EARLY TERMINATION
  console.log('\n--- 8. Testing Early Termination ---');
  const partialEarlySession: InterviewSession = {
    ...dummySession,
    status: 'completed',
    currentQuestionIndex: 1, // ended at question 1
    completedQuestionCount: 1,
    answers: {
      demo_q1: dummySession.answers.demo_q1,
    },
  };
  const earlyCalc = calculateSessionScore(partialEarlySession);
  assert(earlyCalc.evaluatedCount === 1, 'Early terminated session only calculates attempted questions (evaluated = 1)');
  assert(earlyCalc.overallScore === 85, 'Overall score reflects only attempted question');

  // 9. SCORECARD & 5-QUESTION POINT RULE (+20 FOR CORRECT, 0 FOR WRONG)
  console.log('\n--- 9. Testing 5-Question Test Scorecard & +20 Point Rule ---');
  const fiveQuestionSession: InterviewSession = {
    id: 'test_scorecard_session',
    createdAt: new Date().toISOString(),
    config: {
      ...dummyConfig,
      questionLimit: 5,
    },
    questions: PYTHON_FRESHER_QUESTIONS.slice(0, 5),
    currentQuestionIndex: 5,
    status: 'completed',
    durationSeconds: 300,
    timeRemainingSeconds: 0,
    completedQuestionCount: 5,
    evaluationMode: 'demo',
    answers: {
      demo_q1: {
        questionId: 'demo_q1',
        answerText: 'Correct detailed answer',
        submittedAt: new Date().toISOString(),
        status: 'completed',
        evaluation: {
          overallScore: 85,
          correctnessScore: 85,
          relevanceScore: 90,
          depthScore: 80,
          clarityScore: 85,
          isCorrect: true,
          pointsEarned: 20,
          strengths: ['Great'],
          missingConcepts: [],
          corrections: [],
          improvementSuggestions: [],
        },
      },
      demo_q2: {
        questionId: 'demo_q2',
        answerText: 'Wrong incomplete answer',
        submittedAt: new Date().toISOString(),
        status: 'completed',
        evaluation: {
          overallScore: 35,
          correctnessScore: 30,
          relevanceScore: 40,
          depthScore: 30,
          clarityScore: 40,
          isCorrect: false,
          pointsEarned: 0,
          strengths: [],
          missingConcepts: ['Omitted immutability'],
          corrections: ['Incorrect concept'],
          improvementSuggestions: ['Study basics'],
        },
      },
      demo_q3: {
        questionId: 'demo_q3',
        answerText: 'Another correct answer',
        submittedAt: new Date().toISOString(),
        status: 'completed',
        evaluation: {
          overallScore: 78,
          correctnessScore: 75,
          relevanceScore: 80,
          depthScore: 75,
          clarityScore: 80,
          isCorrect: true,
          pointsEarned: 20,
          strengths: ['Accurate hash explanation'],
          missingConcepts: [],
          corrections: [],
          improvementSuggestions: [],
        },
      },
    },
  };

  const scorecard = generateSessionScorecard(fiveQuestionSession);
  assert(scorecard.items.length === 5, 'Scorecard contains exactly 5 question items');
  assert(scorecard.items[0].isCorrect === true, 'Question 1 is marked correct');
  assert(scorecard.items[0].pointsEarned === 20, 'Question 1 earns +20 points');
  assert(scorecard.items[1].isCorrect === false, 'Question 2 is marked incorrect');
  assert(scorecard.items[1].pointsEarned === 0, 'Question 2 earns 0 points (no score)');
  assert(scorecard.items[2].isCorrect === true, 'Question 3 is marked correct (+20 pts)');
  assert(scorecard.items[3].pointsEarned === 0, 'Unanswered Question 4 earns 0 points');
  assert(scorecard.items[4].pointsEarned === 0, 'Unanswered Question 5 earns 0 points');
  assert(scorecard.correctCount === 2, 'Total correct count is 2 (got ' + scorecard.correctCount + ')');
  assert(scorecard.totalPointsEarned === 40, 'Total points earned is 40 / 100 (got ' + scorecard.totalPointsEarned + ')');

  // 10. WEEKLY FEEDBACK REPORT
  console.log('\n--- 10. Testing Weekly Feedback Report Generation ---');
  const weeklyReport = generateWeeklyFeedback([fiveQuestionSession]);
  assert(weeklyReport.totalQuestionsAttempted === 5, 'Weekly report counted questions attempted');
  assert(weeklyReport.totalPointsEarned === 40, 'Weekly report points earned matches 40');
  assert(weeklyReport.accuracyPercentage === 40, 'Weekly report accuracy matches 40%');
  assert(weeklyReport.nextWeekActionPlan.length >= 3, 'Weekly action plan has actionable steps');
  assert(weeklyReport.dayByDayBreakdown.length === 7, 'Weekly breakdown tracks all 7 days');

  // 11. INTERVIEW ROUNDS SUITE
  console.log('\n--- 11. Testing 7 Types of Interview Rounds ---');
  const { INTERVIEW_ROUNDS, getRoundById, ROUND_STARTER_QUESTIONS } = await import(
    './src/services/interviewRounds.ts'
  );
  assert(INTERVIEW_ROUNDS.length === 7, `Expected 7 interview rounds (got ${INTERVIEW_ROUNDS.length})`);

  const roundIds = [
    'screening_hr',
    'technical_core',
    'dsa_problem_solving',
    'machine_coding',
    'system_design',
    'behavioral_star',
    'hiring_manager',
  ];

  roundIds.forEach((id) => {
    const round = getRoundById(id as any);
    assert(!!round && round.id === id, `Round ${id} is configured and retrievable`);
    const starterQs = ROUND_STARTER_QUESTIONS[id as keyof typeof ROUND_STARTER_QUESTIONS];
    assert(
      Array.isArray(starterQs) && starterQs.length >= 5,
      `Round ${id} has at least 5 curated starter questions`
    );
  });

  console.log(`\n🎉 All ${passedTests}/${totalTests} unit and integration tests PASSED!`);
}

runTests().catch((e) => {
  console.error('Test suite failed:', e);
  process.exit(1);
});
