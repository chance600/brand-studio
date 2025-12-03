import React, { useState } from 'react';
import { generateStrategy, researchTrends, extractCampaignDetails } from '../services/geminiService';
import { ActiveCampaign, AppMode } from '../types';

interface StrategyProps {
  onActivateCampaign: (campaign: ActiveCampaign) => void;
  onNavigate: (mode: AppMode) => void;
  activeCampaign: ActiveCampaign | null;
}

export const StrategyAgent: React.FC<StrategyProps> = ({ onActivateCampaign, onNavigate, activeCampaign }) => {
  const [brandName, setBrandName] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'strategy' | 'research'>('strategy');
  const [researchUrls, setResearchUrls] = useState<{title: string, uri: string}[]>([]);
  const [extracting, setExtracting] = useState(false);

  const handleRun = async () => {
    if (!brandName) return;
    setLoading(true);
    setOutput('');
    setResearchUrls([]);
    
    try {
      if (mode === 'strategy') {
        const result = await generateStrategy(brandName, goals);
        setOutput(result || "No strategy generated.");
        
        // Auto-extract campaign details for the engine
        setExtracting(true);
        try {
           const details = await extractCampaignDetails(result);
           onActivateCampaign({ ...details, brandName });
        } catch (e) {
           console.error("Failed to extract campaign details", e);
        } finally {
           setExtracting(false);
        }

      } else {
        const result = await researchTrends(brandName);
        setOutput(result.text || "No trends found.");
        setResearchUrls(result.urls);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Mission Control
        </h2>
        <p className="text-slate-400">Deep thinking & strategy planning hub.</p>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setMode('strategy')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'strategy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Deep Strategy (Thinking Mode)
          </button>
          <button
            onClick={() => setMode('research')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              mode === 'research' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Trend Research (Google Search)
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              {mode === 'strategy' ? 'Brand Name' : 'Topic to Research'}
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={mode === 'strategy' ? "e.g., EcoKicks" : "e.g., Sustainable Fashion Trends 2025"}
            />
          </div>

          {mode === 'strategy' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Growth Goals</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                placeholder="e.g., Reach 100k users in 3 months focusing on Gen Z..."
              />
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {mode === 'strategy' ? 'Thinking...' : 'Searching...'}
              </span>
            ) : (
              mode === 'strategy' ? 'Generate Strategy & Campaign Assets' : 'Find Trends'
            )}
          </button>
        </div>
      </div>

      {activeCampaign && !loading && (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6 shadow-2xl animate-fade-in">
           <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">🚀 Campaign Active: {activeCampaign.brandName}</h3>
                <p className="text-indigo-200 text-sm mt-1">Assets ready for deployment</p>
              </div>
              {extracting && <span className="text-xs text-indigo-300 animate-pulse">Extracting prompt data...</span>}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <button onClick={() => onNavigate(AppMode.IMAGE_STUDIO)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-purple-500 transition-all text-left group">
                 <div className="text-2xl mb-2">🎨</div>
                 <div className="font-semibold text-white group-hover:text-purple-400">Create Visuals</div>
                 <div className="text-xs text-slate-400 mt-1">Uses campaign visual style</div>
              </button>
              <button onClick={() => onNavigate(AppMode.VIDEO_LAB)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-orange-500 transition-all text-left group">
                 <div className="text-2xl mb-2">🎥</div>
                 <div className="font-semibold text-white group-hover:text-orange-400">Produce Video</div>
                 <div className="text-xs text-slate-400 mt-1">Uses campaign video script</div>
              </button>
              <button onClick={() => onNavigate(AppMode.SOCIAL_SPEED)} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-yellow-500 transition-all text-left group">
                 <div className="text-2xl mb-2">⚡</div>
                 <div className="font-semibold text-white group-hover:text-yellow-400">Generate Posts</div>
                 <div className="text-xs text-slate-400 mt-1">Uses campaign hooks</div>
              </button>
           </div>
        </div>
      )}

      {output && (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl animate-fade-in">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Strategy Report</h3>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-300">
            {output}
          </div>
          {researchUrls.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">Sources Found:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {researchUrls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-slate-950 p-2 rounded border border-slate-800 hover:border-blue-800 transition-colors">
                      <span className="truncate">{url.title}</span>
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};