import React, { useState, useEffect } from 'react';
import {
  CandidateProfile,
  Difficulty,
  InterviewCategory,
  InterviewConfig,
  InterviewQuestion,
  InterviewSession,
  AppSettings,
  QuestionBankItem,
} from './types';
import { StorageService } from './services/storage';
import { ApiService, ServerStatus } from './services/api';
import { PYTHON_FRESHER_QUESTIONS } from './services/demoEngine';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewWizard } from './components/InterviewWizard';
import { InterviewRoom } from './components/InterviewRoom';
import { InterviewResults } from './components/InterviewResults';
import { ResumeAnalyzer } from './components/ResumeAnalyzer';
import { QuestionBankView } from './components/QuestionBankView';
import { AnalyticsView } from './components/AnalyticsView';
import { RoadmapView } from './components/RoadmapView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    StorageService.isLoggedIn()
  );
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(() =>
    StorageService.getActiveSession()
  );
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const active = StorageService.getActiveSession();
    if (active && (active.status === 'in_progress' || active.status === 'evaluating')) {
      return 'interview';
    }
    return 'overview';
  });
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  // Authoritative persistent state
  const [profile, setProfile] = useState<CandidateProfile>(() => StorageService.getProfile());
  const [sessions, setSessions] = useState<InterviewSession[]>(() => StorageService.getSessions());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  const [selectedResultSession, setSelectedResultSession] = useState<InterviewSession | null>(null);

  // Wizard pre-config
  const [wizardCategory, setWizardCategory] = useState<InterviewCategory | undefined>(undefined);

  // Responsive UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Check backend server status on mount
  useEffect(() => {
    ApiService.checkStatus().then((status) => {
      setServerStatus(status);
    });
  }, []);

  // Sync state on storage events
  useEffect(() => {
    const handleStorageChange = () => {
      setProfile(StorageService.getProfile());
      setSessions(StorageService.getSessions());
      setSettings(StorageService.getSettings());
      setActiveSession(StorageService.getActiveSession());
    };

    window.addEventListener('interviewai:state_change', handleStorageChange);
    return () => window.removeEventListener('interviewai:state_change', handleStorageChange);
  }, []);

  // 1-Click Launch Python Fresher Demo Interview (Zero setup required for presenter)
  const handleStartQuickDemo = () => {
    const demoConfig: InterviewConfig = {
      category: 'Technical',
      targetRole: 'Python Developer',
      difficulty: 'beginner',
      durationMinutes: 15,
      questionLimit: 5,
      mode: 'text',
      interviewStyle: 'coach',
      language: 'English',
      roundType: 'technical_core',
      roundTitle: 'Round 2: Technical & Core Fundamentals',
    };
    const newSession: InterviewSession = {
      id: `session_demo_${Date.now()}`,
      createdAt: new Date().toISOString(),
      config: demoConfig,
      questions: [PYTHON_FRESHER_QUESTIONS[0]],
      currentQuestionIndex: 0,
      status: 'in_progress',
      durationSeconds: 0,
      timeRemainingSeconds: 15 * 60,
      completedQuestionCount: 0,
      evaluationMode: 'demo',
      roundType: 'technical_core',
      roundTitle: 'Round 2: Technical & Core Fundamentals',
      answers: {},
    };
    StorageService.saveSession(newSession);
    setActiveSession(newSession);
    setCurrentTab('interview');
  };

  // Launch interview from wizard
  const handleLaunchInterview = async (config: InterviewConfig) => {
    // 1. Generate or load first question
    const { question, mode } = await ApiService.generateQuestion({
      category: config.category,
      targetRole: config.targetRole,
      difficulty: config.difficulty,
      questionNumber: 1,
      totalQuestions: config.questionLimit,
      candidateProfile: profile,
      previousQuestions: [],
      roundType: config.roundType,
      roundTitle: config.roundTitle,
    });

    const newSession: InterviewSession = {
      id: `session_${Date.now()}`,
      createdAt: new Date().toISOString(),
      config,
      questions: [question],
      currentQuestionIndex: 0,
      status: 'in_progress',
      durationSeconds: 0,
      timeRemainingSeconds: config.durationMinutes * 60,
      completedQuestionCount: 0,
      evaluationMode: mode,
      roundType: config.roundType,
      roundTitle: config.roundTitle,
      answers: {},
    };

    StorageService.saveSession(newSession);
    setActiveSession(newSession);
    setCurrentTab('interview');
  };

  // Launch interview with a pre-selected question (from Question Bank or Resume Analyzer)
  const handleLaunchSpecificQuestion = (questionText: string, categoryName: string) => {
    const matchedCategory: InterviewCategory =
      categoryName === 'HR / Behavioral'
        ? 'HR / Behavioral'
        : categoryName === 'SQL / DBMS'
        ? 'SQL / DBMS'
        : categoryName === 'Frontend'
        ? 'Frontend'
        : categoryName === 'DSA'
        ? 'DSA'
        : categoryName === 'AI / Machine Learning'
        ? 'AI / Machine Learning'
        : 'Technical';

    const customQ: InterviewQuestion = {
      id: `custom_q_${Date.now()}`,
      text: questionText,
      category: matchedCategory,
      skill: profile.targetRole,
      difficulty: profile.defaultDifficulty || 'beginner',
      type: matchedCategory === 'HR / Behavioral' ? 'behavioral' : 'conceptual',
      source: 'ai',
      expectedCompetencies: ['Clear technical reasoning', 'Concrete examples', 'Structured answer'],
    };

    const config: InterviewConfig = {
      category: matchedCategory,
      targetRole: profile.targetRole,
      difficulty: profile.defaultDifficulty || 'beginner',
      durationMinutes: 10,
      questionLimit: 3,
      mode: 'text',
      interviewStyle: 'coach',
      language: 'English',
    };

    const newSession: InterviewSession = {
      id: `session_q_${Date.now()}`,
      createdAt: new Date().toISOString(),
      config,
      questions: [customQ],
      currentQuestionIndex: 0,
      status: 'in_progress',
      durationSeconds: 0,
      timeRemainingSeconds: 10 * 60,
      completedQuestionCount: 0,
      evaluationMode: serverStatus?.hasApiKey ? 'ai' : 'demo',
      answers: {},
    };

    StorageService.saveSession(newSession);
    setActiveSession(newSession);
    setCurrentTab('interview');
  };

  // Interview Session Completed callback
  const handleSessionComplete = (completedSession: InterviewSession) => {
    setActiveSession(null);
    setSelectedResultSession(completedSession);
    setCurrentTab('results');
  };

  // Navigate helper
  const handleNavigate = (tab: string, extraData?: any) => {
    if (tab === 'wizard' && extraData?.category) {
      setWizardCategory(extraData.category);
    } else {
      setWizardCategory(undefined);
    }
    setCurrentTab(tab);
  };

  // Review a specific session in the Results tab
  const handleReviewSession = (session: InterviewSession) => {
    setSelectedResultSession(session);
    setCurrentTab('results');
  };

  // Retry an interview
  const handleRetrySession = () => {
    if (selectedResultSession) {
      handleLaunchInterview(selectedResultSession.config);
    } else {
      setCurrentTab('wizard');
    }
  };

  // Logout callback
  const handleLogout = () => {
    StorageService.logoutUser();
    setIsAuthenticated(false);
  };

  // Requirement: Starting page is login page
  if (!isAuthenticated) {
    return (
      <LoginPage
        serverStatus={serverStatus}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setProfile(StorageService.getProfile());
          const active = StorageService.getActiveSession();
          if (active && (active.status === 'in_progress' || active.status === 'evaluating')) {
            setCurrentTab('interview');
          } else {
            setCurrentTab('overview');
          }
        }}
        onQuickDemoStart={() => {
          setIsAuthenticated(true);
          handleStartQuickDemo();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* If current tab is Landing Page, render full landing experience */}
      {currentTab === 'landing' ? (
        <LandingPage
          onStartDemo={() => {
            setWizardCategory('Technical');
            setCurrentTab('wizard');
          }}
          onEnterApp={() => setCurrentTab('overview')}
        />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onNavigate={(tab) => handleNavigate(tab)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            hasActiveInterview={!!activeSession && activeSession.status === 'in_progress'}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Top Navigation */}
            <Navbar
              currentTab={currentTab}
              onNavigate={(tab) => handleNavigate(tab)}
              serverStatus={serverStatus}
              profile={profile}
              onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
              onStartDemo={handleStartQuickDemo}
              onLogout={handleLogout}
            />

            {/* Page Views Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {currentTab === 'overview' && (
                <Dashboard
                  profile={profile}
                  sessions={sessions}
                  activeSession={activeSession}
                  onNavigate={handleNavigate}
                  onReviewSession={handleReviewSession}
                  onResumeActiveSession={() => setCurrentTab('interview')}
                  onDiscardActiveSession={() => {
                    StorageService.clearActiveSession();
                    setActiveSession(null);
                  }}
                  onStartDemo={handleStartQuickDemo}
                />
              )}

              {currentTab === 'wizard' && (
                <InterviewWizard
                  profile={profile}
                  initialCategory={wizardCategory}
                  onLaunchInterview={handleLaunchInterview}
                  onCancel={() => setCurrentTab('overview')}
                />
              )}

              {currentTab === 'interview' && activeSession && (
                <InterviewRoom
                  session={activeSession}
                  onSessionComplete={handleSessionComplete}
                  onExitInterview={() => {
                    StorageService.clearActiveSession();
                    setActiveSession(null);
                    setCurrentTab('overview');
                  }}
                />
              )}

              {currentTab === 'results' && selectedResultSession && (
                <InterviewResults
                  session={selectedResultSession}
                  allSessions={sessions}
                  onRetry={handleRetrySession}
                  onNavigateRoadmap={() => setCurrentTab('roadmap')}
                  onPracticeWeakAreas={(weakSkills) => {
                    setWizardCategory('Technical');
                    setCurrentTab('wizard');
                  }}
                  onReturnDashboard={() => setCurrentTab('overview')}
                />
              )}

              {currentTab === 'resume' && (
                <ResumeAnalyzer
                  onPracticeQuestion={(qText, cat) => handleLaunchSpecificQuestion(qText, cat)}
                />
              )}

              {currentTab === 'qbank' && (
                <QuestionBankView
                  onPracticeQuestion={(item: QuestionBankItem) =>
                    handleLaunchSpecificQuestion(item.text, item.category)
                  }
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView
                  sessions={sessions}
                  onStartPractice={() => setCurrentTab('wizard')}
                />
              )}

              {currentTab === 'roadmap' && (
                <RoadmapView
                  profile={profile}
                  sessions={sessions}
                  onPracticeTopic={(skill) => {
                    setWizardCategory('Technical');
                    setCurrentTab('wizard');
                  }}
                />
              )}

              {currentTab === 'history' && (
                <HistoryView
                  sessions={sessions}
                  onReviewSession={handleReviewSession}
                  onRetryCategory={(cat, role) => {
                    setWizardCategory(cat);
                    setCurrentTab('wizard');
                  }}
                  onStartNew={() => setCurrentTab('wizard')}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  profile={profile}
                  settings={settings}
                  onSaveProfile={(updatedProfile) => {
                    StorageService.saveProfile(updatedProfile);
                    setProfile(updatedProfile);
                  }}
                  onSaveSettings={(updatedSettings) => {
                    StorageService.saveSettings(updatedSettings);
                    setSettings(updatedSettings);
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
