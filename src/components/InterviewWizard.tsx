import React, { useState } from 'react';
import {
  CandidateProfile,
  Difficulty,
  InterviewCategory,
  InterviewConfig,
  InterviewMode,
  InterviewStyle,
  InterviewRoundType,
} from '../types';
import { INTERVIEW_ROUNDS, getRoundById } from '../services/interviewRounds';
import {
  Code,
  Terminal,
  Database,
  Users,
  Brain,
  Zap,
  Layers,
  FileText,
  Settings2,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Play,
  Volume2,
  Keyboard,
  ShieldAlert,
  Loader2,
  Award,
  Briefcase,
} from 'lucide-react';

interface InterviewWizardProps {
  profile: CandidateProfile;
  initialCategory?: InterviewCategory;
  onLaunchInterview: (config: InterviewConfig) => Promise<void>;
  onCancel: () => void;
}

export const InterviewWizard: React.FC<InterviewWizardProps> = ({
  profile,
  initialCategory,
  onLaunchInterview,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [selectedRound, setSelectedRound] = useState<InterviewRoundType>('technical_core');
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [category, setCategory] = useState<InterviewCategory>(
    initialCategory || 'Technical'
  );

  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      // Auto-match round if category matches
      if (initialCategory === 'HR / Behavioral') setSelectedRound('screening_hr');
      else if (initialCategory === 'DSA') setSelectedRound('dsa_problem_solving');
      else if (initialCategory === 'Coding') setSelectedRound('machine_coding');
      else if (initialCategory === 'Backend') setSelectedRound('system_design');
      else if (initialCategory === 'Resume-Based') setSelectedRound('hiring_manager');
      else setSelectedRound('technical_core');
    }
  }, [initialCategory]);
  const [targetRole, setTargetRole] = useState<string>(profile.targetRole || 'Python Developer');
  const [experienceLevel, setExperienceLevel] = useState<string>(profile.experienceLevel || 'Fresher');
  const [skills, setSkills] = useState<string[]>(profile.skills || ['Python', 'SQL', 'Git']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeContext, setResumeContext] = useState<string>(profile.resumeContext || '');

  // Settings
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [questionLimit, setQuestionLimit] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.defaultDifficulty || 'beginner');
  const [mode, setMode] = useState<InterviewMode>('text');
  const [interviewStyle, setInterviewStyle] = useState<InterviewStyle>('coach');

  const categoriesList: Array<{ id: InterviewCategory; name: string; desc: string; icon: any }> = [
    { id: 'Technical', name: 'Technical / Core', desc: 'Core engineering concepts & language internals', icon: Terminal },
    { id: 'Coding', name: 'Coding Challenge', desc: 'Live code writing with algorithms & edge cases', icon: Code },
    { id: 'DSA', name: 'DSA & Algorithms', desc: 'Arrays, Trees, Graphs, Dynamic Programming', icon: Zap },
    { id: 'SQL / DBMS', name: 'SQL & Databases', desc: 'Queries, schema design, joins & indexing', icon: Database },
    { id: 'HR / Behavioral', name: 'HR & Behavioral', desc: 'STAR questions, culture, teamwork & conflict', icon: Users },
    { id: 'Frontend', name: 'Frontend / UI', desc: 'React, modern JavaScript, web performance & CSS', icon: Zap },
    { id: 'Backend', name: 'Backend / APIs', desc: 'REST, microservices, databases, caching & concurrency', icon: Layers },
    { id: 'Full Stack', name: 'Full Stack', desc: 'End-to-end architecture from DB to responsive client', icon: Layers },
    { id: 'AI / Machine Learning', name: 'AI & Machine Learning', desc: 'Model architectures, loss functions & NLP/LLMs', icon: Brain },
    { id: 'Data Science', name: 'Data Science', desc: 'Statistical modeling, pandas & experimentation', icon: Brain },
    { id: 'Resume-Based', name: 'Resume-Based', desc: 'Questions tailored directly to your projects and gaps', icon: FileText },
    { id: 'Aptitude', name: 'Aptitude & Logic', desc: 'Quantitative problem solving & logical puzzles', icon: Settings2 },
    { id: 'Custom Role', name: 'Custom Role', desc: 'Specialized domain based on your target role', icon: Terminal },
  ];

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleLaunch = async () => {
    if (isLaunching) return;

    if (!targetRole.trim()) {
      setErrorMsg('Target role cannot be empty.');
      setCurrentStep(2);
      return;
    }

    setErrorMsg(null);
    setIsLaunching(true);

    try {
      const roundInfo = getRoundById(selectedRound);
      const config: InterviewConfig = {
        category,
        targetRole: targetRole.trim(),
        difficulty,
        durationMinutes,
        questionLimit,
        mode,
        interviewStyle,
        language: 'English',
        roundType: selectedRound,
        roundTitle: roundInfo.title,
        resumeContext: resumeContext.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
      };

      await onLaunchInterview(config);
    } catch (e: any) {
      console.error('Launch failed:', e);
      setErrorMsg(e.message || 'Failed to start interview. Please try again.');
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header & Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configure Mock Interview</h2>
            <p className="text-xs text-slate-500">
              Customize your mock interview session to match your upcoming hiring round.
            </p>
          </div>
          <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: 'Category' },
            { num: 2, label: 'Role & Skills' },
            { num: 3, label: 'Format & Mode' },
            { num: 4, label: 'Review & Launch' },
          ].map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all ${
                  currentStep >= s.num ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              ></div>
              <span
                className={`text-[11px] font-medium block truncate ${
                  currentStep === s.num
                    ? 'text-indigo-600 font-bold'
                    : currentStep > s.num
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Interview Round & Category Selection */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
                <Sparkles className="h-3 w-3" /> 7 Dedicated Hiring Rounds
              </div>
              <h3 className="text-base font-bold text-slate-900">Select Interview Round</h3>
              <p className="text-xs text-slate-500">
                Choose the exact interview round you are preparing for. Evaluator questions and rubrics adapt automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition self-start sm:self-auto cursor-pointer"
            >
              {showAllCategories ? '← View Standard Rounds' : 'Custom Category View →'}
            </button>
          </div>

          {!showAllCategories ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {INTERVIEW_ROUNDS.map((round) => {
                  const isSelected = selectedRound === round.id;
                  return (
                    <div
                      key={round.id}
                      onClick={() => {
                        setSelectedRound(round.id);
                        setCategory(round.defaultCategory);
                        setDurationMinutes(round.recommendedDuration);
                        setQuestionLimit(round.recommendedQuestions);
                      }}
                      className={`group relative cursor-pointer rounded-xl border p-4 transition text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${round.badgeColor}`}
                          >
                            Round {round.roundNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{round.title}</span>
                        </div>
                        {isSelected && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2.5">
                        {round.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {round.focusAreas.slice(0, 3).map((area, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {area}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100/80">
                        <span>Default: {round.defaultCategory}</span>
                        <span>
                          {round.recommendedDuration} min ({round.recommendedQuestions} Qs)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Round Active Callout */}
              {selectedRound && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-indigo-900 block">
                      Active Round: {getRoundById(selectedRound).title}
                    </span>
                    <p className="text-indigo-800 text-[11px] mt-0.5">
                      <strong>AI Evaluation Focus:</strong> {getRoundById(selectedRound).evalCriteria}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700">
                Choose a specific domain or custom skill track:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoriesList.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <span>Next: Role & Details</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Candidate & Job Details */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Candidate & Role Details</h3>
            <p className="text-xs text-slate-500">
              Provide context so the interviewer can calibrate questions accurately.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role / Job Title *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Python Developer, Full Stack Engineer, Data Analyst"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Fresher', 'Junior', 'Mid-Level', 'Senior'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      experienceLevel === lvl
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Skills to Test
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-indigo-400 hover:text-indigo-700 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. FastAPI, Pandas, Docker) and press Enter"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional: Target Job Description
              </label>
              <textarea
                rows={2}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key requirements or snippets from the job listing to steer questions..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <span>Next: Format & Mode</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Format & Settings */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Format & Interview Settings</h3>
            <p className="text-xs text-slate-500">
              Configure session duration, number of questions, difficulty, and input mode.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Interview Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-xl border py-2.5 text-xs font-medium capitalize transition ${
                      difficulty === d
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Question Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionLimit(cnt)}
                    className={`rounded-xl border py-2.5 text-xs font-medium transition ${
                      questionLimit === cnt
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Allocated Duration
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      durationMinutes === mins
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Answer Input Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Answer Input Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'text', label: 'Text', icon: Keyboard },
                  { id: 'voice', label: 'Voice (Mic)', icon: Volume2 },
                  { id: 'coding', label: 'Code Editor', icon: Code },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id as InterviewMode)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2 transition ${
                        mode === m.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <span>Next: Style & Summary</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Interviewer Style & Summary Confirmation */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Interviewer Persona & Launch</h3>
            <p className="text-xs text-slate-500">
              Select the coaching tone and review your configuration before entering the room.
            </p>
          </div>

          {/* Persona Style selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'coach',
                title: 'Friendly Coach',
                desc: 'Constructive feedback, encouraging tone, highlights growth opportunities.',
              },
              {
                id: 'realistic',
                title: 'Realistic Interviewer',
                desc: 'Balanced corporate interview demeanor with neutral follow-ups.',
              },
              {
                id: 'strict',
                title: 'Strict Tech Lead',
                desc: 'Rigorously evaluates trade-offs, edge cases, and algorithmic complexity.',
              },
            ].map((st) => (
              <div
                key={st.id}
                onClick={() => setInterviewStyle(st.id as InterviewStyle)}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  interviewStyle === st.id
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                  {interviewStyle === st.id && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Configuration Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Session Configuration Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">INTERVIEW ROUND</span>
                <span className="font-semibold text-indigo-700">{getRoundById(selectedRound).title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET ROLE</span>
                <span className="font-semibold text-slate-800">{targetRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DIFFICULTY</span>
                <span className="font-semibold text-slate-800 capitalize">{difficulty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">DURATION / LIMIT</span>
                <span className="font-semibold text-slate-800">
                  {durationMinutes} min ({questionLimit} Qs)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INPUT MODE</span>
                <span className="font-semibold text-slate-800 capitalize">{mode} Mode</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INTERVIEW STYLE</span>
                <span className="font-semibold text-slate-800 capitalize">{interviewStyle}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">SKILLS TESTED</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {skills.join(', ') || 'General'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isLaunching}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleLaunch}
              disabled={isLaunching}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initializing Interview Room...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Begin Interview Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
