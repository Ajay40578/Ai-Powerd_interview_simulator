import React from 'react';
import {
  Bot,
  Play,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  FileText,
  Target,
  BarChart,
  ShieldCheck,
  Zap,
  Code,
  Terminal,
  Database,
  Users,
  Compass,
  MessageSquare,
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onExploreFeatures?: () => void;
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onEnterApp,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { name: 'Technical / Core', icon: Terminal, desc: 'Python, Java, C++, System Design & OOP fundamentals' },
    { name: 'Coding & DSA', icon: Code, desc: 'Algorithms, Data Structures, Array, Graphs, DP & problem solving' },
    { name: 'SQL & DBMS', icon: Database, desc: 'Complex joins, indexing, query optimization, ACID & schemas' },
    { name: 'HR & Behavioral', icon: Users, desc: 'STAR technique, leadership principles, conflict & teamwork' },
    { name: 'Frontend & React', icon: Zap, desc: 'React Fiber, hooks, DOM painting, CSS architecture & performance' },
    { name: 'AI & Machine Learning', icon: Brain, desc: 'Supervised models, Transformers, evaluation metrics & NLP' },
  ];

  const features = [
    {
      title: 'Personalized Interviews',
      desc: 'Dynamic questions calibrated specifically to your target role, experience level, and verified competencies.',
      icon: Target,
    },
    {
      title: 'Resume-Based Questions',
      desc: 'Paste or upload your resume to generate targeted interview questions focusing on your real projects and gaps.',
      icon: FileText,
    },
    {
      title: 'Adaptive Follow-ups',
      desc: 'Our AI adjusts on the fly: strong answers lead to architectural trade-offs; weak answers trigger foundational checks.',
      icon: Brain,
    },
    {
      title: 'Granular Answer Evaluation',
      desc: 'Receive multi-dimensional rubric scores for relevance, correctness, technical depth, clarity, and reasoning.',
      icon: BarChart,
    },
    {
      title: 'Communication Feedback',
      desc: 'Actionable suggestions on structure, conciseness, and framing answers using the proven STAR methodology.',
      icon: MessageSquare,
    },
    {
      title: 'Readiness Tracking',
      desc: 'Transparent readiness estimate calculated across completed sessions to measure true interview preparedness.',
      icon: ShieldCheck,
    },
    {
      title: 'Practice History & Review',
      desc: 'Full review of every attempted question, candidate answer, feedback breakdown, and model answers.',
      icon: Zap,
    },
    {
      title: 'Personalized Learning Roadmap',
      desc: 'Custom study tasks generated directly from your identified conceptual weaknesses and missed edge cases.',
      icon: Compass,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Landing Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Interview</span>
              <span className="text-lg font-extrabold text-indigo-600">AI</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('features')}
              className="transition hover:text-indigo-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="transition hover:text-indigo-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('interview-types')}
              className="transition hover:text-indigo-600"
            >
              Interview Types
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Dashboard
            </button>
            <button
              onClick={onStartDemo}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Get Started Free</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Personal AI Interview Coach • Practice Smarter. Get Hired.</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your Next Interview{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Practice with an AI interviewer that adapts to your answers, identifies your weaknesses, and helps you become job-ready with realistic real-time feedback.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Mock Interview</span>
              </button>

              <button
                onClick={onStartDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-6 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300 active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Try Demo Interview (Python Fresher)</span>
              </button>

              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 cursor-pointer"
              >
                <span>Explore Features</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Zero Setup or API Key Required in Demo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Realistic Adaptive Follow-ups</span>
              </div>
            </div>
          </div>

          {/* Interactive Illustrative Product Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-slate-600">Sample Live Interview Preview (Illustrative)</span>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                Score: 84 / 100 • Strong
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Question & Answer Column */}
              <div className="space-y-3.5 text-left">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Question 2 of 5 • Technical
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800">
                    "Explain the difference between Python lists and tuples. Why are tuples immutable, and when should you use one over the other?"
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50/50 p-3.5 border border-indigo-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Candidate Answer
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    "Lists are mutable so their items can be altered in-place, whereas tuples are immutable once created. Because tuples have fixed size, Python allocates exact memory without headroom, making them more memory efficient and slightly faster. Tuples can also be used as dictionary keys if their contents are hashable."
                  </p>
                </div>
              </div>

              {/* Evaluation Feedback Column */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">AI Evaluation & Rubric</span>
                  <span className="text-xs text-emerald-600 font-semibold">Rubric Weight: 100%</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Relevance: 95%</span>
                    <span>Correctness: 90%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Depth: 80%</span>
                    <span>Clarity: 85%</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2.5 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-700">Strengths:</p>
                  <p className="text-slate-600">• Accurately highlighted memory allocation difference & dictionary key hashability.</p>
                  <p className="font-semibold text-slate-700 pt-1">Adaptive Next Follow-up:</p>
                  <p className="text-indigo-700 font-medium">"Can a tuple contain a mutable object like a list, and what happens if you mutate that list?"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Core Capabilities</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered for Realistic Practice
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Everything you need to transform interview anxiety into confident, structured performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-white hover:shadow-md hover:border-indigo-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base mb-1.5">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Simple Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How InterviewAI Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Create Profile', desc: 'Select your target role, education, and technical experience.' },
              { step: '02', title: 'Upload Resume', desc: 'Optionally supply your resume text for targeted project questions.' },
              { step: '03', title: 'Configure Session', desc: 'Choose category, difficulty, duration, and interviewer personality.' },
              { step: '04', title: 'Practice Live', desc: 'Answer one question at a time via text, code editor, or voice.' },
              { step: '05', title: 'Get Study Plan', desc: 'Receive transparent rubric scores and a personalized learning roadmap.' },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-center"
              >
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold mb-3">
                  {s.step}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Categories */}
      <section id="interview-types" className="py-16 sm:py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Domains Covered</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Practice Across Key Industry Roles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  onClick={onStartDemo}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-indigo-500 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{c.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onStartDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Your First Interview Session</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-white font-bold text-base">InterviewAI</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <button onClick={() => scrollToSection('features')} className="hover:text-white transition">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition">
                How It Works
              </button>
              <button onClick={() => scrollToSection('interview-types')} className="hover:text-white transition">
                Categories
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Practice guidelines only • Not an employment guarantee</span>
            </div>

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} InterviewAI. Personal AI Interview Coach.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
