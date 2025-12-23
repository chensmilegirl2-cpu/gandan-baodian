
import React from 'react';
// Added Egg to the imports from lucide-react
import { TreePine, Dog, Loader2, Sparkles, Cat, RefreshCcw, Droplets, Cookie, Sprout, Leaf, Zap, Egg } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useGarden } from '../hooks/useGarden';
import { THEME_CONFIG } from '../constants/config';

const GardenTab: React.FC = () => {
  const { themeColor, currentUser } = useApp();
  const {
    nurtureType, setNurtureType,
    gardenData,
    isWatering,
    isGeneratingGuardian,
    interactionMsg,
    generateGuardian,
    handleAction,
    interact
  } = useGarden();
  const theme = THEME_CONFIG[themeColor];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center py-4 px-2">
        <div className="flex bg-stone-100 p-1 rounded-[24px]">
          <button onClick={() => setNurtureType('tree')} className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-black transition-all ${nurtureType === 'tree' ? 'bg-white text-emerald-500 shadow-sm' : 'text-stone-300'}`}><TreePine size={14}/> 庄园</button>
          <button onClick={() => setNurtureType('pet')} className={`flex items-center gap-2 px-4 py-2 rounded-[18px] text-xs font-black transition-all ${nurtureType === 'pet' ? 'bg-white text-orange-400 shadow-sm' : 'text-stone-300'}`}><Dog size={14}/> 萌宠</button>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black text-stone-700">{nurtureType === 'tree' ? '梦想之林' : '暖心宠伴'}</h2>
          <p className={`text-[9px] font-black ${theme.text} mt-0.5`}>活力能量 {gardenData.vitality}%</p>
        </div>
      </div>

      <div className="ios-card aspect-square flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-white to-stone-50/30">
        <div className={`relative transition-all duration-700 ${isWatering ? 'animate-growth-pop' : ''}`}>
          {isGeneratingGuardian ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className={`w-12 h-12 ${theme.text} animate-spin`} />
              <p className="text-xs font-black text-stone-300 animate-pulse">AI 正在注入灵魂...</p>
            </div>
          ) : (currentUser?.guardianImage || nurtureType === 'tree') ? (
            <div className="relative group cursor-pointer" onClick={interact}>
              {interactionMsg && (
                <div className="absolute -top-16 -left-1/2 right-0 translate-x-1/2 bg-white px-5 py-2.5 rounded-[24px] shadow-2xl text-[11px] font-black border border-stone-50 animate-in zoom-in z-20 w-max max-w-[200px] text-center">
                  {interactionMsg.msg}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-stone-50"></div>
                </div>
              )}
              {nurtureType === 'pet' ? (
                <div className="relative">
                  <img id="guardian-pet" src={currentUser?.guardianImage} className="w-56 h-56 object-contain rounded-full shadow-2xl animate-healing" alt="Guardian" />
                  <div className="absolute -bottom-2 -right-2 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); generateGuardian('cat'); }} className="p-3 bg-white/90 rounded-full shadow-lg border border-stone-50 text-stone-400 hover:text-stone-800 transition-all hover:scale-110 active:rotate-180" title="重塑为猫咪"><Cat size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); generateGuardian('dog'); }} className="p-3 bg-white/90 rounded-full shadow-lg border border-stone-50 text-stone-400 hover:text-stone-800 transition-all hover:scale-110 active:rotate-180" title="重塑为狗狗"><Dog size={16}/></button>
                  </div>
                </div>
              ) : (
                <div id="guardian-tree" className="flex flex-col items-center animate-healing cursor-pointer">
                  <div className={`w-40 h-40 rounded-full border-4 border-white shadow-xl flex flex-wrap items-center justify-center p-5 ${gardenData.leaves < 20 ? 'bg-amber-100' : 'bg-emerald-400'}`}>
                    {gardenData.leaves < 20 ? <Sprout size={56} className="text-emerald-500" /> : <Leaf size={36} className="text-white/80 m-1" />}
                  </div>
                  <div className="w-12 h-16 bg-[#8b5e3c]/90 mx-auto rounded-b-[24px] shadow-lg relative -mt-1"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative animate-healing">
                  <div className="w-32 h-40 bg-white rounded-t-full rounded-b-[40px] border-[6px] border-amber-100 shadow-xl relative overflow-hidden flex items-center justify-center"><Egg size={64} className="text-amber-200" /></div>
                  <div className="absolute -bottom-2 -right-4 bg-white p-3 rounded-full shadow-lg"><Sparkles className="text-amber-400" size={24} /></div>
                </div>
                <p className="text-xs font-black text-stone-300">魔法蛋等待干饭能量注入...</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => generateGuardian('cat')} className={`px-8 py-4 rounded-[32px] ${theme.bg} text-white text-sm font-black shadow-xl active:scale-95 transition-all flex items-center gap-3`}><Cat size={18}/> 养成猫咪</button>
                <button onClick={() => generateGuardian('dog')} className={`px-8 py-4 rounded-[32px] ${theme.bg} text-white text-sm font-black shadow-xl active:scale-95 transition-all flex items-center gap-3`}><Dog size={18}/> 养成狗狗</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 px-2">
        <button onClick={() => handleAction('water')} className="flex-1 ios-card py-6 flex flex-col items-center gap-2 group border-b-4 border-blue-50 active:translate-y-1 transition-all">
          <Droplets size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-stone-500">滋养灌溉</span>
        </button>
        <button onClick={() => handleAction('feed')} className="flex-1 ios-card py-6 flex flex-col items-center gap-2 group border-b-4 border-orange-50 active:translate-y-1 transition-all">
          <Cookie size={24} className="text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-stone-500">投喂美食</span>
        </button>
      </div>
    </div>
  );
};

export default GardenTab;
