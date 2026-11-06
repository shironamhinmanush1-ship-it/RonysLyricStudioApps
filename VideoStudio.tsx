import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Settings,
  Type,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';

interface VideoStudioProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  currentProject,
  onUpdateProject,
  language,
}) => {
  const t = getT(language);

  // Video settings
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>(
    currentProject.videoSync?.aspectRatio || '16:9'
  );
  const [bgType, setBgType] = useState<'gradient' | 'image' | 'dark'>(
    currentProject.videoSync?.bgType || 'gradient'
  );
  const [bgUrl, setBgUrl] = useState<string | null>(currentProject.videoSync?.bgUrl || null);
  const [fontSize, setFontSize] = useState<number>(currentProject.videoSync?.fontSize || 28);
  const [textColor, setTextColor] = useState<string>(currentProject.videoSync?.textColor || '#ffffff');
  const [textShadow, setTextShadow] = useState<boolean>(currentProject.videoSync?.textShadow ?? true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Playback timer simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Lyric cues
  const defaultCues = currentProject.videoSync?.cues || [
    { timeSec: 0, text: 'ঝরে পড়ে বৃষ্টি, নিয়ন আলোয়' },
    { timeSec: 5, text: 'নীরব একাকী এই পথচলায়...' },
    { timeSec: 10, text: 'কাঁচের জানালায় ফোঁটা ফোঁটা জল' },
    { timeSec: 15, text: 'স্মৃতির পাতায় চোখ ছলছল' },
    { timeSec: 22, text: 'বৃষ্টি ভেজা এই নীল শহরে' },
    { timeSec: 28, text: 'খুঁজে ফিরি তোমায় প্রতিটি প্রহরে' },
  ];

  const [cues, setCues] = useState<{ timeSec: number; text: string }[]>(defaultCues);
  const [newCueTime, setNewCueTime] = useState(0);
  const [newCueText, setNewCueText] = useState('');

  // Interval timer for preview playback
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          const maxTime = Math.max(...cues.map((c) => c.timeSec), 35) + 5;
          if (next >= maxTime) {
            return 0; // loop
          }
          return next;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, cues]);

  // Find active cue for current timestamp
  const activeCue = [...cues]
    .sort((a, b) => b.timeSec - a.timeSec)
    .find((c) => currentTime >= c.timeSec) || cues[0];

  // Save video sync settings to project
  const saveVideoSettings = () => {
    onUpdateProject({
      ...currentProject,
      videoSync: {
        aspectRatio,
        bgType,
        bgUrl: bgUrl || undefined,
        fontFamily: 'system-ui, sans-serif',
        fontSize,
        textColor,
        textShadow,
        cues,
      },
    });
  };

  const handleAddCue = () => {
    if (!newCueText.trim()) return;
    const updated = [...cues, { timeSec: newCueTime, text: newCueText }].sort(
      (a, b) => a.timeSec - b.timeSec
    );
    setCues(updated);
    setNewCueText('');
    setNewCueTime(Math.floor(currentTime) + 4);
  };

  const handleDeleteCue = (index: number) => {
    const updated = cues.filter((_, i) => i !== index);
    setCues(updated);
  };

  // Import lines from active lyrics
  const handleImportFromLyrics = () => {
    const raw = currentProject.lyrics?.rawText;
    if (!raw) return;

    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('[') && !l.startsWith('-'));

    let sec = 0;
    const generatedCues = lines.slice(0, 16).map((line) => {
      const cue = { timeSec: sec, text: line };
      sec += 4.5;
      return cue;
    });

    setCues(generatedCues);
  };

  // Export as .lrc (standard subtitle/lyric file)
  const handleExportLrc = () => {
    const formatTime = (seconds: number) => {
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 100);
      return `[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
    };

    const lrcLines = cues.map((c) => `${formatTime(c.timeSec)}${c.text}`);
    const lrcContent = `[ti:${currentProject.title}]\n[ar:${currentProject.genre}]\n[by:LyricCraft Studio]\n\n${lrcLines.join('\n')}`;

    const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title || 'lyrics'}.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-1">
            <span>{language === 'bn' ? 'ফেজ ২ আর্কিটেকচার প্রস্তুত' : 'Phase Two Foundation'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-rose-400" />
            <span>{t.videoStudioTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.videoStudioDesc}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleImportFromLyrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'বর্তমান লিরিক্স আমদানি করুন' : 'Import Project Lyrics'}</span>
          </button>
          <button
            onClick={handleExportLrc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'bn' ? 'LRC ফাইল ডাউনলোড' : 'Export .LRC'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Player/Canvas Preview + Timeline Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Preview Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t.overlayLyrics}
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {currentTime.toFixed(1)}s / {(Math.max(...cues.map((c) => c.timeSec), 35) + 5).toFixed(1)}s
              </span>
            </div>

            {/* Simulated Video Canvas */}
            <div
              className={`w-full relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center transition-all ${
                aspectRatio === '16:9'
                  ? 'aspect-video'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16] max-w-xs mx-auto'
                  : 'aspect-square max-w-sm mx-auto'
              }`}
              style={{
                background:
                  bgType === 'gradient'
                    ? 'radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%)'
                    : bgType === 'image' && bgUrl
                    ? `url(${bgUrl}) center/cover no-repeat`
                    : '#090d16',
              }}
            >
              {/* Subtle visual pulse when playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />
              )}

              {/* Watermark / Title */}
              <div className="absolute top-4 left-4 text-xs font-bold text-white/50 tracking-wider">
                {currentProject.title}
              </div>

              {/* Synchronized Lyrics Overlay */}
              <div className="px-6 text-center z-10 space-y-2">
                <p
                  style={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    textShadow: textShadow ? '0 4px 18px rgba(0,0,0,0.9), 0 0 30px rgba(56,189,248,0.4)' : 'none',
                  }}
                  className="font-bold leading-relaxed transition-all duration-300 drop-shadow-md"
                >
                  {activeCue?.text || '...'}
                </p>
              </div>

              {/* Progress bar line at bottom of player */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{
                    width: `${
                      (currentTime / (Math.max(...cues.map((c) => c.timeSec), 35) + 5)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? t.pausePreview : t.playPreview}</span>
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                  title="Reset to 0s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Controls (0.5x, 0.75x, 1x, 1.25x) */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 mr-1">{t.speedLabel}:</span>
                {[0.5, 0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                      playbackSpeed === speed
                        ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notice about Phase 2 Full MP4 Render */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300 block mb-1">
              {language === 'bn' ? 'ফেজ ২ ইঞ্জিন সংক্রান্ত তথ্য:' : 'Phase Two Notice:'}
            </span>
            <p>
              {language === 'bn'
                ? 'বর্তমানে মোবাইল ব্রাউজারে ওভারলে ও লিরিক্স সিঙ্ক্রোনাইজেশন টাইমলাইন ১০০% কার্যকর। প্রজেক্টের লিরিক্স .LRC ফরম্যাটে রপ্তানি করে ক্যাপকাট, প্রিমিয়ার প্রো বা যেকোনো ভিডিও এডিটরে সরাসরি ব্যবহার করা যায়।'
                : 'Current engine provides real-time lyric preview & sync. Export .LRC files to import directly into CapCut, Premiere, or mobile video editors.'}
            </p>
          </div>
        </div>

        {/* Right: Typography & Timeline Cues (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Typography & Aspect Ratio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>{language === 'bn' ? 'ভিডিও ও টাইপোগ্রাফি সেটিংস' : 'Video & Typography'}</span>
            </h3>

            {/* Aspect Ratio */}
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    aspectRatio === ratio
                      ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Font Size & Color */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-slate-400 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min={18}
                  max={48}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-7 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Timeline Synchronization Cues */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'bn' ? 'টাইমলাইন লিরিক্স কিউ (Cues)' : 'Timeline Sync Cues'}</span>
              </span>
              <span className="text-xs font-mono text-slate-500">{cues.length} cues</span>
            </div>

            {/* Add Cue Input */}
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={newCueTime}
                onChange={(e) => setNewCueTime(parseFloat(e.target.value) || 0)}
                placeholder="Sec"
                className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-cyan-300 font-mono text-center focus:outline-none"
              />
              <input
                type="text"
                value={newCueText}
                onChange={(e) => setNewCueText(e.target.value)}
                placeholder={language === 'bn' ? 'লিরিকের লাইন...' : 'Lyric line...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleAddCue}
                className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                title="Add Cue"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cues List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {cues.map((cue, idx) => {
                const isCurrent = activeCue === cue;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isCurrent
                        ? 'bg-rose-500/20 border border-rose-500/40 text-white font-bold'
                        : 'bg-slate-950 border border-slate-800/80 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      onClick={() => setCurrentTime(cue.timeSec)}
                    >
                      <span className="font-mono text-rose-400 shrink-0">
                        {cue.timeSec.toFixed(1)}s
                      </span>
                      <span className="truncate">{cue.text}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCue(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
