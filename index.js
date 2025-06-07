import express from 'express';
import dotenv from 'dotenv';
import kassalService from './service.js';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});