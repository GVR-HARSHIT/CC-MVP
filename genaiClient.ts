// src/genaiClient.ts

import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getGenAIClient = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("❌ VITE_GOOGLE_API_KEY is not defined in your environment.");
    }

    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};
