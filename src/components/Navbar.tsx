import React from 'react';
import {
  Sparkles,
  Bot,
  Play,
  User,
  Menu,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { ServerStatus } from '../services/api';
import { CandidateProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  serverStatus: ServerStatus | null;
  profile: CandidateProfile;
  onToggleMobileMenu: () => void;
  onStartDemo?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  serverStatus,
  profile,
  onToggleMobileMenu,
  onStartDemo,
  onLogout,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview & Dashboard';
      case 'wizard':
        return 'Configure Interview';
      case 'interview':
        return 'Live Mock Interview';
      case 'results':
        return 'Interview Evaluation Report';
      case 'resume':
        return 'Resume Analyzer & Skills';
      case 'qbank':
        return 'Question Bank';
      case 'analytics':
        return 'Performance Analytics';
      case 'history':
        return 'Practice History';
      case 'roadmap':
        return 'Personalized Learning Roadmap';
      case 'settings':
        return 'Settings & Profile';
      default:
        return 'AI Powered Interview Simulator';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-md no-print">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => onNavigate('overview')}
          className="flex cursor-pointer items-center gap-2 sm:gap-2.5 transition hover:opacity-90"
          title="AI Powered Interview Simulator"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 text-sm sm:text-base leading-tight">
                AI Powered Interview Simulator
              </span>
            </div>
            <p className="hidden md:block text-[10px] font-semibold text-indigo-600 tracking-wide uppercase leading-tight">
              7 Mock Rounds &bull; Real-Time 5-Q Scoring
            </p>
          </div>
        </div>

        <div className="hidden h-5 w-[1px] bg-slate-200 xl:block mx-1"></div>

        <div className="hidden xl:block">
          <h1 className="text-xs font-semibold text-slate-500">{getTabTitle(currentTab)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
            serverStatus?.hasApiKey
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
          title={
            serverStatus?.hasApiKey
              ? 'Gemini 3.8 Flash AI Connected'
              : 'Deterministic Demo Mode Active (No API Key Required)'
          }
        >
          {serverStatus?.hasApiKey ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini AI Connected</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Demo Mode Active</span>
            </>
          )}
        </div>

        {/* Try Demo Interview CTA */}
        {onStartDemo && currentTab !== 'interview' && (
          <button
            onClick={onStartDemo}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition active:scale-95 cursor-pointer shadow-2xs"
            title="Launch 5-question Python Fresher mock interview instantly"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Try Demo Interview</span>
          </button>
        )}

        {/* Start Interview CTA */}
        {currentTab !== 'interview' && currentTab !== 'wizard' && (
          <button
            onClick={() => onNavigate('wizard')}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Interview</span>
          </button>
        )}

        {/* Profile Pill */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2 pr-3 text-left transition hover:border-slate-300 hover:bg-slate-100"
          title={`Signed in as ${profile.displayName}`}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
            {profile.displayName.charAt(0)}
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-700 truncate max-w-[100px]">
            {profile.displayName}
          </span>
        </button>

        {/* Logout / Switch User */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Switch Candidate / Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
