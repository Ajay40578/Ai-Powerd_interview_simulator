import React, { useState, useEffect, useRef } from 'react';
import {
  AnswerEvaluation,
  AnswerRecord,
  InterviewQuestion,
  InterviewSession,
} from '../types';
import {
  Clock,
  Play,
  Pause,
  Send,
  SkipForward,
  StopCircle,
  Mic,
  MicOff,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import {
  calculateSessionScore,
  calculateTransparentAnswerScore,
  generateSessionScorecard,
  getScoreTier,
} from '../services/scoring';

interface InterviewRoomProps {
  session: InterviewSession;
  onSessionComplete: (completedSession: InterviewSession) => void;
  onExitInterview: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  session: initialSession,
  onSessionComplete,
  onExitInterview,
}) => {
  const [session, setSession] = useState<InterviewSession>(initialSession);
  const [answerDraft, setAnswerDraft] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active answer evaluation modal / card to review before advancing
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    evaluation: AnswerEvaluation;
    question: InterviewQuestion;
    mode: 'ai' | 'demo';
  } | null>(null);

  // Code editor language state
  const [codeLanguage, setCodeLanguage] = useState<string>('python');

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQIndex = session.currentQuestionIndex;
  const currentQuestion: InterviewQuestion | undefined = session.questions[currentQIndex];
  const totalQuestions = session.config.questionLimit;
  const progressPercent = Math.round(((currentQIndex) / totalQuestions) * 100);

  // Timer reference & tick
  useEffect(() => {
    if (isPaused || session.status === 'evaluating' || session.status === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      setSession((prev) => {
        if (prev.timeRemainingSeconds <= 1) {
          // Time expired! Auto complete
          clearInterval(interval);
          handleAutoTimeOut();
          return { ...prev, timeRemainingSeconds: 0 };
        }
        const updated = {
          ...prev,
          timeRemainingSeconds: prev.timeRemainingSeconds - 1,
          durationSeconds: prev.durationSeconds + 1,
        };
        // Periodically sync
        StorageService.saveSession(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, session.status]);

  // Restore draft if user previously answered part of it
  useEffect(() => {
    if (currentQuestion && session.answers[currentQuestion.id]) {
      const existing = session.answers[currentQuestion.id];
      if (existing.answerText && !currentEvaluation) {
        setAnswerDraft(existing.answerText);
      }
    } else {
      setAnswerDraft('');
    }
    setShowHints(false);
  }, [currentQIndex]);

  // Setup Web Speech API for voice mode
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setAnswerDraft((prev) => {
              const cleaned = prev ? `${prev.trim()} ${currentTranscript.trim()}` : currentTranscript;
              return cleaned;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission denied. You can continue typing in text mode.');
          } else {
            setSpeechError(`Voice recognition: ${event.error}. You can edit your response in text mode.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init error:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your answer below.');
      return;
    }

    setSpeechError(null);
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.warn('Could not start recognition:', err);
        setSpeechError('Could not start microphone. Please check browser permissions.');
      }
    }
  };

  const handlePauseResume = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (_) {}
    }
    setIsPaused(!isPaused);
  };

  // Submit Answer & Evaluate
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (isSubmitting || session.status === 'evaluating') return; // Prevent duplicate submission lock

    const trimmed = answerDraft.trim();
    if (!trimmed) {
      setErrorMsg('Please write or speak an answer before submitting.');
      return;
    }

    if (trimmed.length < 5) {
      setErrorMsg('Answer is too short. Please provide at least a couple sentences of technical explanation.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (_) {}
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Evaluate answer
      const { evaluation, mode } = await ApiService.evaluateAnswer({
        question: currentQuestion,
        answer: trimmed,
        category: session.config.category,
        targetRole: session.config.targetRole,
        difficulty: session.config.difficulty,
        codeLanguage: session.config.mode === 'coding' ? codeLanguage : undefined,
      });

      // 2. Save answer record into session
      const answerRecord: AnswerRecord = {
        questionId: currentQuestion.id,
        answerText: trimmed,
        submittedAt: new Date().toISOString(),
        codeLanguage: session.config.mode === 'coding' ? codeLanguage : undefined,
        evaluation,
        status: 'completed',
      };

      const updatedAnswers = {
        ...session.answers,
        [currentQuestion.id]: answerRecord,
      };

      const updatedSession: InterviewSession = {
        ...session,
        answers: updatedAnswers,
        completedQuestionCount: Object.values(updatedAnswers).filter((a) => a.status === 'completed').length,
        status: 'evaluating',
      };

      setSession(updatedSession);
      StorageService.saveSession(updatedSession);

      // 3. Show intermediate feedback modal
      setCurrentEvaluation({
        evaluation,
        question: currentQuestion,
        mode,
      });
    } catch (err: any) {
      console.error('Answer submission error:', err);
      setErrorMsg(err.message || 'Failed to evaluate answer. Your draft has been preserved. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip Question
  const handleSkipQuestion = async () => {
    if (!currentQuestion || isSubmitting) return;

    const answerRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      answerText: '[Question Skipped by Candidate]',
      submittedAt: new Date().toISOString(),
      status: 'skipped',
    };

    const updatedAnswers = {
      ...session.answers,
      [currentQuestion.id]: answerRecord,
    };

    const nextIdx = currentQIndex + 1;
    if (nextIdx >= totalQuestions) {
      // Finished all questions
      completeSession({ ...session, answers: updatedAnswers });
    } else {
      // Advance to next question or generate it
      await advanceToNextQuestion(nextIdx, updatedAnswers);
    }
  };

  // Continue to Next Question after reviewing evaluation
  const handleContinueAfterEvaluation = async () => {
    setCurrentEvaluation(null);
    setAnswerDraft('');

    const nextIdx = currentQIndex + 1;
    if (nextIdx >= totalQuestions) {
      // Session Completed!
      completeSession(session);
    } else {
      await advanceToNextQuestion(nextIdx, session.answers);
    }
  };

  const advanceToNextQuestion = async (
    nextIdx: number,
    currentAnswers: Record<string, AnswerRecord>
  ) => {
    setIsSubmitting(true);
    try {
      // Check if next question is already generated in session.questions
      if (nextIdx < session.questions.length) {
        const updated: InterviewSession = {
          ...session,
          answers: currentAnswers,
          currentQuestionIndex: nextIdx,
          status: 'in_progress',
        };
        setSession(updated);
        StorageService.saveSession(updated);
        return;
      }

      // Otherwise, generate the next adaptive question
      const previousQTexts = session.questions.map((q) => q.text);
      const lastAnswerRecord = session.answers[currentQuestion?.id || ''];

      const { question: nextQ } = await ApiService.generateQuestion({
        category: session.config.category,
        targetRole: session.config.targetRole,
        difficulty: session.config.difficulty,
        questionNumber: nextIdx + 1,
        totalQuestions,
        candidateProfile: { targetRole: session.config.targetRole },
        previousQuestions: previousQTexts,
        lastAnswerFeedback: lastAnswerRecord?.evaluation,
      });

      const updatedQuestions = [...session.questions, nextQ];
      const updated: InterviewSession = {
        ...session,
        questions: updatedQuestions,
        answers: currentAnswers,
        currentQuestionIndex: nextIdx,
        status: 'in_progress',
      };

      setSession(updated);
      StorageService.saveSession(updated);
    } catch (e: any) {
      console.error('Error fetching next question:', e);
      setErrorMsg('Failed to load next question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete session & finalize scoring
  const completeSession = (targetSession: InterviewSession) => {
    const scorecard = generateSessionScorecard(targetSession);
    const { overallScore } = calculateSessionScore(targetSession);
    const finalizedScore = scorecard ? scorecard.totalPointsEarned : overallScore;

    const finalized: InterviewSession = {
      ...targetSession,
      status: 'completed',
      completedAt: new Date().toISOString(),
      overallScore: finalizedScore,
      scorecard,
    };

    setSession(finalized);
    StorageService.saveSession(finalized);
    StorageService.clearActiveSession();
    onSessionComplete(finalized);
  };

  // User ends early confirmation
  const handleConfirmEndEarly = () => {
    setShowEndModal(false);
    const scorecard = generateSessionScorecard(session);
    const { overallScore } = calculateSessionScore(session);
    const finalizedScore = scorecard ? scorecard.totalPointsEarned : overallScore;

    const partialSession: InterviewSession = {
      ...session,
      status: 'completed',
      completedAt: new Date().toISOString(),
      overallScore: finalizedScore,
      scorecard,
    };
    StorageService.saveSession(partialSession);
    StorageService.clearActiveSession();
    onSessionComplete(partialSession);
  };

  const handleAutoTimeOut = () => {
    completeSession(session);
  };

  // Format time remaining mm:ss
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = answerDraft.trim() ? answerDraft.trim().split(/\s+/).length : 0;
  const charCount = answerDraft.length;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Session Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {session.config.roundTitle ? (
              <span className="rounded-lg bg-indigo-600 text-white px-2.5 py-1 text-xs font-bold shadow-xs">
                {session.config.roundTitle}
              </span>
            ) : (
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                {session.config.category}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px] sm:max-w-none">
              {session.config.targetRole}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 capitalize">
              {session.config.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono font-bold ${
                session.timeRemainingSeconds < 120
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimer(session.timeRemainingSeconds)}</span>
            </div>

            {/* Pause / Resume */}
            <button
              onClick={handlePauseResume}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title={isPaused ? 'Resume interview timer' : 'Pause interview timer'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-current text-emerald-600" /> : <Pause className="h-3.5 w-3.5 text-slate-600" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* End Early */}
            <button
              onClick={() => setShowEndModal(true)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              End Early
            </button>
          </div>
        </div>

        {/* Question Counter & Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>
              Question {currentQIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(((currentQIndex) / totalQuestions) * 100)}% Progress</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(8, ((currentQIndex) / totalQuestions) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {isPaused && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-800">
          <span className="font-bold">Interview Paused.</span> The timer is frozen. Click "Resume" above when you're ready to proceed.
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Evaluating: {currentQuestion.skill}
              </span>
              {currentQuestion.source === 'demo' && (
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Demo Rule-Based Question
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.text}
            </h3>

            {/* Expected competencies pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Key Focus:</span>
              {currentQuestion.expectedCompetencies?.map((comp, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Optional Code Snippet for coding question */}
          {currentQuestion.codeSnippet && (
            <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{currentQuestion.codeSnippet}</pre>
            </div>
          )}

          {/* Hints Toggle */}
          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>{showHints ? 'Hide Hints' : 'Need a hint?'}</span>
              </button>

              {showHints && (
                <div className="mt-2 rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1 text-xs text-amber-900">
                  <p className="font-semibold text-amber-800">Interviewer Hints:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800/90">
                    {currentQuestion.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Answer Input Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Your Response {session.config.mode === 'coding' && '(Code & Explanation)'}:
              </label>

              {/* Mode-specific actions */}
              <div className="flex items-center gap-2">
                {session.config.mode === 'coding' && (
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="sql">SQL</option>
                  </select>
                )}

                {session.config.mode === 'voice' && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    <span>{isListening ? 'Stop Recording' : 'Start Mic Recording'}</span>
                  </button>
                )}
              </div>
            </div>

            {speechError && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
                {speechError}
              </div>
            )}

            {/* Answer Field */}
            <div className="relative">
              <textarea
                rows={session.config.mode === 'coding' ? 12 : 8}
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                onKeyDown={(e) => {
                  // Tab support for code indentation
                  if (session.config.mode === 'coding' && e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    setAnswerDraft(
                      answerDraft.substring(0, start) + '    ' + answerDraft.substring(end)
                    );
                  }
                  // Ctrl+Enter or Cmd+Enter to submit
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
                disabled={isSubmitting || isPaused}
                placeholder={
                  session.config.mode === 'coding'
                    ? `# Write your solution in ${codeLanguage} and explain trade-offs below...\ndef solution():\n    pass`
                    : session.config.mode === 'voice'
                    ? 'Click "Start Mic Recording" above to speak, or type your answer here...'
                    : 'Provide a structured answer. State the key concept first, detail the underlying mechanics, and give practical examples or trade-offs...'
                }
                className={`w-full rounded-xl border border-slate-200 p-4 text-xs sm:text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed ${
                  session.config.mode === 'coding' ? 'font-mono bg-slate-50' : 'bg-white'
                }`}
              />
            </div>

            {/* Answer Stats Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
                {session.config.mode === 'coding' && <span>• Tab key indents 4 spaces</span>}
              </div>
              <div className="hidden sm:inline">
                Press <kbd className="rounded bg-slate-100 px-1 py-0.5 border text-slate-600 font-mono">Ctrl+Enter</kbd> to submit
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={handleSkipQuestion}
              disabled={isSubmitting || isPaused}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skip Question</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || isPaused}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Quick Submitting & Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>⚡ Quick Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Answer Evaluation Modal / Drawer */}
      {currentEvaluation && (() => {
        const isAnswerCorrect =
          currentEvaluation.evaluation.isCorrect === true ||
          (currentEvaluation.evaluation.overallScore >= 55 &&
            (currentEvaluation.evaluation.correctnessScore ?? 50) >= 50);

        // Calculate running score across all completed answers
        const currentCompletedAnswers = Object.values(session.answers);
        const correctAnswersCount = currentCompletedAnswers.filter((a) => {
          const evalItem = a.evaluation;
          return (
            evalItem &&
            (evalItem.isCorrect === true ||
              (evalItem.overallScore >= 55 && (evalItem.correctnessScore ?? 50) >= 50))
          );
        }).length;
        const runningPointsEarned = correctAnswersCount * 20;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Question Evaluation
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Answer Feedback & Dimension Breakdown
                  </h3>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-lg px-3 py-1 text-sm font-black border ${
                      getScoreTier(currentEvaluation.evaluation.overallScore).badgeBg
                    } ${getScoreTier(currentEvaluation.evaluation.overallScore).badgeText}`}
                  >
                    {currentEvaluation.evaluation.overallScore} / 100
                  </span>
                  <span className="block text-[10px] font-medium text-slate-400">
                    {getScoreTier(currentEvaluation.evaluation.overallScore).label}
                  </span>
                </div>
              </div>

              {/* 5-Question Point Rule Banner: Correct = +20, Wrong = 0 */}
              <div
                className={`rounded-xl border p-4 flex items-start gap-3 ${
                  isAnswerCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div
                  className={`mt-0.5 rounded-full p-1.5 shrink-0 ${
                    isAnswerCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isAnswerCorrect ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-extrabold tracking-tight">
                      {isAnswerCorrect
                        ? 'Answer is Correct! (+20 Points Added)'
                        : 'Answer is Incorrect / Incomplete (0 Points - No Score Added)'}
                    </h4>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-black border ${
                        isAnswerCorrect
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isAnswerCorrect ? '+20 / 20 Points' : '0 / 20 Points'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {isAnswerCorrect
                      ? 'Your answer was technically sound and addressed the question core. +20 points awarded!'
                      : 'Your answer did not satisfy the interview criteria for full credit. 0 points awarded. Review the key concepts and model answer below.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-slate-600">
                    <span className="rounded bg-white px-2 py-0.5 border border-slate-200">
                      Test Scorecard Progress: {runningPointsEarned} / 100 pts
                    </span>
                    <span>•</span>
                    <span>
                      Question {currentQIndex + 1} of {totalQuestions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rubric Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">RELEVANCE</span>
                  <span className="font-bold text-slate-800">
                    {currentEvaluation.evaluation.relevanceScore}%
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">CORRECTNESS</span>
                  <span className="font-bold text-slate-800">
                    {currentEvaluation.evaluation.correctnessScore}%
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">DEPTH</span>
                  <span className="font-bold text-slate-800">
                    {currentEvaluation.evaluation.depthScore}%
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">CLARITY</span>
                  <span className="font-bold text-slate-800">
                    {currentEvaluation.evaluation.clarityScore}%
                  </span>
                </div>
              </div>

              {/* Strengths & Missing Concepts */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Strengths in your answer:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    {currentEvaluation.evaluation.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                {currentEvaluation.evaluation.missingConcepts.length > 0 && (
                  <div>
                    <h4 className="font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Areas to elaborate or missing concepts:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      {currentEvaluation.evaluation.missingConcepts.map((mc, i) => (
                        <li key={i}>{mc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model Answer Preview */}
                {currentEvaluation.evaluation.exampleAnswer && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Model Answer / Key Concepts
                    </span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {currentEvaluation.evaluation.exampleAnswer}
                    </p>
                  </div>
                )}

                {/* Mode notice */}
                <div className="text-[10px] text-slate-400 italic">
                  {currentEvaluation.mode === 'demo'
                    ? '• Evaluated using transparent demonstration rubric rules. Full session data will be saved.'
                    : '• Evaluated by Gemini 3.8 Flash model.'}
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-2">
                <button
                  onClick={handleContinueAfterEvaluation}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition cursor-pointer"
                >
                  <span>
                    {currentQIndex + 1 >= totalQuestions
                      ? '⚡ View Final Scorecard & Weekly Feedback'
                      : '⚡ Quick Next Question'}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirmation Modal to End Early */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">End Interview Early?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to conclude this session now? Your final evaluation report will be generated based only on the questions you have actually attempted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel & Continue
              </button>
              <button
                onClick={handleConfirmEndEarly}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
