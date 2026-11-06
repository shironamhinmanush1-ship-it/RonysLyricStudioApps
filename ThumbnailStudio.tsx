import React, { useState, useRef, useEffect } from 'react';
import {
  ImageIcon,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  Palette,
  AlertCircle,
  Check,
  Type,
  Layout,
} from 'lucide-react';
import { ActiveTab, AppLanguage, SongProject } from '../types';
import { getT } from '../translations';
import { generateImageApi } from '../services/api';

interface ThumbnailStudioProps {
  currentProject: SongProject;
  onUpdateProject: (updated: SongProject) => void;
  setActiveTab: (tab: ActiveTab) => void;
  language: AppLanguage;
}

export const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({
  currentProject,
  onUpdateProject,
  language,
}) => {
  const t = getT(language);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Thumbnail configuration
  const [title, setTitle] = useState(currentProject.thumbnail?.title || currentProject.title || 'বৃষ্টি ভেজা নীল শহর');
  const [subtitle, setSubtitle] = useState(
    currentProject.thumbnail?.subtitle || 'অফিসিয়াল লিরিক ভিডিও • ৪K'
  );
  const [artist, setArtist] = useState(currentProject.thumbnail?.artist || 'লিরিকক্রাফট স্টুডিও');
  const [badgeText, setBadgeText] = useState(currentProject.thumbnail?.badgeText || 'OFFICIAL MUSIC VIDEO');
  const [bgColor1, setBgColor1] = useState(currentProject.thumbnail?.bgColor1 || '#090d16');
  const [bgColor2, setBgColor2] = useState(currentProject.thumbnail?.bgColor2 || '#1e1b4b');
  const [textColor, setTextColor] = useState(currentProject.thumbnail?.textColor || '#38bdf8');
  const [accentColor, setAccentColor] = useState('#f43f5e');
  const [bgImage, setBgImage] = useState<string | null>(currentProject.thumbnail?.imageUrl || null);

  // AI Image generation state
  const [aiPrompt, setAiPrompt] = useState(
    `Cinematic moody 16:9 YouTube thumbnail background for a Bengali song titled "${title}", dramatic volumetric rain lighting, dark neon atmosphere, high quality 4k`
  );
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Render canvas whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const drawContent = (loadedImg?: HTMLImageElement) => {
      // Background: either uploaded/generated image or rich gradient
      if (loadedImg) {
        ctx.drawImage(loadedImg, 0, 0, width, height);
        // Dark vignette overlay so text pops
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(0,0,0,0.3)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, bgColor1);
        grad.addColorStop(1, bgColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient radial light
        const radial = ctx.createRadialGradient(width * 0.7, height * 0.4, 50, width * 0.7, height * 0.4, 400);
        radial.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      }

      // Border outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Badge (top left)
      if (badgeText.trim()) {
        ctx.save();
        ctx.fillStyle = accentColor;
        const badgeW = ctx.measureText(badgeText).width + 360;
        ctx.beginPath();
        ctx.roundRect(60, 60, Math.min(badgeW, 400), 42, 8);
        ctx.fill();

        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText.toUpperCase(), 75, 81);
        ctx.restore();
      }

      // Title (Large Bengali / Multilingual)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      ctx.font = 'bold 64px "Hind Siliguri", "Noto Sans Bengali", sans-serif, system-ui';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(title, 60, height - 200);

      // Subtitle / Theme
      ctx.font = 'bold 36px "Hind Siliguri", "Noto Sans Bengali", sans-serif, system-ui';
      ctx.fillStyle = textColor;
      ctx.fillText(subtitle, 60, height - 130);

      // Artist name
      ctx.font = '500 26px "Segoe UI", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Directed by ${artist}`, 60, height - 75);

      // 4K Ultra HD badge on bottom right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width - 180, height - 110, 120, 50, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('4K ULTRA', width - 120, height - 85);

      ctx.restore();
    };

    if (bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = bgImage;
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent();
    } else {
      drawContent();
    }
  }, [title, subtitle, artist, badgeText, bgColor1, bgColor2, textColor, accentColor, bgImage]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBgImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Image via Gemini backend
  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;

    setIsGeneratingAiImage(true);
    setImageError(null);

    try {
      const res = await generateImageApi({
        prompt: aiPrompt,
        aspectRatio: '16:9',
      });
      if (res?.imageUrl) {
        setBgImage(res.imageUrl);
      }
    } catch (err: any) {
      console.warn('AI Image generation not accessible:', err.message);
      setImageError(
        language === 'bn'
          ? `এআই ইমেজ জেনারেশন বর্তমানে সীমাবদ্ধ (${err.message})। তবে আপনি যেকোনো ছবি আপলোড করতে পারবেন এবং ক্যানভাসে থাম্বনেইল তৈরি করতে পারবেন।`
          : `AI image generation note (${err.message}). You can upload custom images or use custom gradients.`
      );
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Download high-resolution 1280x720 PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_thumbnail_16x9.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>{t.thumbnailTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'bn'
              ? 'ইউটিউবের জন্য প্রফেশনাল ১৬:৯ থাম্বনেইল ডিজাইন, টেক্সট স্টাইলিং ও এআই আর্ট'
              : 'Professional 16:9 YouTube thumbnail layout planning, typography, and visual generator'}
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{downloadSuccess ? t.copied : t.downloadThumbnail}</span>
        </button>
      </div>

      {imageError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{imageError}</span>
        </div>
      )}

      {/* Main Grid: Canvas Preview + Layout Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 16:9 Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? '১৬:৯ ইউটিউব থাম্বনেইল লাইভ ক্যানভাস' : '16:9 Live Canvas'}</span>
              </span>
              <span className="text-xs font-mono text-slate-500">1280 x 720 (HD)</span>
            </div>

            {/* Canvas Container with responsive aspect ratio */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>{language === 'bn' ? 'এইচডি কোয়ালিটিতে সম্পূর্ণ ডাউনলোডযোগ্য' : 'Direct full-resolution PNG export'}</span>
              <button
                onClick={handleDownload}
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                {t.downloadThumbnail} →
              </button>
            </div>
          </div>

          {/* AI Background Image Generator Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{t.generateAiImage}</span>
            </h3>

            <div>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe thumbnail backdrop..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleGenerateAiImage}
              disabled={isGeneratingAiImage}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isGeneratingAiImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.loading}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এআই দিয়ে ব্যাকগ্রাউন্ড আর্ট বানান' : 'Generate Backdrop with AI'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Customization Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span>{language === 'bn' ? 'টেক্সট ও টাইপোগ্রাফি সেটিংস' : 'Text & Typography'}</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.songTitleLabel}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.subtitleLabel}
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'bn' ? 'পরিচালক / শিল্পী' : 'Artist / Director'}
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.badgeLabel}
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Colors */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'কালার প্যালেট' : 'Color Palette'}</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Badge Accent</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gradient Start</label>
                  <input
                    type="color"
                    value={bgColor1}
                    onChange={(e) => setBgColor1(e.target.value)}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gradient End</label>
                  <input
                    type="color"
                    value={bgColor2}
                    onChange={(e) => setBgColor2(e.target.value)}
                    className="w-full h-8 rounded bg-slate-950 border border-slate-800 cursor-pointer p-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Upload Custom Image */}
            <div className="border-t border-slate-800 pt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'bn' ? 'কাস্টম ইমেজ আপলোড' : 'Upload Backdrop Image'}
              </label>
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-700 hover:border-amber-500 bg-slate-950 cursor-pointer text-xs text-slate-300 transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'ফাইল সিলেক্ট করুন (PNG/JPG)' : 'Select image file'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
