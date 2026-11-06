import React, { useState, useEffect } from 'react';
import { ActiveTab, AppLanguage, SongProject } from './types';
import {
  loadProjects,
  saveProjects,
  getActiveProjectId,
  setActiveProjectId,
  DEFAULT_PROJECT,
} from './services/storage';
import { checkServerStatus } from './services/api';
import { App as CapApp } from '@capacitor/app';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LyricsStudio } from './components/LyricsStudio';
import { SongwritingAssistant } from './components/SongwritingAssistant';
import { MusicStyleBox } from './components/MusicStyleBox';
import { AIPromptStudio } from './components/AIPromptStudio';
import { ThumbnailStudio } from './components/ThumbnailStudio';
import { VoiceStudio } from './components/VoiceStudio';
import { MusicGeneration } from './components/MusicGeneration';
import { VideoStudio } from './components/VideoStudio';
import { ProjectsManager } from './components/ProjectsManager';
import { SettingsStudio } from './components/SettingsStudio';

export default function App() {
  const [projects, setProjects] = useState<SongProject[]>(() => loadProjects());
  const [activeProjectId, setActiveId] = useState<string>(() => getActiveProjectId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguage] = useState<AppLanguage>('bn');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  // Sync active project
  const currentProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECT;

  // Check server API status on mount
  useEffect(() => {
    checkServerStatus().then((res) => {
      setHasGeminiKey(res.hasGeminiKey);
    });
  }, []);

  // Android hardware back button handler
  useEffect(() => {
    let listenerHandle: any = null;
    try {
      CapApp.addListener('backButton', () => {
        if (activeTab !== 'dashboard') {
          setActiveTab('dashboard');
        } else {
          CapApp.exitApp();
        }
      }).then((handle) => {
        listenerHandle = handle;
      }).catch(() => {
        // web fallback
      });
    } catch {
      // web environment
    }

    return () => {
      if (listenerHandle?.remove) {
        listenerHandle.remove();
      }
    };
  }, [activeTab]);

  // Update a project with autosave
  const handleUpdateProject = (updated: SongProject) => {
    setSaveStatus('saving');
    const updatedProjects = projects.map((p) =>
      p.id === updated.id ? { ...updated, updatedAt: Date.now() } : p
    );
    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  // Select project
  const handleSelectProject = (id: string) => {
    setActiveId(id);
    setActiveProjectId(id);
  };

  // Create new project
  const handleCreateProject = (title: string, genre: string, mood: string) => {
    const newProj: SongProject = {
      id: `proj_${Date.now()}`,
      title,
      genre,
      mood,
      language: 'Bengali',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lyrics: {
        rawText: `[স্থায়ী / Verse 1]\n\n[অন্তরা / Chorus]\n`,
        sections: [],
      },
    };

    const nextProjects = [newProj, ...projects];
    setProjects(nextProjects);
    saveProjects(nextProjects);
    handleSelectProject(newProj.id);
    setActiveTab('lyrics');
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const nextProjects = projects.filter((p) => p.id !== id);
    setProjects(nextProjects);
    saveProjects(nextProjects);
    if (activeProjectId === id) {
      handleSelectProject(nextProjects[0].id);
    }
  };

  // Duplicate project
  const handleDuplicateProject = (id: string) => {
    const source = projects.find((p) => p.id === id);
    if (!source) return;

    const copy: SongProject = {
      ...source,
      id: `proj_${Date.now()}`,
      title: `${source.title} (কপি)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextProjects = [copy, ...projects];
    setProjects(nextProjects);
    saveProjects(nextProjects);
    handleSelectProject(copy.id);
  };

  // Refresh projects from storage
  const handleRefreshProjects = () => {
    const loaded = loadProjects();
    setProjects(loaded);
    const active = getActiveProjectId();
    setActiveId(active);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar / Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        projectName={currentProject?.title}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentProject={currentProject}
          projects={projects}
          onSelectProject={handleSelectProject}
          onNewProject={() => {
            const defaultTitle = language === 'bn' ? `নতুন গান ${projects.length + 1}` : `New Song ${projects.length + 1}`;
            handleCreateProject(defaultTitle, 'Bengali Soft Rock', 'Melancholic');
          }}
          language={language}
          setLanguage={setLanguage}
          saveStatus={saveStatus}
        />

        {/* Tab Router Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              currentProject={currentProject}
              projects={projects}
              setActiveTab={setActiveTab}
              onSelectProject={handleSelectProject}
              language={language}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {activeTab === 'lyrics' && (
            <LyricsStudio
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'songwriting' && (
            <SongwritingAssistant
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'stylebox' && (
            <MusicStyleBox
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'prompts' && (
            <AIPromptStudio
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'thumbnail' && (
            <ThumbnailStudio
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'voice' && (
            <VoiceStudio
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'music' && (
            <MusicGeneration
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
              hasGeminiKey={hasGeminiKey}
            />
          )}

          {activeTab === 'video' && (
            <VideoStudio
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              currentProjectId={currentProject.id}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onDuplicateProject={handleDuplicateProject}
              onRefreshProjects={handleRefreshProjects}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsStudio
              language={language}
              setLanguage={setLanguage}
              hasGeminiKey={hasGeminiKey}
            />
          )}
        </main>
      </div>
    </div>
  );
}
