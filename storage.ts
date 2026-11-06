import { SongProject } from '../types';

const STORAGE_KEY = 'lyriccraft_projects_v1';
const ACTIVE_PROJECT_KEY = 'lyriccraft_active_project_id';

export const DEFAULT_PROJECT: SongProject = {
  id: 'proj_default_1',
  title: 'বৃষ্টি ভেজা নীল শহর',
  description: 'একটি বিষাদময় বাংলা সফট-রক ও মেলোডিয়াস গান',
  genre: 'Bengali Soft Rock',
  mood: 'Melancholic & Nostalgic',
  language: 'Bengali',
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  lyrics: {
    rawText: `[ইন্ট্রো / Intro - অ্যাকোস্টিক গিটার ও মৃদু পিয়ানো]
ঝরে পড়ে বৃষ্টি, নিয়ন আলোয়
নীরব একাকী এই পথচলায়...

[স্থায়ী / Verse 1]
কাঁচের জানালায় ফোঁটা ফোঁটা জল
স্মৃতির পাতায় চোখ ছলছল
তোমার রেখে যাওয়া আধপোড়া চিঠি
আজও কি তোমায় মনে করিয়ে দিই?

[সঞ্চারী / Pre-Chorus]
হাওয়ায় ভাসে সুর, চেনা চেনা গান
ভিজে যায় মন, কাঁদে অভিমান
মেঘের ওপারে জমা কথা যত
আজ নিভে যাক আলো সব স্বপ্নের মতো...

[অন্তরা / Chorus]
বৃষ্টি ভেজা এই নীল শহরে
খুঁজে ফিরি তোমায় প্রতিটি প্রহরে
তুমি ছিলে সুর, তুমিই বাঁশি
তবু কেন আজ বিরহের হাসি?

[আভোগ / Bridge - ড্রামস ও ইলেকট্রিক গিটার সোলো]
সময়ের স্রোতে যদি মুছে যায় গান
স্মৃতির গভীরে রয়ে যাবে প্রাণ
একবার ফিরে চাও, যদি পারো তবে
এই গান চিরকাল তোমারই রবে।

[আউটরো / Outro]
নীরব শহর... নিঃশব্দ রাত...
থেমে যায় বৃষ্টি, থেকে যায় একাকী হাত...`,
    sections: [
      {
        id: 'sec_1',
        type: 'intro',
        title: 'ইন্ট্রো / Intro',
        lines: [
          'ঝরে পড়ে বৃষ্টি, নিয়ন আলোয়',
          'নীরব একাকী এই পথচলায়...'
        ]
      },
      {
        id: 'sec_2',
        type: 'verse',
        title: 'স্থায়ী / Verse 1',
        lines: [
          'কাঁচের জানালায় ফোঁটা ফোঁটা জল',
          'স্মৃতির পাতায় চোখ ছলছল',
          'তোমার রেখে যাওয়া আধপোড়া চিঠি',
          'আজও কি তোমায় মনে করিয়ে দিই?'
        ]
      },
      {
        id: 'sec_3',
        type: 'pre_chorus',
        title: 'সঞ্চারী / Pre-Chorus',
        lines: [
          'হাওয়ায় ভাসে সুর, চেনা চেনা গান',
          'ভিজে যায় মন, কাঁদে অভিমান',
          'মেঘের ওপারে জমা কথা যত',
          'আজ নিভে যাক আলো সব স্বপ্নের মতো...'
        ]
      },
      {
        id: 'sec_4',
        type: 'chorus',
        title: 'অন্তরা / Chorus',
        lines: [
          'বৃষ্টি ভেজা এই নীল শহরে',
          'খুঁজে ফিরি তোমায় প্রতিটি প্রহরে',
          'তুমি ছিলে সুর, তুমিই বাঁশি',
          'তবু কেন আজ বিরহের হাসি?'
        ]
      },
      {
        id: 'sec_5',
        type: 'bridge',
        title: 'আভোগ / Bridge',
        lines: [
          'সময়ের স্রোতে যদি মুছে যায় গান',
          'স্মৃতির গভীরে রয়ে যাবে প্রাণ',
          'একবার ফিরে চাও, যদি পারো তবে',
          'এই গান চিরকাল তোমারই রবে।'
        ]
      },
      {
        id: 'sec_6',
        type: 'outro',
        title: 'আউটরো / Outro',
        lines: [
          'নীরব শহর... নিঃশব্দ রাত...',
          'থেমে যায় বৃষ্টি, থেকে যায় একাকী হাত...'
        ]
      }
    ]
  },
  styleBox: {
    genre: 'Bengali Soft Rock / Ballad',
    mood: 'Emotional, Melancholic, Nostalgic, Soulful',
    vocal: 'Male expressive vocals, warm baritone with subtle rasp on emotional peaks',
    instruments: 'Acoustic steel-string guitar fingerpicking, grand piano, warm bass, mellow drums, ambient pad',
    tempo: '78 BPM, 4/4 Time Signature',
    theme: 'Rainy lonely night in Dhaka / Kolkata, reminiscing lost love',
    negativeConstraints: 'No heavy metal screams, no autotune, no hyperpop, no trap hi-hats',
    generatedOutput: `[SHORT TAG PROMPT]
bengali soft rock, acoustic guitar, emotive male baritone, melancholic ballad, rain atmosphere, 78 bpm, warm analog mix

[PRODUCTION SPEC]
Tempo: 78 BPM (Adagio)
Instrumentation: Acoustic 12-string guitar, soft piano reverb, cello swells, subtle fretless bass, brush snare.
Mix: Spacious dynamic headroom, intimate upfront vocal presence.`
  },
  thumbnail: {
    title: 'বৃষ্টি ভেজা নীল শহর',
    subtitle: 'লিরিকক্রাফট স্টুডিও প্রোডাকশন',
    artist: 'LyricCraft AI & Bengali Ensemble',
    bgColor1: '#0f172a',
    bgColor2: '#1e293b',
    textColor: '#38bdf8',
    badgeText: 'Official Lyric Video • 4K',
    aspectRatio: '16:9'
  },
  videoSync: {
    aspectRatio: '16:9',
    bgType: 'gradient',
    fontFamily: 'system-ui, sans-serif',
    fontSize: 28,
    textColor: '#ffffff',
    textShadow: true,
    cues: [
      { timeSec: 0, text: 'ঝরে পড়ে বৃষ্টি, নিয়ন আলোয়' },
      { timeSec: 4, text: 'নীরব একাকী এই পথচলায়...' },
      { timeSec: 9, text: 'কাঁচের জানালায় ফোঁটা ফোঁটা জল' },
      { timeSec: 14, text: 'স্মৃতির পাতায় চোখ ছলছল' },
      { timeSec: 20, text: 'বৃষ্টি ভেজা এই নীল শহরে' },
      { timeSec: 25, text: 'খুঁজে ফিরি তোমায় প্রতিটি প্রহরে' }
    ]
  }
};

export function loadProjects(): SongProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProjects([DEFAULT_PROJECT]);
      return [DEFAULT_PROJECT];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_PROJECT];
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [DEFAULT_PROJECT];
  }
}

export function saveProjects(projects: SongProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

export function getActiveProjectId(): string {
  return localStorage.getItem(ACTIVE_PROJECT_KEY) || DEFAULT_PROJECT.id;
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

export function exportProjectsJson(): string {
  const projects = loadProjects();
  return JSON.stringify(projects, null, 2);
}

export function importProjectsJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0) {
      saveProjects(parsed);
      setActiveProjectId(parsed[0].id);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Invalid JSON import:', err);
    return false;
  }
}
