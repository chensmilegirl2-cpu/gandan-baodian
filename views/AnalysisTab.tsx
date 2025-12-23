
import React, { useState, useMemo, useEffect } from 'react';
import { Scale, Loader2, Salad, Activity, MessageCircleHeart, Timer, TrendingUp, Medal, Target, Soup, Flame, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { THEME_CONFIG, TASTES } from '../constants/config';
import { geminiService } from '../services/geminiService';
import { AnalysisResult, MealType } from '../types';

const RadarChart = ({ nutrients, color }: { nutrients: { carbs: number, protein: number, fiber: number }, color: string }) => {
  const size = 120;
  const center = size / 2;
  const radius = center * 0.8;
  const getPoint = (angle: number, value: number) => {
    const val = (value / 100) * radius;
    const x = center + val * Math.cos(angle - Math.PI / 2);
    const y = center + val * Math.sin(angle - Math.PI / 2);
    return `${x},${y}`;
  };
  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const points = [getPoint(angles[0], nutrients.carbs), getPoint(angles[1], nutrients.protein), getPoint(angles[2], nutrients.fiber)].join(' ');
  const gridPoints = (r: number) => angles.map(a => `${center + r * Math.cos(a - Math.PI / 2)},${center + r * Math.sin(a - Math.PI / 2)}`).join(' ');
  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {[0.2, 0.4, 0.6, 0.8, 1].map(r => <polygon key={r} points={gridPoints(radius * r)} fill="none" stroke="#e5e7eb" strokeWidth="1" />)}
        {angles.map(a => <line key={a} x1={center} y1={center} x2={center + radius * Math.cos(a - Math.PI / 2)} y2={center + radius * Math.sin(a - Math.PI / 2)} stroke="#e5e7eb" strokeWidth="1" />)}
        <polygon points={points} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {points.split(' ').map((p, i) => { const [x, y] = p.split(','); return <circle key={i} cx={x} cy={y} r="3" fill={color} />; })}
      </svg>
    </div>
  );
};

