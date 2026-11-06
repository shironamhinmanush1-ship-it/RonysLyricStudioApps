import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Service status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    hasGeminiKey: !!apiKey,
    services: {
      lyricsStudio: !!apiKey,
      songwritingAssistant: !!apiKey,
      styleBoxGenerator: !!apiKey,
      promptStudio: !!apiKey,
      ttsNarration: !!apiKey,
      imageGeneration: !!apiKey,
      musicAudioGeneration: false, // Lyria requires authorized preview key; style box & prompt generator fully operational
      videoStudio: 'phase_two_prepared',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

function formatErrorMessage(error: any): string {
  let text = error?.message || String(error);
  try {
    const parsed = JSON.parse(text);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }
  return text;
}

async function callGemini(contents: string, systemInstruction?: string, model = 'gemini-3.8-flash', temperature = 0.7) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.');
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature,
      },
    });

    const text = response.text || '';
    return text;
  } catch (err: any) {
    // If a specific preview model failed, try falling back to gemini-3.8-flash
    if (model !== 'gemini-3.8-flash') {
      console.warn(`Model ${model} failed, attempting fallback to gemini-3.8-flash:`, err?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature,
        },
      });
      return fallbackResponse.text || '';
    }
    throw err;
  }
}

// 1. General Gemini Generate Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model = 'gemini-3.8-flash', temperature = 0.7 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = await callGemini(prompt, systemInstruction, model, temperature);
    return res.json({ text });
  } catch (error: any) {
    let errorText = error?.message || 'Gemini API call failed';
    try {
      const parsed = JSON.parse(errorText);
      if (parsed?.error?.message) {
        errorText = parsed.error.message;
      }
    } catch {
      // not json, keep original
    }

    return res.status(500).json({
      error: errorText,
      code: error?.status || 500,
    });
  }
});

// 2. Lyrics Studio Generation Endpoint
app.post('/api/gemini/lyrics', async (req, res) => {
  try {
    const {
      topic,
      genre = 'Bengali Modern Rock',
      mood = 'Emotional & Melancholic',
      language = 'Bengali',
      structure = 'Standard (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Chorus, Bridge, Outro)',
      additionalNotes = '',
      existingLyrics = '',
      action = 'create', // 'create' | 'rewrite_line' | 'improve_meter' | 'rhyme_suggest'
      targetSection = '',
      selectedLine = '',
    } = req.body;

    const systemInstruction = `You are a legendary Bengali songwriter, lyricist, and music director (গীতিকার ও সুরকার). 
You understand poetic meter (মাত্রা, ছন্দ), emotion (রস), Bengali soft rock, folk, acoustic, and modern pop song aesthetics.
When writing in Bengali:
- Maintain natural Bengali phrasing, singability (সুরযোগ্যতা), and evocative imagery.
- Mark song sections clearly in brackets like [ইন্ট্রো / Intro], [স্থায়ী / Verse 1], [সঞ্চারী / Pre-Chorus], [অন্তরা / Chorus], [আভোগ / Bridge], [আউটরো / Outro].
- Provide chords suggestion or rhythm guidance where helpful.
- Respect the requested language: ${language}.
Always output structured, clean, well-spaced lyrics with emotional depth.`;

    let prompt = '';
    if (action === 'create') {
      prompt = `গান রচনার জন্য একটি নতুন ও সম্পূর্ণ লিরিক্স লিখে দাও:
- গানের বিষয়/গল্প (Topic/Story): ${topic}
- গানের জঁরা/ধারা (Genre): ${genre}
- মেজাজ/মুড (Mood): ${mood}
- গানের কাঠামো (Structure): ${structure}
- অতিরিক্ত নির্দেশনা (Notes): ${additionalNotes || 'গানটির প্রতিটি লাইনে গভীর অনুভূতি ও সুরের আবেদন থাকতে হবে।'}

দয়া করে প্রতিটি সেকশন পরিষ্কারভাবে উল্লেখ করে সম্পূর্ণ গানটি উপস্থাপন করো।`;
    } else if (action === 'rewrite_line') {
      prompt = `গানের নিচের নির্দিষ্ট লাইনটি সুন্দর ও ছন্দবদ্ধ করে ৩-৫টি বিকল্প উপায়ে পুনর্লিখন (Rewrite) করে দাও:
নির্দিষ্ট লাইন: "${selectedLine}"
গানের বিষয়/মুড: ${mood} (${genre})
পুরো গানের প্রসঙ্গ:
${existingLyrics}

বিকল্প লাইনগুলোর ভাব, ছন্দ ও সুরযোগ্যতার ব্যাখ্যা সংক্ষেপে দাও।`;
    } else if (action === 'improve_meter') {
      prompt = `নিচের গানটির ছন্দ, মাত্রা ও সুরযোগ্যতা (Meter, Rhyme & Singability) নিখুঁত করে রিভিশন দাও। গানের মূল ভাব অক্ষুণ্ণ রাখবে:
গানের লিরিক্স:
${existingLyrics}

কোন কোন জায়গায় ছন্দ ও অন্ত্যমিল (rhyme) উন্নত করা হয়েছে তা নিচে সংক্ষেপে বুঝিয়ে বলো।`;
    } else {
      prompt = `গানের জন্য লিরিক্স তৈরি/উন্নত করো:
বিষয়: ${topic}
ভাষ্য: ${additionalNotes}`;
    }

    const text = await callGemini(prompt, systemInstruction, 'gemini-3.8-flash', 0.7);
    return res.json({ text, action });
  } catch (error: any) {
    console.error('Lyrics API Error:', error);
    return res.status(500).json({ error: formatErrorMessage(error) });
  }
});

