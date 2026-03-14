
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to sanitize Gemini response which often includes markdown code blocks
const parseGeminiJson = (text: string | undefined) => {
  if (!text) return {};
  try {
    // Remove markdown code blocks like ```json ... ``` or just ``` ... ```
    const cleanText = text.replace(/```json\s*|\s*```/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse Gemini JSON:", error);
    return {};
  }
};

export const getProductAnalysis = async (productName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this product for a live shopping stream: ${productName}. Description: ${description}. Provide 3 key selling points and a catchy 'live pitch' sentence.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sellingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            pitch: { type: Type.STRING }
          },
          required: ["sellingPoints", "pitch"]
        }
      }
    });
    return parseGeminiJson(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getProductDeepDive = async (productName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a professional auction-house 'Collector's Note' for: ${productName}. Focus on its historical significance, rarity, and why it is a must-have for serious collectors. Keep it to 3 short, punchy paragraphs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            history: { type: Type.STRING },
            rarityReport: { type: Type.STRING },
            investmentPotential: { type: Type.STRING }
          },
          required: ["history", "rarityReport", "investmentPotential"]
        }
      }
    });
    return parseGeminiJson(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getShowPlanner = async (items: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Plan a 30-minute high-energy live show for these items: ${items.join(', ')}. Provide an itinerary with 3 segments, a 'hype trigger' for each, and suggested starting bids.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  hypeTrigger: { type: Type.STRING },
                  suggestedBid: { type: Type.STRING }
                }
              }
            },
            overallVibe: { type: Type.STRING }
          }
        }
      }
    });
    return parseGeminiJson(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getSmartChatReply = async (context: string, userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: You are an AI shopping assistant for a live stream titled "${context}". A viewer asks: "${userMessage}". Give a friendly, helpful reply in 1-2 short sentences.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm here to help with any questions!";
  }
};
