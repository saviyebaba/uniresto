
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeStats = async (stats: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a university restaurant administrator, analyze these statistics and provide a 3-sentence summary with one strategic recommendation for tomorrow: ${JSON.stringify(stats)}`,
  });
  return response.text;
};

export const suggestMenu = async (mealType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a balanced and popular university meal for ${mealType}. Provide a descriptive title and a list of key ingredients.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          calories: { type: Type.NUMBER }
        },
        required: ["title", "description"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { title: "Daily Special", description: "Chef's choice of seasonal vegetables and protein." };
  }
};
