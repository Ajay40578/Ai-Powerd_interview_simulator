import React, { useState } from 'react';
import {
  User,
  Settings,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  Save,
  Volume2,
} from 'lucide-react';
import { AppSettings, CandidateProfile } from '../types';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  profile: CandidateProfile;
  settings: AppSettings;
  onSaveProfile: (profile: CandidateProfile) => void;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile: initialProfile,
  settings: initialSettings,
  onSaveProfile,
  onSaveSettings,
}) => {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const [skillsStr, setSkillsStr] = useState<string>(
    initialProfile.skills?.join(', ') || ''
  );

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSkills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProfile: CandidateProfile = {
      ...profile,
      skills: updatedSkills,
    };

    onSaveProfile(updatedProfile);
    onSaveSettings(settings);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewai_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = StorageService.importDataJSON(text);
        if (success) {
          setImportStatus('Backup data successfully imported! Reloading profile...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setImportStatus('Failed to import data: invalid JSON structure.');
        }
      } catch (err) {
        setImportStatus('Error reading file. Ensure it is a valid InterviewAI backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Settings & Candidate Profile</h2>
        <p className="text-xs text-slate-500">
          Manage your candidate credentials, default interview configurations, and data persistence.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Profile and settings saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-xs font-semibold text-indigo-800">
          {importStatus}
        </div>
      )}

      {/* Candidate Profile Form */}
      <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Candidate Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Candidate Display Name *
            </label>
            <input
              type="text"
              required
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Role *
            </label>
            <input
              type="text"
              required
              value={profile.targetRole}
              onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={profile.experienceLevel}
              onChange={(e) =>
                setProfile({ ...profile, experienceLevel: e.target.value as any })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Fresher">Fresher / Graduate</option>
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid-Level">Mid-Level (2-5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Education Level
            </label>
            <input
              type="text"
              value={profile.educationLevel}
              onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              College / University / Organization (Optional)
            </label>
            <input
              type="text"
              value={profile.college || ''}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Companies (Optional)
            </label>
            <input
              type="text"
              value={profile.targetCompanies || ''}
              onChange={(e) => setProfile({ ...profile, targetCompanies: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. Python, SQL, REST APIs, Git, Algorithms"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Defaults & Preferences */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Default Interview Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Difficulty
              </label>
              <select
                value={settings.defaultDifficulty}
                onChange={(e) =>
                  setSettings({ ...settings, defaultDifficulty: e.target.value as any })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Duration
              </label>
              <select
                value={settings.defaultDurationMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultDurationMinutes: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Question Count
              </label>
              <select
                value={settings.defaultQuestionCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultQuestionCount: Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile & Preferences</span>
          </button>
        </div>
      </form>

      {/* Data Export / Import Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Data Management & Backup</h3>
        <p className="text-xs text-slate-500">
          Your interview sessions and learning roadmaps are saved locally in browser storage. Export a complete JSON backup to archive your progress or transfer between devices.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
            <Upload className="h-4 w-4 text-violet-600" />
            <span>Import Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Reset All Local Data</span>
          </button>
        </div>
      </div>

      {/* Privacy & Transparency */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span>AI Ethics & Privacy Disclosure</span>
        </div>
        <p className="leading-relaxed">
          InterviewAI is designed as an educational practice tool. Evaluations and readiness estimates are AI-assisted guidelines and do not represent validated hiring decisions or employment guarantees. We do not infer protected personal characteristics, honesty, or personality from voice or demographic data.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reset All Data?</h3>
            <p className="text-xs text-slate-600">
              This will erase all candidate profiles, completed interview scores, bookmarks, and roadmap tasks from this browser. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
