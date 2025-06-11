import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'https://kassal.app/api/v1';
const headers = {
  Authorization: `Bearer ${process.env.KASSAL_API_KEY}`
};

// General product search
async function searchProducts(search) {
  const res = await axios.get(`${API_BASE}/products`, {
    headers,
    params: { search, size: 5 }
  });
  return res.data.data;
}

function getNutrient(nutritionArray, code) {
  const found = nutritionArray.find(n => n.code === code);
  return found ? found.amount : null;
}

// Filter by nutrition
function matchesNutrition(product, kcal, protein, fat, carbs) {
  const n = product.nutrition;
  if (!Array.isArray(n)) return false;

  const energyKcal = getNutrient(n, 'energi_kcal');
  const proteinG = getNutrient(n, 'protein');
  const fatG = getNutrient(n, 'fett_totalt');
  const carbsG = getNutrient(n, 'karbohydrater');

  const within = (target, value) => !target || (value !== null && value <= parseFloat(target));

  return (
    within(kcal, energyKcal) &&
    within(protein, proteinG) &&
    within(fat, fatG) &&
    within(carbs, carbsG)
  );
}

async function getProductsWithNutritionFilter(search, kcal, protein, fat, carbs) {
  const products = await searchProducts(search);
  
  console.log('Total products before filtering:', products.length);

  const irrelevantCategories = new Set([
    'barneprodukter', 'barnedessert', 'barnemat',
    'kjæledyr', 'kattemat', 'hundemat',
    'tilbehør', 'rengjøring',
    'kosmetikk', 'hudpleie'
  ]);

  return products.filter(product => {
    const nutritionMatch = matchesNutrition(product, kcal, protein, fat, carbs);
    const categoryMatch = !(
  product.category &&
  product.category.some(cat => irrelevantCategories.has(cat.name.toLowerCase()))
);
    
    console.log(`Product: ${product.name || product.title}, Nutrition: ${nutritionMatch}, Category: ${categoryMatch}`);
    
    return nutritionMatch && categoryMatch;
  });
}


export default {
  searchProducts,
  getProductsWithNutritionFilter
};
