import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
  Code,
  Layers,
  Users,
  Award,
} from 'lucide-react';
import { AuthUser, CandidateProfile } from '../types';
import { StorageService } from '../services/storage';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onQuickDemoStart?: () => void;
  serverStatus?: { hasApiKey: boolean; model: string } | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onQuickDemoStart,
  serverStatus,
}) => {
  const currentProfile = StorageService.getProfile();

  const [name, setName] = useState(currentProfile.displayName || 'Alex Morgan');
  const [email, setEmail] = useState(currentProfile.email || 'alex.morgan@university.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState(currentProfile.targetRole || 'Python Developer');
  const [experienceLevel, setExperienceLevel] = useState<'Fresher' | 'Junior' | 'Mid-Level' | 'Senior'>(
    (currentProfile.experienceLevel as any) || 'Fresher'
  );
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const user = StorageService.loginUser({
        name: name.trim() || 'Alex Morgan',
        email: email.trim() || 'candidate@simulator.ai',
        role: role.trim() || 'Python Developer',
        experienceLevel,
      });
      setIsSubmitting(false);
      onLoginSuccess(user);
    }, 200);
  };

  const handleSelectDemoPersona = (
    personaName: string,
    personaEmail: string,
    personaRole: string,
    personaExp: 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior'
  ) => {
    setName(personaName);
    setEmail(personaEmail);
    setRole(personaRole);
    setExperienceLevel(personaExp);

    const user = StorageService.loginUser({
      name: personaName,
      email: personaEmail,
      role: personaRole,
      experienceLevel: personaExp,
    });
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="relative z-10 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">
                AI Powered Interview Simulator
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                <Sparkles className="h-2.5 w-2.5" /> Hackathon Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Adaptive Multi-Round Mock Interviews & Real-time Scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {serverStatus?.hasApiKey ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Gemini Live AI Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 px-2.5 py-1 text-xs font-medium text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Demo Engine Ready
            </span>
          )}

          {onQuickDemoStart && (
            <button
              onClick={onQuickDemoStart}
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm hover:shadow-indigo-500/20"
            >
              <Zap className="h-3.5 w-3.5" /> Quick Demo
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14">
        {/* Left Column: Branding, Value Proposition, Supported Rounds */}
        <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 px-3.5 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Official Candidate Portal & Live Test Environment</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Master Every Round with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                AI Powered Interview Simulator
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Experience authentic technical and behavioral mock interviews with strict 5-question scoring (+20 points for each correct answer, 0 for wrong), adaptive follow-up questions, and weekly scorecard analysis.
            </p>
          </div>

          {/* Supported Interview Rounds Pill Grid */}
          <div className="space-y-2.5 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" /> 7 Dedicated Interview Rounds Available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Users className="h-3 w-3" /> Round 1
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">HR & Screening</div>
                <div className="text-[10px] text-slate-400">Culture & background</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
                  <Terminal className="h-3 w-3" /> Round 2
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">Technical Core</div>
                <div className="text-[10px] text-slate-400">Language internals</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <Zap className="h-3 w-3" /> Round 3
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">DSA & Logic</div>
                <div className="text-[10px] text-slate-400">Algorithms & Big-O</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <Code className="h-3 w-3" /> Round 4
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">Machine Coding</div>
                <div className="text-[10px] text-slate-400">Modular clean code</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
                  <Layers className="h-3 w-3" /> Round 5
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">System Design</div>
                <div className="text-[10px] text-slate-400">Scalability & cache</div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-850/80 p-2.5 text-left bg-slate-800/40 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                  <Award className="h-3 w-3" /> Round 6
                </div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">Behavioral STAR</div>
                <div className="text-[10px] text-slate-400">Leadership & ownership</div>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas (1-click presentation entry) */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-center lg:justify-start gap-1.5">
              <span>⚡ Quick Presentation Personas (1-Click Login):</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() =>
                  handleSelectDemoPersona(
                    'Alex Morgan',
                    'alex.morgan@university.edu',
                    'Python Developer',
                    'Fresher'
                  )
                }
                className="rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 px-3 py-1.5 text-xs text-indigo-200 font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Alex Morgan (Fresher / Python)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectDemoPersona(
                    'Priya Sharma',
                    'priya.sharma@engineer.io',
                    'Frontend Engineer',
                    'Junior'
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Priya Sharma (Junior / Frontend)
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectDemoPersona(
                    'David Miller',
                    'david.miller@cloudarch.com',
                    'Backend & System Architect',
                    'Mid-Level'
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                David Miller (Backend Architect)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Sign In Card */}
        <div className="w-full lg:w-[440px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-850/95 bg-slate-800/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" /> Candidate Authentication
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Simulator</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or customize your candidate profile to begin.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Target Role & Experience Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Role
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Python Developer"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-2.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Experience Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-2.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Fresher">Fresher (0 yrs)</option>
                      <option value="Junior">Junior (1-2 yrs)</option>
                      <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                      <option value="Senior">Senior (5+ yrs)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@simulator.ai"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password / Key</label>
                  <span className="text-[11px] text-indigo-400">Default: Demo Access</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Save session state in browser</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>Logging in...</>
                ) : (
                  <>
                    <span>Enter AI Interview Simulator</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest Login alternative */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() =>
                  handleSelectDemoPersona(
                    'Alex Morgan',
                    'alex.morgan@university.edu',
                    'Python Developer',
                    'Fresher'
                  )
                }
                className="text-xs text-slate-400 hover:text-indigo-300 font-medium transition cursor-pointer underline underline-offset-4"
              >
                Instant Guest Login (Skip form and enter immediately)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">AI Powered Interview Simulator</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>7 Interview Rounds</span>
          <span>&bull;</span>
          <span>5-Question Evaluation</span>
          <span>&bull;</span>
          <span>Weekly Scorecards</span>
        </div>
      </footer>
    </div>
  );
};
