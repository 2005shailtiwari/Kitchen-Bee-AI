export type Language = 'en' | 'hi';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Ingredient {
  name: string;
  nameHi?: string;
  amount: number;
  unit: string;
  category?: 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Spices & Oils' | 'Meat & Seafood' | 'Bakery' | 'Flours & Bakery' | 'Others';
}

export interface LibraryIngredient {
  id: string;
  nameEn: string;
  nameHi: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy & Eggs' | 'Grains & Pulses' | 'Flours & Bakery' | 'Spices & Herbs' | 'Meat, Poultry & Fish' | 'Oils & Condiments';
  categoryHi: string;
  icon: string;
  isVegetarian: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  subcategory?: string;
  image: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  baseServings: number;
  description: string;
  descriptionHi: string;
  isVegetarian: boolean;
  cuisine: string; // Indian, Italian, Chinese, Mexican, Thai, Bakery, Continental, etc.
  tags?: string[];
  ingredients: Ingredient[];
  instructions: string[];
  instructionsHi?: string[];
  tips?: string;
  tipsHi?: string;
  isAiGenerated?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount: number | string;
  unit: string;
  category: 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Spices & Oils' | 'Meat & Seafood' | 'Bakery' | 'Flours & Bakery' | 'Others';
  completed: boolean;
  addedAt: string;
  recipeSource?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface RecipeSuggestion {
  dishName: string;
  dishNameHi?: string;
  matchPercentage: number;
  description: string;
  usedIngredients: string[];
  missingIngredients: string[];
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  quickInstructions: string[];
  isVegetarian?: boolean;
  category?: string;
  alternativeDishes?: string[];
}

export type ActiveView = 
  | 'dashboard'
  | 'chat'
  | 'recipes'
  | 'recipe-detail'
  | 'calculator'
  | 'grocery'
  | 'solver'
  | 'explore'
  | 'profile';
