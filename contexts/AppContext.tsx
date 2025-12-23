
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, MealRecord, ThemeColor } from '../types';
import { safeParse, safeStringify } from '../utils/storage';
import { geminiService } from '../services/geminiService';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  records: MealRecord[];
  setRecords: React.Dispatch<React.SetStateAction<MealRecord[]>>;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  userTitle: string;
  aiTip: string;
  healthTip: string;
  companionPool: string[];
  addCompanion: (name: string) => void;
  removeCompanion: (name: string) => void;
  refreshAiTips: () => Promise<void>;
  showToast: (msg: string) => void;
  toast: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_COMPANIONS = ['独美', '恋人', '朋友', '家人', '聚餐'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => safeParse('ganfan_user', null));
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => safeParse('ganfan_theme', 'orange'));
  const [userTitle, setUserTitle] = useState("干饭萌新");
  const [aiTip, setAiTip] = useState("正在构思美味的句子...");
  const [healthTip, setHealthTip] = useState("悄悄观察你的干饭规律...");
  const [toast, setToast] = useState<string | null>(null);
  const [companionPool, setCompanionPool] = useState<string[]>(() => safeParse('companion_pool', DEFAULT_COMPANIONS));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const setThemeColor = useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    safeStringify('ganfan_theme', color);
  }, []);

  const addCompanion = useCallback((name: string) => {
    if (!name.trim()) return;
    setCompanionPool(prev => {
      if (prev.includes(name.trim())) return prev;
      const next = [...prev, name.trim()];
      safeStringify('companion_pool', next);
      return next;
    });
  }, []);

  const removeCompanion = useCallback((name: string) => {
    setCompanionPool(prev => {
      const next = prev.filter(c => c !== name);
      safeStringify('companion_pool', next);
      return next;
    });
  }, []);

  // Load records when user changes
  useEffect(() => {
    if (currentUser) {
      const saved = safeParse<MealRecord[]>(`ganfan_records_${currentUser.id}`, []);
      setRecords(saved);
      safeStringify('ganfan_user', currentUser);
    }
  }, [currentUser]);

  // Sync records and update AI analysis
  useEffect(() => {
    if (currentUser) {
      safeStringify(`ganfan_records_${currentUser.id}`, records);
      
      // Background analysis updates
      const updateAnalysis = async () => {
        const title = await geminiService.generateUserTitle(records);
        setUserTitle(title);
        if (records.length > 0) {
          const health = await geminiService.analyzeDietHealth(records);
          setHealthTip(health);
        }
      };
      updateAnalysis();
    }
  }, [records, currentUser]);

  const refreshAiTips = useCallback(async () => {
    if (records.length > 0) {
      const tip = await geminiService.getMealInspiration(records.slice(-5));
      setAiTip(tip);
    }
  }, [records]);

  useEffect(() => {
    refreshAiTips();
  }, [refreshAiTips]);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      records, setRecords,
      themeColor, setThemeColor,
      userTitle, aiTip, healthTip,
      companionPool, addCompanion, removeCompanion,
      refreshAiTips, showToast, toast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
