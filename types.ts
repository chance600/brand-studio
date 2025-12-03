export enum AppMode {
  STRATEGY = 'STRATEGY',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_LAB = 'VIDEO_LAB',
  SOCIAL_SPEED = 'SOCIAL_SPEED',
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_16_9 = '16:9',
  PORTRAIT_9_16 = '9:16',
  LANDSCAPE_21_9 = '21:9',
  PORTRAIT_2_3 = '2:3',
  LANDSCAPE_3_2 = '3:2'
}

export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K',
}

export enum VideoResolution {
  P720 = '720p',
  P1080 = '1080p',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  images?: string[]; // base64
  groundingUrls?: { title: string; uri: string }[];
  isThinking?: boolean;
}

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
}

export interface ActiveCampaign {
  brandName: string;
  visualStyle: string; // Describes the aesthetic for Image Gen
  videoConcept: string; // A core video idea for Veo
  socialHooks: string[]; // List of snappy headlines
  targetAudience: string;
}

// Window interface extension for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}