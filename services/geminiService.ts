
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from '../types';

export async function getFinancialInsight(query: string, transactions: Transaction[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional Financial Assistant for myBCA app.
    Based on the user's recent transaction history provided, answer their questions accurately.
    Transaction Data: ${JSON.stringify(transactions)}
    Tone: Friendly, professional, concise.
    Always use Indonesian Rupiah (IDR) for amounts.
    Keep answers helpful for personal budgeting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Maaf, saya tidak bisa memberikan jawaban saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
}
