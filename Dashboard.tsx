import React from 'react';
import {
  PenTool,
  Sliders,
  Sparkles,
  Music,
  ImageIcon,
  Mic,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';

interface DashboardProps {
  currentProject: SongProject;
  projects: SongProject[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectProject: (id: string) => void;
  language: AppLanguage;
  hasGeminiKey: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentProject,
  projects,
  setActiveTab,
  onSelectProject,
  language,
  hasGeminiKey,
}) => {
  const t = getT(language);

  // Calculate quick stats
  const totalProjects = projects.length;
  const totalLyricsLines = projects.reduce((acc, p) => {
    return acc + (p.lyrics?.rawText ? p.lyrics.rawText.split('\n').filter(Boolean).length : 0);
  }, 0);
  const totalPrompts = projects.reduce((acc, p) => acc + (p.prompts?.length || 0), 0);

  const quickActions = [
    {
      title: t.writeNewSong,
      desc: language === 'bn' ? 'লিরিক্স লিখুন, অন্তরা-স্থায়ী সাজান ও সুর মেলান' : 'Craft original lyrics, verse-chorus, and rhyme',
      icon: PenTool,
      tab: 'lyrics' as ActiveTab,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: t.createStylePrompt,
      desc: language === 'bn' ? 'Suno/Udio এর জন্য মাস্টার সাউন্ড ও স্টাইল বক্স' : 'Master audio style prompts for Suno and Udio',
      icon: Sliders,
      tab: 'stylebox' as ActiveTab,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: t.generateAIPrompt,
      desc: language === 'bn' ? 'Runway, Luma ও সিনেমাটিক ভিডিও প্রম্পট' : 'Elite cinematic prompts for video & visuals',
      icon: Music,
      tab: 'prompts' as ActiveTab,
      color: 'from-fuchsia-500 to-pink-600',
    },
    {
      title: t.designThumbnail,
      desc: language === 'bn' ? '১৬:৯ ইউটিউব থাম্বনেইল ও আর্ট বিল্ডার' : '16:9 YouTube thumbnail layout & artwork',
      icon: ImageIcon,
      tab: 'thumbnail' as ActiveTab,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: t.voiceStudioTitle,
      desc: language === 'bn' ? 'বাংলা ভয়েসওভার ও জেমিনি টিটিএস অডিও' : 'Bengali narration scripts & Gemini TTS audio',
      icon: Mic,
      tab: 'voice' as ActiveTab,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: t.videoStudioTitle,
      desc: language === 'bn' ? 'লিরিক ভিডিও ওভারলে ও টাইমলাইন সিঙ্ক' : 'Lyric video overlay and timeline synchronization',
      icon: Video,
      tab: 'video' as ActiveTab,
      color: 'from-rose-500 to-red-600',
    },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Hero Studio Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 border border-slate-700/80 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রফেশনাল বাংলা এআই স্টুডিও' : 'AI Creative Music Studio'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.appName}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t.tagline}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setActiveTab('lyrics')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>{t.writeNewSong}</span>
            </button>
            <button
              onClick={() => setActiveTab('stylebox')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{t.createStylePrompt}</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">{t.totalProjects}</p>
          <p className="text-2xl font-bold text-white mt-1">{totalProjects}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">{t.lyricsCount}</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{totalLyricsLines} <span className="text-xs font-normal text-slate-400">lines</span></p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">{t.promptsCount}</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{totalPrompts}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400">{t.aiStatus}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-sm font-semibold text-white">
              {hasGeminiKey ? (language === 'bn' ? 'সক্রিয় (Active)' : 'Active') : 'Configure'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
          <span>{t.quickActions}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(action.tab)}
                className="group relative flex items-start gap-4 p-4 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 hover:border-slate-700 transition-all text-left shadow-sm hover:shadow-md"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {action.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Project Quick Card */}
      {currentProject && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                {language === 'bn' ? 'বর্তমানে কাজ চলছে' : 'Working On'}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {currentProject.title}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('lyrics')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              {language === 'bn' ? 'লিরিক্স এডিটর খুলুন' : 'Open Lyrics Studio'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-500">{t.genreLabel}: </span>
              <span className="font-medium text-slate-200">{currentProject.genre || 'Bengali Soft Rock'}</span>
            </div>
            <div>
              <span className="text-slate-500">{t.moodLabel}: </span>
              <span className="font-medium text-slate-200">{currentProject.mood || 'Melancholic'}</span>
            </div>
            <div>
              <span className="text-slate-500">{t.language}: </span>
              <span className="font-medium text-slate-200">{currentProject.language || 'Bengali'}</span>
            </div>
          </div>

          {currentProject.lyrics?.rawText && (
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin">
              {currentProject.lyrics.rawText.slice(0, 350)}...
            </div>
          )}
        </div>
      )}

      {/* Recent Projects List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{t.recentProjects}</span>
          </h2>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {language === 'bn' ? 'সবগুলো দেখুন →' : 'View All →'}
          </button>
        </div>

        <div className="space-y-2">
          {projects.slice(0, 4).map((p) => {
            const isSelected = p.id === currentProject?.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/70 border-slate-800 hover:bg-slate-850/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white truncate">{p.title}</h4>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'bn' ? 'বর্তমান' : 'Active'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {p.genre} • {p.mood}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-500">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
