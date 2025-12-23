
export type MealType = '早餐' | '午餐' | '下午茶' | '晚餐' | '宵夜';
export type SourceType = '外卖' | '堂食' | '烹饪';
export type CompanionType = string[]; 
export type ThemeColor = 'orange' | 'emerald' | 'blue' | 'rose' | 'violet' | 'amber' | 'indigo' | 'teal';
export type TasteType = '酸' | '甜' | '苦' | '辣' | '咸';

export interface DishItem {
  name: string;
  rating: number;
}

export interface User {
  username: string;
  id: string;
  avatar?: string;
  guardianImage?: string;
}

export interface MealRecord {
  id: string;
  date: string;
  mealType: MealType;
  source: SourceType;
  companion: CompanionType;
  dishItems: DishItem[];
  tastes: TasteType[];
  cost: number;
  photos: string[];
  note: string;
  cuisine: string;
  createdAt: number;
}

export interface StatsData {
  totalCost: number;
  count: number;
  topCuisine: string;
  sourceCounts: Record<string, number>;
  missingMeals: Array<{ date: string; types: MealType[]; isToday: boolean }>;
}

export interface AnalysisResult {
  summary: string;
  nutritionalAdvice: string;
  stomachBurden: string;
  varietyScore: number;
  ingredientInsight: string;
  rhythmAnalysis: string;
  nutrients: {
    carbs: number;    // 0-100
    protein: number;  // 0-100
    fiber: number;    // 0-100
  };
}

export interface GardenState {
  type: 'tree' | 'pet';
  leaves: number;
  flowers: number;
  fruits: number;
  energy: number;
  vitality: number;
  status: 'thriving' | 'normal' | 'yellow' | 'withered';
  lastWatered: number;
}
