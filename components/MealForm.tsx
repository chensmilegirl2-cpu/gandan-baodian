import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, Star, Utensils, Sparkles, Loader2, Plus, Wand2, BrainCircuit, Check, Ban, Tag, Users
} from 'lucide-react';
import { MealRecord, MealType, SourceType, CompanionType, DishItem, ThemeColor, TasteType } from '../types';
import { geminiService } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';

interface MealFormProps {
  onSave: (meal: Omit<MealRecord, 'id' | 'createdAt' | 'cuisine'> & { cuisine?: string }) => void;
  onCancel: () => void;
  themeColor: ThemeColor;
}

const MEAL_TYPES: MealType[] = ['早餐', '午餐', '下午茶', '晚餐', '宵夜'];
const SOURCES: SourceType[] = ['外卖', '堂食', '烹饪'];

const THEME_BG_MAP: Record<ThemeColor, string> = {
  orange: 'bg-orange-400',
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  amber: 'bg-amber-400',
  indigo: 'bg-indigo-400',
  teal: 'bg-teal-400'
};

const THEME_LIGHT_BG_MAP: Record<ThemeColor, string> = {
  orange: 'bg-orange-50/50',
  emerald: 'bg-emerald-50/50',
  blue: 'bg-blue-50/50',
  rose: 'bg-rose-50/50',
  violet: 'bg-violet-50/50',
  amber: 'bg-amber-50/50',
  indigo: 'bg-indigo-50/50',
  teal: 'bg-teal-50/50'
};

const THEME_BORDER_MAP: Record<ThemeColor, string> = {
  orange: 'border-orange-500',
  emerald: 'border-emerald-500',
  blue: 'border-blue-500',
  rose: 'border-rose-500',
  violet: 'border-violet-500',
  amber: 'border-amber-500',
  indigo: 'border-indigo-500',
  teal: 'border-teal-500'
};

const THEME_TEXT_MAP: Record<ThemeColor, string> = {
  orange: 'text-orange-600',
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  rose: 'text-rose-600',
  violet: 'text-violet-600',
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
  teal: 'text-teal-600'
};

const THEME_RING_MAP: Record<ThemeColor, string> = {
  orange: 'ring-orange-100/50',
  emerald: 'ring-emerald-100/50',
  blue: 'ring-blue-100/50',
  rose: 'ring-rose-100/50',
  violet: 'ring-violet-100/50',
  amber: 'ring-amber-100/50',
  indigo: 'ring-indigo-100/50',
  teal: 'ring-teal-100/50'
};

