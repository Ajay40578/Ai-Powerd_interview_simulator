import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to instantiate Gemini client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to parse JSON from AI model response safely
function extractJson(text: string | undefined): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (_) {}
    }
    console.error('Failed to parse AI JSON:', cleaned);
    throw new Error('AI service returned an invalid response structure.');
  }
}

// Health & Capability Status
app.get('/api/status', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidKey = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    hasApiKey: hasValidKey,
    model: 'gemini-3.8-flash',
    mode: hasValidKey ? 'live_ai' : 'demo_mode',
  });
});

// Generate Adaptive Question
app.post('/api/interview/generate-question', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Falling back to deterministic demo engine.',
        code: 'NO_API_KEY',
      });
    }

    const {
      category = 'Technical',
      targetRole = 'Software Engineer',
      difficulty = 'intermediate',
      questionNumber = 1,
      totalQuestions = 5,
      candidateProfile = {},
      previousQuestions = [],
      previousAnswers = [],
      followUpMode = false,
      lastAnswerFeedback = null,
      roundType = null,
      roundTitle = null,
    } = req.body;

    const prompt = `
You are an expert technical interviewer conducting a mock interview for the role of "${targetRole}".
Interview Category: "${category}"
${roundTitle ? `Active Interview Round: "${roundTitle}" (${roundType})` : ''}
Difficulty Level: "${difficulty}"
Question ${questionNumber} of ${totalQuestions}.
Follow-up mode: ${followUpMode ? 'YES - craft a direct follow-up or deeper probe based on the previous answer' : 'NO - introduce next logical topic'}

Candidate Skills: ${candidateProfile.skills ? JSON.stringify(candidateProfile.skills) : 'General software engineering'}
Candidate Experience: ${candidateProfile.experienceLevel || 'Fresher/Junior'}

Previously Asked Questions:
${previousQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || 'None (First question)'}

${lastAnswerFeedback ? `Last Answer Feedback: ${JSON.stringify(lastAnswerFeedback)}` : ''}

CRITICAL RULES:
1. Generate EXACTLY ONE clear, realistic, and interview-grade question tailored to the active interview round:
   - If HR/Screening: Ask about career narrative, motivation, teamwork, or situational fit.
   - If Technical Core: Test language internals, memory allocation, runtime, and core CS fundamentals.
   - If DSA: Algorithmic problem requiring data structure selection and Big-O complexity analysis.
   - If Machine Coding: Modular implementation, design patterns, defensive coding, and maintainability.
   - If System Design: Scalability, caching (Redis), database choice, and distributed trade-offs.
   - If Behavioral: Use STAR method (Situation, Task, Action, Result) on conflict, ownership, or failure.
   - If Hiring Manager: Dissect past project architecture, engineering maturity, and trade-offs.
2. For Question 1, ask a realistic opening question suitable for ${difficulty} ${targetRole}.
3. If previous questions exist, do NOT repeat any previously asked concepts.
4. Adapt difficulty: If the last feedback was strong, ask about trade-offs, edge cases, or architecture. If weak, ask a diagnostic foundational question.
5. Provide 2-3 helpful hints, 3-4 expected competencies, and a comprehensive model sample answer.
6. Return structured JSON matching the requested schema.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: 'The question text' },
            category: { type: Type.STRING },
            skill: { type: Type.STRING, description: 'Primary skill evaluated' },
            difficulty: { type: Type.STRING },
            type: { type: Type.STRING, description: 'conceptual, coding, behavioral, scenario, or sql' },
            expectedCompetencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sampleAnswer: { type: Type.STRING, description: 'Exemplary high-scoring answer' },
            codeSnippet: { type: Type.STRING, description: 'Optional code snippet or starter template if coding mode' },
          },
          required: ['text', 'category', 'skill', 'difficulty', 'expectedCompetencies', 'sampleAnswer'],
        },
      },
    });

    const parsed = extractJson(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating question:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate question',
      code: 'GEMINI_GENERATE_ERROR',
    });
  }
});

// Evaluate Answer
app.post('/api/interview/evaluate-answer', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Falling back to deterministic demo engine.',
        code: 'NO_API_KEY',
      });
    }

    const {
      question,
      answer,
      category = 'Technical',
      targetRole = 'Software Engineer',
      difficulty = 'intermediate',
      codeLanguage,
    } = req.body;

    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({ error: 'Answer cannot be empty' });
    }

    const prompt = `
You are a senior hiring manager and tech lead evaluating a candidate's response in an interview.
Role: "${targetRole}"
Category: "${category}"
Difficulty: "${difficulty}"
${codeLanguage ? `Programming Language: ${codeLanguage}` : ''}

QUESTION:
"""
${question?.text || question}
"""

CANDIDATE'S SUBMITTED ANSWER:
"""
${answer}
"""

EVALUATION RUBRIC:
1. relevanceScore (0-100): Did the candidate directly answer what was asked without wandering?
2. correctnessScore (0-100): Are the technical assertions, syntax, facts, or methodology correct?
3. depthScore (0-100): Does the answer show deep conceptual mastery, internals, and edge cases, or just shallow buzzwords?
4. clarityScore (0-100): Is the phrasing well-structured, easy to follow, and concise?
5. reasoningScore (0-100): Did they explain the 'why' (trade-offs, complexity, alternatives, or STAR situation-action-result)?
6. overallScore (0-100): Category-weighted realistic assessment (0-39: Needs foundational work, 40-59: Developing, 60-74: Good progress, 75-89: Strong, 90-100: Exceptional).
7. strengths: 2-3 specific things the candidate did well.
8. missingConcepts: Concrete concepts or edge cases that were omitted.
9. corrections: Any specific factual inaccuracies corrected politely.
10. improvementSuggestions: Actionable, high-impact tips for their next answer.
11. exampleAnswer: A concise, ideal model answer for this exact question.
12. communicationFeedback: Communication analysis (clarity, conciseness, structure, and STAR feedback if behavioral).
13. isCorrect: Boolean. MUST be true if the candidate's answer is substantially correct, answers the core question, and demonstrates understanding. MUST be false if the answer is factually incorrect, wrong, incomplete, or fails to address the question.

