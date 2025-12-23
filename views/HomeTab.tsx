
import React, { useState, useMemo } from 'react';
import { Utensils, CalendarDays, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { THEME_CONFIG, TASTES } from '../constants/config';
import { geminiService } from '../services/geminiService';
import { MealRecord, TasteType } from '../types';

const HomeTab: React.FC = () => {
  const { records, themeColor } = useApp();
  const [showAllDays, setShowAllDays] = useState(false);
  const [dishRange, setDishRange] = useState<string[]>([]);
  const [currentDishIndex, setCurrentDishIndex] = useState(-1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawTasteFilters, setDrawTasteFilters] = useState<TasteType[]>([]);
  const theme = THEME_CONFIG[themeColor];

  const mealGrid = useMemo(() => {
    const grouped: Record<string, Record<string, MealRecord[]>> = {};
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    const uniqueDates = Array.from(new Set(sortedRecords.map(r => r.date)));
    const datesToShow = showAllDays ? uniqueDates : uniqueDates.slice(0, 3);

    datesToShow.forEach(date => { grouped[date] = { '早餐': [], '午餐': [], '晚餐': [] }; });
    sortedRecords.forEach(record => {
      if (grouped[record.date] && grouped[record.date][record.mealType]) {
        grouped[record.date][record.mealType].push(record);
      }
    });
    return Object.entries(grouped).map(([date, meals]) => ({ date, meals }));
  }, [records, showAllDays]);

  const startDraw = () => {
    setIsSpinning(true);
    if (dishRange.length === 0) {
      geminiService.getDishRangeByTastes(drawTasteFilters).then(range => {
        setDishRange(range);
        setIsSpinning(false);
        setCurrentDishIndex(Math.floor(Math.random() * range.length));
      }).catch(() => setIsSpinning(false));
    } else {
      setTimeout(() => {
        setIsSpinning(false);
        setCurrentDishIndex(Math.floor(Math.random() * dishRange.length));
      }, 800);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="ios-card p-10 text-center relative overflow-hidden">
        <h3 className="text-[11px] font-black text-stone-300 uppercase tracking-widest mb-8">✨ 今天吃点啥？</h3>
        <div className="min-h-[5rem] flex items-center justify-center mb-8">
          {isSpinning ? (
            <div className="flex gap-2">
              <div className={`w-3 h-3 ${theme.bg} rounded-full animate-bounce`}></div>
              <div className={`w-3 h-3 ${theme.bg} rounded-full animate-bounce delay-75`}></div>
              <div className={`w-3 h-3 ${theme.bg} rounded-full animate-bounce delay-150`}></div>
            </div>
          ) : currentDishIndex !== -1 ? (
            <div className="animate-in zoom-in px-4 max-w-full">
              <p className="text-4xl font-black text-stone-700 tracking-tighter truncate">“{dishRange[currentDishIndex]}”</p>
            </div>
          ) : (
            <p className="text-stone-200 font-bold italic">点此抽取美味灵感 🎲</p>
          )}
        </div>
        <div className="flex justify-center gap-3 mb-8">
          {TASTES.map(t => (
            <button key={t} onClick={() => setDrawTasteFilters(prev => prev.includes(t) ? prev.filter(v => v !== t) : [...prev, t])} className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-black border transition-all ${drawTasteFilters.includes(t) ? `${theme.bg} border-transparent text-white shadow-md` : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={startDraw} disabled={isSpinning} className={`w-full py-5 ${theme.bg} text-white font-black rounded-[28px] shadow-lg border-b-4 border-black/10 active:translate-y-1 transition-all`}>
          {dishRange.length > 0 ? "换一个" : "灵感降临"}
        </button>
      </div>

      <div className="ios-card p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme.light} ${theme.text}`}><CalendarDays size={20}/></div>
            <h3 className="text-sm font-black text-stone-700 tracking-tight">最近足迹</h3>
          </div>
          <button onClick={() => setShowAllDays(!showAllDays)} className={`p-2.5 rounded-2xl ${showAllDays ? `${theme.bg} text-white shadow-lg` : 'bg-stone-50 text-stone-300'}`}>
            <Calendar size={18} />
          </button>
        </div>
        <div className="space-y-12">
          {mealGrid.length === 0 ? (
            <div className="py-10 text-center text-stone-200 font-bold text-xs italic">记录三餐，开启养成之旅 🍲</div>
          ) : mealGrid.map(row => (
            <div key={row.date} className="flex gap-6 animate-in slide-in-from-left-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-stone-800 leading-none">{row.date.split('-')[2]}</span>
                <span className="text-[10px] font-black text-stone-300 uppercase mt-1">{row.date.split('-')[1]}月</span>
                <div className="w-px h-full bg-stone-100 mt-4 rounded-full"></div>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                {['早餐', '午餐', '晚餐'].map(type => {
                  const meal = (row.meals as any)[type]?.[0];
                  return (
                    <div key={type} className="flex flex-col items-center gap-2">
                      <div className={`w-full aspect-square rounded-[24px] border-2 transition-all relative overflow-hidden group ${meal ? 'bg-white border-white shadow-md' : 'bg-[#fffcf9] border-stone-50 border-dashed opacity-50'}`}>
                        {meal ? (meal.photos?.[0] ? <img src={meal.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-200"><Utensils size={16} /></div>) : null}
                      </div>
                      <span className={`text-[9px] font-black ${meal ? theme.accent : 'text-stone-200'}`}>{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
