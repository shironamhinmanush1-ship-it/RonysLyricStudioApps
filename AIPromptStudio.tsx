import React, { useState } from 'react';
import {
  Film,
  Music,
  ImageIcon,
  Video,
  Mic,
  Clapperboard,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Camera,
  Layers,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { generatePromptStudioApi } from '../services/api';

interface AIPromptStudioProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const AIPromptStudio: React.FC<AIPromptStudioProps> = ({
  currentProject,
  onUpdateProject,
  setActiveTab,
  language,
}) => {
  const t = getT(language);

  const categories = [
    {
      id: 'cinematic_mv',
      label: language === 'bn' ? 'সিনেমাটিক মিউজিক ভিডিও' : 'Cinematic Music Video',
      icon: Film,
      desc: 'Runway Gen-3, Luma, Sora, Veo',
    },
    {
      id: 'music_gen',
      label: language === 'bn' ? 'এআই মিউজিক ও সুর' : 'Music & Audio Generation',
      icon: Music,
      desc: 'Suno, Udio, Lyria',
    },
    {
      id: 'image_gen',
      label: language === 'bn' ? 'ইমেজ ও ফটোশুট' : 'Image & Photo Shoot',
      icon: ImageIcon,
      desc: 'Midjourney v6, Imagen 3',
    },
    {
      id: 'youtube_thumb',
      label: language === 'bn' ? 'ইউটিউব থাম্বনেইল' : 'YouTube Thumbnail',
      icon: Layers,
      desc: '16:9 Clickable Artwork',
    },
    {
      id: 'lyric_video_bg',
      label: language === 'bn' ? 'লিরিক ভিডিও ব্যাকগ্রাউন্ড' : 'Lyric Video Background',
      icon: Video,
      desc: 'Looping Mood & Aesthetic',
    },
    {
      id: 'voice_narration',
      label: language === 'bn' ? 'ভয়েস ও ন্যারেটিভ' : 'Voice & Narration',
      icon: Mic,
      desc: 'Emotion & Delivery Persona',
    },
    {
      id: 'short_film',
      label: language === 'bn' ? 'শর্ট ফিল্ম স্টোরিবোর্ড' : 'Short Film & Storyboard',
      icon: Clapperboard,
      desc: 'Scene-by-scene Shot List',
    },
  ];

  const [category, setCategory] = useState(categories[0].id);
  const [title, setTitle] = useState(currentProject.title || '');
  const [details, setDetails] = useState('');
  const [camera, setCamera] = useState('Cinematic slow tracking shot, 35mm lens, shallow depth of field');
  const [lighting, setLighting] = useState('Volumetric street lamps, neon wet reflections, midnight cinematic blue hour');
  const [style, setStyle] = useState('Hyper-realistic, 8k resolution, 24fps film grain, cinematic color grading');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() && !details.trim()) {
      setErrorMsg(language === 'bn' ? 'দয়া করে দৃশ্যের মূল ভাবনা বা বর্ণনা লিখুন' : 'Please provide scene title or details');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await generatePromptStudioApi({
        category,
        title: title || currentProject.title,
        details: details || `Atmospheric music visual for song: ${currentProject.title} (${currentProject.genre})`,
        camera,
        lighting,
        style,
        aspectRatio,
      });

      setGeneratedPrompt(result);

      // Save prompt in project prompts history
      const existingPrompts = currentProject.prompts || [];
      onUpdateProject({
        ...currentProject,
        prompts: [
          {
            category,
            promptText: result,
            createdAt: Date.now(),
          },
          ...existingPrompts.slice(0, 19),
        ],
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Prompt generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy raw prompt only (the English block for AI tool)
  const handleCopyRaw = () => {
    // Extract English prompt inside [RAW PROMPT] or first block
    const match = generatedPrompt.match(/\[RAW PROMPT\]([\s\S]*?)(\[|$)/i);
    const textToCopy = match ? match[1].trim() : generatedPrompt;

    navigator.clipboard.writeText(textToCopy);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Copy all (English + Bengali explanation)
  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-fuchsia-400" />
            <span>{t.promptStudioTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'রানওয়ে, লুমা, মিডজার্নি ও অন্যান্য এআই টুলের জন্য নিখুঁত সিনেমাটিক ইংরেজি প্রম্পট ও বাংলা ডিরেক্টরিয়াল গাইড'
              : 'Production-ready AI prompts for video, image, music, and storyboards'}
          </p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                setGeneratedPrompt('');
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                isActive
                  ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300 shadow-md shadow-fuchsia-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-fuchsia-400' : 'text-slate-500'}`} />
              <span className="font-bold text-[11px] text-white leading-tight">{c.label}</span>
              <span className="text-[9px] text-slate-500 mt-0.5 truncate w-full">{c.desc}</span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parameters & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-fuchsia-400">
              {language === 'bn' ? 'সিনেমাটিক প্রম্পট প্যারামিটার' : 'Cinematic Parameters'}
            </h2>

            {/* Title / Idea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.promptTitleLabel} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: নিয়ন শহরের বৃষ্টিতে বিষণ্ণ দাঁড়িয়ে থাকা গায়ক'
                    : 'e.g. Lonely man in rainy neon city with acoustic guitar'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.promptDetailsLabel}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder={
                  language === 'bn'
                    ? 'মডেলের পোশাক, ভাবাবেগ, চারপাশের পরিবেশ ও গল্পের মুহূর্ত...'
                    : 'Action, emotions, character clothing, and environmental backdrop...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Camera & Shot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.cameraMovementLabel}
              </label>
              <input
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Lighting */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.lightingLabel}
              </label>
              <input
                type="text"
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.aspectRatioLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {ratio} {ratio === '16:9' ? '(YouTube)' : ratio === '9:16' ? '(Reels/TikTok)' : '(Square)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generatePromptBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 min-h-[460px] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <span className="text-sm font-bold text-white">
                {language === 'bn' ? 'জেনারেটেড এআই প্রম্পট ও গাইড' : 'Generated Prompt & Director Notes'}
              </span>

              {generatedPrompt && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRaw}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-fuchsia-600/30 hover:bg-fuchsia-600/40 text-fuchsia-300 border border-fuchsia-500/40 transition-colors"
                  >
                    {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{language === 'bn' ? 'শুধু ইংরেজি প্রম্পট কপি' : 'Copy English Prompt'}</span>
                  </button>

                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{language === 'bn' ? 'সব কপি' : 'Copy All'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[360px]">
              {generatedPrompt ? (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-[480px] overflow-y-auto scrollbar-thin">
                  {generatedPrompt}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Camera className="w-10 h-10 text-slate-700 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-400">
                    {language === 'bn'
                      ? 'প্যারামিটার নির্ধারণ করে প্রম্পট তৈরি করুন — ইংরেজি প্রম্পট সরাসরি রানওয়ে বা লুমায় পেস্ট করতে পারবেন'
                      : 'Build high-fidelity prompts ready to paste into Runway, Luma, Midjourney, or Sora'}
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
