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
  meals: 'Liste med måltider og kalorier, f.eks: [{ "food": "Havregryn", "calories": 350 }]',
});

const prompt = ChatPromptTemplate.fromTemplate(
  `Du er en måltidsplanlegger. Lag en måltidsplan som totalt gir omtrent {goal} kalorier.

VIKTIG: Hver matvare må være separat. Ikke kombiner matvarer i samme objekt. Skriv frukter i flertall. Banan - Bananer

Eksempler på RIKTIG format:
- I stedet for "Egg og bacon" → lag to separate objekter: "Egg" og "Bacon"  
- I stedet for "Laks med grønnsaker" → lag to separate objekter: "Laks" og "Grønnsaker"
- I stedet for "Frukt og nøtter" → lag to separate objekter: "Frukt" og "Nøtter"

Svar som en liste i JSON-format, der hvert element er et objekt med feltene:
- "food": Bare ett enkelt matvare-navn (ikke kombinasjoner)
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
    plan: response.meals, // structured list like: [{ food: 'Havregryn', calories: 350 }]
  };
}
