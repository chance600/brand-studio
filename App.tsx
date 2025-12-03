import React, { useState } from 'react';
import { StrategyAgent } from './components/StrategyAgent';
import { ImageStudio } from './components/ImageStudio';
import { VideoLab } from './components/VideoLab';
import { SocialSpeed } from './components/SocialSpeed';
import { AppMode, ActiveCampaign } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STRATEGY);
  const [campaign, setCampaign] = useState<ActiveCampaign | null>(null);

  const renderContent = () => {
    switch (mode) {
      case AppMode.STRATEGY: 
        return <StrategyAgent onActivateCampaign={setCampaign} activeCampaign={campaign} onNavigate={setMode} />;
      case AppMode.IMAGE_STUDIO: 
        return <ImageStudio activeCampaign={campaign} />;
      case AppMode.VIDEO_LAB: 
        return <VideoLab activeCampaign={campaign} />;
      case AppMode.SOCIAL_SPEED: 
        return <SocialSpeed activeCampaign={campaign} />;
      default: 
        return <StrategyAgent onActivateCampaign={setCampaign} activeCampaign={campaign} onNavigate={setMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans">
      {/* Sidebar Nav */}
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col md:h-screen sticky top-0 z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
              BrandRocket
            </h1>
          </div>
          <p className="text-xs text-slate-500">Viral Content Engine</p>
        </div>
        
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem 
            active={mode === AppMode.STRATEGY} 
            onClick={() => setMode(AppMode.STRATEGY)} 
            icon="🧠" 
            label="Strategy & Plans" 
          />
          <NavItem 
            active={mode === AppMode.IMAGE_STUDIO} 
            onClick={() => setMode(AppMode.IMAGE_STUDIO)} 
            icon="🎨" 
            label="Image Studio" 
          />
          <NavItem 
            active={mode === AppMode.VIDEO_LAB} 
            onClick={() => setMode(AppMode.VIDEO_LAB)} 
            icon="🎥" 
            label="Video Lab" 
          />
          <NavItem 
            active={mode === AppMode.SOCIAL_SPEED} 
            onClick={() => setMode(AppMode.SOCIAL_SPEED)} 
            icon="⚡" 
            label="Social Speed" 
          />
        </div>

        {campaign && (
          <div className="p-4 mx-4 mb-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-lg">
            <div className="text-xs text-blue-300 font-bold uppercase mb-1">Active Campaign</div>
            <div className="text-sm text-white font-medium truncate">{campaign.brandName}</div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
           <div className="text-xs text-slate-500">
             Powered by Gemini 3.0 Pro & Veo
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950 relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         {renderContent()}
      </main>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: string, label: string}> = ({
  active, onClick, icon, label
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
      ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/50 translate-x-1 border-l-2 border-blue-500' 
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

export default App;