const AnalysisTab: React.FC = () => {
  const { records, themeColor } = useApp();
  const [analysisPeriod, setAnalysisPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [detailedAnalysis, setDetailedAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = THEME_CONFIG[themeColor];

  useEffect(() => {
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const result = await geminiService.getDetailedDietaryAnalysis(records, analysisPeriod);
        setDetailedAnalysis(result);
      } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
    };
    runAnalysis();
  }, [records, analysisPeriod]);

  const stats = useMemo(() => {
    const count = records.length;
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const dishCounts: Record<string, number> = {};
    records.forEach(r => r.dishItems.forEach(d => { if (d.name) dishCounts[d.name] = (dishCounts[d.name] || 0) + 1; }));
    const topDishes = Object.entries(dishCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
    
    // Missing meals calculation (last 3 days)
    const missingMeals: Array<{ date: string; types: MealType[]; isToday: boolean }> = [];
    const mealTypes: MealType[] = ['早餐', '午餐', '晚餐'];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMeals = records.filter(r => r.date === dateStr);
      const missing = mealTypes.filter(type => !dayMeals.some(m => m.mealType === type));
      if (missing.length > 0) {
        missingMeals.push({ date: dateStr, types: missing, isToday: i === 0 });
      }
    }

    return { totalCost, count, topDishes, missingMeals };
  }, [records]);

  const tasteProfile = useMemo(() => {
    const counts: Record<string, number> = { '酸': 0, '甜': 0, '苦': 0, '辣': 0, '咸': 0 };
    records.forEach(r => r.tastes?.forEach(t => counts[t]++));
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return { counts, dominant: Object.values(counts).some(v => v > 0) ? dominant : '平和' };
  }, [records]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-end mb-6 px-2">
        <div className="flex gap-1 bg-white p-1 rounded-[18px] shadow border border-stone-50">
          {(['week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setAnalysisPeriod(p)} className={`px-4 py-2 text-[9px] font-black rounded-2xl transition-all ${analysisPeriod === p ? `${theme.bg} text-white shadow-sm` : 'text-stone-300'}`}>
              {p === 'week' ? '周' : p === 'month' ? '月' : '年'}
            </button>
          ))}
        </div>
      </div>

      <div className="ios-card p-8 bg-gradient-to-br from-white to-emerald-50/20 border border-emerald-100 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3"><div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner"><Scale size={20} /></div><h3 className="text-sm font-black text-stone-700">AI 营养报告</h3></div>
        </div>
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /><p className="text-[10px] font-black text-stone-300">正在为你精密分析食材配比...</p></div>
        ) : detailedAnalysis ? (
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <RadarChart nutrients={detailedAnalysis.nutrients} color={THEME_CONFIG.emerald.accent} />
              <div className="flex flex-col"><span className="text-[10px] font-black text-emerald-600/60 uppercase mb-2">平衡得分</span><div className="flex items-baseline gap-1"><span className="text-6xl font-black text-emerald-600">{detailedAnalysis.varietyScore}</span><span className="text-[11px] font-black text-emerald-300">/ 100</span></div></div>
            </div>
            <div className="bg-white/70 p-4 rounded-3xl border border-emerald-50 shadow-sm"><p className="text-[11px] font-bold text-emerald-800 italic">“{detailedAnalysis.summary}”</p></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-[32px] border border-emerald-50 flex flex-col gap-3 shadow-sm"><div className="flex items-center gap-2 text-emerald-600"><Salad size={16} /><span className="text-[10px] font-black">饮食调理</span></div><p className="text-[11px] font-bold text-stone-500">{detailedAnalysis.nutritionalAdvice}</p></div>
              <div className="bg-white p-5 rounded-[32px] border border-emerald-50 flex flex-col gap-3 shadow-sm"><div className="flex items-center gap-2 text-emerald-600"><Activity size={16} /><span className="text-[10px] font-black">肠胃状态</span></div><p className="text-[11px] font-bold text-stone-500">{detailedAnalysis.stomachBurden}</p></div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="ios-card p-5 flex flex-col gap-1.5 items-center"><div className={`p-2 rounded-xl ${theme.light} ${theme.text}`}><TrendingUp size={14} /></div><p className="text-[8px] font-black text-stone-300 uppercase">累计支出</p><p className={`text-lg font-black ${theme.accent}`}>¥{stats.totalCost.toLocaleString()}</p></div>
        <div className="ios-card p-5 flex flex-col gap-1.5 items-center"><div className="p-2 rounded-xl bg-amber-50 text-amber-500"><Medal size={14} /></div><p className="text-[8px] font-black text-stone-300 uppercase">成就达成</p><p className="text-lg font-black text-stone-700">{stats.count}顿</p></div>
        <div className="ios-card p-5 flex flex-col gap-1.5 items-center"><div className="p-2 rounded-xl bg-indigo-50 text-indigo-500"><Target size={14} /></div><p className="text-[8px] font-black text-stone-300 uppercase">均衡指数</p><p className="text-lg font-black text-indigo-600">{detailedAnalysis?.varietyScore || 0}%</p></div>
      </div>

      {/* Missing Meals Statistics Moved to Bottom and Limited to 3 Days */}
      <div className="ios-card p-6 border border-stone-100 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-amber-500" />
          <h3 className="text-sm font-black text-stone-700">漏餐统计 (最近3日)</h3>
        </div>
        <div className="space-y-2">
          {stats.missingMeals.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <CheckCircle2 size={18} />
              <span className="text-xs font-black">每一餐都准时报道，为你点赞！</span>
            </div>
          ) : (
            stats.missingMeals.map((m, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl border ${m.isToday ? 'bg-orange-50 border-orange-200' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-stone-400">{m.isToday ? '今日提醒' : m.date.slice(5)}</span>
                  <span className="text-xs font-black text-stone-700">缺失: {m.types.join('、')}</span>
                </div>
                {m.isToday && <span className="text-[10px] font-black text-orange-500 animate-pulse">记得按时吃饭哦!</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisTab;
