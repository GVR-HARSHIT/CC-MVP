console.log("API key loaded:", Boolean(import.meta.env.VITE_GOOGLE_API_KEY));

import { GoogleGenerativeAI } from "@google/generative-ai";

let aiInstance: GoogleGenerativeAI | null = null;

export const getGenAIClient = (): GoogleGenerativeAI | null => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn("VITE_GOOGLE_API_KEY is not defined. AI features will be disabled.");
      return null;
    }

    try {
      aiInstance = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error("Failed to initialize Google Generative AI:", error);
      return null;
    }
  }

  return aiInstance;
};

export const isAIAvailable = (): boolean => {
  return Boolean(import.meta.env.VITE_GOOGLE_API_KEY);
};