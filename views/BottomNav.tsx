import React from 'react';
import { Utensils, Droplets, PieChart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { THEME_CONFIG } from '../constants/config';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChange }) => {
  const { themeColor } = useApp();
  const theme = THEME_CONFIG[themeColor];

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-glass px-8 py-3 flex justify-between items-center z-[80] rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <button onClick={() => onChange('home')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'home' ? theme.accent : 'text-stone-300'}`}>
        <div className={`p-2 rounded-xl transition-all ${activeTab === 'home' ? theme.light + ' shadow-sm scale-105' : ''}`}>
          <Utensils size={22} className={activeTab === 'home' ? 'drop-shadow-sm' : 'opacity-25'} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">足迹</span>
      </button>
      <button onClick={() => onChange('garden')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'garden' ? theme.accent : 'text-stone-300'}`}>
        <div className={`p-2 rounded-xl transition-all ${activeTab === 'garden' ? theme.light + ' shadow-sm scale-105' : ''}`}>
          <Droplets size={22} className={activeTab === 'garden' ? 'drop-shadow-sm' : 'opacity-25'} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">养成</span>
      </button>
      <button onClick={() => onChange('analysis')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${activeTab === 'analysis' ? theme.accent : 'text-stone-300'}`}>
        <div className={`p-2 rounded-xl transition-all ${activeTab === 'analysis' ? theme.light + ' shadow-sm scale-105' : ''}`}>
          <PieChart size={22} className={activeTab === 'analysis' ? 'drop-shadow-sm' : 'opacity-25'} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest">总结</span>
      </button>
    </nav>
  );
};

export default BottomNav;