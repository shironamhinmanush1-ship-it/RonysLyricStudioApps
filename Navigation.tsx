import React, { useState } from 'react';
import {
  LayoutDashboard,
  Music,
  PenTool,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  Mic,
  Disc3,
  Video,
  FolderKanban,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab, AppLanguage } from '../types';
import { getT } from '../translations';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
  projectName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  language,
}) => {
  const t = getT(language);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard, badge: null },
    { id: 'lyrics' as ActiveTab, label: t.lyricsStudio, icon: PenTool, badge: 'Core' },
    { id: 'songwriting' as ActiveTab, label: t.songwriting, icon: Sparkles, badge: 'AI' },
    { id: 'stylebox' as ActiveTab, label: t.styleBox, icon: Sliders, badge: 'Suno/Udio' },
    { id: 'prompts' as ActiveTab, label: t.promptStudio, icon: Music, badge: 'Prompt' },
    { id: 'thumbnail' as ActiveTab, label: t.thumbnail, icon: ImageIcon, badge: '16:9' },
    { id: 'voice' as ActiveTab, label: t.voice, icon: Mic, badge: 'TTS' },
    { id: 'music' as ActiveTab, label: t.music, icon: Disc3, badge: 'Status' },
    { id: 'video' as ActiveTab, label: t.video, icon: Video, badge: 'Phase 2' },
    { id: 'projects' as ActiveTab, label: t.projects, icon: FolderKanban, badge: null },
    { id: 'settings' as ActiveTab, label: t.settings, icon: Settings, badge: null },
  ];

  // Mobile quick bottom items (top 4 most used + "More" drawer)
  const mobileQuickItems = [
    { id: 'dashboard' as ActiveTab, label: t.dashboard, icon: LayoutDashboard },
    { id: 'lyrics' as ActiveTab, label: language === 'bn' ? 'লিরিক্স' : 'Lyrics', icon: PenTool },
    { id: 'songwriting' as ActiveTab, label: language === 'bn' ? 'সহকারী' : 'Assist', icon: Sparkles },
    { id: 'stylebox' as ActiveTab, label: language === 'bn' ? 'স্টাইল' : 'Style', icon: Sliders },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/95 border-r border-slate-800 text-slate-200 h-screen sticky top-0 shrink-0 z-20 backdrop-blur">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide text-white">
              LyricCraft
            </h1>
            <p className="text-xs text-cyan-400 font-medium">
              {language === 'bn' ? 'এআই মিউজিক স্টুডিও' : 'AI Creative Studio'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 text-xs text-slate-500 text-center">
          LyricCraft Studio v1.0 • Mobile-First
        </div>
      </aside>

      {/* Mobile Drawer (All Modules) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 text-slate-200 h-full flex flex-col z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white">{t.appName}</h2>
                  <p className="text-[10px] text-cyan-400">
                    {language === 'bn' ? 'সবগুলো মডিউল' : 'All Modules'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Android Touch Optimized) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-2 py-1 safe-area-pb">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mobileQuickItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-1 font-medium tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <Menu className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-1 font-medium">
              {language === 'bn' ? 'মেনু' : 'Menu'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
