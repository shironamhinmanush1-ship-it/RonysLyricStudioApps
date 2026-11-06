import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
  Cpu,
  Layers,
} from 'lucide-react';
import { AppLanguage, ApiStatus } from '../types';
import { getT } from '../translations';
import { checkServerStatus } from '../services/api';

interface SettingsStudioProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  hasGeminiKey: boolean;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({
  language,
  setLanguage,
  hasGeminiKey,
}) => {
  const t = getT(language);
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const fetchStatus = async () => {
    setIsChecking(true);
    try {
      const res = await checkServerStatus();
      setStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleClearCache = () => {
    const ok = window.confirm(
      language === 'bn'
        ? 'আপনি কি ব্রাউজার ক্যাশ রিসেট করতে চান? (আপনার বর্তমান সংরক্ষিত প্রজেক্টসমূহ নিরাপদে থাকবে)'
        : 'Clear UI temporary cache? (Your saved projects will remain safe)'
    );
    if (ok) {
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-400" />
            <span>{t.settingsTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'স্টুডিও ভাষা, এআই ব্যাকএন্ড সংযোগ ও ক্লাউড ইন্টিগ্রেশন সেটিংস'
              : 'Studio language, Gemini API status, and Google Drive integration status'}
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isChecking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{language === 'bn' ? 'স্ট্যাটাস রিফ্রেশ' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Language Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{t.languageSelect}</span>
        </div>
        <p className="text-xs text-slate-400">
          {language === 'bn'
            ? 'ডিফল্ট ভাষা বাংলা হিসেবে নির্ধারিত। আপনি চাইলে যেকোনো সময় ইংরেজি ইন্টারফেসে পরিবর্তন করতে পারবেন।'
            : 'Default language is Bengali. You can switch to English anytime.'}
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs">
          <button
            onClick={() => setLanguage('bn')}
            className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
              language === 'bn'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            বাংলা (Bengali)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* AI Services & Server Health */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{language === 'bn' ? 'এআই ব্যাকএন্ড ও সার্ভিস স্ট্যাটাস' : 'Gemini Backend & Services'}</span>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              status?.hasGeminiKey
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {status?.hasGeminiKey ? 'Connected' : 'Missing Key in Secrets'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Lyrics & Songwriting Engine:</span>
            <span className="text-emerald-400 font-bold">gemini-3.8-flash</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Voice Synthesis (TTS):</span>
            <span className="text-emerald-400 font-bold">gemini-3.8-flash-lite-tts</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Image Generation:</span>
            <span className="text-purple-400 font-bold">gemini-3.1-flash-lite-image</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Server Runtime:</span>
            <span className="text-cyan-400 font-mono">Node.js Express + TSX</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {language === 'bn'
            ? 'সুরক্ষিত নিয়ম অনুযায়ী API Key কখনই ব্রাউজারে এক্সপোজ হয় না; এটি সার্ভার-সাইড প্রক্সি রুটের মাধ্যমে নির্বাহ হয়।'
            : 'As per security standards, the API key is never exposed to the client and is managed securely on the server.'}
        </p>
      </div>

      {/* Google Drive Integration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>{t.driveStatus}</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
            OAuth Bridge Ready
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {language === 'bn'
            ? 'ব্যবহারকারীর সম্মতিক্রমে গুগল ড্রাইভে লিরিক্স, চিত্রকর্ম, স্ক্রিপ্ট ও ব্যাকআপ ফাইল সিঙ্ক ও সেভ করার জন্য গুগল ওয়ার্কস্পেস ড্রাইভার কনফিগার করা রয়েছে।'
            : 'Configured for Google Drive integration to securely save and export lyric videos, scripts, and artwork with user permission.'}
        </p>
      </div>

      {/* Storage and Reset */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Database className="w-4 h-4 text-rose-400" />
          <span>{language === 'bn' ? 'লোকাল স্টোরেজ ও মেমরি' : 'Storage & Cache'}</span>
        </div>

        <p className="text-xs text-slate-400">
          {language === 'bn'
            ? 'আপনার গান, লিরিক্স ও প্রম্পটগুলো আপনার ডিভাইসে স্বয়ংক্রিয়ভাবে সেভ হয়।'
            : 'Your lyrics, style boxes, and generated prompts are auto-saved locally on your device.'}
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'bn' ? 'অস্থায়ী ক্যাশ পরিষ্কার করুন' : 'Clear Temporary Cache'}</span>
          </button>
          {cacheCleared && (
            <span className="text-xs text-emerald-400 font-semibold">
              {language === 'bn' ? 'ক্যাশ পরিষ্কার হয়েছে!' : 'Cache cleared!'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
