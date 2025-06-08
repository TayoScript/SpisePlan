import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from 'langchain/chains';
import kassalService from './service.js';
import dotenv from 'dotenv';

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
});


const prompt = new PromptTemplate({
  inputVariables: ['goal'],
  template: `
Du er en måltidsplanlegger. Basert på brukerens mål, lag en enkel liste med måltider og mellommåltider som til sammen dekker målet (f.eks. 2000 kcal).

List opp hvert element slik:
- [Matnavn] – [Kalorier]

Mål: {goal}
`
});


const chain = new LLMChain({ llm: model, prompt });

export async function generateMealPlan(goal) {
  const response = await chain.call({ goal });

  const lines = response.text
    .split('\n')
    .filter(line => line.includes('–') || line.includes('-'));

  const foodNames = lines.map(line =>
    line.split(/[–-]/)[0].trim()
  );

  const result = [];

  for (const food of foodNames) {
    const products = await kassalService.searchProducts(food);
    if (products.length) {
      result.push({ food, options: products });
    }
  }

  return {
    plan: lines,
    result
  };
}
