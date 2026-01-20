
import React, { useState } from 'react';
import { StrategyAgent } from './components/StrategyAgent';
import { ImageStudio } from './components/ImageStudio';
import { VideoLab } from './components/VideoLab';
import { SocialSpeed } from './components/SocialSpeed';
import { TrendMimic } from './components/TrendMimic';
import { AppMode, ActiveCampaign, GeneratedAsset } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STRATEGY);
  const [campaign, setCampaign] = useState<ActiveCampaign | null>(null);
  const [history, setHistory] = useState<GeneratedAsset[]>([]);
  const [navigationPayload, setNavigationPayload] = useState<any>(null);

  // Helper to navigate with payload
  const handleNavigate = (newMode: AppMode, payload?: any) => {
    setNavigationPayload(payload || null);
    setMode(newMode);
  };

  // Helper to add assets to memory
  const addAsset = (asset: GeneratedAsset) => {
    setHistory(prev => [asset, ...prev]);
  };

  const renderContent = () => {
    const commonProps = {
      activeCampaign: campaign,
      history,
      onAssetGenerated: addAsset,
      onNavigate: handleNavigate,
      navigationPayload
    };

    switch (mode) {
      case AppMode.STRATEGY: 
        return <StrategyAgent 
          {...commonProps} 
          onActivateCampaign={setCampaign} 
        />;
      case AppMode.IMAGE_STUDIO: 
        return <ImageStudio {...commonProps} />;
      case AppMode.VIDEO_LAB: 
        return <VideoLab {...commonProps} />;
      case AppMode.SOCIAL_SPEED: 
        return <SocialSpeed {...commonProps} />;
      case AppMode.TREND_MIMIC:
        return <TrendMimic {...commonProps} />;
      default: 
        return <StrategyAgent 
          {...commonProps} 
          onActivateCampaign={setCampaign} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans text-slate-100">
      {/* Sidebar Nav */}
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col md:h-screen sticky top-0 z-50 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-lg shadow-lg">🚀</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
              BrandRocket
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">AI VIRAL ENGINE</p>
        </div>
        
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem 
            active={mode === AppMode.STRATEGY} 
            onClick={() => handleNavigate(AppMode.STRATEGY)} 
            icon="🧠" 
            label="Strategy" 
            desc="Mission Control"
          />
          <NavItem 
            active={mode === AppMode.TREND_MIMIC} 
            onClick={() => handleNavigate(AppMode.TREND_MIMIC)} 
            icon="📐" 
            label="Blueprint" 
            desc="Trend DNA"
          />
          <NavItem 
            active={mode === AppMode.IMAGE_STUDIO} 
            onClick={() => handleNavigate(AppMode.IMAGE_STUDIO)} 
            icon="🎨" 
            label="Image Studio"
            desc="Gen & Remix" 
          />
          <NavItem 
            active={mode === AppMode.VIDEO_LAB} 
            onClick={() => handleNavigate(AppMode.VIDEO_LAB)} 
            icon="🎥" 
            label="Video Lab" 
            desc="Veo Production"
          />
          <NavItem 
            active={mode === AppMode.SOCIAL_SPEED} 
            onClick={() => handleNavigate(AppMode.SOCIAL_SPEED)} 
            icon="⚡" 
            label="Social Speed"
            desc="Viral Copy" 
          />

          <div className="pt-6 px-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-2">Memory</h3>
            <div className="space-y-2">
               <div className="flex justify-between px-2 text-xs text-slate-400">
                  <span>Images</span>
                  <span className="text-white">{history.filter(a => a.type === 'image').length}</span>
               </div>
               <div className="flex justify-between px-2 text-xs text-slate-400">
                  <span>Videos</span>
                  <span className="text-white">{history.filter(a => a.type === 'video').length}</span>
               </div>
               <div className="flex justify-between px-2 text-xs text-slate-400">
                  <span>Copy</span>
                  <span className="text-white">{history.filter(a => a.type === 'copy').length}</span>
               </div>
            </div>
          </div>
        </div>

        {campaign && (
          <div className="p-4 mx-3 mb-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg shadow-inner">
            <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1 tracking-wider">Active Campaign</div>
            <div className="text-sm text-white font-semibold truncate">{campaign.brandName}</div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="text-[10px] text-slate-600 text-center">
             Powered by Google Gemini
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
         {renderContent()}
      </main>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: string, label: string, desc: string}> = ({
  active, onClick, icon, label, desc
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
      active 
      ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/50 border-l-2 border-indigo-500' 
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <span className={`text-xl p-2 rounded-md transition-colors ${active ? 'bg-slate-700' : 'bg-slate-800 group-hover:bg-slate-700'}`}>{icon}</span>
    <div className="text-left">
      <div className="font-medium text-sm">{label}</div>
      <div className={`text-[10px] ${active ? 'text-indigo-300' : 'text-slate-500'}`}>{desc}</div>
    </div>
  </button>
);

export default App;
