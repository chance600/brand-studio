import React, { useState, useEffect } from 'react';
import { generateVideoAdvanced, analyzeVideo, optimizePrompt } from '../services/geminiService';
import { AgentProps, TrendBlueprint } from '../types';

export const VideoLab: React.FC<AgentProps> = ({ activeCampaign, history, onAssetGenerated, navigationPayload }) => {
  const [activeTab, setActiveTab] = useState<'text-to-video' | 'blueprint-production' | 'analyze'>('text-to-video');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [status, setStatus] = useState('');

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceVideoFile, setReferenceVideoFile] = useState<any>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isHighQuality, setIsHighQuality] = useState(false);

  // Analysis State
  const [analysisVideoFile, setAnalysisVideoFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Blueprint State
  const [activeBlueprint, setActiveBlueprint] = useState<TrendBlueprint | null>(null);
  const [mySubject, setMySubject] = useState('');

  // Auto-fill from campaign or payload
  useEffect(() => {
    if (navigationPayload?.blueprint) {
      setActiveBlueprint(navigationPayload.blueprint);
      setActiveTab('blueprint-production');
      if (navigationPayload.subject) setMySubject(navigationPayload.subject);
      setPrompt(navigationPayload.prefillPrompt || "");
    } else if (navigationPayload?.prefillPrompt) {
      setPrompt(navigationPayload.prefillPrompt);
    } else if (activeCampaign && !prompt) {
      setPrompt(activeCampaign.videoConcept);
    }
  }, [activeCampaign, navigationPayload]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Explicitly cast to File[] to avoid 'unknown' inference issues when iterate files
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const remainingSlots = 3 - referenceImages.length;
      const toProcess = files.slice(0, remainingSlots);
      
      toProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setReferenceImages(prev => [...prev, reader.result as string].slice(0, 3));
        // Fix line 51: file is now correctly inferred as File which extends Blob
        reader.readAsDataURL(file);
      });
    }
  };

  // Fixed handleVideoUpload type issue by explicitly casting e.target to HTMLInputElement
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) setAnalysisVideoFile(file);
  };

  const handleOptimizePrompt = async () => {
    if (!prompt) return;
    setOptimizing(true);
    try {
      const betterPrompt = await optimizePrompt(prompt, 'video');
      setPrompt(betterPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setVideoResult(null);
    setStatus('Initializing AI Director...');
    
    try {
      setStatus('Processing references and generating video (this may take up to 2-3 minutes)...');
      const result = await generateVideoAdvanced({
        prompt: prompt || (activeBlueprint ? "Produce video according to blueprint" : ""),
        aspectRatio,
        images: referenceImages.length > 0 ? referenceImages : undefined,
        highQuality: isHighQuality
      });
      
      setVideoResult(result.url);
      
      // Save to memory
      onAssetGenerated({
        id: Date.now().toString(),
        type: 'video',
        content: result.url,
        timestamp: Date.now()
      });

    } catch (e: any) {
      alert("Video generation failed: " + e.message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleAnalyze = async () => {
    if (!analysisVideoFile) return;
    setLoading(true);
    setStatus('Analyzing video frames...');
    try {
      const text = await analyzeVideo(analysisVideoFile, analysisPrompt || "Summarize this video.");
      setAnalysisResult(text);
    } catch (e: any) {
      alert("Analysis failed. Video might be too large for this demo. " + e.message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const removeImage = (idx: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== idx));
  };

  const assemblePromptFromBlueprint = () => {
    if (!activeBlueprint) return prompt;
    const subject = mySubject || (activeCampaign ? activeCampaign.brandName : "a luxury product");
    return `${subject} placed in a scene with: ${activeBlueprint.aesthetic}. Lighting: ${activeBlueprint.lighting}. Composition: ${activeBlueprint.composition}. Technical style: ${activeBlueprint.technical_specs}. Narrative vibe: ${activeBlueprint.narrative_beat}.`;
  };

  const recentVideos = history.filter(a => a.type === 'video');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-400 tracking-tight">
          Veo Video Production
        </h2>
        <div className="bg-slate-900 rounded-lg p-1 flex space-x-1 border border-slate-800">
          {(['text-to-video', 'blueprint-production', 'analyze'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                ? 'bg-orange-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6 h-fit shadow-lg">
          {activeTab !== 'analyze' ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-orange-400 capitalize">
                  {activeTab.replace(/-/g, ' ')}
                </h3>
              </div>

              {/* Blueprint Reference Panel */}
              {activeTab === 'blueprint-production' && activeBlueprint && (
                <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Active Blueprint</span>
                      <button onClick={() => setActiveBlueprint(null)} className="text-slate-600 hover:text-red-400 text-[10px]">[Clear]</button>
                   </div>
                   <div className="text-[10px] text-slate-400 line-clamp-2 italic font-mono">
                      {activeBlueprint.aesthetic}
                   </div>
                   <div>
                     <label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Subject Injection</label>
                     <input 
                       type="text" 
                       value={mySubject} 
                       onChange={e => setMySubject(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                       placeholder="Target product/person"
                     />
                   </div>
                   <button 
                     onClick={() => setPrompt(assemblePromptFromBlueprint())}
                     className="w-full bg-cyan-900/40 text-cyan-400 text-[10px] py-1.5 rounded hover:bg-cyan-900/60 font-bold border border-cyan-500/30"
                   >
                     Apply Blueprint Prompt
                   </button>
                </div>
              )}
              
              {/* Reference Images */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block font-bold">Reference Images (Up to 3)</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {referenceImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-950 rounded border border-slate-700 overflow-hidden group">
                       <img src={img} className="w-full h-full object-cover" />
                       <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                    </div>
                  ))}
                  {referenceImages.length < 3 && (
                    <div className="relative aspect-square bg-slate-950 border-2 border-dashed border-slate-700 rounded flex items-center justify-center hover:border-orange-500 transition-colors cursor-pointer group">
                      <input type="file" accept="image/*" onChange={handleImageUpload} multiple className="absolute inset-0 opacity-0 cursor-pointer" />
                      <span className="text-2xl text-slate-700 group-hover:text-orange-500">+</span>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 italic">Reference images help maintain consistency in characters and environment.</p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block font-bold">Final Scene Prompt</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Describe the action in detail..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <button 
                  onClick={handleOptimizePrompt}
                  disabled={optimizing || !prompt}
                  className="mt-2 text-xs flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  {optimizing ? 'Thinking...' : '✨ Enhance Prompt for Cinematic Quality'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block font-bold">Aspect Ratio</label>
                  <div className="flex gap-2">
                    {(['16:9', '9:16'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r)}
                        className={`flex-1 py-2 rounded border text-sm transition-all ${aspectRatio === r ? 'bg-orange-600/20 border-orange-600 text-orange-400' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                   <div className="space-y-0.5">
                      <div className="text-[10px] font-black uppercase text-slate-500">Render Quality</div>
                      <div className="text-[9px] text-slate-600 italic">High quality supports 3 images</div>
                   </div>
                   <button 
                    onClick={() => setIsHighQuality(!isHighQuality)}
                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${isHighQuality ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                   >
                     {isHighQuality ? 'HQ' : 'FAST'}
                   </button>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 shadow-lg ${activeTab === 'blueprint-production' ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-indigo-900/30' : 'bg-gradient-to-r from-orange-600 to-pink-600 shadow-orange-900/30'}`}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="animate-pulse">Producing Video...</span>
                    <span className="text-[9px] opacity-70">Veo is generating frames</span>
                  </div>
                ) : (
                  activeTab === 'blueprint-production' ? '🚀 Generate Blueprint Production' : '🎬 Produce Scene'
                )}
              </button>
            </>
          ) : (
            <>
               <h3 className="text-lg font-semibold text-blue-400">Video Analysis</h3>
               <div className="border border-slate-700 rounded-lg p-2 bg-slate-950">
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700"/>
               </div>
               <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ask something about the video..."
                  value={analysisPrompt}
                  onChange={e => setAnalysisPrompt(e.target.value)}
                />
               <button 
                  onClick={handleAnalyze}
                  disabled={loading || !analysisVideoFile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Video'}
                </button>
            </>
          )}
          
          {status && (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 animate-[progress_20s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-[10px] text-center text-slate-500 italic px-2">{status}</p>
            </div>
          )}
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-4 min-h-[500px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-orange-400 text-6xl font-black italic">PRODUCTION</div>
          
          {activeTab !== 'analyze' ? (
             videoResult ? (
               <video src={videoResult} controls autoPlay loop className="max-h-[500px] max-w-full rounded shadow-2xl z-10" />
             ) : (
               <div className="text-center text-slate-600 z-10">
                 <span className="text-6xl block mb-4 opacity-30">🎬</span>
                 <p className="font-bold uppercase tracking-widest text-sm text-slate-700">Studio Stage Ready</p>
                 <p className="text-xs mt-1">Generations will appear in this viewport</p>
               </div>
             )
          ) : (
             analysisResult ? (
               <div className="w-full h-full p-4 overflow-y-auto z-10">
                 <h4 className="text-blue-400 font-bold mb-2">Analysis Result:</h4>
                 <div className="text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-800 text-sm">
                   {analysisResult}
                 </div>
               </div>
             ) : (
               <div className="text-center text-slate-600 z-10">
                 <span className="text-6xl block mb-4 opacity-30">👁️</span>
                 <p className="font-bold uppercase tracking-widest text-sm text-slate-700">Analysis Hub</p>
               </div>
             )
          )}
        </div>

        {/* Memory Column */}
        <div className="lg:col-span-1 space-y-4">
             <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
               <span>🕒</span> Recent Studio Exports
             </h3>
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {recentVideos.length === 0 && (
                     <p className="text-center text-xs text-slate-600 py-8 italic border border-slate-800 border-dashed rounded-xl">No production exports yet</p>
                )}
                {recentVideos.map((asset) => (
                    <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-orange-500/50 cursor-pointer group shadow-lg transition-all" onClick={() => setVideoResult(asset.content)}>
                        <div className="relative">
                          <video src={asset.content} className="w-full rounded-lg bg-black aspect-video object-cover" muted />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">Load into Player</span>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center px-1">
                            <span className="text-[10px] text-slate-500">{new Date(asset.timestamp).toLocaleTimeString()}</span>
                            <span className="text-[10px] text-orange-400 font-bold px-2 py-0.5 bg-orange-400/10 rounded">Veo Gen</span>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};