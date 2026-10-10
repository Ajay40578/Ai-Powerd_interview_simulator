import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  HelpCircle,
  Copy,
} from 'lucide-react';
import { ResumeAnalysisResult } from '../types';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

interface ResumeAnalyzerProps {
  onPracticeQuestion: (questionText: string, category: string) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({
  onPracticeQuestion,
}) => {
  const [resumeText, setResumeText] = useState<string>(() => {
    return StorageService.getProfile().resumeContext || '';
  });
  const [targetRole, setTargetRole] = useState<string>(() => {
    return StorageService.getProfile().targetRole || 'Python Developer';
  });
  const [jobDescription, setJobDescription] = useState<string>('');
  const [hasConsent, setHasConsent] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // File upload reader with clear binary/PDF fallback handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      setErrorMsg(
        'Direct PDF/Word binary decoding is not supported in browser-only mode. Please copy and paste your resume text directly into the editable text area below.'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File exceeds 2MB limit. Please upload a smaller file or paste plain text.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please paste your resume text manually below.');
    };
    reader.readAsText(file);
  };

  const handleLoadSampleResume = () => {
    const sample = `ALEX MORGAN
Email: alex.morgan@example.com | GitHub: github.com/alexmorgan-dev
Location: San Francisco, CA

SUMMARY:
Motivated Software Engineer specializing in Python backend systems, REST APIs, and database design. Experienced in building scalable web microservices, data processing pipelines, and caching layers with Redis.

TECHNICAL SKILLS:
- Languages: Python 3, SQL, TypeScript, Bash
- Frameworks & Tools: FastAPI, Flask, Django, PostgreSQL, Docker, Git, Redis, Pytest
- Concepts: Data Structures & Algorithms, RESTful API Design, Relational DB Normalization, Concurrency

PROJECTS:
1. Automated Price Tracker & Alert Pipeline (Python, FastAPI, Redis, PostgreSQL)
- Developed an asynchronous web scraper and REST API tracking price updates across 500+ e-commerce items.
- Optimized database query throughput with composite B-Tree indexes, reducing 95th percentile latency from 450ms to 65ms.
- Containerized application services using Docker and orchestrated scheduled workers with Celery.

2. Distributed Task Queue & Worker System (Python, Multiprocessing, Sockets)
- Engineered a lightweight in-memory task distribution system handling priority worker execution.
- Implemented exponential backoff retries and dead-letter queue mechanics.

EDUCATION:
Bachelor of Science in Computer Science
State University, 2024
Relevant Coursework: Advanced Algorithms, Database Management Systems, Distributed Systems`;

    setResumeText(sample);
    setTargetRole('Python Developer');
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 25) {
      setErrorMsg('Please paste or upload meaningful resume content (at least a couple paragraphs or bullet points).');
      return;
    }

    if (!hasConsent) {
      setErrorMsg('Please confirm consent before submitting resume content for analysis.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const { result } = await ApiService.analyzeResume({
        resumeText: resumeText.trim(),
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim() || undefined,
      });

      setAnalysisResult(result);

      // Save resume context to profile automatically
      const currentProfile = StorageService.getProfile();
      StorageService.saveProfile({
        ...currentProfile,
        resumeContext: resumeText.trim(),
        targetRole: targetRole.trim(),
      });
    } catch (err: any) {
      console.error('Resume analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Resume Analyzer & Question Generator</h2>
        </div>
        <p className="text-xs text-slate-500">
          Upload or paste your resume to detect skills, uncover experience gaps, and generate realistic interview questions directly tailored to your background.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Role to Benchmark Against *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Python Developer, Full Stack Engineer"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Resume File (.txt, .md)
              </label>
              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                + Load Sample Resume
              </button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Resume Text Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Resume Text Content (Editable) *
            </label>
            <span className="text-[11px] text-slate-400">
              {resumeText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={8}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your education, work experience, projects, and technical skills here..."
            className="w-full rounded-xl border border-slate-200 p-4 text-xs font-mono text-slate-800 leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Optional Target Job Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Optional: Target Job Description (For Job Match Estimate)
          </label>
          <textarea
            rows={3}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste requirements, responsibilities, and qualifications from the target job posting..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2 pt-1 text-xs text-slate-600">
          <input
            type="checkbox"
            id="resumeConsent"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="resumeConsent" className="cursor-pointer">
            I consent to analyzing my resume text to generate interview questions and feedback. Information is processed strictly for practice and stored locally on this device.
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing Resume & Formulating Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze Resume & Generate Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Summary Card with Match Score */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Candidate Profile Assessment
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Estimated Level: {analysisResult.experienceLevelEstimate}
                </h3>
                <p className="text-xs text-slate-500">{analysisResult.educationSummary}</p>
              </div>

              {typeof analysisResult.jobDescriptionMatchScore === 'number' && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-center sm:text-right shrink-0">
                  <span className="text-[10px] text-indigo-600 uppercase font-bold block">
                    Job Description Alignment
                  </span>
                  <span className="text-2xl font-black text-indigo-900">
                    {analysisResult.jobDescriptionMatchScore}%
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    *Practice alignment estimate, not ATS guarantee
                  </span>
                </div>
              )}
            </div>

            {/* Detected Skills */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Detected Core Skills:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.detectedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 space-y-1.5">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Key Resume Strengths</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-900/90 text-[11px]">
                  {analysisResult.strengths.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 space-y-1.5">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Underrepresented or Missing Topics</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px]">
                  {analysisResult.missingOrWeakSkills.map((ms, i) => (
                    <li key={i}>{ms}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improvement Recommendations */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-800">
                Actionable Resume Formatting & Impact Suggestions:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                {analysisResult.improvementSuggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Generated Tailored Interview Questions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Resume-Based Interview Questions
              </h3>
              <p className="text-xs text-slate-500">
                Generated based on your projects, technology choices, and experience gaps.
              </p>
            </div>

            <div className="space-y-3">
              {analysisResult.generatedInterviewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600">Question {idx + 1}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {q.category}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                      "{q.question}"
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Why interviewers ask this: {q.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyQuestion(q.question, idx)}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition"
                      title="Copy Question"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onPracticeQuestion(q.question, q.category)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition active:scale-95 shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Practice Question</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
