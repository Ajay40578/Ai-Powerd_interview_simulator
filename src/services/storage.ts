import {
  CandidateProfile,
  InterviewSession,
  RoadmapTask,
  AppSettings,
  QuestionBankItem,
  AuthUser,
} from '../types';

const STORAGE_KEYS = {
  AUTH: 'interviewai_auth_v1',
  PROFILE: 'interviewai_profile_v1',
  SESSIONS: 'interviewai_sessions_v1',
  ACTIVE_SESSION: 'interviewai_active_session_v1',
  ROADMAP: 'interviewai_roadmap_v1',
  SETTINGS: 'interviewai_settings_v1',
  BOOKMARKS: 'interviewai_bookmarks_v1',
  COMPLETED_QUESTIONS: 'interviewai_completed_q_v1',
};

const DEFAULT_PROFILE: CandidateProfile = {
  id: 'demo_candidate_001',
  displayName: 'Alex Morgan',
  email: 'alex.morgan@university.edu',
  educationLevel: "Bachelor's in Computer Science",
  college: 'State University',
  targetRole: 'Python Developer',
  experienceLevel: 'Fresher',
  skills: ['Python', 'SQL', 'Data Structures', 'Git', 'REST APIs'],
  preferredLanguage: 'English',
  defaultDifficulty: 'beginner',
  targetCompanies: 'Google, Amazon, Tech Startups',
  resumeContext: 'Completed hands-on coursework and academic projects in Python, SQL data querying, and basic web scraping.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  voiceInputEnabled: true,
  soundEffects: false,
  defaultDurationMinutes: 15,
  defaultQuestionCount: 5,
  defaultDifficulty: 'beginner',
};

