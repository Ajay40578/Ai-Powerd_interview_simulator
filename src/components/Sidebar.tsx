import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  FileText,
  HelpCircle,
  BarChart3,
  History,
  Compass,
  Settings,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  hasActiveInterview?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  hasActiveInterview = false,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'wizard', label: 'Start Interview', icon: PlayCircle, badge: hasActiveInterview ? 'In Progress' : undefined },
    { id: 'resume', label: 'My Resume', icon: FileText },
    { id: 'qbank', label: 'Question Bank', icon: HelpCircle },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'history', label: 'Interview History', icon: History },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-3">
      <div className="space-y-4">
        {/* Logo and Brand in Sidebar */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          {!isCollapsed && (
            <div
              onClick={() => handleSelect('landing')}
              className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
              title="AI Powered Interview Simulator"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Bot className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-slate-900 tracking-tight text-xs block">
                  AI Powered
                </span>
                <span className="font-bold text-indigo-600 text-[11px] block">
                  Interview Simulator
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white cursor-pointer"
              title="AI Powered Interview Simulator"
              onClick={() => handleSelect('overview')}
            >
              <Bot className="h-4 w-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Landing link */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <button
          onClick={() => handleSelect('landing')}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          title={isCollapsed ? 'Landing Page' : undefined}
        >
          <Globe className="h-4 w-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Landing Page</span>}
        </button>

        {!isCollapsed && (
          <div className="rounded-xl bg-slate-50 p-2.5 text-center text-[11px] text-slate-500 border border-slate-200">
            <p className="font-semibold text-slate-700">InterviewAI Coach</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Practice Smarter. Interview Better.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out shrink-0 no-print ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden no-print"
          onClick={onCloseMobile}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
