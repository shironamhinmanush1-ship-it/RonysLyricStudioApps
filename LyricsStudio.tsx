import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Download,
  Send,
  RefreshCw,
  AlertCircle,
  FileText,
  Sliders,
  Video,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { generateLyricsApi } from '../services/api';

interface LyricsStudioProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const LyricsStudio: React.FC<LyricsStudioProps> = ({
  currentProject,
  onUpdateProject,
  setActiveTab,
  language,
}) => {
  const t = getT(language);

  // Form states
  const [topic, setTopic] = useState(currentProject.title || '');
  const [genre, setGenre] = useState(currentProject.genre || 'Bengali Soft Rock');
  const [mood, setMood] = useState(currentProject.mood || 'Melancholic & Emotional');
  const [songLang, setSongLang] = useState(currentProject.language || 'Bengali');
  const [structure, setStructure] = useState(
    'Standard (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Chorus, Bridge, Outro)'
  );
  const [notes, setNotes] = useState('');

  // Selected line for rewrite
  const [selectedLine, setSelectedLine] = useState('');
  const [rewriteSuggestions, setRewriteSuggestions] = useState<string[]>([]);

  // Generation status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Lyrics text editor
  const lyricsText = currentProject.lyrics?.rawText || '';

  const handleLyricsChange = (newText: string) => {
    onUpdateProject({
      ...currentProject,
      lyrics: {
        ...currentProject.lyrics,
        rawText: newText,
      },
    });
  };

  // Generate complete lyrics
  const handleGenerateLyrics = async () => {
    if (!topic.trim()) {
      setErrorMsg(language === 'bn' ? 'দয়া করে গানের বিষয় বা গল্প লিখুন' : 'Please provide a topic or theme');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const generated = await generateLyricsApi({
        topic,
        genre,
        mood,
        language: songLang,
        structure,
        additionalNotes: notes,
        action: 'create',
      });

      // If existing lyrics exist, confirm before overwriting or append
      if (lyricsText.trim()) {
        const replace = window.confirm(
          language === 'bn'
            ? 'আপনার বর্তমান লিরিক্স রয়েছে। আপনি কি নতুন জেনারেট করা লিরিক্স দিয়ে প্রতিস্থাপন (Replace) করতে চান? নাকি নিচে যুক্ত (Append) করবেন? OK = Replace, Cancel = Append.'
            : 'You already have lyrics. Replace existing lyrics? (OK = Replace, Cancel = Append below)'
        );
        if (replace) {
          handleLyricsChange(generated);
        } else {
          handleLyricsChange(`${lyricsText}\n\n--- [নতুন ড্রাফট / New Draft] ---\n${generated}`);
        }
      } else {
        handleLyricsChange(generated);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lyrics generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Rewrite selected line
  const handleRewriteLine = async () => {
    if (!selectedLine.trim()) {
      setErrorMsg(language === 'bn' ? 'রিরাইট করার জন্য নিচের টেক্সটবক্স থেকে একটি লাইন সিলেক্ট করুন বা লিখুন' : 'Select or enter a line to rewrite');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setRewriteSuggestions([]);

    try {
      const result = await generateLyricsApi({
        topic: currentProject.title,
        genre,
        mood,
        language: songLang,
        existingLyrics: lyricsText,
        selectedLine,
        action: 'rewrite_line',
      });

      setRewriteSuggestions(result.split('\n').filter(Boolean));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Line rewrite failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Improve meter & rhyme
  const handleImproveMeter = async () => {
    if (!lyricsText.trim()) {
      setErrorMsg(language === 'bn' ? 'প্রথমে কিছু লিরিক্স লিখুন বা জেনারেট করুন' : 'No lyrics available to improve');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const improved = await generateLyricsApi({
        topic: currentProject.title,
        genre,
        mood,
        language: songLang,
        existingLyrics: lyricsText,
        action: 'improve_meter',
      });

      const confirmReplace = window.confirm(
        language === 'bn'
          ? 'ছন্দ ও সুরযোগ্যতা উন্নত করা হয়েছে। বর্তমান লিরিক্স নতুন সংস্করণে আপডেট করবেন?'
          : 'Meter & Rhyme enhanced. Update current lyrics with the improved version?'
      );

      if (confirmReplace) {
        handleLyricsChange(improved);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Meter improvement failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(lyricsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as text file
  const handleExportText = () => {
    const blob = new Blob([lyricsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.title || 'lyrics'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear lyrics
  const handleClear = () => {
    handleLyricsChange('');
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>{t.lyricsTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'বাংলা গানের স্থায়ী, অন্তরা, সঞ্চারী, আভোগ সেকশন ও ছন্দোপযোগী লিরিক্স স্টুডিও'
              : 'Bengali & multilingual songwriting workspace with meter and rhyme perfection'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('songwriting')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.transferToAssistant}</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.transferToVideo}</span>
          </button>
          <button
            onClick={() => setActiveTab('stylebox')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.transferToStyle}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Generator Controls + Lyrics Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400">
              {language === 'bn' ? '১. নতুন লিরিক্স কনফিগারেশন' : '1. Generate New Song'}
            </h2>

            {/* Topic Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.topicOrStory} *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Genre & Mood Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.genreLabel}
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Bengali Soft Rock">বাংলা সফট রক (Soft Rock)</option>
                  <option value="Bengali Acoustic Melancholic">অ্যাকোস্টিক মেলোডি (Acoustic)</option>
                  <option value="Bengali Modern Pop">আধুনিক পপ (Modern Pop)</option>
                  <option value="Bengali Folk Fusion">ফোক ফিউশন (Folk Fusion)</option>
                  <option value="Cinematic Ballad">সিনেমেটিক ব্যালাড (Ballad)</option>
                  <option value="Lofi Chillout Bengali">লো-ফাই চিলআউট (Lofi)</option>
                  <option value="Sufi Rock">সুফি রক (Sufi Rock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.moodLabel}
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Melancholic & Emotional">বিষাদময় ও আবেগঘন (Melancholic)</option>
                  <option value="Romantic & Poetic">রোমান্টিক ও কাব্যিক (Romantic)</option>
                  <option value="Nostalgic & Rainy">স্মৃতিমেদুর ও বৃষ্টিভেজা (Nostalgic)</option>
                  <option value="Uplifting & Inspiring">অনুপ্রেরণামূলক (Inspiring)</option>
                  <option value="Philosophical & Deep">দার্শনিক ও গভীর (Philosophical)</option>
                  <option value="Energetic Rock">উত্তাল ও তেজস্বী (Energetic)</option>
                </select>
              </div>
            </div>

            {/* Language & Structure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.language}
                </label>
                <select
                  value={songLang}
                  onChange={(e) => setSongLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Bengali">বাংলা (Pure Bengali)</option>
                  <option value="Bengali with English Mix">বাংলা + ইংরেজি মিক্স</option>
                  <option value="Hindi / Urdu Blend">হিন্দি / উর্দু ব্লেন্ড</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.structureLabel}
                </label>
                <select
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Standard (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Chorus, Bridge, Outro)">
                    Standard (Intro-Verse-Chorus-Bridge)
                  </option>
                  <option value="Traditional Bengali (স্থায়ী, অন্তরা, সঞ্চারী, আভোগ)">
                    ঐতিহ্যবাহী বাংলা (স্থায়ী-সঞ্চারী-অন্তরা-আভোগ)
                  </option>
                  <option value="Minimal Acoustic (Verse 1, Chorus, Verse 2, Chorus, Outro)">
                    সংক্ষিপ্ত অ্যাকোস্টিক (Verse-Chorus)
                  </option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateLyrics}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateLyricsBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Line Rewriter & Meter Enhancement Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              {language === 'bn' ? '২. লাইন রিভিশন ও ছন্দ সংশোধন' : '2. Line Rewrite & Rhyme Polish'}
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {language === 'bn' ? 'নির্দিষ্ট লাইন সিলেক্ট করুন বা পেস্ট করুন' : 'Target Line to Rewrite'}
              </label>
              <input
                type="text"
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                placeholder={t.selectedLinePlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRewriteLine}
                disabled={isLoading || !selectedLine.trim()}
                className="flex-1 py-2 px-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {t.rewriteSelectedLine}
              </button>

              <button
                onClick={handleImproveMeter}
                disabled={isLoading || !lyricsText.trim()}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {t.improveMeter}
              </button>
            </div>

            {/* Rewrite Suggestions */}
            {rewriteSuggestions.length > 0 && (
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-purple-400">
                  {language === 'bn' ? 'বিকল্প প্রস্তাবনা:' : 'Alternative Lines:'}
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {rewriteSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded hover:bg-slate-800 cursor-pointer flex items-center justify-between group"
                      onClick={() => {
                        // replace selectedLine in lyricsText if found
                        if (lyricsText.includes(selectedLine)) {
                          handleLyricsChange(lyricsText.replace(selectedLine, sug));
                        }
                      }}
                      title={language === 'bn' ? 'ক্লিক করে এই লাইনটি প্রতিস্থাপন করুন' : 'Click to replace line in song'}
                    >
                      <span className="truncate">{sug}</span>
                      <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 ml-2">
                        {language === 'bn' ? 'ব্যবহার করুন' : 'Use'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Lyrics Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-3 flex flex-col">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex-1 flex flex-col space-y-3">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">
                  {language === 'bn' ? 'লিরিক্স এডিটর ও সেকশন ক্যানভাস' : 'Lyrics Canvas'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({lyricsText.split('\n').filter(Boolean).length} {language === 'bn' ? 'লাইন' : 'lines'})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copied : t.copy}</span>
                </button>

                <button
                  onClick={handleExportText}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.export} (.txt)</span>
                </button>

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title={t.clear}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl space-y-2 text-xs">
                <p className="text-red-200">{t.clearLyricsConfirm}</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 rounded bg-red-600 text-white font-bold"
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            )}

            {/* Raw Lyrics Textarea */}
            <div className="flex-1 min-h-[420px] relative flex flex-col">
              <textarea
                value={lyricsText}
                onChange={(e) => handleLyricsChange(e.target.value)}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const sel = target.value.substring(target.selectionStart, target.selectionEnd);
                  if (sel.trim() && sel.trim().length > 3) {
                    setSelectedLine(sel.trim());
                  }
                }}
                placeholder={
                  language === 'bn'
                    ? '[স্থায়ী / Verse]\nআপনার গানের কথা এখানে লিখুন বা বামপাশের বোতাম দিয়ে জেনারেট করুন...'
                    : '[Verse 1]\nType or generate your lyrics here...'
                }
                className="w-full flex-1 min-h-[420px] bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 font-mono text-sm leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 scrollbar-thin resize-y"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                {language === 'bn'
                  ? 'টিপস: যেকোনো লাইন সিলেক্ট করলে তা স্বয়ংক্রিয়ভাবে রিরাইট বক্সে চলে আসবে।'
                  : 'Tip: Highlight any line to load it into the Rewrite tool.'}
              </span>
              <span>{t.saved}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
