import React, { useState, useEffect } from 'react';
import { generateVideoFromPrompt, animateImageWithVeo, analyzeVideo, optimizePrompt } from '../services/geminiService';
import { ActiveCampaign } from '../types';

interface VideoLabProps {
  activeCampaign: ActiveCampaign | null;
}

export const VideoLab: React.FC<VideoLabProps> = ({ activeCampaign }) => {
  const [activeTab, setActiveTab] = useState<'text-to-video' | 'image-to-video' | 'analyze'>('text-to-video');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [status, setStatus] = useState('');

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<string | null>(null);

  // Analysis State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Auto-fill from campaign
  useEffect(() => {
    if (activeCampaign && !prompt) {
      setPrompt(activeCampaign.videoConcept);
    }
  }, [activeCampaign]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
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
    setStatus('Initializing Veo...');
    
    try {
      let url = '';
      if (activeTab === 'text-to-video') {
        setStatus('Generating video from text (this may take a minute)...');
        url = await generateVideoFromPrompt(prompt, aspectRatio);
      } else {
        if (!sourceImage) throw new Error("Image required");
        const base64 = sourceImage.split(',')[1];
        setStatus('Animating image with Veo (this may take a minute)...');
        url = await animateImageWithVeo(base64, prompt, aspectRatio);
      }
      setVideoResult(url);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setLoading(true);
    setStatus('Analyzing video frames...');
    try {
      const text = await analyzeVideo(videoFile, analysisPrompt || "Summarize this video.");
      setAnalysisResult(text);
    } catch (e: any) {
      alert("Analysis failed. Video might be too large for this demo. " + e.message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-400">
          Veo Video Lab
        </h2>
        <div className="bg-slate-900 rounded-lg p-1 flex space-x-1 border border-slate-800">
          {(['text-to-video', 'image-to-video', 'analyze'] as const).map(tab => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6 h-fit">
          {activeTab !== 'analyze' ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-orange-400">
                  {activeTab === 'text-to-video' ? 'Prompt Generation' : 'Image Animation'}
                </h3>
                {activeCampaign && <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-500/30">Campaign Active</span>}
              </div>
              
              {activeTab === 'image-to-video' && (
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 text-center cursor-pointer relative hover:border-orange-500 transition-colors">
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   {sourceImage ? (
                     <img src={sourceImage} className="h-32 mx-auto object-contain" alt="Source" />
                   ) : (
                     <p className="text-xs text-slate-500">Upload source image</p>
                   )}
                </div>
              )}

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Prompt</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder={activeTab === 'text-to-video' ? "A cinematic drone shot of a futuristic city..." : "Make the water flow and clouds move..."}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <button 
                  onClick={handleOptimizePrompt}
                  disabled={optimizing || !prompt}
                  className="mt-2 text-xs flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
                >
                  {optimizing ? 'Thinking...' : '✨ Optimize for Veo'}
                </button>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '9:16'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`flex-1 py-2 rounded border text-sm ${aspectRatio === r ? 'bg-orange-600/20 border-orange-600 text-orange-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || (activeTab === 'image-to-video' && !sourceImage) || (activeTab === 'text-to-video' && !prompt)}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 rounded font-bold text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Generate Video'}
              </button>
            </>
          ) : (
            <>
               <h3 className="text-lg font-semibold text-blue-400">Video Analysis</h3>
               <input type="file" accept="video/*" onChange={handleVideoUpload} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700"/>
               <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Ask something about the video..."
                  value={analysisPrompt}
                  onChange={e => setAnalysisPrompt(e.target.value)}
                />
               <button 
                  onClick={handleAnalyze}
                  disabled={loading || !videoFile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Video'}
                </button>
            </>
          )}
          
          {status && <p className="text-xs text-center text-slate-400 animate-pulse">{status}</p>}
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-4 min-h-[500px]">
          {activeTab !== 'analyze' ? (
             videoResult ? (
               <video src={videoResult} controls autoPlay loop className="max-h-[500px] max-w-full rounded shadow-2xl" />
             ) : (
               <div className="text-center text-slate-600">
                 <span className="text-6xl block mb-4">🎬</span>
                 <p>Veo generations appear here</p>
               </div>
             )
          ) : (
             analysisResult ? (
               <div className="w-full h-full p-4 overflow-y-auto">
                 <h4 className="text-blue-400 font-bold mb-2">Analysis Result:</h4>
                 <p className="text-slate-300 whitespace-pre-wrap">{analysisResult}</p>
               </div>
             ) : (
               <div className="text-center text-slate-600">
                 <span className="text-6xl block mb-4">👁️</span>
                 <p>Video insights appear here</p>
               </div>
             )
          )}
        </div>
      </div>
    </div>
  );
};