import { GoogleGenAI } from "@google/genai";
import { PetStats, PetType } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize securely inside functions to avoid early instantiation issues if key is missing initially in some envs
// But per instructions, we assume valid env var.

const ai = new GoogleGenAI({ apiKey });

export const generatePetReaction = async (
  petType: PetType,
  name: string,
  stats: PetStats,
  userMessage?: string
): Promise<string> => {
  if (!apiKey) return "...";

  const prompt = userMessage 
    ? `User said to ${name} (a ${petType}): "${userMessage}".`
    : `The user is just watching ${name}.`;

  const context = `
    You are roleplaying as a digital pet.
    Type: ${petType}.
    Name: ${name}.
    Current Stats: Hunger ${stats.hunger}/100, Happiness ${stats.happiness}/100, Energy ${stats.energy}/100.
    
    Stats interpretation:
    - Low Hunger (<30): Complaining, weak.
    - Low Energy (<30): Sleepy, groggy.
    - Low Happiness (<30): Sad, bored.
    - High all: Excited, energetic.

    Respond in character. 
    Keep it extremely short (max 15 words). 
    Use cute "pet speak" if appropriate for the animal (e.g. Meow, Glup, Quack).
    Do not use hashtags.
    
    ${prompt}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });
    return response.text || "???";
  } catch (error) {
    console.error("AI Error", error);
    return "...";
  }
};