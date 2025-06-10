import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import * as dotenv from 'dotenv';

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
});

async function generate2000KcalMealPlan() {
  const prompt = ChatPromptTemplate.fromTemplate(
    `Du er en måltidsplanlegger. Lag en måltidsplan som totalt gir omtrent 2000 kcal.
Svar som en liste i JSON-format, der hvert element er et objekt med feltene:
- "food": navnet på måltidet eller matvaren
- "calories": kalorier som tall

{format_instructions}`
  );

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    meals: 'Liste med måltider og kalorier, f.eks: [{ "food": "Havregrøt", "calories": 350 }]',
  });

  const chain = prompt.pipe(model).pipe(outputParser);

  const response = await chain.invoke({
    format_instructions: outputParser.getFormatInstructions(),
  });

  return response.meals;
}

// Run it
generate2000KcalMealPlan()
  .then(console.log)
  .catch(console.error);
