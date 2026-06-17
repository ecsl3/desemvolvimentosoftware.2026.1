"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function perguntarParaIA(pergunta: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API Key não configurada no .env.local");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(pergunta);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na Gemini API:", error);
    return "Puxa, tive um problema para acessar a inteligência agora. Tente novamente!";
  }
}