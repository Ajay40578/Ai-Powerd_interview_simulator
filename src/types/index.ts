export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type InterviewRoundType =
  | 'screening_hr'
  | 'technical_core'
  | 'dsa_problem_solving'
  | 'machine_coding'
  | 'system_design'
  | 'behavioral_star'
  | 'hiring_manager';

export interface InterviewRoundInfo {
  id: InterviewRoundType;
  roundNumber: number;
  title: string;
  shortName: string;
  tagline: string;
  description: string;
  focusAreas: string[];
  recommendedDuration: number;
  recommendedQuestions: number;
  defaultCategory: InterviewCategory;
  evalCriteria: string;
  iconName: string;
  badgeColor: string;
}

export type InterviewCategory =
  | 'Technical'
  | 'HR / Behavioral'
  | 'Coding'
  | 'DSA'
  | 'SQL / DBMS'
  | 'AI / Machine Learning'
  | 'Data Science'
  | 'Frontend'
  | 'Backend'
  | 'Full Stack'
  | 'Aptitude'
  | 'Resume-Based'
  | 'Custom Role';

export type InterviewMode = 'text' | 'voice' | 'coding';

export type InterviewStyle = 'coach' | 'realistic' | 'strict';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  experienceLevel: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior';
  token?: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
  loginTime: string;
}

export interface CandidateProfile {
  id: string;
  displayName: string;
  email?: string;
  educationLevel: string;
  college?: string;
  targetRole: string;
  experienceLevel: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior';
  skills: string[];
  preferredLanguage: string;
  targetCompanies?: string;
  resumeContext?: string;
  defaultDifficulty: Difficulty;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewConfig {
  category: InterviewCategory;
  targetRole: string;
  difficulty: Difficulty;
  durationMinutes: number; // 5, 10, 15, 20, 30
  questionLimit: number; // 5, 10, 15
  mode: InterviewMode;
  interviewStyle: InterviewStyle;
  language: string;
  roundType?: InterviewRoundType;
  roundTitle?: string;
  resumeContext?: string;
  jobDescription?: string;
}

export interface CommunicationFeedback {
  clarity: string;
  conciseness: string;
  structure: string;
  starFeedback?: string;
}

export interface AnswerEvaluation {
  overallScore: number; // 0 - 100
  isCorrect?: boolean; // True if answer is substantially correct (+20 pts)
  pointsEarned?: number; // 20 if correct, 0 if wrong
  maxPoints?: number; // Usually 20 for 5 questions (100 / totalQuestions)
  relevanceScore: number;
  correctnessScore: number;
  depthScore: number;
  clarityScore: number;
  reasoningScore?: number;
  strengths: string[];
  missingConcepts: string[];
  corrections: string[];
  improvementSuggestions: string[];
  exampleAnswer?: string;
  communicationFeedback?: CommunicationFeedback;
  confidenceOrLimitations?: string;
  suggestedFollowUpSkill?: string;
}

export interface ScorecardItem {
  questionNumber: number;
  questionId: string;
  questionText: string;
  category: string;
  skill: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  candidateAnswer: string;
  strengths: string[];
  corrections: string[];
  improvementSuggestions: string[];
  modelAnswer?: string;
}

export interface SessionScorecard {
  totalPointsEarned: number;
  maxPossiblePoints: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  grade: string;
  items: ScorecardItem[];
}

export interface WeeklyFeedbackReport {
  weekLabel: string;
  sessionsCompleted: number;
  totalQuestionsAttempted: number;
  totalPointsEarned: number;
  maxPointsPossible: number;
  accuracyPercentage: number;
  weeklyGrade: string;
  keyStrengths: string[];
  topicsToRevise: string[];
  nextWeekActionPlan: string[];
  dayByDayBreakdown: Array<{
    day: string;
    questionsCount: number;
    accuracy: number;
  }>;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: string;
  skill: string;
  difficulty: Difficulty;
  type: 'conceptual' | 'coding' | 'behavioral' | 'scenario' | 'sql';
  source: 'curated' | 'ai' | 'demo';
  expectedCompetencies: string[];
  followUpTo?: string;
  hints?: string[];
  sampleAnswer?: string;
  codeSnippet?: string;
}

export interface AnswerRecord {
  questionId: string;
  answerText: string;
  submittedAt: string;
  codeLanguage?: string;
  evaluation?: AnswerEvaluation;
  status: 'submitted' | 'evaluating' | 'skipped' | 'completed';
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  completedAt?: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  status: 'setup' | 'in_progress' | 'paused' | 'evaluating' | 'completed' | 'abandoned';
  durationSeconds: number;
  timeRemainingSeconds: number;
  completedQuestionCount: number;
  overallScore?: number;
  scorecard?: SessionScorecard;
  readinessEstimate?: {
    score: number;
    level: string;
    description: string;
    factors: string[];
  };
  roundType?: InterviewRoundType;
  roundTitle?: string;
  evaluationMode: 'ai' | 'demo';
  answers: Record<string, AnswerRecord>;
}

export interface QuestionBankItem {
  id: string;
  text: string;
  category: InterviewCategory;
  skill: string;
  difficulty: Difficulty;
  experienceLevel: string;
  hints: string[];
  sampleAnswer: string;
  source: 'curated' | 'ai';
  isBookmarked?: boolean;
  isCompleted?: boolean;
}

export interface RoadmapTask {
  id: string;
  skill: string;
  whyItMatters: string;
  priority: 'high' | 'medium' | 'low';
  task: string;
  estimatedEffort: string;
  completed: boolean;
  relatedQuestions?: string[];
}

export interface ResumeAnalysisResult {
  detectedSkills: string[];
  experienceLevelEstimate: string;
  educationSummary: string;
  strengths: string[];
  missingOrWeakSkills: string[];
  structureAndClarityFeedback: string[];
  improvementSuggestions: string[];
  jobDescriptionMatchScore?: number;
  generatedInterviewQuestions: Array<{
    question: string;
    category: string;
    reason: string;
  }>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  voiceInputEnabled: boolean;
  soundEffects: boolean;
  defaultDurationMinutes: number;
  defaultQuestionCount: number;
  defaultDifficulty: Difficulty;
}
