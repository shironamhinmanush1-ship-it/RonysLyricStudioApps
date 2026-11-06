import React, { useState } from 'react';
import {
  Sliders,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileMusic,
  Share2,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { generateStyleBoxApi } from '../services/api';

interface MusicStyleBoxProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const MusicStyleBox: React.FC<MusicStyleBoxProps> = ({
  currentProject,
  onUpdateProject,
  setActiveTab,
  language,
}) => {
  const t = getT(language);

  // Preset styles
  const presets = [
    {
      name: language === 'bn' ? 'বাংলা সফট রক (ব্যালাড)' : 'Bengali Soft Rock Ballad',
      genre: 'Bengali Soft Rock / Melodic Alternative',
      mood: 'Nostalgic, Melancholic, Emotional, Rainy night atmosphere',
      vocal: 'Male warm baritone, emotional delivery with raspy peaks',
      instruments: 'Acoustic 12-string guitar, subtle sarod, grand piano, warm bass, brushed drums',
      tempo: '78 BPM, 4/4 Time Signature',
      theme: 'Reminiscing old memories under city streetlights in rain',
      neg: 'No heavy metal screams, no autotune, no EDM synth leads',
    },
    {
      name: language === 'bn' ? 'অ্যাকোস্টিক মেলোডি ও বাঁশি' : 'Acoustic Melody & Bansuri',
      genre: 'Acoustic Folk-Pop / Bengali Soul',
      mood: 'Heartfelt, Serene, Deep Romantic, Soulful',
      vocal: 'Female melodic gentle vocal, breathy intimacy',
      instruments: 'Fingerstyle nylon guitar, Indian bamboo flute (Bansuri), cajon, light shaker',
      tempo: '88 BPM, 3/4 Waltz / 6/8 Meter',
      theme: 'Riverbank breezes, longing, acoustic simplicity',
      neg: 'No electric distortion, no synth pads, no heavy bass 808',
    },
    {
      name: language === 'bn' ? 'সিনেম্যাটিক এভারগ্রিন' : 'Cinematic Evergreen Orchestral',
      genre: 'Cinematic Bengali Ballad / Orchestral Pop',
      mood: 'Epic, Triumphant, Sweeping Emotion, Heart-touching',
      vocal: 'Dual vocal harmony, rich resonance, theatrical passion',
      instruments: 'Full string ensemble, concert harp, acoustic piano, timpani, subtle acoustic guitar',
      tempo: '72 BPM, 4/4 Time Signature',
      theme: 'Destiny, time passing, eternal love story',
      neg: 'No electronic beats, no mumble vocals',
    },
    {
      name: language === 'bn' ? 'লো-ফাই চিলআউট' : 'Bengali Lofi Chillout',
      genre: 'Bengali Lofi Beats / Chillhop',
      mood: 'Relaxed, Nostalgic, Late-night study, Cozy rain',
      vocal: 'Soft whispered vocal chops, subtle singing fragments',
      instruments: 'Rhodes electric piano, tape hiss, vinyl crackle, mellow jazz guitar chords, boombap kick',
      tempo: '75 BPM, 4/4 Swing',
      theme: 'Coffee shop windows, silent night contemplation',
      neg: 'No fast tempo, no aggressive horns, no harsh high frequencies',
    },
  ];

  const [genre, setGenre] = useState(currentProject.styleBox?.genre || presets[0].genre);
  const [mood, setMood] = useState(currentProject.styleBox?.mood || presets[0].mood);
  const [vocal, setVocal] = useState(currentProject.styleBox?.vocal || presets[0].vocal);
  const [instruments, setInstruments] = useState(currentProject.styleBox?.instruments || presets[0].instruments);
  const [tempo, setTempo] = useState(currentProject.styleBox?.tempo || presets[0].tempo);
  const [theme, setTheme] = useState(currentProject.styleBox?.theme || presets[0].theme);
  const [negativeConstraints, setNegativeConstraints] = useState(
    currentProject.styleBox?.negativeConstraints || presets[0].neg
  );

  const [output, setOutput] = useState(currentProject.styleBox?.generatedOutput || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setGenre(p.genre);
    setMood(p.mood);
    setVocal(p.vocal);
    setInstruments(p.instruments);
    setTempo(p.tempo);
    setTheme(p.theme);
    setNegativeConstraints(p.neg);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const generated = await generateStyleBoxApi({
        genre,
        mood,
        vocal,
        instruments,
        tempo,
        theme,
        negativeConstraints,
      });

      setOutput(generated);

      // Save to project
      onUpdateProject({
        ...currentProject,
        styleBox: {
          genre,
          mood,
          vocal,
          instruments,
          tempo,
          theme,
          negativeConstraints,
          generatedOutput: generated,
        },
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Style box generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy only short tag prompt
  const handleCopyTagPrompt = () => {
    // Extract first section or raw tags
    const lines = output.split('\n');
    let promptTag = '';
    const tagIndex = lines.findIndex((l) => l.includes('[SHORT TAG PROMPT]') || l.includes('1. Short Tag'));
    if (tagIndex !== -1 && lines[tagIndex + 1]) {
      promptTag = lines[tagIndex + 1];
    } else {
      promptTag = `${genre}, ${mood}, ${vocal}, ${tempo}, ${instruments}`;
    }

    navigator.clipboard.writeText(promptTag.trim());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Copy full spec
  const handleCopyFull = () => {
    navigator.clipboard.writeText(output);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            <span>{t.styleBoxTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.styleBoxDesc}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('lyrics')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          <FileMusic className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'লিরিক্স দেখুন' : 'View Lyrics'}</span>
        </button>
      </div>

      {/* Preset Buttons */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
          {language === 'bn' ? 'জনপ্রিয় স্টাইল প্রিসেট (Presets)' : 'Popular Style Presets'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left text-xs transition-all group"
            >
              <div className="font-bold text-slate-200 group-hover:text-indigo-300 truncate">
                {p.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {p.tempo}
              </div>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout: Parameters + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Form (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
              {language === 'bn' ? 'সঙ্গীত ও সাউন্ড প্যারামিটার' : 'Sound & Musical Parameters'}
            </h2>

            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.genreLabel}
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.moodLabel}
              </label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Vocal Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.vocalStyleLabel}
              </label>
              <input
                type="text"
                value={vocal}
                onChange={(e) => setVocal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Instruments */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.instrumentsLabel}
              </label>
              <textarea
                value={instruments}
                onChange={(e) => setInstruments(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tempo & Theme */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.tempoLabel}
                </label>
                <input
                  type="text"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'গানের আবহাওয়া' : 'Theme / Atmosphere'}
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Negative Constraints */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.negativeConstraintsLabel}
              </label>
              <input
                type="text"
                value={negativeConstraints}
                onChange={(e) => setNegativeConstraints(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateStyleBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 min-h-[460px] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <span className="text-sm font-bold text-white">
                {language === 'bn' ? 'স্টাইল বক্স ও প্রোডাকশন প্রম্পট' : 'Style Box Output & Production Spec'}
              </span>

              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTagPrompt}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{t.copyPromptOnly}</span>
                  </button>

                  <button
                    onClick={handleCopyFull}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{t.copyFullSpec}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[360px]">
              {output ? (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[480px] overflow-y-auto scrollbar-thin">
                  {output}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Sliders className="w-10 h-10 text-slate-700 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-400">
                    {language === 'bn'
                      ? 'বামপাশের প্যারামিটার নির্ধারণ করে "স্টাইল বক্স প্রম্পট তৈরি করুন" বাটনে ক্লিক করুন'
                      : 'Configure the parameters and generate structured prompts for Suno and Udio'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
