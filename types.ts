
export enum AppMode {
  STRATEGY = 'STRATEGY',
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  VIDEO_LAB = 'VIDEO_LAB',
  SOCIAL_SPEED = 'SOCIAL_SPEED',
  TREND_MIMIC = 'TREND_MIMIC'
}

export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT_3_4 = '3:4',
  LANDSCAPE_4_3 = '4:3',
  LANDSCAPE_16_9 = '16:9',
  PORTRAIT_9_16 = '9:16'
}

// Added ImageSize enum for high-quality image generation supported by gemini-3-pro-image-preview
export enum ImageSize {
  K1 = '1K',
  K2 = '2K',
  K4 = '4K'
}

export interface ContentTemplate {
  platform: string;
  hooks: string[];
  script: string;
  shotList: string[];
  cta: string;
  audioVibe: string;
}

export interface TrendBlueprint {
  lighting: string;
  composition: string;
  aesthetic: string;
  narrative_beat: string;
  technical_specs: string;
  raw_json: string;
}

export interface IndexedTrend {
  id: string;
  name: string;
  description: string;
  category: string;
  source: string;
  viralityScore: number;
  blueprint: TrendBlueprint;
  template: ContentTemplate;
  isLive?: boolean;
  timestamp: number;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'copy' | 'blueprint';
  content: string; 
  timestamp: number;
}

export interface ActiveCampaign {
  brandName: string;
  visualStyle: string; 
  videoConcept: string; 
  socialHooks: string[]; 
  targetAudience: string;
  voice: string;
}

export interface AgentProps {
  activeCampaign: ActiveCampaign | null;
  history: GeneratedAsset[];
  onAssetGenerated: (asset: GeneratedAsset) => void;
  onNavigate?: (mode: AppMode, payload?: any) => void;
  onActivateCampaign?: (campaign: ActiveCampaign) => void;
  navigationPayload?: any;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}
