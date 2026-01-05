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

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video' | 'copy';
  content: string; // URL for media, text for copy
  preview?: string; // Optional thumbnail or snippet
  timestamp: number;
}

export interface ActiveCampaign {
  brandName: string;
  visualStyle: string; 
  videoConcept: string; 
  socialHooks: string[]; 
  targetAudience: string;
}

// Common props for agents
export interface AgentProps {
  activeCampaign: ActiveCampaign | null;
  history: GeneratedAsset[];
  onAssetGenerated: (asset: GeneratedAsset) => void;
  onNavigate?: (mode: AppMode) => void;
  onActivateCampaign?: (campaign: ActiveCampaign) => void;
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