// 3. Songwriting Assistant (Hooks, Concepts, Rhyme, Proofreading)
app.post('/api/gemini/songwriting-assist', async (req, res) => {
  try {
    const { type, input, context = '', genre = 'Bengali Soft Rock' } = req.body;

    const systemInstruction = `You are an elite music composition consultant, poet, and Bengali lyric analyst. 
Provide creative, inspiring, highly musical advice and suggestions. 
Always provide answers in easy-to-read Bengali with clear bullet points and highlight key lyric ideas.`;

    let prompt = '';
    switch (type) {
      case 'concept':
        prompt = `একটি কালজয়ী গানের জন্য ৩টি অনন্য গানের কনসেপ্ট ও স্টোরিলাইন তৈরি করো:
ভাবনা বা সূত্র: "${input}"
জঁরা: ${genre}
প্রতিটি কনসেপ্টে থাকবে:
১. মূল প্রতিপাদ্য (Core Theme)
২. আবেগের বাঁক (Emotional Arc)
৩. একটি নমুনা হুক লাইন (Sample Hook Line)`;
        break;
      case 'hook':
        prompt = `নিচের বিষয় বা গানের জন্য ৫টি আকর্ষণীয় ও হৃদয়গ্রাহী "হুক লাইন" বা কোরাস আইডিয়া লিখে দাও যা সহজেই শ্রোতার মুখে গেঁথে যায়:
বিষয়: "${input}"
ধারা: ${genre}
প্রসঙ্গ: ${context}`;
        break;
      case 'rhyme':
        prompt = `নিচের বাংলা শব্দ/লাইনের জন্য অন্ত্যমিল (Rhyme) ও সুরোপযোগী বিকল্প শব্দের তালিকা দাও:
টার্গেট শব্দ/লাইন: "${input}"
এদের মধ্যে কোন শব্দটি গানের কোন মেজাজে সবচেয়ে ভালো মানাবে তা উল্লেখ করো।`;
        break;
      case 'proofread':
        prompt = `নিচের গানটির ব্যাকরণ, ছন্দপতন, শব্দের পুনরাবৃত্তি এবং সুরের সাবলীলতা গভীরভাবে প্রুফরিড ও বিশ্লেষণ করো:
গান:
${input}

পয়েন্ট আকারে মতামত দাও এবং যেখানে দুর্বলতা আছে সেখানে উন্নত বিকল্প লাইন প্রস্তাব করো।`;
        break;
      case 'structure':
        prompt = `নিচের থিমের গানের জন্য একটি নিখুঁত কাঠামো ও পর্যায়ক্রম (Structure & Section Flow) প্রস্তাব করো:
থিম: "${input}"
জঁরা: ${genre}`;
        break;
      default:
        prompt = `গান রচনার সহায়তা: ${input}`;
    }

    const text = await callGemini(prompt, systemInstruction, 'gemini-3.8-flash', 0.7);
    return res.json({ text, type });
  } catch (error: any) {
    console.error('Songwriting Assist Error:', error);
    return res.status(500).json({ error: formatErrorMessage(error) });
  }
});

