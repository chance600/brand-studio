
import React, { useState, useEffect } from 'react';
import { generateStrategy, extractCampaignDetails, researchTrends } from '../services/geminiService';
import { AgentProps, AppMode } from '../types';

export const StrategyAgent: React.FC<AgentProps> = ({ onActivateCampaign, onNavigate, activeCampaign }) => {
  const [brandName, setBrandName] = useState(activeCampaign?.brandName || 'Phaws');
  const [goals, setGoals] = useState('Create viral, eco-conscious pet care content for sustainable dog toys. Fun & authentic voice.');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'strategy' | 'research'>('strategy');
  const [researchUrls, setResearchUrls] = useState<{title: string, uri: string}[]>([]);

  const handleRun = async () => {
    if (!brandName) return;
    setLoading(true);
    try {
      if (mode === 'strategy') {
        const result = await generateStrategy(brandName, goals);
        setOutput(result);
        const details = await extractCampaignDetails(result);
        if (onActivateCampaign) {
          onActivateCampaign({ 
            ...details, 
            brandName, 
            voice: "fun, educational, eco-conscious, authentic (Phaws specialized)" 
          });
        }
      } else {
        const result = await researchTrends(brandName);
        setOutput(result.text);
        setResearchUrls(result.urls);
      }
    } catch (e: any) { setOutput(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">Mission Control</h2>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Neural Strategy Engine for {brandName}</p>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 shadow-2xl space-y-10">
        <div className="flex gap-4 justify-center">
           <button onClick={() => setMode('strategy')} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${mode === 'strategy' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 text-slate-600'}`}>Deep Strategy</button>
           <button onClick={() => setMode('research')} className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${mode === 'research' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'bg-slate-950 text-slate-600'}`}>Trend Probe</button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-3 block px-4">Brand Profile ID</label>
            <input 
              type="text" value={brandName} onChange={e => setBrandName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold italic text-lg" 
              placeholder="e.g. Phaws"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-3 block px-4">Growth Directives</label>
            <textarea 
              value={goals} onChange={e => setGoals(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-8 text-white focus:ring-2 focus:ring-blue-500 outline-none h-40 text-sm leading-relaxed" 
              placeholder="Define your campaign objectives..."
            />
          </div>
          <button onClick={handleRun} disabled={loading} className="w-full py-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm text-white shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50">
            {loading ? <span className="animate-pulse">THINKING...</span> : 'EXECUTE MISSION'}
          </button>
        </div>
      </div>

      {activeCampaign && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-[2.5rem] p-10 animate-fade-in">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Campaign DNA: {activeCampaign.brandName}</h3>
              <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Active</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CampaignLink label="Image Studio" icon="🎨" desc="Visual Assets" onClick={() => onNavigate!(AppMode.IMAGE_STUDIO)} />
              <CampaignLink label="Video Lab" icon="🎥" desc="Veo Production" onClick={() => onNavigate!(AppMode.VIDEO_LAB)} />
              <CampaignLink label="Blueprint" icon="📐" desc="Trend Analysis" onClick={() => onNavigate!(AppMode.TREND_MIMIC)} />
           </div>
        </div>
      )}

      {output && (
        <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 shadow-2xl animate-fade-in relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-blue-500 text-9xl font-black italic">REPORT</div>
           <h3 className="text-xl font-black text-white italic uppercase mb-8 border-b border-slate-800 pb-6">Strategy Protocol 001</h3>
           <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-400 text-sm leading-[1.8] font-medium">
             {output}
           </div>
        </div>
      )}
    </div>
  );
};

const CampaignLink = ({label, icon, desc, onClick}: any) => (
  <button onClick={onClick} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-indigo-500 transition-all text-left group">
     <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
     <div className="font-black text-white uppercase text-xs tracking-widest">{label}</div>
     <div className="text-[10px] text-slate-600 font-bold mt-1 uppercase italic">{desc}</div>
  </button>
);
