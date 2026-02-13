
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const breakdownGoal = async (goal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quebre este objetivo em 5 tarefas práticas e sequenciais para um MVP: "${goal}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['task', 'description'],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Erro ao quebrar objetivo:', error);
    return null;
  }
};
