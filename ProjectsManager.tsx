import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Download,
  Upload,
  AlertCircle,
  FileMusic,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { exportProjectsJson, importProjectsJson } from '../services/storage';

interface ProjectsManagerProps {
  projects: SongProject[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (title: string, genre: string, mood: string) => void;
  onUpdateProject: (updated: SongProject) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onRefreshProjects: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onDuplicateProject,
  onRefreshProjects,
  setActiveTab,
  language,
}) => {
  const t = getT(language);

  // New project modal / inputs
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Bengali Soft Rock');
  const [newMood, setNewMood] = useState('Melancholic');

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Import error/success notification
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateProject(newTitle.trim(), newGenre, newMood);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleStartRename = (project: SongProject) => {
    setRenamingId(project.id);
    setRenameTitle(project.title);
  };

  const handleSaveRename = (project: SongProject) => {
    if (!renameTitle.trim()) return;
    onUpdateProject({
      ...project,
      title: renameTitle.trim(),
      updatedAt: Date.now(),
    });
    setRenamingId(null);
  };

  const handleExportBackup = () => {
    const jsonStr = exportProjectsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyriccraft_projects_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const success = importProjectsJson(reader.result);
        if (success) {
          onRefreshProjects();
          setImportStatus(language === 'bn' ? 'প্রজেক্ট ব্যাকআপ সফলভাবে পুনরুদ্ধার হয়েছে!' : 'Projects successfully restored!');
        } else {
          setImportStatus(language === 'bn' ? 'ভুল ফাইল ফরম্যাট। অনুগ্রহ করে বৈধ JSON ফাইল নির্বাচন করুন।' : 'Invalid JSON file format.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>{t.projectsTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'আপনার তৈরি সমস্ত গানের লিরিক্স, স্টাইল বক্স ও প্রম্পট সংরক্ষণ ও ব্যাকআপ'
              : 'Local persistence, duplicate, export, and import management'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createProjectBtn}</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{t.exportJson}</span>
            <span className="sm:hidden">JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer">
            <Upload className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">{t.importJson}</span>
            <span className="sm:hidden">Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* New Project Form Modal / Inline Box */}
      {isCreating && (
        <div className="p-5 bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
            {language === 'bn' ? 'নতুন গানের প্রজেক্ট তৈরি করুন' : 'Create New Project'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'bn' ? 'গানের শিরোনাম / নাম *' : 'Project Title *'}
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: মেঘবালিকা"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.genreLabel}
              </label>
              <select
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Bengali Soft Rock">বাংলা সফট রক (Soft Rock)</option>
                <option value="Bengali Acoustic Melodic">অ্যাকোস্টিক মেলোডি (Acoustic)</option>
                <option value="Bengali Modern Pop">আধুনিক পপ (Modern Pop)</option>
                <option value="Cinematic Ballad">সিনেমেটিক ব্যালাড (Ballad)</option>
                <option value="Folk Fusion">ফোক ফিউশন (Folk Fusion)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.moodLabel}
              </label>
              <input
                type="text"
                value={newMood}
                onChange={(e) => setNewMood(e.target.value)}
                placeholder="Melancholic, Romantic, Energetic"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-750"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs disabled:opacity-50"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const isSelected = project.id === currentProjectId;
          const lyricsLines = project.lyrics?.rawText
            ? project.lyrics.rawText.split('\n').filter(Boolean).length
            : 0;

          return (
            <div
              key={project.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                isSelected
                  ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  {renamingId === project.id ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500 rounded p-1 text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(project)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-sm text-white truncate flex-1">
                      {project.title}
                    </h3>
                  )}

                  {isSelected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  {project.genre} • {project.mood}
                </p>

                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileMusic className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lyricsLines} lines</span>
                  </span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectProject(project.id);
                    setActiveTab('lyrics');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold transition-colors"
                >
                  {language === 'bn' ? 'স্টুডিও খুলুন' : 'Open Studio'}
                </button>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleStartRename(project)}
                    className="p-1.5 hover:text-white rounded hover:bg-slate-800"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicateProject(project.id)}
                    className="p-1.5 hover:text-white rounded hover:bg-slate-800"
                    title={t.duplicateProject}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={() => setDeletingId(project.id)}
                      className="p-1.5 hover:text-red-400 rounded hover:bg-slate-800"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete confirmation inline */}
              {deletingId === project.id && (
                <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-lg space-y-2 text-xs">
                  <p className="text-red-200">{t.deleteProjectConfirm}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => {
                        onDeleteProject(project.id);
                        setDeletingId(null);
                      }}
                      className="px-2.5 py-1 rounded bg-red-600 text-white font-bold"
                    >
                      {t.confirm}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
