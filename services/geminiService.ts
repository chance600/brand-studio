
import { GoogleGenAI, Type } from "@google/genai";
import { ActiveCampaign, IndexedTrend, ContentTemplate } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface ScoutResult {
  trends: IndexedTrend[];
  sources: { title: string; uri: string }[];
}

/**
 * Scout Agent: Scrapes official creative hubs and reconstitutes trends for Phaws.
 * Uses Gemini 3 Pro with Thinking Budget for high-quality trend extraction.
 */
export const scoutViralTrends = async (targetHub: string = "All Platforms", brandContext?: ActiveCampaign): Promise<ScoutResult> => {
  const ai = getAiClient();
  
  const brand = brandContext || {
    brandName: "Phaws",
    voice: "fun, educational, eco-conscious, authentic",
    targetAudience: "sustainable pet owners",
    visualStyle: "natural, clean, vibrant"
  };

  const systemInstruction = `
    ACT AS: A Senior Viral Content Engineer for Phaws (Sustainable Pet Care brand).
    PHAWS PRODUCT: Biodegradable PHA dog toys. 
    VOICE: Fun, Educational, Eco-Conscious, Authentic.
    
    STRICT COMPLIANCE RULES:
    1. NO medical claims (e.g., 'cures anxiety').
    2. NO greenwashing. Be specific about PHA material.
    3. NO 'guaranteed results' or 'guaranteed growth'.
    4. NO unsafe dog behavior.
    5. Templates MUST be optimized for short-form video (TikTok/Reels/Shorts).
  `;

  const prompt = `
    RESEARCH TASK:
    1. Use Google Search to browse "TikTok Creative Center Trending Ads 2024", "Instagram Reels Trends Pet Industry", and "Meta Ads Library High Performing Pet Brands".
    2. Identify 3 distinct, high-engagement viral patterns or "hooks" being used right now.
    3. Transform these into specific Content Templates for Phaws.
    
    OUTPUT:
    Return a JSON array of 3 objects. Each object must follow this structure:
    {
      "name": "Template Name",
      "description": "Why this pattern is currently viral.",
      "category": "e.g. ASMR, Educational, POV, Vlog",
      "source": "Platform name",
      "viralityScore": 90-100,
      "blueprint": {
        "lighting": "Description of lighting style",
        "composition": "Camera angles",
        "aesthetic": "Visual vibe",
        "narrative_beat": "Pacing/Timing",
        "technical_specs": "Resolution/FPS/Editing style"
      },
      "template": {
        "platform": "TikTok/Reels",
        "hooks": ["Hook 1", "Hook 2", "Hook 3"],
        "script": "Detailed production script",
        "shotList": ["Shot 1", "Shot 2", "Shot 3", "Shot 4"],
        "cta": "Call to action",
        "audioVibe": "Audio/Music style"
      }
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 16000 },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            source: { type: Type.STRING },
            viralityScore: { type: Type.NUMBER },
            blueprint: {
              type: Type.OBJECT,
              properties: {
                lighting: { type: Type.STRING },
                composition: { type: Type.STRING },
                aesthetic: { type: Type.STRING },
                narrative_beat: { type: Type.STRING },
                technical_specs: { type: Type.STRING }
              }
            },
            template: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                hooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                script: { type: Type.STRING },
                shotList: { type: Type.ARRAY, items: { type: Type.STRING } },
                cta: { type: Type.STRING },
                audioVibe: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const raw = JSON.parse(response.text);
  if (!raw || !Array.isArray(raw)) {
    throw new Error("Model failed to generate valid trend array.");
  }

  const trends = raw.map((t: any, i: number) => ({
    ...t,
    id: `phaws-index-${Date.now()}-${i}`,
    timestamp: Date.now(),
    blueprint: { ...t.blueprint, raw_json: JSON.stringify(t.blueprint) }
  }));

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null).filter((u: any) => u !== null);

  return { trends, sources };
};

export const generateStrategy = async (brandName: string, goals: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Develop a viral content strategy for ${brandName}. Directives: ${goals}.`,
    config: { thinkingConfig: { thinkingBudget: 16000 } }
  });
  return response.text;
};

export const extractCampaignDetails = async (strategy: string): Promise<ActiveCampaign> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract a structured campaign for Phaws from this strategy: ${strategy}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          visualStyle: { type: Type.STRING },
          videoConcept: { type: Type.STRING },
          socialHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          voice: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const researchTrends = async (brandName: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find viral news related to pet care and sustainability for ${brandName}.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const urls = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null).filter((u: any) => u !== null) || [];
  return { text: response.text, urls };
};

export const generateProImage = async (prompt: string, aspectRatio: string, imageSize: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return `data:image/png;base64,${part?.inlineData?.data}`;
};

export const editImageWithFlash = async (base64: string, prompt: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: prompt }] }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return `data:image/png;base64,${part?.inlineData?.data}`;
};

export const analyzeImage = async (base64: string, prompt: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64, mimeType: 'image/png' } }, { text: prompt }] }
  });
  return response.text;
};

export const generateVideoAdvanced = async ({ prompt, aspectRatio, images, highQuality }: any) => {
  const ai = getAiClient();
  let operation;
  const config = { numberOfVideos: 1, resolution: highQuality ? '1080p' : '720p', aspectRatio };
  
  if (images && images.length > 0) {
    const referenceImages = images.map((img: string) => ({
      image: { imageBytes: img.split(',')[1], mimeType: 'image/png' },
      referenceType: 'ASSET' as any
    }));
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt,
      config: { ...config, referenceImages, resolution: '720p' }
    });
  } else {
    operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config
    });
  }

  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  return { url: `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}` };
};

export const analyzeVideo = async (file: File, prompt: string) => {
  const ai = getAiClient();
  const reader = new FileReader();
  const base64Promise = new Promise<string>((r) => {
    reader.onload = () => r((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const base64 = await base64Promise;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64, mimeType: file.type } }, { text: prompt }] }
  });
  return response.text;
};

export const generateFastSocialCopy = async (topic: string, platform: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create viral ${platform} content for Phaws. Topic: ${topic}. Fun, eco-conscious voice.`,
  });
  return response.text;
};

export const generateSocialCaptionFromMedia = async (image: string, topic: string, platform: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: image.split(',')[1], mimeType: 'image/png' } }, { text: `Viral ${platform} caption for Phaws: ${topic}` }] }
  });
  return response.text;
};

export const optimizePrompt = async (raw: string, type: 'image' | 'video' = 'video') => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Optimize for cinematic ${type}: "${raw}"`,
  });
  return response.text;
};
