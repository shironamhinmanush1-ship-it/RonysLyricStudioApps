import { ApiStatus } from '../types';

export async function checkServerStatus(): Promise<ApiStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err: any) {
    return {
      status: 'offline',
      hasGeminiKey: false,
      services: {
        lyricsStudio: false,
        songwritingAssistant: false,
        styleBoxGenerator: false,
        promptStudio: false,
        ttsNarration: false,
        imageGeneration: false,
        musicAudioGeneration: false,
        videoStudio: 'phase_two_prepared',
      },
      version: '1.0.0',
    };
  }
}

export async function generateLyricsApi(payload: {
  topic: string;
  genre: string;
  mood: string;
  language?: string;
  structure?: string;
  additionalNotes?: string;
  existingLyrics?: string;
  action?: 'create' | 'rewrite_line' | 'improve_meter' | 'rhyme_suggest';
  selectedLine?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/lyrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate lyrics');
  }
  return data.text;
}

export async function songwritingAssistApi(payload: {
  type: 'concept' | 'hook' | 'rhyme' | 'proofread' | 'structure';
  input: string;
  context?: string;
  genre?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/songwriting-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Songwriting assistance failed');
  }
  return data.text;
}

export async function generateStyleBoxApi(payload: {
  genre: string;
  mood: string;
  vocal: string;
  instruments: string;
  tempo: string;
  theme: string;
  negativeConstraints: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/style-box', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Style box generation failed');
  }
  return data.text;
}

export async function generatePromptStudioApi(payload: {
  category: string;
  title: string;
  details: string;
  camera?: string;
  lighting?: string;
  style?: string;
  aspectRatio?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/prompt-studio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Prompt generation failed');
  }
  return data.text;
}

export async function synthesizeVoiceApi(payload: {
  text: string;
  voice?: string;
  style?: string;
}): Promise<{ audioUrl: string }> {
  const res = await fetch('/api/gemini/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Speech synthesis failed');
  }
  return data;
}

export async function generateImageApi(payload: {
  prompt: string;
  aspectRatio?: string;
  imageBase64?: string | null;
}): Promise<{ imageUrl: string }> {
  const res = await fetch('/api/gemini/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Image generation failed');
  }
  return data;
}
