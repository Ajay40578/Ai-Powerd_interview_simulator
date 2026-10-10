import {
  AnswerEvaluation,
  CandidateProfile,
  Difficulty,
  InterviewCategory,
  InterviewConfig,
  InterviewQuestion,
  InterviewRoundType,
  ResumeAnalysisResult,
  RoadmapTask,
} from '../types';
import { evaluateDemoAnswer, getNextDemoQuestion, PYTHON_FRESHER_QUESTIONS } from './demoEngine';
import { CURATED_QUESTIONS } from '../data/curatedQuestions';
import { ROUND_STARTER_QUESTIONS } from './interviewRounds';

export interface ServerStatus {
  status: string;
  hasApiKey: boolean;
  model: string;
  mode: 'live_ai' | 'demo_mode';
}

export class ApiService {
  private static cachedStatus: ServerStatus | null = null;

  static async checkStatus(): Promise<ServerStatus> {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        this.cachedStatus = data;
        return data;
      }
    } catch (e) {
      console.warn('API status check failed, using demo mode fallback:', e);
    }
    const fallback: ServerStatus = {
      status: 'ok',
      hasApiKey: false,
      model: 'demo-rules-engine',
      mode: 'demo_mode',
    };
    this.cachedStatus = fallback;
    return fallback;
  }

  static getCachedStatus(): ServerStatus | null {
    return this.cachedStatus;
  }

  /**
   * Generates next interview question.
   * If Gemini API is available and not forced to demo, calls backend.
   * Otherwise falls back to deterministic curriculum or curated question bank.
   */
  static async generateQuestion(params: {
    category: InterviewCategory;
    targetRole: string;
    difficulty: Difficulty;
    questionNumber: number;
    totalQuestions: number;
    candidateProfile: Partial<CandidateProfile>;
    previousQuestions: string[];
    previousAnswers?: string[];
    lastAnswerFeedback?: AnswerEvaluation | null;
    forceDemo?: boolean;
    roundType?: InterviewRoundType;
    roundTitle?: string;
  }): Promise<{ question: InterviewQuestion; mode: 'ai' | 'demo' }> {
    if (!params.forceDemo) {
      try {
        const res = await fetch('/api/interview/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (res.ok) {
          const data = await res.json();
          const question: InterviewQuestion = {
            id: `ai_q_${Date.now()}_${params.questionNumber}`,
            text: data.text,
            category: data.category || params.category,
            skill: data.skill || params.targetRole,
            difficulty: data.difficulty || params.difficulty,
            type: data.type || 'conceptual',
            source: 'ai',
            expectedCompetencies: data.expectedCompetencies || ['Technical correctness', 'Clear communication'],
            hints: data.hints || [],
            sampleAnswer: data.sampleAnswer,
            codeSnippet: data.codeSnippet,
          };
          return { question, mode: 'ai' };
        }
      } catch (err) {
        console.warn('Backend question generation call failed, using demo fallback:', err);
      }
    }

    // Demo Mode: Check if specific round has starter questions
    if (params.roundType && ROUND_STARTER_QUESTIONS[params.roundType]) {
      const roundQuestions = ROUND_STARTER_QUESTIONS[params.roundType];
      const qIndex = (params.questionNumber - 1) % roundQuestions.length;
      const roundQ = roundQuestions[qIndex];
      return {
        question: { ...roundQ, id: `round_${params.roundType}_${params.questionNumber}_${Date.now()}` },
        mode: 'demo',
      };
    }

    // Demo Mode fallback for Python / Technical
    if (params.category === 'Technical' || params.targetRole.toLowerCase().includes('python')) {
      // Check adaptive branching based on candidate's previous answer score
      if (params.lastAnswerFeedback && params.previousQuestions && params.previousQuestions.length > 0) {
        const lastQIndex = params.previousQuestions.length - 1;
        const adaptiveQ = getNextDemoQuestion(lastQIndex, params.lastAnswerFeedback);
        if (adaptiveQ) {
          return {
            question: { ...adaptiveQ, id: `demo_adapt_${params.questionNumber}_${Date.now()}` },
            mode: 'demo',
          };
        }
      }

      const questionIndex = Math.min(params.questionNumber - 1, PYTHON_FRESHER_QUESTIONS.length - 1);
      const demoQ = PYTHON_FRESHER_QUESTIONS[questionIndex];
      return { question: { ...demoQ, id: `demo_${params.questionNumber}_${Date.now()}` }, mode: 'demo' };
    }

    // Match from curated question bank for category
    const matches = CURATED_QUESTIONS.filter(
      (q) => q.category.toLowerCase().includes(params.category.toLowerCase()) || params.category.toLowerCase().includes(q.category.toLowerCase())
    );
    const pool = matches.length > 0 ? matches : CURATED_QUESTIONS;
    const selected = pool[(params.questionNumber - 1) % pool.length];

    const fallbackQ: InterviewQuestion = {
      id: `curated_${params.questionNumber}_${Date.now()}`,
      text: selected.text,
      category: selected.category,
      skill: selected.skill,
      difficulty: selected.difficulty,
      type: 'conceptual',
      source: 'demo',
      expectedCompetencies: ['Clear technical explanation', 'Proper terminology', 'Demonstrated understanding'],
      hints: selected.hints,
      sampleAnswer: selected.sampleAnswer,
    };

    return { question: fallbackQ, mode: 'demo' };
  }

  /**
   * Evaluates candidate's submitted answer.
   */
  static async evaluateAnswer(params: {
    question: InterviewQuestion;
    answer: string;
    category: InterviewCategory;
    targetRole: string;
    difficulty: Difficulty;
    codeLanguage?: string;
    forceDemo?: boolean;
  }): Promise<{ evaluation: AnswerEvaluation; mode: 'ai' | 'demo' }> {
    if (!params.forceDemo) {
      try {
        const res = await fetch('/api/interview/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (res.ok) {
          const data = await res.json();
          const isCorrect =
            typeof data.isCorrect === 'boolean'
              ? data.isCorrect
              : (data.overallScore >= 55 && (data.correctnessScore ?? 50) >= 50);
          data.isCorrect = isCorrect;
          data.pointsEarned = isCorrect ? 20 : 0;
          data.maxPoints = 20;
          return { evaluation: data as AnswerEvaluation, mode: 'ai' };
        }
      } catch (err) {
        console.warn('Backend evaluation call failed, using deterministic evaluation:', err);
      }
    }

    // Deterministic Rule-Based Demo evaluation
    const evaluation = evaluateDemoAnswer(params.question, params.answer, params.category);
    return { evaluation, mode: 'demo' };
  }

  /**
   * Analyzes resume text.
   */
  static async analyzeResume(params: {
    resumeText: string;
    targetRole: string;
    jobDescription?: string;
    forceDemo?: boolean;
  }): Promise<{ result: ResumeAnalysisResult; mode: 'ai' | 'demo' }> {
    if (!params.forceDemo) {
      try {
        const res = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (res.ok) {
          const data = await res.json();
          return { result: data as ResumeAnalysisResult, mode: 'ai' };
        }
      } catch (err) {
        console.warn('Resume AI analysis failed, falling back to local extractor:', err);
      }
    }

    // Deterministic local resume parser fallback
    const text = params.resumeText.toLowerCase();
    const detectedSkills: string[] = [];
    const skillKeywords = [
      'python', 'javascript', 'typescript', 'react', 'node.js', 'sql', 'postgresql', 'mongodb',
      'docker', 'git', 'aws', 'rest api', 'fastapi', 'flask', 'django', 'html', 'css',
      'c++', 'java', 'data structures', 'algorithms', 'linux', 'machine learning'
    ];

    skillKeywords.forEach((k) => {
      if (text.includes(k)) detectedSkills.push(k.charAt(0).toUpperCase() + k.slice(1));
    });

    const isSenior = text.includes('lead') || text.includes('architect') || text.includes('senior') || text.includes('years of experience');
    const isMid = text.includes('mid') || text.includes('developed') || text.includes('collaborated');

    const result: ResumeAnalysisResult = {
      detectedSkills: detectedSkills.length > 0 ? detectedSkills : ['Python', 'SQL', 'Git', 'Problem Solving'],
      experienceLevelEstimate: isSenior ? 'Senior (5+ yrs)' : isMid ? 'Junior / Mid-Level (1-3 yrs)' : 'Fresher / Entry-Level',
      educationSummary: text.includes('bachelor') || text.includes('degree') || text.includes('b.tech')
        ? "Bachelor's Degree in Computer Science or related STEM field"
        : 'Technical Coursework & Self-Directed Software Projects',
      strengths: [
        'Clear demonstration of foundational programming skills.',
        'Mentions practical software development tools (Git, APIs, Database).',
        'Includes academic and personal hands-on projects.',
      ],
      missingOrWeakSkills: [
        'Add quantitative metrics to project impact (e.g., "Reduced response latency by 35%").',
        'Elaborate on production CI/CD pipelines and automated unit testing (pytest, Jest).',
        'Highlight cloud deployment or containerization experience (Docker, Cloud Run).',
      ],
      structureAndClarityFeedback: [
        'Organize sections using standard headings: Summary, Core Competencies, Experience, Projects, Education.',
        'Use consistent bullet point formatting starting with strong action verbs (Architected, Implemented, Optimized).',
      ],
      improvementSuggestions: [
        'Include live demo links or public GitHub repository URLs for key projects.',
        'Tailor technical skills section to match the specific keywords in your target job description.',
        'Add a brief 2-sentence professional headline at the top summarizing your target niche.',
      ],
      jobDescriptionMatchScore: params.jobDescription ? 78 : undefined,
      generatedInterviewQuestions: [
        {
          question: `Can you walk me through the architecture and design decisions of your most significant Python project mentioned on your resume?`,
          category: 'Technical',
          reason: 'Deep dive into practical engineering implementation.',
        },
        {
          question: `How do you structure database queries and optimize performance when working with SQL in your applications?`,
          category: 'SQL / DBMS',
          reason: 'Validates listed database skills.',
        },
        {
          question: `Describe a challenging bug you encountered in one of your projects and how you diagnosed the root cause.`,
          category: 'Behavioral',
          reason: 'Assesses troubleshooting and methodical problem solving.',
        },
      ],
    };

    return { result, mode: 'demo' };
  }

  /**
   * Generates or refreshes personalized learning roadmap.
   */
  static async generateRoadmap(params: {
    targetRole: string;
    weakSkills: string[];
    recentSessionScores: number[];
    candidateProfile: Partial<CandidateProfile>;
    forceDemo?: boolean;
  }): Promise<{ tasks: RoadmapTask[]; mode: 'ai' | 'demo' }> {
    if (!params.forceDemo) {
      try {
        const res = await fetch('/api/roadmap/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.tasks && Array.isArray(data.tasks)) {
            const tasks: RoadmapTask[] = data.tasks.map((t: any, i: number) => ({
              id: t.id || `roadmap_ai_${Date.now()}_${i}`,
              skill: t.skill,
              whyItMatters: t.whyItMatters,
              priority: (t.priority?.toLowerCase() as 'high' | 'medium' | 'low') || 'medium',
              task: t.task,
              estimatedEffort: t.estimatedEffort || '2 hours',
              completed: false,
              relatedQuestions: t.relatedQuestions || [],
            }));
            return { tasks, mode: 'ai' };
          }
        }
      } catch (err) {
        console.warn('Roadmap AI generation failed, using structured template generator:', err);
      }
    }

    // Structured roadmap based on weaknesses
    const weak = params.weakSkills.length > 0 ? params.weakSkills : ['Python Internals', 'SQL Joins', 'System Trade-offs'];
    const tasks: RoadmapTask[] = weak.slice(0, 5).map((skill, index) => ({
      id: `task_gen_${Date.now()}_${index}`,
      skill: skill,
      whyItMatters: `High failure rate in recent interviews for ${params.targetRole}. Interviewers expect deep technical reasoning here.`,
      priority: index === 0 ? 'high' : index === 1 ? 'high' : 'medium',
      task: `Master foundational principles of ${skill}, complete 3 targeted practice questions, and explain trade-offs out loud.`,
      estimatedEffort: index === 0 ? '2 hours' : '1.5 hours',
      completed: false,
      relatedQuestions: [`What are common pitfalls and best practices when working with ${skill}?`],
    }));

    return { tasks, mode: 'demo' };
  }
}
