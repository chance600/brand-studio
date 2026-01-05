import React, { useState, useRef } from 'react';
import { generateFastSocialCopy, generateSocialCaptionFromMedia } from '../services/geminiService';
import { AgentProps } from '../types';

export const SocialSpeed: React.FC<AgentProps> = ({ activeCampaign, history, onAssetGenerated }) => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Twitter/X');
  const [loading, setLoading] = useState(false);
  const [droppedImage, setDroppedImage] = useState<string | null>(null);
  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setDroppedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (t: string) => {
    if (!t && !droppedImage) return;
    setLoading(true);
    
    try {
      let text = '';
      const start = performance.now();
      
      if (droppedImage) {
        text = await generateSocialCaptionFromMedia(droppedImage, t, platform);
      } else {
        text = await generateFastSocialCopy(t, platform);
      }
      
      const end = performance.now();
      const time = ((end - start) / 1000).toFixed(2);
      const finalOutput = `${text}\n\n---\n⚡ Generated in ${time}s using Gemini 2.5 Flash`;
      
      // Save to memory
      onAssetGenerated({
        id: Date.now().toString(),
        type: 'copy',
        content: finalOutput,
        timestamp: Date.now()
      });

    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Get recent copy assets
  const recentCopy = history.filter(a => a.type === 'copy').slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
       <div className="text-center space-y-2">
         <h2 className="text-4xl font-bold text-yellow-400 tracking-tight">Social Speed</h2>
         <p className="text-slate-400">Viral content engine with Image-to-Caption intelligence</p>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Generator */}
         <div className="lg:col-span-2 space-y-6">
            {/* Context Hooks */}
            {activeCampaign && (
                <div className="bg-slate-900/50 border border-yellow-600/20 rounded-xl p-4">
                  <h3 className="text-yellow-400 font-bold text-xs uppercase mb-3 tracking-wider">Active Campaign Hooks</h3>
                  <div className="flex flex-wrap gap-2">
                      {activeCampaign.socialHooks.map((hook, idx) => (
                        <button 
                          key={idx}
                          onClick={() => { setTopic(hook); }}
                          className="bg-slate-800 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-slate-300 hover:text-yellow-200 text-sm py-2 px-4 rounded-full border border-slate-700 transition-all text-left"
                        >
                          ⚡ {hook}
                        </button>
                      ))}
                  </div>
                </div>
            )}

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
                {/* Platform Selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['Twitter/X', 'Instagram', 'LinkedIn', 'TikTok'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${platform === p ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Drag & Drop Zone */}
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-yellow-400 bg-yellow-400/5 scale-[1.01]' : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                  
                  {droppedImage ? (
                    <div className="relative inline-block group">
                      <img src={droppedImage} alt="Context" className="h-40 rounded-lg shadow-lg border border-slate-700" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDroppedImage(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pointer-events-none">
                      <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl">📸</div>
                      <p className="text-slate-300 font-medium">Drag & Drop Image Here</p>
                      <p className="text-xs text-slate-500">Add an image to generate relevant captions automatically</p>
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block font-semibold">Context / Topic</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none min-h-[100px]"
                    placeholder={droppedImage ? "Add extra context about this image (optional)..." : "What is this post about? e.g. Summer Sale"}
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>

                <button 
                  onClick={() => handleGenerate(topic)}
                  disabled={loading || (!topic && !droppedImage)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-lg py-4 rounded-xl transition-all shadow-lg shadow-yellow-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? 'Optimizing with Gemini...' : '⚡ Generate Viral Copy'}
                </button>
            </div>
         </div>

         {/* Memory / History Column */}
         <div className="space-y-4">
            <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider flex items-center gap-2">
              <span>🕒</span> Recent Generations
            </h3>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {recentCopy.length === 0 && (
                <div className="text-center p-8 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                  <p className="text-slate-600 text-sm">No copy generated yet.</p>
                </div>
              )}
              
              {recentCopy.map((asset) => (
                <div key={asset.id} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-600 transition-all group relative animate-fade-in">
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigator.clipboard.writeText(asset.content.split('---')[0])}
                        className="text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600"
                      >
                        Copy
                      </button>
                   </div>
                   <p className="text-slate-300 text-sm whitespace-pre-wrap line-clamp-6">{asset.content}</p>
                   <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                     <span>{new Date(asset.timestamp).toLocaleTimeString()}</span>
                     <span className="text-yellow-500/50 font-bold">Generated</span>
                   </div>
                </div>
              ))}
            </div>
         </div>
       </div>
    </div>
  );
};