// 4. Music Style Box Generator
app.post('/api/gemini/style-box', async (req, res) => {
  try {
    const {
      genre = 'Bengali Soft Rock',
      mood = 'Nostalgic & Melodic',
      vocal = 'Male soulful, warm texture, emotional grit',
      instruments = 'Acoustic Guitar, Sarod, Piano, Muted Drums, Ambient Synth',
      tempo = '82 BPM, 4/4 Time Signature',
      theme = 'Lost memories in a rainy Kolkata/Dhaka evening',
      negativeConstraints = 'No auto-tune, no heavy metal distortion, no electronic trap beat',
    } = req.body;

    const systemInstruction = `You are a professional AI Music Production Engineer and Sound Designer.
Your task is to create a structured, copy-pasteable Music Style Prompt (optimized for modern AI music engines like Suno v3.5/v4, Udio, etc.).
DO NOT imitate a specific living artist by name. Instead describe musical characteristics, vocal timbre, acoustics, and arrangement.
Output format:
1. Short Tag / Style Prompt (English - comma-separated, under 200 characters for tight AI boxes)
2. Comprehensive Production Prompt (English - detailed instrumentation, vocal texture, mix style, dynamics)
3. Structure & Arrangement Roadmap (English + Bengali)
4. Bengali Musical Explanation (বাংলায় সঙ্গীত পরিচালনা ও বাদ্যযন্ত্রের নির্দেশনা)
5. Negative Constraints (English)`;

    const prompt = `Generate a master Music Style Box prompt:
- Genre / Subgenre: ${genre}
- Mood / Emotion: ${mood}
- Vocal Style & Delivery: ${vocal}
- Instrumentation: ${instruments}
- Tempo & Meter: ${tempo}
- Theme / Atmosphere: ${theme}
- Negative Constraints: ${negativeConstraints}`;

    const text = await callGemini(prompt, systemInstruction, 'gemini-3.8-flash', 0.6);
    return res.json({ text });
  } catch (error: any) {
    console.error('Style Box API Error:', error);
    return res.status(500).json({ error: formatErrorMessage(error) });
  }
});

// 5. AI Prompt Studio Generator
app.post('/api/gemini/prompt-studio', async (req, res) => {
  try {
    const { category, title, details, camera, lighting, style, aspectRatio = '16:9' } = req.body;

    const systemInstruction = `You are an international award-winning AI Prompt Engineer and Cinematic Director.
Generate high-fidelity, production-grade prompts for creators.
Crucial Rule:
- The raw prompt for the AI tool (Runway, Luma, Midjourney, Veo, Kling, Suno) MUST be in English so users can copy-paste directly.
- The breakdown, explanation, camera advice, and directorial tips MUST be in fluent Bengali (বাংলা).
Format:
- [RAW PROMPT] (Clean, ready to copy)
- [নেতিবাচক প্রম্পট / Negative Prompt]
- [ক্যামেরা ও লাইটিং বিশ্লেষণ / Camera & Lighting in Bengali]
- [পরিচালকের নোট / Director Notes in Bengali]`;

    let prompt = `Create an elite AI prompt for category: "${category}".
Title / Idea: ${title}
Details: ${details}
Visual Style: ${style || 'Cinematic photorealistic 4k 24fps'}
Camera Movement / Shot: ${camera || 'Cinematic slow tracking shot'}
Lighting: ${lighting || 'Atmospheric volumetric neon & street reflection'}
Aspect Ratio: ${aspectRatio}`;

    const text = await callGemini(prompt, systemInstruction, 'gemini-3.8-flash', 0.65);
    return res.json({ text, category });
  } catch (error: any) {
    console.error('Prompt Studio Error:', error);
    return res.status(500).json({ error: formatErrorMessage(error) });
  }
});

// 6. Text to Speech / Voice Narration
app.post('/api/gemini/tts', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { text, voice = 'Kore', style = 'Clear, emotional narrator' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Call gemini-3.8-flash-lite-tts or gemini-3.8-flash-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS service' });
    }

    return res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      format: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Gemini TTS generation failed. Verify API permissions in Secrets.',
    });
  }
});

// 7. Image Generation & Editing
app.post('/api/gemini/image', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { prompt, aspectRatio = '16:9', imageBase64 = null } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Map aspect ratios supported by gemini-3.1-flash-lite-image: "1:1", "3:4", "4:3", "9:16", "16:9"
    const allowedRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const validRatio = allowedRatios.includes(aspectRatio) ? aspectRatio : '16:9';

    let parts: any[] = [];
    if (imageBase64) {
      // Image edit
      parts.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, ''),
          mimeType: 'image/png',
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: validRatio as any,
        },
      },
    });

    let generatedImageUrl: string | null = null;
    const candidateParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candidateParts) {
      if (part.inlineData?.data) {
        generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'Image generation completed but no image binary was returned. Model might have returned text only.',
      });
    }

    return res.json({ imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    return res.status(500).json({
      error: error?.message || 'Image generation failed. Verify API key and model quota.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LyricCraft Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LyricCraft Studio server:', err);
});
