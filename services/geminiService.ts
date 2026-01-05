import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, ImageSize, VideoResolution, ActiveCampaign } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const ensurePaidApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey && window.aistudio.openSelectKey) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      return true; 
    }
  }
  return true;
};

// --- Strategy ---

export const generateStrategy = async (brandName: string, goals: string) => {
  const ai = getAiClient();
  const prompt = `Act as a senior marketing strategist for the brand "${brandName}". 
  The brand's goal is: "${goals}".
  
  Develop a comprehensive viral growth strategy. Include:
  1. Core Value Proposition
  2. Target Audience Personas
  3. Key Campaign Angles
  4. A detailed content calendar idea for one week.
  
  Use deep reasoning to ensure the strategy is unique and actionable.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    }
  });

  return response.text;
};

export const extractCampaignDetails = async (strategyText: string): Promise<ActiveCampaign> => {
  const ai = getAiClient();
  const prompt = `Analyze the following marketing strategy and extract structured campaign assets.
  
  Strategy Text:
  ${strategyText.substring(0, 5000)}
  
  Return a JSON object with:
  - visualStyle: A detailed prompt describing the visual aesthetic (lighting, color palette, mood) suitable for an image generator.
  - videoConcept: A specific, cinematic video scene description suitable for a video generation model.
  - socialHooks: An array of 3 short, punchy social media headlines/hooks.
  - targetAudience: A 1-sentence summary of the target audience.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visualStyle: { type: Type.STRING },
          videoConcept: { type: Type.STRING },
          socialHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING }
        }
      }
    }
  });
  
  return JSON.parse(response.text);
};

export const researchTrends = async (topic: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Find the latest trending news, memes, or discussions related to: "${topic}". Provide a summary and list specific links to sources.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null).filter((u: any) => u !== null);

  return {
    text: response.text,
    urls: urls
  };
};

export const optimizePrompt = async (rawInput: string, type: 'image' | 'video'): Promise<string> => {
  const ai = getAiClient();
  const systemInstruction = type === 'video' 
    ? "You are an expert prompt engineer for Veo. Convert the user's idea into a highly detailed, cinematic video description including lighting, camera movement, and texture." 
    : "You are an expert prompt engineer for Image generation. Convert the user's idea into a detailed visual description including composition, lighting, and style.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Optimize this prompt: "${rawInput}"`,
    config: { systemInstruction }
  });
  return response.text;
};

// --- Image Studio ---

export const generateProImage = async (prompt: string, aspectRatio: AspectRatio, size: ImageSize) => {
  await ensurePaidApiKey();
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio, imageSize: size },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editImageWithFlash = async (base64Image: string, prompt: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: prompt },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No edited image returned");
};

export const analyzeImage = async (base64Image: string, prompt: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt },
      ],
    },
  });
  return response.text;
};

// --- Video Lab ---

export const generateVideoFromPrompt = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  await ensurePaidApiKey();
  const ai = getAiClient();

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");
  
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const animateImageWithVeo = async (base64Image: string, prompt: string | undefined, aspectRatio: '16:9' | '9:16') => {
  await ensurePaidApiKey();
  const ai = getAiClient();

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this image cinematically",
    image: {
      imageBytes: base64Image,
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video animation failed");
  
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const analyzeVideo = async (file: File, prompt: string): Promise<string> => {
  const ai = getAiClient();
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
              const response = await ai.models.generateContent({
                  model: 'gemini-3-pro-preview',
                  contents: {
                      parts: [
                          { inlineData: { mimeType: file.type, data: base64Data } },
                          { text: prompt }
                      ]
                  }
              });
              resolve(response.text || "No analysis generated.");
          } catch (e) {
              reject(e);
          }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
};

// --- Social Speed ---

export const generateFastSocialCopy = async (topic: string, platform: string) => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Write a viral ${platform} post about "${topic}". Keep it punchy, use emojis, and include hashtags.`,
  });
  return response.text;
};

export const generateSocialCaptionFromMedia = async (base64Image: string | null, topic: string, platform: string) => {
  const ai = getAiClient();
  const parts: any[] = [];
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1] // remove data:image/jpeg;base64,
      }
    });
  }
  
  parts.push({
    text: `You are a social media expert. Write 3 distinct, engaging, and viral captions for ${platform} based on this image (if provided) and the following topic/context: "${topic}". 
    
    If an image is provided, analyze it specifically to make the caption relevant to the visual content.
    Include hashtags.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using standard Flash for multimodal vision
    contents: { parts },
  });
  
  return response.text;
};