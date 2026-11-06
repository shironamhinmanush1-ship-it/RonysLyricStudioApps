import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Music,
  CheckCircle2,
  GitBranch,
  Copy,
  Check,
  Send,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { songwritingAssistApi } from '../services/api';

interface SongwritingAssistantProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const SongwritingAssistant: React.FC<SongwritingAssistantProps> = ({
  currentProject,
  onUpdateProject,
  setActiveTab,
  language,
}) => {
  const t = getT(language);

  const [activeTool, setActiveTool] = useState<
    'concept' | 'hook' | 'rhyme' | 'proofread' | 'structure'
  >('hook');

  const [input, setInput] = useState(currentProject.title || '');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toolTabs = [
    { id: 'hook' as const, label: t.hookIdeas, icon: Sparkles, desc: 'Catchy choruses & hooks' },
    { id: 'concept' as const, label: t.conceptDev, icon: BookOpen, desc: 'Deep storylines & themes' },
    { id: 'rhyme' as const, label: t.rhymeDict, icon: Music, desc: 'Bengali rhymes & vocab' },
    { id: 'proofread' as const, label: t.proofread, icon: CheckCircle2, desc: 'Meter & consistency' },
    { id: 'structure' as const, label: t.structureFlow, icon: GitBranch, desc: 'Section sequencing' },
  ];

  const handleRunTool = async () => {
    if (!input.trim()) {
      setErrorMsg(language === 'bn' ? 'দয়া করে কিছু টেক্সট বা ভাবনা ইনপুট দিন' : 'Please provide input text or theme');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await songwritingAssistApi({
        type: activeTool,
        input,
        context: currentProject.lyrics?.rawText || '',
        genre: currentProject.genre || 'Bengali Soft Rock',
      });
      setOutput(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Assistant request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransferToLyrics = () => {
    if (!output.trim()) return;
    const currentText = currentProject.lyrics?.rawText || '';
    const newText = currentText
      ? `${currentText}\n\n--- [সহকারীর প্রস্তাবনা / Assistant Suggestions] ---\n${output}`
      : output;

    onUpdateProject({
      ...currentProject,
      lyrics: {
        ...currentProject.lyrics,
        rawText: newText,
      },
    });

    setActiveTab('lyrics');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span>{t.songwriting}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'গানের কনসেপ্ট, আবেগের গভীরতা, হুক লাইন ও ছন্দ মেলানোর বিশেষ সহকারী'
              : 'Concept builder, hook generator, rhyme dictionary, and consistency proofreader'}
          </p>
        </div>

        <button
          onClick={() => {
            if (currentProject.lyrics?.rawText) {
              setInput(currentProject.lyrics.rawText);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'চলতি লিরিক্স লোড করুন' : 'Load Current Lyrics'}</span>
        </button>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {toolTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTool === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTool(tab.id);
                setOutput('');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center sm:items-start text-center sm:text-left transition-all ${
                isActive
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className="font-bold text-xs sm:text-sm text-white">{tab.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block truncate w-full">
                {tab.desc}
              </span>
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

      {/* Dual Panel: Input and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
              {language === 'bn' ? 'ইনপুট ও প্রসঙ্গ' : 'Input & Context'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activeTool === 'hook' && (language === 'bn' ? 'গানের বিষয় বা কেন্দ্রীয় ভাবনা' : 'Core Theme for Hook')}
                {activeTool === 'concept' && (language === 'bn' ? 'সংক্ষিপ্ত ভাব বা অনুভূতি' : 'Theme / Emotion')}
                {activeTool === 'rhyme' && (language === 'bn' ? 'যে শব্দের অন্ত্যমিল চান' : 'Target Word for Rhyme')}
                {activeTool === 'proofread' && (language === 'bn' ? 'যে লিরিক্স প্রুফরিড করবেন' : 'Lyrics to Proofread')}
                {activeTool === 'structure' && (language === 'bn' ? 'গানের স্টোরিলাইন বা বিষয়' : 'Song Storyline')}
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.assistantInputPlaceholder}
                rows={activeTool === 'proofread' ? 8 : 4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 scrollbar-thin"
              />
            </div>

            <button
              onClick={handleRunTool}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'bn' ? 'পরামর্শ ও বিকল্প খুঁজুন' : 'Analyze & Generate'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 min-h-[380px] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <span className="text-sm font-bold text-white">
                {t.assistantOutputTitle}
              </span>

              <div className="flex items-center gap-2">
                {output && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t.copied : t.copy}</span>
                    </button>

                    <button
                      onClick={handleTransferToLyrics}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লিরিক্স স্টুডিওতে যুক্ত করুন' : 'Transfer to Lyrics'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[280px]">
              {output ? (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-[480px] overflow-y-auto scrollbar-thin">
                  {output}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Sparkles className="w-10 h-10 text-slate-700 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-400">
                    {language === 'bn'
                      ? 'বামপাশ থেকে টুল সিলেক্ট করে আপনার ভাবনা লিখুন এবং এআই সঙ্গীত পরিচালকের প্রস্তাবনা দেখুন'
                      : 'Select a tool and enter your thoughts to receive expert songwriting advice'}
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
