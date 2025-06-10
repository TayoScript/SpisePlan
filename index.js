import express from 'express';
import dotenv from 'dotenv';
import kassalService from './service.js';
import { generateMealPlan, extractFoodNames } from './MealPlan.js';

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
    if (err.response) {
      console.error('MealPlan API Error:');
      console.error('Status code:', err.response.status);
      console.error('Error body:', err.response.data);
      console.error('From:', err.config?.url || 'Unknown URL');

      if (err.response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }

      return res.status(err.response.status).json({ error: 'Upstream API error' });
    } else {
      console.error('Unexpected Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/mealplan-with-products', async (req, res) => {
  const { goal, kcal, protein, fat, carbs } = req.query;
  if (!goal) return res.status(400).json({ error: 'Missing ?goal=' });

  try {
    console.log('Generating meal plan...');
    const mealPlanData = await generateMealPlan(goal);
    console.log('Extracting food names...');
    let foodNames = [];
    
    try {
      // Parse the meal plan structure
      if (mealPlanData.plan) {
        const planArray = JSON.parse(mealPlanData.plan);
        foodNames = planArray.map(item => item.food);
        console.log('Extracted food names:', foodNames);
      } else {
        throw new Error('No plan property found in meal plan data');
      }
    } catch (parseError) {
      console.warn('Could not parse meal plan structure:', parseError.message);
      console.warn('Trying extractFoodNames function...');
      
      // Fallback function
      try {
        const mealPlanText = typeof mealPlanData === 'string' 
          ? mealPlanData 
          : JSON.stringify(mealPlanData);
        
        foodNames = await extractFoodNames(mealPlanText);
      } catch (extractError) {
        console.warn('extractFoodNames also failed:', extractError.message);
      }
    }


    console.log('Searching for products...');
    const productResults = {};
    const searchPromises = foodNames.map(async (foodName) => {
      try {
        const products = await kassalService.getProductsWithNutritionFilter(
          foodName,
          kcal,
          protein,
          fat,
          carbs
        );
        
        // Filter products to only include essential information
        const filteredProducts = products.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.current_price,
          store: {
            name: product.store?.name,
            url: product.store?.url
          },
          nutrition: {
            calories: product.nutrition?.find(n => n.code === 'energi_kcal')?.amount || null,
            protein: product.nutrition?.find(n => n.code === 'protein')?.amount || null,
            fat: product.nutrition?.find(n => n.code === 'fett_totalt')?.amount || null,
            carbs: product.nutrition?.find(n => n.code === 'karbohydrater')?.amount || null
          }
        }));
        
        return { foodName, products: filteredProducts };
      } catch (error) {
        console.error(`Error searching for ${foodName}:`, error.message);
        return { foodName, products: [], error: error.message };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    
    // Organize results
    searchResults.forEach(result => {
      productResults[result.foodName] = {
        products: result.products,
        error: result.error || null
      };
    });

    // Returned combined response
    res.json({
      mealPlan: mealPlanData,
      extractedFoodNames: foodNames,
      products: productResults,
      summary: {
        totalFoodItems: foodNames.length,
        productsFound: Object.values(productResults).reduce((sum, item) => sum + item.products.length, 0)
      }
    });

  } catch (err) {
    if (err.response) {
      console.error('API Error:');
      console.error('Status code:', err.response.status);
      console.error('Error body:', err.response.data);

      if (err.response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }

      return res.status(err.response.status).json({ error: 'Upstream API error' });
    } else {
      console.error('Unexpected Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});


app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});