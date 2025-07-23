console.log("API key loaded:", Boolean(import.meta.env.VITE_GOOGLE_API_KEY));

import { GoogleGenerativeAI } from "@google/generative-ai";

let aiInstance: GoogleGenerativeAI | null = null;

export const getGenAIClient = (): GoogleGenerativeAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("❌ VITE_GOOGLE_API_KEY is not defined in your environment variables.");
    }

    // ✅ Must pass as an object
    aiInstance = new GoogleGenerativeAI({ apiKey });
  }

  return aiInstance;
};
