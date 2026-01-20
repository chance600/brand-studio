
import React, { useState, useEffect } from 'react';
import { scoutViralTrends } from '../services/geminiService';
import { AgentProps, IndexedTrend, AppMode } from '../types';

export const TrendMimic: React.FC<AgentProps> = ({ activeCampaign, onNavigate }) => {
  const [viewMode, setViewMode] = useState<'pipeline' | 'vault'>('pipeline');
  const [scouting, setScouting] = useState(false);
  const [agentStatus, setAgentStatus] = useState('');
  const [trendLibrary, setTrendLibrary] = useState<IndexedTrend[]>([]);
  const [researchTrail, setResearchTrail] = useState<{title: string, uri: string}[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<IndexedTrend | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('phaws_vault_final_v2');
    if (saved) {
      setTrendLibrary(JSON.parse(saved));
    } else {
      const seed: IndexedTrend[] = [{
        id: 'seed-001',
        name: 'Sustainability ASMR',
        description: 'Tapping on biodegradable materials to emphasize quality and earth-safe texture.',
        category: 'Eco-ASMR',
        source: 'Internal Research',
        viralityScore: 95,
        timestamp: Date.now(),
        blueprint: {
          aesthetic: 'Natural, earthy tones, high-def textures',
          lighting: 'Soft side-lighting from windows',
          composition: 'Extreme macro close-ups',
          narrative_beat: 'Rhythmic, relaxing, satisfying',
          technical_specs: '4K 60fps, sensitive audio gain',
          raw_json: '{}'
        },
        template: {
          platform: 'TikTok / Reels',
          hooks: ['Wait for the sound of sustainable play...', 'Can your dog toy do this?', 'Unboxing the future of pet care.'],
          script: '[No voiceover, just the sounds of the PHA toy being squished and dog paws.] Overlay: PHA = Plants, not Plastic.',
          shotList: ['Macro of toy texture', 'Slow-mo squish', 'Dog grabbing toy', 'Logo fade'],
          cta: 'Shop the PHA collection.',
          audioVibe: 'Crispy, high-fidelity ASMR'
        }
      }];
      setTrendLibrary(seed);
      localStorage.setItem('phaws_vault_final_v2', JSON.stringify(seed));
    }
  }, []);

  const handleScout = async () => {
    setScouting(true);
    setResearchTrail([]);
    setAgentStatus('DEPLOYING PHAWS SCOUT AGENT...');
    
    try {
      // Fake status updates to keep UI responsive while Pro model "thinks"
      const statusTimer = setInterval(() => {
        const statuses = [
          'PROBING TIKTOK CREATIVE CENTER...',
          'ANALYZING INSTAGRAM REELS PATTERNS...',
          'FILTERING FOR SUSTAINABILITY COMPLIANCE...',
          'SYNTHESIZING NEW TEMPLATES...',
          'CALIBRATING RETENTION SCORES...'
        ];
        setAgentStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 3000);

      const result = await scoutViralTrends("All Platforms", activeCampaign || undefined);
      
      clearInterval(statusTimer);

      if (result.trends.length === 0) {
        throw new Error("No new patterns found in current search cycle.");
      }

      const updated = [...result.trends, ...trendLibrary].slice(0, 50);
      setTrendLibrary(updated);
      setResearchTrail(result.sources);
      localStorage.setItem('phaws_vault_final_v2', JSON.stringify(updated));
      
      setAgentStatus('PIPELINE SYNC COMPLETE. 3 NEW TEMPLATES ADDED.');
    } catch (e: any) {
      setAgentStatus(`PIPELINE ERROR: ${e.message}`);
    } finally {
      setScouting(false);
    }
  };

  const useTemplate = (trend: IndexedTrend, mode: AppMode) => {
    if (!onNavigate) return;
    const prompt = `[Phaws Content Factory] 
    Trend Reference: ${trend.name}
    Platform: ${trend.template.platform}
    Visual DNA: ${trend.blueprint.aesthetic}
    Lighting: ${trend.blueprint.lighting}
    Narrative: ${trend.template.script}
    Brand Safety: NO medical claims, NO greenwashing.`;
    
    onNavigate(mode, { prefillPrompt: prompt, blueprint: trend.blueprint, template: trend.template });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12 pb-32">
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40">🌿</div>
             <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Phaws Pipeline</h2>
          </div>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Autonomous Template Generation Engine</p>
        </div>

        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
           <button onClick={() => setViewMode('pipeline')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'pipeline' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/20' : 'text-slate-500 hover:text-slate-300'}`}>Command Center</button>
           <button onClick={() => setViewMode('vault')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'vault' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-500 hover:text-slate-300'}`}>Data Vault ({trendLibrary.length})</button>
        </div>
      </div>

      {viewMode === 'pipeline' ? (
        <div className="space-y-10 animate-fade-in">
           {/* Scout Interface */}
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-emerald-500 text-9xl font-black italic">SCOUT_v3</div>
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                 <div className="space-y-6 max-w-xl text-center lg:text-left">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Sync Viral Patterns</h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                       Deploy the Gemini 3 Pro Scout to deconstruct live ads on TikTok and Meta. 
                       Patterns are automatically reconstituted into Phaws-specific templates.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                       {['TikTok', 'Meta', 'Shorts'].map(p => (
                         <span key={p} className="bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">{p} HUB ACTIVE</span>
                       ))}
                    </div>
                 </div>

                 <button 
                    onClick={handleScout}
                    disabled={scouting}
                    className="group bg-slate-950 border border-slate-700 hover:border-emerald-500 p-12 rounded-[3rem] transition-all flex flex-col items-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50 min-w-[280px]"
                 >
                    {scouting ? (
                       <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    ) : (
                       <span className="text-6xl group-hover:scale-110 transition-transform">🛰️</span>
                    )}
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">DEEP SEARCH</span>
                 </button>
              </div>

              {/* Research Log terminal */}
              {(scouting || researchTrail.length > 0) && (
                <div className="mt-10 bg-black/80 border border-slate-800 rounded-3xl p-8 font-mono text-[10px] space-y-4 shadow-inner">
                   <div className="flex justify-between items-center text-slate-600 font-bold uppercase tracking-widest border-b border-slate-800 pb-4">
                      <span>Status Protocol: <span className="text-emerald-500">{agentStatus}</span></span>
                      <span className="animate-pulse">Gemini 3 Pro Active</span>
                   </div>
                   {researchTrail.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                        {researchTrail.map((url, i) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800/50 truncate group hover:border-emerald-500/50 transition-colors">
                            <span className="text-emerald-500 font-black">SOURCE_{i+1}</span>
                            <span className="text-slate-400 truncate text-[9px]">{url.title}</span>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
           </div>

           {/* Quick Access Grid */}
           <div className="space-y-6">
              <div className="flex items-center gap-4 px-4">
                <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.5em]">Sync History</h4>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendLibrary.slice(0, 6).map(trend => (
                  <TrendCard key={trend.id} trend={trend} onSelect={() => setSelectedTrend(trend)} />
                ))}
              </div>
           </div>
        </div>
      ) : (
        /* SPREADSHEET VAULT VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in">
           <div className="p-8 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">PHAWS_TEMPLATE_VAULT.xls</h3>
              <div className="text-[10px] font-mono text-slate-600">RECORDS: {trendLibrary.length}</div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Template ID</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Pattern Name</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Channel</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Virality</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/30">
                    {trendLibrary.map(trend => (
                      <tr key={trend.id} className="hover:bg-slate-800/20 transition-colors group">
                         <td className="p-6 font-mono text-[9px] text-slate-600">{trend.id.substring(0, 12)}</td>
                         <td className="p-6">
                            <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">{trend.name}</div>
                            <div className="text-[10px] text-slate-500 italic mt-1">{trend.category}</div>
                         </td>
                         <td className="p-6 text-xs text-slate-400 font-bold uppercase tracking-widest">{trend.template.platform}</td>
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="h-1.5 w-24 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{width: `${trend.viralityScore}%`}}></div>
                               </div>
                               <span className="text-[10px] font-mono font-black text-emerald-400">{trend.viralityScore}%</span>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded uppercase font-black tracking-widest">VERIFIED</span>
                         </td>
                         <td className="p-6">
                            <button onClick={() => setSelectedTrend(trend)} className="text-[9px] font-black uppercase text-indigo-400 hover:text-white transition-colors border border-indigo-500/20 px-4 py-2 rounded-xl bg-indigo-500/5 hover:bg-indigo-600 shadow-xl">Get Script</button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* DETAIL MODAL (THE TEMPLATE) */}
      {selectedTrend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/80 backdrop-blur-xl animate-fade-in p-4 lg:p-10">
           <div className="w-full max-w-3xl h-full bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] border border-slate-800 overflow-y-auto custom-scrollbar animate-slide-in-right">
              <div className="p-12 space-y-12">
                 <div className="flex justify-between items-start border-b border-slate-800 pb-10">
                    <div className="space-y-3">
                       <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-[0.3em]">Phaws Framework</span>
                       <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{selectedTrend.name}</h3>
                       <p className="text-slate-500 font-medium italic">Analyzed from live {selectedTrend.source} patterns.</p>
                    </div>
                    <button onClick={() => setSelectedTrend(null)} className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors text-2xl shadow-xl">✕</button>
                 </div>

                 {/* SCRIPT & PRODUCTION DATA */}
                 <div className="grid grid-cols-1 gap-12">
                    <section className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-10 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500 text-6xl font-black italic select-none">BLUEPRINT</div>
                       
                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] border-b border-slate-900 pb-3">Phaws Hooks</h5>
                          <div className="space-y-3">
                            {selectedTrend.template.hooks.map((h, i) => (
                               <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-sm italic font-bold text-slate-300">"{h}"</div>
                            ))}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] border-b border-slate-900 pb-3">The Script</h5>
                          <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 text-sm leading-[1.8] text-slate-400 whitespace-pre-wrap font-medium">
                             {selectedTrend.template.script}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.5em] border-b border-slate-900 pb-3">The Shot List</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {selectedTrend.template.shotList.map((shot, i) => (
                               <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4 group">
                                  <span className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-[10px] font-black text-slate-700 group-hover:text-orange-500 transition-colors">0{i+1}</span>
                                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{shot}</div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </section>
                 </div>

                 <div className="pt-10 border-t border-slate-800 space-y-8">
                    <div className="flex flex-col md:flex-row gap-6">
                       <button onClick={() => useTemplate(selectedTrend, AppMode.IMAGE_STUDIO)} className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:scale-[1.02] active:scale-95 text-white text-[11px] font-black tracking-[0.2em] py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3">
                          🎨 IMAGE STUDIO SYNC
                       </button>
                       <button onClick={() => useTemplate(selectedTrend, AppMode.VIDEO_LAB)} className="flex-1 bg-gradient-to-br from-orange-600 to-red-700 hover:scale-[1.02] active:scale-95 text-white text-[11px] font-black tracking-[0.2em] py-6 rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3">
                          🎥 VIDEO LAB SYNC
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const TrendCard: React.FC<{trend: IndexedTrend, onSelect: () => void}> = ({ trend, onSelect }) => (
  <div 
    onClick={onSelect}
    className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 hover:border-emerald-500/50 cursor-pointer transition-all transform hover:-translate-y-3 shadow-2xl group relative overflow-hidden flex flex-col min-h-[380px]"
  >
     <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10">{trend.category}</span>
        <div className="text-2xl font-black text-white italic tracking-tighter">{trend.viralityScore}%</div>
     </div>
     <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none group-hover:text-emerald-400 transition-colors">{trend.name}</h4>
     <p className="text-xs text-slate-500 line-clamp-4 mb-8 leading-relaxed font-medium">"{trend.description}"</p>
     <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-800/50">
        <span className="text-[9px] font-mono text-slate-600 uppercase font-bold tracking-widest">{trend.template.platform}</span>
        <span className="text-[10px] font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-6 group-hover:translate-x-0 tracking-widest">GET_BLUEPRINT →</span>
     </div>
  </div>
);
