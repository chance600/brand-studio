import React, { useState, useEffect } from 'react';
import { generateProImage, editImageWithFlash, analyzeImage, optimizePrompt } from '../services/geminiService';
import { AspectRatio, ImageSize, ActiveCampaign } from '../types';

interface ImageStudioProps {
  activeCampaign: ActiveCampaign | null;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ activeCampaign }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'remix' | 'analyze'>('generate');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  // Gen State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.K1);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);

  // Edit/Remix State
  const [remixPrompt, setRemixPrompt] = useState('');
  const [remixSource, setRemixSource] = useState<string | null>(null);
  const [remixedImg, setRemixedImg] = useState<string | null>(null);

  // Analyze State
  const [analyzeSource, setAnalyzeSource] = useState<string | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // Auto-fill from campaign
  useEffect(() => {
    if (activeCampaign && activeTab === 'generate' && !genPrompt) {
      setGenPrompt(`Create a high-quality marketing image for ${activeCampaign.brandName}. ${activeCampaign.visualStyle}`);
    }
  }, [activeCampaign, activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setSource: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSource(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptimizePrompt = async () => {
    if (!genPrompt) return;
    setOptimizing(true);
    try {
      const betterPrompt = await optimizePrompt(genPrompt, 'image');
      setGenPrompt(betterPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedImg(null);
    try {
      const result = await generateProImage(genPrompt, aspectRatio, imageSize);
      setGeneratedImg(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemix = async () => {
    if (!remixSource) return;
    setLoading(true);
    setRemixedImg(null);
    try {
      const base64Data = remixSource.split(',')[1];
      // Instructions for product placement
      const result = await editImageWithFlash(base64Data, remixPrompt);
      setRemixedImg(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeSource) return;
    setLoading(true);
    setAnalysisResult('');
    try {
      const base64Data = analyzeSource.split(',')[1];
      const result = await analyzeImage(base64Data, analyzePrompt || "Describe this image in detail.");
      setAnalysisResult(result || "No analysis returned.");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Creative Studio</h2>
        <div className="bg-slate-900 rounded-lg p-1 flex space-x-1 border border-slate-800">
          {(['generate', 'remix', 'analyze'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'remix' ? 'Product Remix' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 min-h-[500px]">
        {/* GENERATE TAB */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="col-span-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-purple-400">Generation Config</h3>
                {activeCampaign && <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-500/30">Campaign Active</span>}
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Prompt</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm h-32 focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="A futuristic sneaker floating in neon space..."
                  value={genPrompt}
                  onChange={e => setGenPrompt(e.target.value)}
                />
                <button 
                  onClick={handleOptimizePrompt}
                  disabled={optimizing || !genPrompt}
                  className="mt-2 text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {optimizing ? 'Thinking...' : '✨ Enhance Prompt with Gemini'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Aspect Ratio</label>
                  <select 
                    value={aspectRatio} 
                    onChange={e => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                  >
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Size</label>
                  <select 
                    value={imageSize} 
                    onChange={e => setImageSize(e.target.value as ImageSize)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                  >
                    {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !genPrompt}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded font-bold text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate 3 Pro Image'}
              </button>
            </div>

            <div className="col-span-1 md:col-span-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-center relative overflow-hidden">
               {generatedImg ? (
                 <img src={generatedImg} alt="Generated" className="max-w-full max-h-[500px] object-contain shadow-2xl" />
               ) : (
                 <div className="text-slate-600 flex flex-col items-center">
                   <span className="text-6xl mb-4">🎨</span>
                   <p>Your masterpiece will appear here</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* REMIX TAB */}
        {activeTab === 'remix' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-blue-400">Product Placement Remix</h3>
               <p className="text-xs text-slate-400">Upload your product photo and tell Gemini where to place it.</p>
               
               <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                 <input type="file" accept="image/*" onChange={e => handleFileChange(e, setRemixSource)} className="absolute inset-0 opacity-0 cursor-pointer" />
                 {remixSource ? (
                   <img src={remixSource} className="h-48 mx-auto object-contain" alt="Source" />
                 ) : (
                   <p className="text-slate-500">Click to upload product image</p>
                 )}
               </div>
               
               <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Instructions</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Place this bottle on a wooden table in a sunlit garden..."
                    value={remixPrompt}
                    onChange={e => setRemixPrompt(e.target.value)}
                  />
                  {activeCampaign && (
                     <button 
                       onClick={() => setRemixPrompt(`Place this product in a setting that matches: ${activeCampaign.visualStyle}`)}
                       className="mt-2 text-xs text-blue-400 hover:underline"
                     >
                       Use Campaign Style
                     </button>
                  )}
               </div>

               <button 
                  onClick={handleRemix}
                  disabled={loading || !remixSource || !remixPrompt}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Remixing...' : 'Remix with Flash Image'}
                </button>
            </div>

            <div className="bg-slate-950 rounded border border-slate-800 flex items-center justify-center">
              {remixedImg ? (
                 <img src={remixedImg} alt="Edited" className="max-w-full max-h-[500px] object-contain" />
               ) : (
                 <p className="text-slate-600">Remixed result</p>
               )}
            </div>
          </div>
        )}

        {/* ANALYZE TAB */}
        {activeTab === 'analyze' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-emerald-400">Image Analysis</h3>
               <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer relative">
                 <input type="file" accept="image/*" onChange={e => handleFileChange(e, setAnalyzeSource)} className="absolute inset-0 opacity-0 cursor-pointer" />
                 {analyzeSource ? (
                   <img src={analyzeSource} className="h-48 mx-auto object-contain" alt="Analyze Source" />
                 ) : (
                   <p className="text-slate-500">Click to upload image to analyze</p>
                 )}
               </div>

               <div>
                  <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Question (Optional)</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="What objects are in this image?"
                    value={analyzePrompt}
                    onChange={e => setAnalyzePrompt(e.target.value)}
                  />
               </div>

               <button 
                  onClick={handleAnalyze}
                  disabled={loading || !analyzeSource}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze with Gemini Pro'}
                </button>
             </div>

             <div className="bg-slate-950 rounded border border-slate-800 p-4 overflow-y-auto max-h-[500px]">
                {analysisResult ? (
                   <p className="text-slate-200 whitespace-pre-wrap">{analysisResult}</p>
                ) : (
                   <p className="text-slate-600 text-center mt-20">Analysis results will appear here</p>
                )}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};