const MealForm: React.FC<MealFormProps> = ({ onSave, onCancel, themeColor }) => {
  const { companionPool, addCompanion, removeCompanion, showToast } = useApp();
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [detectedCuisine, setDetectedCuisine] = useState<string | undefined>();
  const [aiSuccess, setAiSuccess] = useState(false);
  
  const [pendingAiContent, setPendingAiContent] = useState<{ dishName: string, note: string } | null>(null);
  const [showCompanionAdd, setShowCompanionAdd] = useState(false);
  const [newCompanionName, setNewCompanionName] = useState('');
  
  // Track clicks for "double click to delete" logic
  const lastClickRef = useRef<{ name: string; time: number } | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: '' as MealType | '',
    source: '' as SourceType | '',
    companion: [] as string[], 
    dishItems: [{ name: '', rating: 5 }] as DishItem[],
    tastes: [] as TasteType[],
    cost: '',
    photos: [] as string[],
    note: '',
  });

  useEffect(() => {
    const validNames = formData.dishItems.map(d => d.name.trim()).filter(n => n.length > 1);
    if (validNames.length > 0) {
      const timer = setTimeout(async () => {
        const cuisine = await geminiService.detectCuisine(validNames);
        setDetectedCuisine(cuisine);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.dishItems]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAiScan = async () => {
    if (formData.photos.length === 0) return;
    setIsAiAnalyzing(true);
    try {
      const result = await geminiService.analyzeMealImage(formData.photos[formData.photos.length - 1]);
      setPendingAiContent({ dishName: result.dishes[0]?.name || "识别到的美食", note: result.note });
      setDetectedCuisine(result.cuisine);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleAiBrainstorm = async () => {
    setIsAiAnalyzing(true);
    try {
      const result = await geminiService.brainstormMeal(formData.mealType || '餐点');
      setPendingAiContent(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const acceptAiContent = () => {
    if (pendingAiContent) {
      setFormData(prev => ({
        ...prev,
        dishItems: [{ name: pendingAiContent.dishName, rating: 5 }, ...prev.dishItems.filter(d => d.name !== '')],
        note: pendingAiContent.note
      }));
      setAiSuccess(true);
      setPendingAiContent(null);
    }
  };

  const isFieldFilled = (field: string) => {
    const val = (formData as any)[field];
    if (Array.isArray(val)) return val.length > 0;
    return val !== '' && val !== null && val !== undefined;
  };

  const InputWrapper = ({ label, field, children }: { label: string, field: string, children: React.ReactNode }) => {
    const filled = isFieldFilled(field);
    const activeBorder = THEME_BORDER_MAP[themeColor];
    const activeText = THEME_TEXT_MAP[themeColor];
    const activeBg = THEME_LIGHT_BG_MAP[themeColor];
    const activeRing = THEME_RING_MAP[themeColor];
    
    return (
      <div className={`relative flex flex-col justify-center px-4 h-16 rounded-2xl border-2 transition-all ${filled ? `${activeBorder} ${activeBg} ring-2 ${activeRing}` : 'border-stone-100 bg-stone-50/50'}`}>
        {!filled ? (
           <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest text-center w-full">{label}</span>
        ) : (
           <span className={`text-[8px] font-black uppercase mb-0.5 opacity-60 ${activeText}`}>{label}</span>
        )}
        <div className={`w-full h-full relative flex items-center ${!filled ? 'hidden' : 'block'}`}>
           {children}
        </div>
        {!filled && (
           <div className="absolute inset-0 z-10 cursor-pointer">{children}</div>
        )}
      </div>
    );
  };

  const handleCompanionPoolClick = (name: string) => {
    const now = Date.now();
    const last = lastClickRef.current;

    // Check for double click for deletion from pool
    if (last && last.name === name && now - last.time < 500) {
      if (window.confirm(`确定从伙伴池中移除 "${name}" 吗？`)) {
        removeCompanion(name);
        setFormData(prev => ({
          ...prev,
          companion: prev.companion.filter(c => c !== name)
        }));
      }
      lastClickRef.current = null;
      return;
    }

    // Toggle selection on single click
    lastClickRef.current = { name, time: now };
    setFormData(prev => {
      const isSelected = prev.companion.includes(name);
      return {
        ...prev,
        companion: isSelected 
          ? prev.companion.filter(c => c !== name) 
          : [...prev.companion, name]
      };
    });
  };

  const handleAddCompanion = () => {
    if (newCompanionName.trim()) {
      addCompanion(newCompanionName.trim());
      setFormData(prev => ({
        ...prev,
        companion: [...prev.companion, newCompanionName.trim()]
      }));
      setNewCompanionName('');
      setShowCompanionAdd(false);
      showToast(`已添加新伙伴: ${newCompanionName}`);
    }
  };

  return (
    <div className="bg-white rounded-[40px] p-6 shadow-2xl border border-stone-50 animate-in zoom-in slide-in-from-bottom-4 duration-300 relative overflow-hidden pb-12">
      {isAiAnalyzing && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
           <Loader2 className={`w-12 h-12 ${THEME_TEXT_MAP[themeColor]} animate-spin mb-4`} />
           <p className="text-sm font-black text-stone-800">AI 正在捕捉灵感...</p>
        </div>
      )}

      {pendingAiContent && (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full rounded-[40px] p-8 shadow-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`p-4 rounded-3xl ${THEME_LIGHT_BG_MAP[themeColor]} mb-2`}><Sparkles className={`${THEME_TEXT_MAP[themeColor]} w-8 h-8`} /></div>
              <h3 className="text-xl font-black text-stone-800">AI 捕捉到灵感</h3>
              <p className="text-2xl font-black text-stone-900 border-b-4 border-amber-200">“{pendingAiContent.dishName}”</p>
              <p className="text-sm text-stone-500 italic px-2">“{pendingAiContent.note}”</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={acceptAiContent} className={`flex items-center justify-center gap-2 ${THEME_BG_MAP[themeColor]} text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all`}>
                <Check size={18}/> 采纳
              </button>
              <button onClick={() => setPendingAiContent(null)} className="flex items-center justify-center gap-2 bg-stone-100 text-stone-400 font-black py-4 rounded-2xl active:scale-95 transition-all">
                <Ban size={18}/> 拒绝
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-stone-800 flex items-center gap-2">
            <Utensils className={THEME_TEXT_MAP[themeColor]} /> 开启新足迹
        </h2>
        <button onClick={onCancel} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:bg-stone-200 transition-colors">
            <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <InputWrapper label="时间" field="date">
            <input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} 
              className="w-full bg-transparent text-xs font-black focus:outline-none appearance-none h-full text-stone-800" 
            />
          </InputWrapper>
          <InputWrapper label="餐次" field="mealType">
            <select 
              value={formData.mealType} 
              onChange={e => setFormData(p => ({ ...p, mealType: e.target.value as MealType }))} 
              className={`w-full bg-transparent text-xs font-black focus:outline-none appearance-none h-full ${formData.mealType ? 'text-stone-800' : 'opacity-0 absolute inset-0 z-20'}`}
            >
              <option value="" disabled>餐次</option>
              {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </InputWrapper>
          <InputWrapper label="来源" field="source">
            <select 
              value={formData.source} 
              onChange={e => setFormData(p => ({ ...p, source: e.target.value as SourceType }))} 
              className={`w-full bg-transparent text-xs font-black focus:outline-none appearance-none h-full ${formData.source ? 'text-stone-800' : 'opacity-0 absolute inset-0 z-20'}`}
            >
              <option value="" disabled>来源</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </InputWrapper>
        </div>

        <div className="bg-stone-50 rounded-[32px] p-4 border border-stone-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">餐品清单</p>
              {detectedCuisine && (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${THEME_BG_MAP[themeColor]} text-white text-[8px] font-black animate-in zoom-in`}>
                  <Tag size={8} /> {detectedCuisine}
                </span>
              )}
            </div>
            {aiSuccess && <span className="text-emerald-500 text-[10px] font-black animate-pulse">✨ 灵感已注入</span>}
          </div>
          <div className="space-y-2">
            {formData.dishItems.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-2xl border border-stone-100 flex items-center gap-2">
                <input type="text" placeholder="干了什么菜?" value={item.name} onChange={e => {
                  const items = [...formData.dishItems];
                  items[idx].name = e.target.value;
                  setFormData(p => ({ ...p, dishItems: items }));
                }} className="flex-1 bg-transparent text-sm font-bold focus:outline-none" />
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} onClick={() => {
                    const items = [...formData.dishItems];
                    items[idx].rating = s;
                    setFormData(p => ({ ...p, dishItems: items }));
                  }} className={`${s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'} cursor-pointer transition-colors`} />)}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setFormData(p => ({ ...p, dishItems: [...p.dishItems, { name: '', rating: 5 }] }))} className="w-full mt-2 py-2 border border-dashed border-stone-200 rounded-xl text-stone-300 text-[10px] font-black">+ 继续加菜</button>
        </div>

        <div className="grid grid-cols-2 gap-3 items-end">
          <InputWrapper label="费用" field="cost">
            <div className="flex items-center w-full">
              <input 
                type="number" 
                value={formData.cost} 
                onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))} 
                className={`w-full bg-transparent text-sm font-black focus:outline-none ${formData.cost ? 'text-stone-800' : 'opacity-0 absolute inset-0 z-20'}`} 
              />
            </div>
          </InputWrapper>
          
          <div className="flex gap-2 items-center">
            <div className={`flex-1 relative flex flex-col justify-center px-4 h-16 rounded-2xl border-2 transition-all ${formData.companion.length > 0 ? `${THEME_BORDER_MAP[themeColor]} ${THEME_LIGHT_BG_MAP[themeColor]} ring-2 ${THEME_RING_MAP[themeColor]}` : 'border-stone-100 bg-stone-50/50'}`}>
              <span className={`text-[8px] font-black uppercase mb-0.5 opacity-60 ${THEME_TEXT_MAP[themeColor]} text-center`}>伙伴</span>
              <div className="text-xs font-black text-stone-800 truncate text-center">
                {formData.companion.length > 0 ? formData.companion.join(', ') : '独美'}
              </div>
            </div>
            <button 
              onClick={() => setShowCompanionAdd(!showCompanionAdd)} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${THEME_BG_MAP[themeColor]} text-white shadow-lg active:scale-95 transition-all flex-shrink-0`}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {showCompanionAdd && (
          <div className="bg-stone-50 p-4 rounded-3xl border border-stone-100 flex items-center gap-2 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder="新伙伴姓名..." 
              value={newCompanionName} 
              onChange={e => setNewCompanionName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddCompanion()}
              className="flex-1 bg-white px-4 py-2 rounded-xl text-xs font-black focus:outline-none border border-stone-200"
            />
            <button onClick={handleAddCompanion} className={`p-2 rounded-xl ${THEME_BG_MAP[themeColor]} text-white`}>
              <Check size={14} />
            </button>
          </div>
        )}

        <div className="space-y-2">
           <p className="text-[9px] font-black text-stone-300 uppercase px-1">伙伴池 (双击移除):</p>
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
             {companionPool.map(c => (
               <button 
                  key={c} 
                  onClick={() => handleCompanionPoolClick(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-black transition-all border-2 select-none ${
                    formData.companion.includes(c) 
                      ? `${THEME_BG_MAP[themeColor]} border-transparent text-white shadow-md scale-105` 
                      : 'bg-stone-50 border-stone-100 text-stone-400'
                  }`}
               >
                 {c}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="bg-stone-50 border-2 border-stone-100 rounded-[28px] p-2 h-28 flex flex-col items-center justify-center relative overflow-hidden group">
              {formData.photos.length > 0 ? (
                <div className="flex gap-1 overflow-x-auto w-full h-full p-1 scrollbar-hide">
                  {formData.photos.map((photo, i) => (
                    <div key={i} className="relative flex-shrink-0 w-full h-full">
                       <img src={photo} className="w-full h-full object-cover rounded-xl" />
                       <button onClick={() => setFormData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"><X size={8}/></button>
                    </div>
                  ))}
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1">
                  <Camera className="text-stone-300" size={24} />
                  <span className="text-[10px] font-black text-stone-300">上传餐照</span>
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" multiple />
                </label>
              )}
              {formData.photos.length > 0 && (
                <button onClick={handleAiScan} className={`absolute bottom-2 right-2 p-2 ${THEME_BG_MAP[themeColor]} text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all`}><Wand2 size={14} /></button>
              )}
           </div>
           <div className="bg-stone-50 border-2 border-stone-100 rounded-[28px] p-4 h-28 relative">
              <textarea placeholder="记下此刻的味道..." value={formData.note} onChange={e => setFormData(p => ({ ...p, note: e.target.value }))} className="w-full h-full bg-transparent text-xs font-bold focus:outline-none resize-none placeholder:text-stone-200 text-stone-800" />
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleAiBrainstorm}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl ${THEME_LIGHT_BG_MAP[themeColor]} ${THEME_TEXT_MAP[themeColor]} text-[12px] font-black border-2 ${THEME_BORDER_MAP[themeColor]} border-dashed active:scale-95 transition-all`}
          >
            <BrainCircuit size={18} /> AI 帮我头脑风暴
          </button>

          <button 
            onClick={() => {
              if (formData.companion.length === 0) {
                showToast("请至少选择一位伙伴哦！");
                return;
              }
              if (!formData.source || !formData.date || !formData.mealType) {
                showToast("请填写完整的时间、餐次和来源哦！");
                return;
              }
              onSave({ 
                ...formData, 
                source: formData.source as SourceType,
                mealType: formData.mealType as MealType,
                cost: Number(formData.cost) || 0, 
                cuisine: detectedCuisine 
              });
            }}
            className={`w-full ${THEME_BG_MAP[themeColor]} text-white font-black py-5 rounded-[32px] shadow-xl active:scale-95 transition-all`}
          >
            确定并干饭 ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealForm;