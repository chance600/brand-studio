import React, { useState } from 'react';
import { generateFastSocialCopy } from '../services/geminiService';
import { ActiveCampaign } from '../types';

interface SocialSpeedProps {
  activeCampaign: ActiveCampaign | null;
}

export const SocialSpeed: React.FC<SocialSpeedProps> = ({ activeCampaign }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter/X');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async (t: string) => {
    if (!t) return;
    setLoading(true);
    const start = performance.now();
    try {
      const text = await generateFastSocialCopy(t, platform);
      const end = performance.now();
      const time = ((end - start) / 1000).toFixed(2);
      setOutput(`${text}\n\n---\n⚡ Generated in ${time}s using Flash Lite`);
    } catch (e: any) {
      setOutput("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
       <div className="text-center">
         <h2 className="text-3xl font-bold text-yellow-400">Social Speed</h2>
         <p className="text-slate-400">Lightning fast copy generation</p>
       </div>
       
       {activeCampaign && (
          <div className="bg-slate-900 border border-yellow-600/30 rounded-lg p-4">
             <h3 className="text-yellow-400 font-bold text-sm uppercase mb-3">Campaign Hooks</h3>
             <div className="flex flex-wrap gap-2">
                {activeCampaign.socialHooks.map((hook, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setTopic(hook); handleGenerate(hook); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm py-2 px-3 rounded-full border border-slate-700 transition-colors text-left"
                  >
                    ⚡ {hook}
                  </button>
                ))}
             </div>
          </div>
       )}

       <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
          <input 
            type="text"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none"
            placeholder="What's happening? e.g. New Product Launch"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Twitter/X', 'Instagram', 'LinkedIn', 'TikTok'].map(p => (
              <button 
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${platform === p ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}
              >
                {p}
              </button>
            ))}
          </div>

          <button 
            onClick={() => handleGenerate(topic)}
            disabled={loading || !topic}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Zap! ⚡' : 'Generate Fast'}
          </button>
       </div>

       {output && (
         <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(output.split('---')[0])}>
           <div className="absolute top-4 right-4 text-xs text-slate-500 group-hover:text-yellow-400">Click to Copy</div>
           <p className="whitespace-pre-wrap text-lg text-slate-200">{output}</p>
         </div>
       )}
    </div>
  );
};