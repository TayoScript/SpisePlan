import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import kassalService from './service.js';
import dotenv from 'dotenv';

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
});

export function extractFoodNames(geminiText) {
  return geminiText
    .split('\n')
    .filter(line => line.includes('–') || line.includes('-'))
    .map(line => line.split(/[–-]/)[0].trim());
}

const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
  meals: 'Liste med måltider og kalorier, f.eks: [{ "food": "Havregrøt", "calories": 350 }]',
});

const prompt = ChatPromptTemplate.fromTemplate(
  `Du er en måltidsplanlegger. Lag en måltidsplan som totalt gir omtrent {goal}.
Svar som en liste i JSON-format, der hvert element er et objekt med feltene:
- "food": Bare et navn på matvaren. For eksempel " Havregrøt med bær" blir "Havregrøt" "bær" 
- "calories": kalorier som tall

{format_instructions}`
);

const chain = prompt.pipe(model).pipe(outputParser);

export async function generateMealPlan(goal) {
  const response = await chain.invoke({
    goal,
    format_instructions: outputParser.getFormatInstructions(),
  });


  return {
    plan: response.meals, // structured list like: [{ food: 'Havregrøt', calories: 350 }]
  };
}
