import React, { useState } from 'react';
import { Utensils, Heart } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './views/Header';
import BottomNav from './views/BottomNav';
import HomeTab from './views/HomeTab';
import GardenTab from './views/GardenTab';
import AnalysisTab from './views/AnalysisTab';
import MealForm from './components/MealForm';
import { THEME_CONFIG } from './constants/config';
import { geminiService } from './services/geminiService';
import { MealRecord, SourceType, MealType } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, setCurrentUser, themeColor, toast, records, setRecords, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'home' | 'garden' | 'analysis' | 'add'>('home');
  const [loginInput, setLoginInput] = useState('');
  const theme = THEME_CONFIG[themeColor];

  const handleSaveMeal = async (newMeal: any) => {
    const cuisine = await geminiService.detectCuisine(newMeal.dishItems.map((d: any) => d.name));
    const fullRecord: MealRecord = { ...newMeal, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), cuisine, tastes: newMeal.tastes || [] };
    setRecords(prev => [...prev, fullRecord]);
    setActiveTab('home');
    showToast("✨ 干饭成功！数据已吸入养成与总结");
  };

  if (!currentUser) return (
    <div className="flex h-screen items-center justify-center bg-[#fffcf9]">
      <div className="text-center p-12 ios-card max-w-[320px] animate-healing">
        <div className={`w-20 h-20 ${theme.bg} rounded-[28px] mx-auto flex items-center justify-center text-white mb-6 shadow-xl border-4 border-white`}><Utensils size={40} /></div>
        <h1 className="text-2xl font-black mb-2">干饭宝典</h1>
        <p className="text-stone-400 text-xs mb-8">记录美味，让生活变得温暖</p>
        <input type="text" placeholder="干饭人的昵称" value={loginInput} onChange={e => setLoginInput(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-stone-50 border-2 border-stone-100 focus:outline-none text-center font-bold mb-4" />
        <button onClick={() => { if(loginInput) setCurrentUser({ username: loginInput, id: loginInput }); }} className={`w-full ${theme.bg} text-white font-black py-4 rounded-2xl shadow-lg border-b-4 border-black/10`}>开启干饭！</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-[#fffcf9] flex flex-col relative overflow-hidden">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in zoom-in slide-in-from-top-4">
          <div className="bg-white/95 px-6 py-2 rounded-full shadow-xl flex items-center gap-2 border border-stone-100 font-black text-[11px] text-stone-600"><Heart size={12} className="text-rose-400 fill-current" /> {toast}</div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pb-24">
        {activeTab !== 'add' && <Header onAdd={() => setActiveTab('add')} />}
        
        <main className={`flex-1 p-5 ${activeTab === 'add' ? 'mt-0' : '-mt-4'} relative z-10`}>
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'garden' && <GardenTab />}
          {activeTab === 'analysis' && <AnalysisTab />}
          {activeTab === 'add' && <MealForm onSave={handleSaveMeal} onCancel={() => setActiveTab('home')} themeColor={themeColor} />}
        </main>
      </div>

      {activeTab !== 'add' && <BottomNav activeTab={activeTab} onChange={setActiveTab} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}