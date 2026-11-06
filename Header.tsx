import React from 'react';
import { Globe, PlusCircle, Check, RefreshCw } from 'lucide-react';
import { AppLanguage, SongProject } from '../types';
import { getT } from '../translations';

interface HeaderProps {
  currentProject: SongProject;
  projects: SongProject[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onNewProject,
  language,
  setLanguage,
  saveStatus,
}) => {
  const t = getT(language);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              {t.currentProject}:
            </span>
            <select
              value={currentProject?.id || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-slate-800/90 text-slate-100 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-cyan-500 max-w-[150px] sm:max-w-[220px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Save indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              <span className="hidden sm:inline">{t.saving}</span>
            </>
          ) : (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">{t.saved}</span>
            </>
          )}
        </div>

        {/* New Project Button */}
        <button
          onClick={onNewProject}
          title={t.newProject}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.newProject}</span>
        </button>

        {/* Language selector toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
