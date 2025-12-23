
import { GoogleGenAI, Type } from "@google/genai";
import { MealRecord, DishItem, TasteType, AnalysisResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async generateGuardianImage(type: 'cat' | 'dog', username: string, referenceImage?: string): Promise<string> {
    const basePrompt = `A cute, high-quality manga-style 3D rendered ${type} character for a meal tracking app. 
    The ${type} should look happy and friendly. Soft macaron colors, clean white background, digital art style. 
    Representing the "Foodie Guardian" for a user named ${username}.`;
    
    const prompt = referenceImage 
      ? `${basePrompt} Please incorporate the color theme, atmosphere, or a small element inspired by the attached food photo to make this guardian feel personalized to the user's latest meal.`
      : basePrompt;
    
    try {
      const parts: any[] = [{ text: prompt }];
      
      if (referenceImage) {
        const data = referenceImage.includes(',') ? referenceImage.split(',')[1] : referenceImage;
        const mimeType = referenceImage.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        parts.push({
          inlineData: { data, mimeType }
        });
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return "";
    } catch (error) {
      console.error("Image generation failed", error);
      return "";
    }
  }

  async getMealInspiration(recentMeals: MealRecord[]): Promise<string> {
    const mealHistory = recentMeals
      .map(m => `${m.mealType}: ${m.dishItems.map(d => d.name).join(', ')}`)
      .join('\n');

    const prompt = `你是一个美食专家。以下是用户最近的饮食记录：
    ${mealHistory}
    请提供一条简短（30字以内）且具有感染力的干饭建议。要求：风格活泼、亲切。`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "今天也要记得好好吃饭哦！";
    } catch (error) {
      return "人生苦短，不如干饭。";
    }
  }

  async getDishRangeByTastes(tastes: TasteType[]): Promise<string[]> {
    const tasteStr = tastes.length > 0 ? tastes.join('、') : "不限口味";
    const prompt = `作为一个美食家，请根据“${tasteStr}”的口味偏好，推荐10个具体的菜品名称。只输出菜名，用逗号分隔，不要包含其他文字。确保菜名简短有力。`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text?.split(/[，,]/).map(s => s.trim().replace(/^[\d.]+/, '')) || [];
    } catch {
      return ["红烧肉", "宫保鸡丁", "麻婆豆腐", "酸辣粉", "回锅肉"];
    }
  }

  async analyzeDietHealth(records: MealRecord[]): Promise<string> {
    if (records.length < 3) return "记录太少，继续加油干饭！";
    const history = records.slice(-10).map(r => `${r.date} ${r.mealType}`).join(', ');
    const prompt = `根据最近的干饭时间表：[${history}]。分析饮食规律性。用一句话给出幽默的健康提醒（20字以内）。`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text?.trim() || "规律干饭，益寿延年。";
    } catch {
      return "干饭虽好，规律更重要。";
    }
  }

  async getDetailedDietaryAnalysis(records: MealRecord[], period: string): Promise<AnalysisResult> {
    if (records.length === 0) {
      return {
        summary: "暂无数据，快去记录你的第一顿美食吧！",
        nutritionalAdvice: "保持饮食多样化是健康的基础。",
        stomachBurden: "规律进食对肠胃最友好。",
        varietyScore: 0,
        ingredientInsight: "建议尝试不同种类的食材。",
        rhythmAnalysis: "暂时无法分析节奏。",
        nutrients: { carbs: 33, protein: 33, fiber: 33 }
      };
    }

    const mealData = records.map(r => ({
      date: r.date,
      type: r.mealType,
      dishes: r.dishItems.map(d => d.name),
      cuisine: r.cuisine
    }));

    const prompt = `你是一个专业的营养师。请分析用户的饮食：${JSON.stringify(mealData)}。
    请严格按照JSON返回：
    1. summary: 总体评价。
    2. nutritionalAdvice: 针对营养均衡的建议。
    3. stomachBurden: 肠胃负担评估。
    4. varietyScore: 多样性评分 (0-100)。
    5. ingredientInsight: 食材重复度分析。
    6. rhythmAnalysis: 饮食规律性。
    7. nutrients: 对象，包含 carbs (碳水), protein (蛋白质), fiber (纤维) 的比例评分，每个值范围 0-100。`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              nutritionalAdvice: { type: Type.STRING },
              stomachBurden: { type: Type.STRING },
              varietyScore: { type: Type.NUMBER },
              ingredientInsight: { type: Type.STRING },
              rhythmAnalysis: { type: Type.STRING },
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  carbs: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  fiber: { type: Type.NUMBER }
                },
                required: ["carbs", "protein", "fiber"]
              }
            },
            required: ["summary", "nutritionalAdvice", "stomachBurden", "varietyScore", "ingredientInsight", "rhythmAnalysis", "nutrients"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Detailed analysis failed", error);
      return {
        summary: "分析暂时迷路了。",
        nutritionalAdvice: "多吃蔬果，少油少盐。",
        stomachBurden: "清淡饮食有益肠胃。",
        varietyScore: 50,
        ingredientInsight: "每顿饭都是新的开始。",
        rhythmAnalysis: "按时干饭！",
        nutrients: { carbs: 50, protein: 50, fiber: 50 }
      };
    }
  }

  async generateUserTitle(records: MealRecord[]): Promise<string> {
    if (records.length === 0) return "萌新干饭人";
    const history = records.slice(-10).map(r => r.cuisine).join(';');
    const prompt = `根据用户吃过的菜系：[${history}]，生成一个4-6字的专属Q萌称号。只输出称号。`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text?.trim() || "优质美食家";
    } catch {
      return "优质美食家";
    }
  }

  async detectCuisine(dishNames: string[]): Promise<string> {
    if (dishNames.length === 0) return "家常菜";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `判断菜系：${dishNames.join(', ')}。仅输出菜系名称。`,
      });
      return response.text?.trim() || "家常菜";
    } catch {
      return "家常菜";
    }
  }

  async analyzeMealImage(base64Image: string): Promise<{ dishes: { name: string }[], note: string, cuisine: string }> {
    const data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || 'image/jpeg';
    
    const prompt = "分析这张美食照片。请识别出照片中的菜品名称，提供一段简短幽默的点评，并判断所属菜系。";
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING }
                  },
                  required: ["name"]
                }
              },
              note: { type: Type.STRING },
              cuisine: { type: Type.STRING }
            },
            required: ["dishes", "note", "cuisine"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Meal image analysis failed", error);
      return { 
        dishes: [{ name: "美味餐点" }], 
        note: "看着就很有食欲！", 
        cuisine: "中式料理" 
      };
    }
  }

  async brainstormMeal(mealType: string): Promise<{ dishName: string, note: string }> {
    const prompt = `请为我的${mealType}提供一个充满诱惑力的菜品推荐灵感，并附带一段调皮幽默的推荐语。`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING },
              note: { type: Type.STRING }
            },
            required: ["dishName", "note"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Meal brainstorm failed", error);
      return { 
        dishName: "热气腾腾的小面", 
        note: "没什么是一顿美食解决不了的，如果有，就两顿！" 
      };
    }
  }
}

export const geminiService = new GeminiService();
