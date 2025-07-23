// src/genaiClient.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

let aiInstance: GoogleGenerativeAI | null = null;

export const getGenAIClient = (): GoogleGenerativeAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("❌ VITE_GOOGLE_API_KEY is not defined in your environment variables.");
    }

    aiInstance = new GoogleGenerativeAI(apiKey);
  }

  return aiInstance;
};
