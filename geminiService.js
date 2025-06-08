import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateMealList(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export function extractFoodNames(geminiText) {
  return geminiText
    .split('\n')
    .filter(line => line.includes('–') || line.includes('-'))
    .map(line => line.split(/[–-]/)[0].trim());
}