Be fair, constructive, and realistic. Return structured JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: {
              type: Type.BOOLEAN,
              description: 'True if answer looks correct and meets interview criteria (+20 score), false if wrong/incorrect/incomplete (0 score)',
            },
            overallScore: { type: Type.NUMBER },
            relevanceScore: { type: Type.NUMBER },
            correctnessScore: { type: Type.NUMBER },
            depthScore: { type: Type.NUMBER },
            clarityScore: { type: Type.NUMBER },
            reasoningScore: { type: Type.NUMBER },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            corrections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            exampleAnswer: { type: Type.STRING },
            communicationFeedback: {
              type: Type.OBJECT,
              properties: {
                clarity: { type: Type.STRING },
                conciseness: { type: Type.STRING },
                structure: { type: Type.STRING },
                starFeedback: { type: Type.STRING },
              },
              required: ['clarity', 'conciseness', 'structure'],
            },
            suggestedFollowUpSkill: { type: Type.STRING },
          },
          required: [
            'isCorrect',
            'overallScore',
            'relevanceScore',
            'correctnessScore',
            'depthScore',
            'clarityScore',
            'strengths',
            'missingConcepts',
            'improvementSuggestions',
            'exampleAnswer',
          ],
        },
      },
    });

    const parsed = extractJson(response.text);
    // Enforce 5-question test point rule:
    // If answer looks correct -> +20 score. If wrong -> 0 score (no score).
    const isCorrect =
      typeof parsed.isCorrect === 'boolean'
        ? parsed.isCorrect
        : (parsed.overallScore >= 55 && (parsed.correctnessScore ?? 50) >= 50);
    parsed.isCorrect = isCorrect;
    parsed.pointsEarned = isCorrect ? 20 : 0;
    parsed.maxPoints = 20;
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({
      error: error.message || 'Failed to evaluate answer',
      code: 'GEMINI_EVALUATE_ERROR',
    });
  }
});

// Resume Analyzer
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Falling back to deterministic demo engine.',
        code: 'NO_API_KEY',
      });
    }

    const {
      resumeText,
      targetRole = 'Software Engineer',
      jobDescription = '',
    } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text to analyze.' });
    }

    const prompt = `
You are an expert technical recruiter and resume reviewer specializing in "${targetRole}".
Analyze the candidate's resume text below.

${jobDescription ? `TARGET JOB DESCRIPTION TO MATCH AGAINST:\n"""${jobDescription}"""\n` : ''}

RESUME TEXT:
"""
${resumeText}
"""

TASKS:
1. Detect core technical & domain skills accurately.
2. Estimate candidate experience level (Fresher/Junior, Mid-Level, Senior, Lead).
3. Summarize education & credentials.
4. Identify resume key strengths.
5. Identify underrepresented or missing skills critical for "${targetRole}".
6. Provide resume structure, formatting, and clarity critique.
7. Provide 4 concrete, actionable improvement suggestions.
8. If a job description was provided, compute jobDescriptionMatchScore (0-100) based on requirements coverage (otherwise return null or 75).
9. Generate 5 targeted interview questions tailored directly to projects, technologies, and gaps in this resume.

Return structured JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceLevelEstimate: { type: Type.STRING },
            educationSummary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingOrWeakSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            structureAndClarityFeedback: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            jobDescriptionMatchScore: { type: Type.NUMBER },
            generatedInterviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  category: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['question', 'category', 'reason'],
              },
            },
          },
          required: [
            'detectedSkills',
            'experienceLevelEstimate',
            'strengths',
            'missingOrWeakSkills',
            'improvementSuggestions',
            'generatedInterviewQuestions',
          ],
        },
      },
    });

    const parsed = extractJson(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze resume',
      code: 'GEMINI_RESUME_ERROR',
    });
  }
});

// Learning Roadmap Generator
app.post('/api/roadmap/generate', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Falling back to deterministic demo engine.',
        code: 'NO_API_KEY',
      });
    }

    const {
      targetRole = 'Software Engineer',
      weakSkills = [],
      recentSessionScores = [],
      candidateProfile = {},
    } = req.body;

    const prompt = `
Create an actionable, highly targeted 5-step learning roadmap for a candidate targeting "${targetRole}".
Weak Areas Identified in Mock Interviews: ${JSON.stringify(weakSkills)}
Recent Performance: ${JSON.stringify(recentSessionScores)}
Candidate Level: ${candidateProfile.experienceLevel || 'Junior/Fresher'}

For each task provide:
- skill: Topic name
- whyItMatters: Why interviewers grill on this
- priority: 'high' | 'medium' | 'low'
- task: Concrete actionable step (e.g., "Implement LRU Cache from scratch in Python")
- estimatedEffort: Time estimate (e.g., "2-3 hours")
- relatedQuestions: 2 sample interview questions to test after completion.

Return structured JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  skill: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  task: { type: Type.STRING },
                  estimatedEffort: { type: Type.STRING },
                  relatedQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'skill', 'whyItMatters', 'priority', 'task', 'estimatedEffort'],
              },
            },
          },
          required: ['title', 'summary', 'tasks'],
        },
      },
    });

    const parsed = extractJson(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating roadmap:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate roadmap',
      code: 'GEMINI_ROADMAP_ERROR',
    });
  }
});

// Vite Middleware mounting in Dev or Static Serve in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewAI Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
