import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Play,
  Filter,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CURATED_QUESTIONS } from '../data/curatedQuestions';
import { QuestionBankItem } from '../types';
import { StorageService } from '../services/storage';

interface QuestionBankViewProps {
  onPracticeQuestion: (question: QuestionBankItem) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  onPracticeQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [expandedHints, setExpandedHints] = useState<Set<string>>(new Set());

  // Bookmarks & Completed questions loaded from storage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() =>
    StorageService.getBookmarkedQuestionIds()
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(() =>
    StorageService.getCompletedQuestionIds()
  );

  const categories = [
    'All',
    'Technical',
    'DSA',
    'SQL / DBMS',
    'HR / Behavioral',
    'Frontend',
    'AI / Machine Learning',
  ];

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.toggleBookmark(id);
    setBookmarkedIds(StorageService.getBookmarkedQuestionIds());
  };

  const handleToggleCompleted = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCompleted = completedIds.has(id);
    StorageService.markQuestionCompleted(id, !isCompleted);
    setCompletedIds(StorageService.getCompletedQuestionIds());
  };

  const toggleSampleAnswer = (id: string) => {
    setExpandedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHints = (id: string) => {
    setExpandedHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter questions
  const filteredQuestions = CURATED_QUESTIONS.filter((q) => {
    if (onlyBookmarked && !bookmarkedIds.has(q.id)) return false;

    if (selectedCategory !== 'All' && q.category !== selectedCategory) {
      return false;
    }

    if (
      selectedDifficulty !== 'All' &&
      q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchText = q.text.toLowerCase().includes(term);
      const matchSkill = q.skill.toLowerCase().includes(term);
      const matchCat = q.category.toLowerCase().includes(term);
      return matchText || matchSkill || matchCat;
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Curated Question Bank</h2>
            <p className="text-xs text-slate-500">
              Browse top verified interview questions, hints, and model answers across categories.
            </p>
          </div>
          <div className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
            {completedIds.size} of {CURATED_QUESTIONS.length} Solved
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, or concept (e.g. list, join, react)..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                onlyBookmarked
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Bookmarks ({bookmarkedIds.size})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
            No questions matched your search criteria. Try clearing the filter.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            const isCompleted = completedIds.has(q.id);
            const showSample = expandedAnswers.has(q.id);
            const showHintsSection = expandedHints.has(q.id);

            return (
              <div
                key={q.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:border-slate-300 ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        {q.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {q.skill}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug pt-1">
                      {q.text}
                    </h3>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleToggleBookmark(q.id, e)}
                      className={`p-2 rounded-lg border transition ${
                        isBookmarked
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleToggleCompleted(q.id, e)}
                      className={`p-2 rounded-lg border transition ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as solved'}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onPracticeQuestion(q)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition active:scale-95 shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Practice</span>
                    </button>
                  </div>
                </div>

                {/* Hints and Sample Answer Dropdowns */}
                <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-100 text-xs">
                  {q.hints && q.hints.length > 0 && (
                    <button
                      onClick={() => toggleHints(q.id)}
                      className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>{showHintsSection ? 'Hide Hints' : 'View Hints'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleSampleAnswer(q.id)}
                    className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-800"
                  >
                    <span>{showSample ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                    {showSample ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Expanded Hints */}
                {showHintsSection && (
                  <div className="mt-3 rounded-xl bg-amber-50/70 border border-amber-200 p-3 space-y-1 text-xs text-amber-900">
                    <span className="font-bold text-amber-800">Hints:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800/90 text-[11px]">
                      {q.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expanded Model Answer */}
                {showSample && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1 text-xs text-slate-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Exemplary Model Answer:
                    </span>
                    <p className="leading-relaxed text-[11px]">{q.sampleAnswer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
