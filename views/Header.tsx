import React, { useState, useRef } from 'react';
import { PlusCircle, Palette, User as UserIcon, Camera, Sparkles, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { THEME_CONFIG, THEME_COLORS } from '../constants/config';

interface HeaderProps {
  onAdd: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdd }) => {
  const { currentUser, setCurrentUser, themeColor, setThemeColor, userTitle, aiTip } = useApp();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const theme = THEME_CONFIG[themeColor];

  if (!currentUser) return null;

  return (
    <header className={`sticky top-0 ${theme.bg} pt-4 pb-6 px-6 rounded-b-[32px] shadow-lg z-[90] transition-all duration-500`}>
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setCurrentUser(prev => prev ? { ...prev, avatar: reader.result as string } : null);
              reader.readAsDataURL(file);
          }
      }} />

      <div className="flex justify-between items-center text-white mb-3">
        <div className="flex items-center gap-3">
          <div onClick={() => avatarInputRef.current?.click()} className="w-10 h-10 bg-white/30 rounded-2xl border-2 border-white/50 shadow-inner overflow-hidden cursor-pointer relative group">
            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon size={16}/></div>}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={10} /></div>
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight leading-none">{currentUser.username}</h2>
            <p className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full inline-block font-black mt-0.5">{userTitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onAdd} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/40 shadow-sm active:scale-90 transition-all">
            <PlusCircle size={16} />
          </button>
          <button onClick={() => setShowThemePicker(!showThemePicker)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center border border-white/40 shadow-sm active:scale-90 transition-all">
            <Palette size={16} />
          </button>
        </div>
      </div>

      {showThemePicker && (
        <div className="absolute top-16 right-6 bg-white rounded-[20px] p-2 shadow-2xl z-[100] grid grid-cols-4 gap-1.5 border border-stone-100 animate-in zoom-in">
          {THEME_COLORS.map(c => (
            <button key={c} onClick={() => { setThemeColor(c); setShowThemePicker(false); }} className={`w-6 h-6 rounded-full ${THEME_CONFIG[c].bg} border-2 border-white shadow-md transition-transform hover:scale-110 flex items-center justify-center`}>
              {themeColor === c && <Check size={8} className="text-white" />}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-[20px] border border-white/20 flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${theme.bg} shadow-md flex items-center justify-center text-white shrink-0`}><Sparkles size={12} /></div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-bold text-white leading-tight truncate">“{aiTip}”</p>
        </div>
      </div>
    </header>
  );
};

export default Header;