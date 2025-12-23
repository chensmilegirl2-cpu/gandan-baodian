
import { useState, useMemo, useCallback } from 'react';
import { MealRecord, GardenState } from '../types';
import { useApp } from '../contexts/AppContext';
import { geminiService } from '../services/geminiService';
import { PET_MESSAGES, TREE_MESSAGES } from '../constants/config';
import { safeParse, safeStringify } from '../utils/storage';

export const useGarden = () => {
  const { records, currentUser, setCurrentUser, showToast } = useApp();
  const [nurtureType, setNurtureTypeState] = useState<'tree' | 'pet'>(() => safeParse('nurture_type', 'pet'));
  const [isWatering, setIsWatering] = useState(false);
  const [isGeneratingGuardian, setIsGeneratingGuardian] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState<{ msg: string, timestamp: number } | null>(null);

  const setNurtureType = useCallback((type: 'tree' | 'pet') => {
    setNurtureTypeState(type);
    safeStringify('nurture_type', type);
  }, []);

  const gardenData = useMemo((): GardenState => {
    if (records.length === 0) return { type: nurtureType, leaves: 0, flowers: 0, fruits: 0, energy: 0, vitality: 0, status: 'normal', lastWatered: 0 };
    const count = records.slice(-20).length;
    const totalGrowth = Math.min(100, count * 5);
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    let status: GardenState['status'] = todayRecords.length >= 3 ? 'thriving' : todayRecords.length === 0 ? 'yellow' : 'normal';
    return { type: nurtureType, leaves: totalGrowth, flowers: totalGrowth > 50 ? (totalGrowth - 50) * 2 : 0, fruits: totalGrowth > 80 ? (totalGrowth - 80) * 5 : 0, energy: totalGrowth, vitality: totalGrowth, status, lastWatered: records[records.length - 1]?.createdAt || 0 };
  }, [records, nurtureType]);

  const generateGuardian = useCallback(async (targetType: 'cat' | 'dog') => {
    if (!currentUser) return;
    setIsGeneratingGuardian(true);
    const referencePhoto = records.length > 0 ? records[records.length - 1].photos[0] : undefined;
    try {
      const url = await geminiService.generateGuardianImage(targetType, currentUser.username, referencePhoto);
      if (url) {
        setCurrentUser(prev => prev ? { ...prev, guardianImage: url } : null);
        showToast("✨ 破壳成功！已根据你的饮食风格优化外观~");
      }
    } catch (e) {
      showToast("❌ 生成失败，请稍后重试");
    } finally {
      setIsGeneratingGuardian(false);
    }
  }, [currentUser, records, setCurrentUser, showToast]);

  const handleAction = useCallback((type: 'water' | 'feed') => {
    setIsWatering(true);
    setTimeout(() => { 
      setIsWatering(false); 
      showToast(type === 'water' ? "滋养成功！💧" : "投喂成功！🥧"); 
      const messages = nurtureType === 'pet' ? PET_MESSAGES : TREE_MESSAGES;
      setInteractionMsg({ msg: messages[Math.floor(Math.random() * messages.length)], timestamp: Date.now() });
    }, 1000);
  }, [nurtureType, showToast]);

  const interact = useCallback(() => {
    const messages = nurtureType === 'pet' ? PET_MESSAGES : TREE_MESSAGES;
    setInteractionMsg({ msg: messages[Math.floor(Math.random() * messages.length)], timestamp: Date.now() });
  }, [nurtureType]);

  return {
    nurtureType, setNurtureType,
    gardenData,
    isWatering,
    isGeneratingGuardian,
    interactionMsg,
    generateGuardian,
    handleAction,
    interact
  };
};
