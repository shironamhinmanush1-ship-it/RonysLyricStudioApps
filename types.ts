/**
 * LyricCraft Studio Types
 */

export type AppLanguage = 'bn' | 'en';

export type ActiveTab =
  | 'dashboard'
  | 'lyrics'
  | 'songwriting'
  | 'stylebox'
  | 'prompts'
  | 'thumbnail'
  | 'voice'
  | 'music'
  | 'video'
  | 'projects'
  | 'settings';

export interface LyricSection {
  id: string;
  type: 'intro' | 'verse' | 'pre_chorus' | 'chorus' | 'bridge' | 'outro' | 'custom';
  title: string;
  lines: string[];
}

export interface SongProject {
  id: string;
  title: string;
  description?: string;
  genre: string;
  mood: string;
  language: string;
  createdAt: number;
  updatedAt: number;
  lyrics: {
    rawText: string;
    sections: LyricSection[];
  };
  styleBox?: {
    genre: string;
    mood: string;
    vocal: string;
    instruments: string;
    tempo: string;
    theme: string;
    negativeConstraints: string;
    generatedOutput: string;
  };
  prompts?: {
    category: string;
    promptText: string;
    negativePrompt?: string;
    notes?: string;
    createdAt: number;
  }[];
  thumbnail?: {
    title: string;
    subtitle: string;
    artist: string;
    bgColor1: string;
    bgColor2: string;
    textColor: string;
    badgeText?: string;
    aspectRatio: '16:9' | '9:16' | '1:1';
    imageUrl?: string;
  };
  voiceScript?: {
    script: string;
    voice: string;
    style: string;
    audioUrl?: string;
  };
  videoSync?: {
    aspectRatio: '16:9' | '9:16' | '1:1';
    bgType: 'gradient' | 'image' | 'dark';
    bgUrl?: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    textShadow: boolean;
    cues: {
      timeSec: number;
      text: string;
    }[];
  };
}

export interface ApiStatus {
  status: string;
  hasGeminiKey: boolean;
  services: {
    lyricsStudio: boolean;
    songwritingAssistant: boolean;
    styleBoxGenerator: boolean;
    promptStudio: boolean;
    ttsNarration: boolean;
    imageGeneration: boolean;
    musicAudioGeneration: boolean;
    videoStudio: string;
  };
  version: string;
}
