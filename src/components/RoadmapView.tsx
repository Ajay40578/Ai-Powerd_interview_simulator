import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Sparkles,
  Play,
  RotateCw,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { RoadmapTask, CandidateProfile, InterviewSession } from '../types';
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';

interface RoadmapViewProps {
  profile: CandidateProfile;
  sessions: InterviewSession[];
  onPracticeTopic: (skill: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  profile,
  sessions,
  onPracticeTopic,
}) => {
  const [tasks, setTasks] = useState<RoadmapTask[]>(() => StorageService.getRoadmap());
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const handleToggleTask = (id: string) => {
    StorageService.toggleRoadmapTask(id);
    setTasks(StorageService.getRoadmap());
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // Find weakest skills from sessions
      const weakMap: Record<string, number> = {};
      sessions.forEach((s) => {
        s.questions.forEach((q) => {
          const ans = s.answers[q.id];
          if (ans?.evaluation && ans.evaluation.overallScore < 75) {
            const sk = q.skill || q.category;
            weakMap[sk] = (weakMap[sk] || 0) + 1;
          }
        });
      });

      const weakSkills = Object.keys(weakMap);
      const scores = sessions.map((s) => s.overallScore || 0);

      const { tasks: newTasks } = await ApiService.generateRoadmap({
        targetRole: profile.targetRole,
        weakSkills,
        recentSessionScores: scores,
        candidateProfile: profile,
      });

      StorageService.saveRoadmap(newTasks);
      setTasks(newTasks);
    } catch (e) {
      console.error('Failed to regenerate roadmap:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Compass className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Personalized Learning Roadmap</h2>
            </div>
            <p className="text-xs text-slate-500">
              Curated study priorities targeting your specific mock interview mistakes and conceptual gaps.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
            ) : (
              <RotateCw className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Update From Recent Sessions</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Overall Roadmap Completion</span>
            <span>
              {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              filterPriority === p
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p === 'all' ? 'All Priorities' : `${p} Priority`}
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            No study tasks in this category.
          </div>
        ) : (
          filteredTasks.map((t, idx) => (
            <div
              key={t.id}
              className={`rounded-2xl border p-5 transition ${
                t.completed
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200 bg-white hover:border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTask(t.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition"
                    title={t.completed ? 'Mark incomplete' : 'Mark task complete'}
                  >
                    {t.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-5 w-5 hover:text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{t.skill}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          t.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : t.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priority} Priority
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>{t.estimatedEffort}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pt-0.5">
                      {t.task}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      <strong>Why it matters:</strong> {t.whyItMatters}
                    </p>

                    {/* Related sample question */}
                    {t.relatedQuestions && t.relatedQuestions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Practice Question:
                        </span>
                        <p className="text-[11px] text-indigo-700 italic">
                          "{t.relatedQuestions[0]}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onPracticeTopic(t.skill)}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition shadow-2xs"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Practice</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
