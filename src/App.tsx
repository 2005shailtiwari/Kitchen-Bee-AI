/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AIChat } from './components/AIChat';
import { FindRecipes } from './components/FindRecipes';
import { IngredientCalculator } from './components/IngredientCalculator';
import { GroceryList } from './components/GroceryList';
import { ProblemSolver } from './components/ProblemSolver';
import { ExploreIngredientsView } from './components/ExploreIngredientsView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { UserProfile } from './components/UserProfile';
import { BottomNav } from './components/BottomNav';
import { ActiveView, Language, User, Ingredient, GroceryItem, Recipe } from './types';
import { CURATED_RECIPES } from './data/curatedRecipes';

export default function App() {
  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('kitchenbee_language') as Language) || 'en';
  });

  const handleLanguageToggle = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('kitchenbee_language', lang);
  };

  // User & Auth State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kitchenbee_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Default to a welcoming Guest profile so beginners can explore immediately
    const defaultGuest: User = {
      id: 'guest_init',
      name: 'Guest',
      email: 'guest@kitchenbee.ai',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('kitchenbee_user', JSON.stringify(defaultGuest));
    return defaultGuest;
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Navigation History Stack
  const [history, setHistory] = useState<ActiveView[]>(['dashboard']);
  const currentView = history[history.length - 1] || 'dashboard';

  const navigateTo = (view: ActiveView) => {
    if (view === currentView) return;
    setHistory((prev) => [...prev, view]);
    window.history.pushState({ view }, '', `#${view}`);
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, prev.length - 1));
    } else {
      setHistory(['dashboard']);
    }
  };

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setHistory((prev) => [...prev, e.state.view]);
      } else {
        handleBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history]);

  // Preloaded data for calculator & explore views
  const [calculatorRecipe, setCalculatorRecipe] = useState<Recipe | null>(null);
  const [explorePantry, setExplorePantry] = useState<{
    ingredients: string[];
    vegOnly: boolean;
  }>({
    ingredients: ['Potatoes', 'Onions', 'Tomatoes'],
    vegOnly: true,
  });

  // Grocery List State
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('kitchenbee_grocery');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'init_1',
        name: 'Basmati Rice',
        amount: '1',
        unit: 'kg',
        category: 'Grains',
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'init_2',
        name: 'Fresh Paneer',
        amount: '250',
        unit: 'g',
        category: 'Dairy',
        completed: false,
        addedAt: new Date().toISOString(),
      },
      {
        id: 'init_3',
        name: 'Ripe Tomatoes',
        amount: '500',
        unit: 'g',
        category: 'Vegetables',
        completed: true,
        addedAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('kitchenbee_grocery', JSON.stringify(groceryItems));
  }, [groceryItems]);

  // Favorite Recipes State
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kitchenbee_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return ['veg-pulao', 'paneer-butter-masala'];
  });

  useEffect(() => {
    localStorage.setItem('kitchenbee_favorites', JSON.stringify(favoriteRecipeIds));
  }, [favoriteRecipeIds]);

  const toggleFavorite = (recipeId: string) => {
    if (favoriteRecipeIds.includes(recipeId)) {
      setFavoriteRecipeIds(favoriteRecipeIds.filter((id) => id !== recipeId));
    } else {
      setFavoriteRecipeIds([...favoriteRecipeIds, recipeId]);
    }
  };

  // Grocery Actions
  const handleAddGrocery = (item: Omit<GroceryItem, 'id' | 'addedAt'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: 'g_' + Date.now() + Math.random().toString(36).substring(2, 6),
      addedAt: new Date().toISOString(),
    };
    setGroceryItems((prev) => [newItem, ...prev]);
  };

  const handleSendIngredientsToGrocery = (
    ingredients: Ingredient[],
    sourceName: string
  ) => {
    const newItems: GroceryItem[] = ingredients.map((ing) => ({
      id: 'g_' + Date.now() + Math.random().toString(36).substring(2, 7),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category || 'Others',
      completed: false,
      addedAt: new Date().toISOString(),
      recipeSource: sourceName,
    }));

    setGroceryItems((prev) => [...newItems, ...prev]);
  };

  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateGroceryItem = (updated: GroceryItem) => {
    setGroceryItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleClearCompletedGrocery = () => {
    setGroceryItems((prev) => prev.filter((item) => !item.completed));
  };

  const handleClearAllGrocery = () => {
    setGroceryItems([]);
  };

  // Jump from Recipe to Calculator
  const handleScaleInCalculator = (recipe: Recipe) => {
    setCalculatorRecipe(recipe);
    navigateTo('calculator');
  };

  // Jump from Dashboard to Explore Ingredients
  const handleExploreFromDashboard = (ingredients: string[], vegOnly: boolean) => {
    setExplorePantry({ ingredients, vegOnly });
    navigateTo('explore');
  };

  const handleLogout = () => {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      name: 'Guest',
      email: 'guest@kitchenbee.ai',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('kitchenbee_user', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        onBack={handleBack}
        canGoBack={history.length > 1}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            language={language}
            onNavigate={navigateTo}
            onExploreWithIngredients={handleExploreFromDashboard}
          />
        )}

        {currentView === 'chat' && <AIChat language={language} />}

        {currentView === 'recipes' && (
          <FindRecipes
            language={language}
            onSendToGrocery={handleSendIngredientsToGrocery}
            onScaleInCalculator={handleScaleInCalculator}
            favoriteRecipeIds={favoriteRecipeIds}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === 'calculator' && (
          <IngredientCalculator
            language={language}
            preloadedRecipe={calculatorRecipe}
            onSendToGrocery={handleSendIngredientsToGrocery}
          />
        )}

        {currentView === 'grocery' && (
          <GroceryList
            language={language}
            groceryItems={groceryItems}
            onToggleItem={handleToggleGroceryItem}
            onDeleteItem={handleDeleteGroceryItem}
            onAddItem={handleAddGrocery}
            onUpdateItem={handleUpdateGroceryItem}
            onClearCompleted={handleClearCompletedGrocery}
            onClearAll={handleClearAllGrocery}
          />
        )}

        {currentView === 'solver' && <ProblemSolver language={language} />}

        {currentView === 'explore' && (
          <ExploreIngredientsView
            language={language}
            initialIngredients={explorePantry.ingredients}
            initialVegOnly={explorePantry.vegOnly}
            onSendToGrocery={handleSendIngredientsToGrocery}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={navigateTo}
        language={language}
        groceryCount={groceryItems.filter((i) => !i.completed).length}
      />

      {/* Welcome & Authentication Modal */}
      <WelcomeScreen
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(newUser) => setUser(newUser)}
        language={language}
      />

      {/* User Profile Drawer */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
        onLogout={handleLogout}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        savedRecipesCount={favoriteRecipeIds.length}
        groceryItemsCount={groceryItems.length}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