export class StorageService {
  private static emitChange(key: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('interviewai:state_change', { detail: { key } }));
    }
  }

  // AUTHENTICATION & LOGIN STATE
  static getAuthUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (data) {
        const user = JSON.parse(data) as AuthUser;
        if (user && user.isAuthenticated) {
          return user;
        }
      }
    } catch (e) {
      console.warn('Failed to load auth user:', e);
    }
    return null;
  }

  static isLoggedIn(): boolean {
    const user = this.getAuthUser();
    return !!user && user.isAuthenticated;
  }

  static loginUser(userData: Partial<AuthUser>): AuthUser {
    const existing = this.getAuthUser();
    const currentProfile = this.getProfile();
    const user: AuthUser = {
      id: userData.id || existing?.id || `user_${Date.now()}`,
      email: userData.email || existing?.email || 'candidate@simulator.ai',
      name: userData.name || userData.role || currentProfile.displayName || 'Alex Morgan',
      role: userData.role || currentProfile.targetRole || 'Python Developer',
      experienceLevel: (userData.experienceLevel || currentProfile.experienceLevel || 'Fresher') as any,
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      // Also sync profile name and targetRole
      if (userData.name || userData.role || userData.experienceLevel) {
        this.saveProfile({
          ...currentProfile,
          displayName: user.name,
          email: user.email,
          targetRole: user.role,
          experienceLevel: user.experienceLevel,
        });
      }
      this.emitChange('auth');
    } catch (e) {
      console.error('Failed to save auth state:', e);
    }
    return user;
  }

  static logoutUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      this.emitChange('auth');
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  }

  // PROFILE
  static getProfile(): CandidateProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: CandidateProfile): boolean {
    try {
      const updated = { ...profile, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      this.emitChange('profile');
      return true;
    } catch (e) {
      console.error('Failed to save profile:', e);
      return false;
    }
  }

  // SESSIONS
  static getSessions(): InterviewSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse sessions from storage:', e);
    }
    return [];
  }

  static getSessionById(id: string): InterviewSession | null {
    const sessions = this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  static saveSession(session: InterviewSession): boolean {
    try {
      const sessions = this.getSessions();
      const existingIdx = sessions.findIndex((s) => s.id === session.id);
      if (existingIdx >= 0) {
        sessions[existingIdx] = session;
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

      // Also update active session if currently in progress
      if (session.status === 'in_progress' || session.status === 'paused' || session.status === 'evaluating') {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }

      this.emitChange('sessions');
      return true;
    } catch (e) {
      console.error('Failed to save session:', e);
      return false;
    }
  }

  static getActiveSession(): InterviewSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse active session:', e);
    }
    return null;
  }

  static clearActiveSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      this.emitChange('active_session');
    } catch (e) {
      console.warn(e);
    }
  }

  static deleteSession(id: string): boolean {
    try {
      const sessions = this.getSessions().filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      const active = this.getActiveSession();
      if (active && active.id === id) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
      this.emitChange('sessions');
      return true;
    } catch (e) {
      console.error('Failed to delete session:', e);
      return false;
    }
  }

  static clearAllSessions(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      this.emitChange('sessions');
      return true;
    } catch (e) {
      console.error('Failed to clear sessions:', e);
      return false;
    }
  }

  // ROADMAP
  static getRoadmap(): RoadmapTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROADMAP);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'task_01',
        skill: 'Python Internals & Memory Model',
        whyItMatters: 'Top differentiator in Python developer interviews; explains list vs tuple and GIL.',
        priority: 'high',
        task: 'Study how Python handles mutable vs immutable types and implement custom dict lookup.',
        estimatedEffort: '1.5 hours',
        completed: false,
        relatedQuestions: ['Explain the internal hashing mechanism of a Python dictionary.'],
      },
      {
        id: 'task_02',
        skill: 'SQL Joins & Grouping',
        whyItMatters: 'Essential for data querying and backend interview assessments.',
        priority: 'high',
        task: 'Practice 5 medium SQL problems featuring LEFT JOIN, GROUP BY, and HAVING clauses.',
        estimatedEffort: '2 hours',
        completed: false,
        relatedQuestions: ['What is the difference between WHERE and HAVING in SQL?'],
      },
      {
        id: 'task_03',
        skill: 'STAR Behavioral Framework',
        whyItMatters: 'Structured answers to "Tell me about a challenge you overcame" prevent rambling.',
        priority: 'medium',
        task: 'Draft 3 bulleted project stories using Situation, Task, Action, and Result.',
        estimatedEffort: '1 hour',
        completed: false,
        relatedQuestions: ['Describe a time you solved a difficult technical bug.'],
      },
    ];
  }

  static saveRoadmap(tasks: RoadmapTask[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(tasks));
      this.emitChange('roadmap');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static toggleRoadmapTask(id: string): boolean {
    const tasks = this.getRoadmap();
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      return this.saveRoadmap(tasks);
    }
    return false;
  }

  // BOOKMARKS & QUESTION BANK COMPLETION
  static getBookmarkedQuestionIds(): Set<string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch (e) {
      console.warn(e);
    }
    return new Set();
  }

  static toggleBookmark(questionId: string): boolean {
    try {
      const bookmarks = this.getBookmarkedQuestionIds();
      if (bookmarks.has(questionId)) {
        bookmarks.delete(questionId);
      } else {
        bookmarks.add(questionId);
      }
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(Array.from(bookmarks)));
      this.emitChange('bookmarks');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static getCompletedQuestionIds(): Set<string> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_QUESTIONS);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch (e) {
      console.warn(e);
    }
    return new Set();
  }

  static markQuestionCompleted(questionId: string, completed = true): boolean {
    try {
      const completedSet = this.getCompletedQuestionIds();
      if (completed) {
        completedSet.add(questionId);
      } else {
        completedSet.delete(questionId);
      }
      localStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTIONS, JSON.stringify(Array.from(completedSet)));
      this.emitChange('completed_questions');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // SETTINGS
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: AppSettings): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      this.emitChange('settings');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // BACKUP & RESTORE
  static exportDataJSON(): string {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      sessions: this.getSessions(),
      roadmap: this.getRoadmap(),
      bookmarks: Array.from(this.getBookmarkedQuestionIds()),
      completedQuestions: Array.from(this.getCompletedQuestionIds()),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importDataJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.profile));
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(parsed.sessions));
      }
      if (parsed.roadmap && Array.isArray(parsed.roadmap)) {
        localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(parsed.roadmap));
      }
      if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(parsed.bookmarks));
      }
      if (parsed.completedQuestions && Array.isArray(parsed.completedQuestions)) {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTIONS, JSON.stringify(parsed.completedQuestions));
      }
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));

      this.emitChange('import');
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  }

  static resetAllData(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP);
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
      localStorage.removeItem(STORAGE_KEYS.COMPLETED_QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      this.emitChange('reset');
      return true;
    } catch (e) {
      console.error('Failed to reset data:', e);
      return false;
    }
  }
}
