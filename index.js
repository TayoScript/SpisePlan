import express from 'express';
import dotenv from 'dotenv';
import kassalService from './service.js';
import { generateMealList, extractFoodNames } from './geminiservice.js';
import { generateMealPlan } from './MealPlan.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.get('/products', async (req, res) => {
  const { search, kcal, protein, fat, carbs } = req.query;

  if (!search) {
    return res.status(400).json({ error: 'Missing ?search= term' });
  }

  try {
    const products = await kassalService.getProductsWithNutritionFilter(
      search,
      kcal,
      protein,
      fat,
      carbs
    );

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'error' });
  }
});

app.get('/mealplan', async (req, res) => {
  const { goal } = req.query;
  if (!goal) return res.status(400).json({ error: 'Missing ?goal=' });

  try {
    const data = await generateMealPlan(goal);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Meal plan generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});