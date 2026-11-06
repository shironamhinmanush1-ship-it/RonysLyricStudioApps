import React, { useState } from 'react';
import {
  Disc3,
  Sliders,
  AlertTriangle,
  ExternalLink,
  Volume2,
  FileMusic,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Pause,
  Upload,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';

interface MusicGenerationProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
  hasGeminiKey: boolean;
}

export const MusicGeneration: React.FC<MusicGenerationProps> = ({
  currentProject,
  setActiveTab,
  language,
  hasGeminiKey,
}) => {
  const t = getT(language);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [refAudioUrl, setRefAudioUrl] = useState<string | null>(null);

  const styleBoxText = currentProject.styleBox?.generatedOutput || '';

  const handleCopyStyleBox = () => {
    if (!styleBoxText) return;
    navigator.clipboard.writeText(styleBoxText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRefAudioUrl(url);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-cyan-400" />
            <span>{t.musicStatusTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'এআই মিউজিক জেনারেশন ইঞ্জিন ইন্টিগ্রেশন স্ট্যাটাস ও রেফারেন্স ওয়ার্কস্পেস'
              : 'AI music generation integration status and reference workflow'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('stylebox')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4" />
          <span>{t.createStylePrompt} →</span>
        </button>
      </div>

      {/* Honest Capability & Status Notice Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-sm text-white">
              {language === 'bn' ? 'অফিশিয়াল মিউজিক অডিও ইন্টিগ্রেশন স্ট্যাটাস' : 'Music Audio Integration Architecture'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.musicStatusNotice}
            </p>
          </div>
        </div>

        {/* Integration Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Music Style Box</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                Active ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn' ? 'Suno, Udio ও অন্যান্য টুলের জন্য প্রস্তুত' : 'Ready for Suno, Udio, etc.'}
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Lyrics & Meter AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                Active ✓
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn' ? 'বাংলা ছন্দ ও সেকশন অপ্টিমাইজেশন' : 'Rhyme, Meter, and Section Flow'}
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Direct Audio Render</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                Prompt Bridge
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn' ? 'কপি করে সরাসরি এআই ইঞ্জিনে ব্যবহার্য' : 'One-click copy into external engines'}
            </p>
          </div>
        </div>
      </div>

      {/* Music Workflow: Active Project Lyrics + Style Box Quick Copy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lyrics & Structure to copy into Suno/Udio (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <FileMusic className="w-4 h-4 text-cyan-400" />
                <span>{language === 'bn' ? 'গানের কথা (Suno / Udio তে পেস্ট করার জন্য)' : 'Lyrics for AI Music Engine'}</span>
              </span>
              <button
                onClick={() => {
                  if (currentProject.lyrics?.rawText) {
                    navigator.clipboard.writeText(currentProject.lyrics.rawText);
                  }
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copy}</span>
              </button>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 max-h-64 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
              {currentProject.lyrics?.rawText || (
                <span className="text-slate-600">
                  {language === 'bn' ? 'কোনো লিরিক্স নেই। লিরিক্স স্টুডিও থেকে গান তৈরি করুন।' : 'No lyrics yet.'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Style Box Prompt & Reference Player (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>{language === 'bn' ? 'চলতি স্টাইল বক্স প্রম্পট' : 'Style Box Music Prompt'}</span>
              </span>
              {styleBoxText && (
                <button
                  onClick={handleCopyStyleBox}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? t.copied : t.copy}</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
              {styleBoxText || (
                <span className="text-slate-600">
                  {language === 'bn' ? 'স্টাইল বক্স খালি। স্টাইল বক্সে গিয়ে তৈরি করুন।' : 'No style box generated yet.'}
                </span>
              )}
            </div>

            {/* Reference Audio Player / Audition */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'bn' ? 'রেফারেন্স গান / মিউজিক প্রিভিউ প্লেয়ার' : 'Reference Audio Player'}</span>
              </span>

              {refAudioUrl ? (
                <div className="space-y-2">
                  <audio src={refAudioUrl} controls className="w-full rounded-lg" />
                  <button
                    onClick={() => setRefAudioUrl(null)}
                    className="text-[11px] text-red-400 hover:text-red-300"
                  >
                    {language === 'bn' ? 'অডিও রিমুভ করুন' : 'Remove reference audio'}
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950 cursor-pointer text-xs text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'bn' ? 'রেফারেন্স অডিও ফাইল আপলোড করুন (MP3/WAV)' : 'Upload reference audio track'}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
