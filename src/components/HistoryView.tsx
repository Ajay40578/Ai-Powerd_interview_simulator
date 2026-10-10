import React, { useState } from 'react';
import {
  History,
  Trash2,
  RotateCcw,
  ExternalLink,
  Calendar,
  Clock,
  Layers,
  Award,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { InterviewSession } from '../types';
import { getScoreTier } from '../services/scoring';
import { StorageService } from '../services/storage';

interface HistoryViewProps {
  sessions: InterviewSession[];
  onReviewSession: (session: InterviewSession) => void;
  onRetryCategory: (category: any, role: string) => void;
  onStartNew: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  onReviewSession,
  onRetryCategory,
  onStartNew,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteSession(id);
    setSessionToDelete(null);
  };

  const handleClearAll = () => {
    StorageService.clearAllSessions();
    setShowClearConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Practice History & Reports</h2>
          <p className="text-xs text-slate-500">
            Revisit every past mock interview, review detailed question feedback, or track your progress.
          </p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Past Sessions Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your completed and saved mock interviews will appear here with full answers, scores, and evaluations.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const hasScore = typeof session.overallScore === 'number';
            const tier = hasScore ? getScoreTier(session.overallScore!) : null;

            return (
              <div
                key={session.id}
                onClick={() => onReviewSession(session)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {session.config.targetRole}
                      </span>
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        {session.config.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
                        {session.config.difficulty}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase">
                        {session.evaluationMode}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.round(session.durationSeconds / 60)} mins</span>
                      </span>
                      <span>•</span>
                      <span>
                        {session.completedQuestionCount} questions attempted
                      </span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {hasScore ? (
                      <div className="text-right">
                        <span
                          className={`inline-block rounded-xl border px-3 py-1 text-sm font-black ${tier?.badgeBg} ${tier?.badgeText}`}
                        >
                          {session.overallScore}%
                        </span>
                        <span className="block text-[10px] font-medium text-slate-400">
                          {tier?.label}
                        </span>
                      </div>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        Partial
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryCategory(session.config.category, session.config.targetRole);
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition"
                        title="Retry this category"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onReviewSession(session)}
                        className="flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <span>Review</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Single Session Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Delete This Session?</h3>
            <p className="text-xs text-slate-600">
              This will remove this mock interview record and its evaluation scores from your device.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleDeleteSession(sessionToDelete, e)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Clear All Practice History?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure? This will permanently delete all {sessions.length} saved interview sessions and reset your dashboard statistics.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
