import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  Sparkles, 
  ShoppingBag, 
  Scale, 
  Heart, 
  Check, 
  ChevronRight, 
  Flame, 
  ChefHat, 
  Utensils 
} from 'lucide-react';
import { Recipe, Language, Ingredient } from '../types';
import { CURATED_RECIPES } from '../data/curatedRecipes';
import { getTranslation } from '../locales/translations';
import { BeeLogo } from './BeeLogo';

interface FindRecipesProps {
  language: Language;
  onSendToGrocery: (items: Ingredient[], recipeName: string) => void;
  onScaleInCalculator: (recipe: Recipe) => void;
  favoriteRecipeIds: string[];
  onToggleFavorite: (recipeId: string) => void;
}

export const FindRecipes: React.FC<FindRecipesProps> = ({
  language,
  onSendToGrocery,
  onScaleInCalculator,
  favoriteRecipeIds,
  onToggleFavorite,
}) => {
  const t = getTranslation(language);
  const isHi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_RECIPES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [grocerySuccess, setGrocerySuccess] = useState(false);
  const [genError, setGenError] = useState('');

  // Helper to format difficulty in active language
  const formatDifficulty = (diff: string) => {
    if (!isHi) return diff;
    if (diff === 'Easy' || diff === 'सरल') return 'सरल';
    if (diff === 'Medium' || diff === 'मध्यम') return 'मध्यम';
    if (diff === 'Hard' || diff === 'कठिन') return 'कठिन';
    return diff;
  };

  // Helper to format time strings (e.g. "15 mins" -> "15 मिनट")
  const formatTime = (timeStr: string) => {
    if (!isHi) return timeStr;
    return timeStr
      .replace(/mins?/gi, 'मिनट')
      .replace(/hours?/gi, 'घंटे')
      .replace(/sec/gi, 'सेकंड');
  };

  // Helper to format unit
  const formatUnit = (unit: string) => {
    if (!isHi) return unit;
    return (t.units as any)[unit] || unit;
  };

  // Helper for cuisine name in active language
  const formatCuisine = (cuisine: string) => {
    if (!isHi) return cuisine;
    if (cuisine.toLowerCase() === 'indian') return 'भारतीय';
    if (cuisine.toLowerCase() === 'international') return 'अंतरराष्ट्रीय';
    if (cuisine.toLowerCase() === 'bakery') return 'बेकरी';
    if (cuisine.toLowerCase() === 'italian') return 'इटैलियन';
    if (cuisine.toLowerCase() === 'chinese') return 'चीनी';
    if (cuisine.toLowerCase() === 'mexican') return 'मैक्सिकन';
    return cuisine;
  };

  // Comprehensive Filtering: Name, Category, Cuisine, Tags, and Ingredients!
  const filteredRecipes = recipes.filter((r) => {
    // 1. Dietary Filter
    if (dietFilter === 'veg' && !r.isVegetarian) return false;
    if (dietFilter === 'non-veg' && r.isVegetarian) return false;

    // 2. Category Filter
    if (activeCategory === 'indian') {
      if (r.cuisine.toLowerCase() !== 'indian') return false;
    } else if (activeCategory === 'international') {
      if (r.cuisine.toLowerCase() !== 'international') return false;
    } else if (activeCategory === 'bakery') {
      if (r.cuisine.toLowerCase() !== 'bakery' && !r.category.toLowerCase().includes('bakery')) return false;
    } else if (activeCategory === 'quick') {
      const cookNum = parseInt(r.cookTime) || 30;
      if (cookNum > 20) return false;
    } else if (activeCategory === 'healthy') {
      if (!r.tags?.includes('Healthy') && !r.tags?.includes('Comfort Food')) return false;
    } else if (activeCategory === 'desserts') {
      if (!r.category.toLowerCase().includes('dessert') && !r.category.toLowerCase().includes('beverage')) return false;
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = r.name.toLowerCase().includes(q) || (r.nameHi && r.nameHi.includes(q));
      const descMatch = r.description.toLowerCase().includes(q) || (r.descriptionHi && r.descriptionHi.includes(q));
      const cuisineMatch = r.cuisine.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      const tagsMatch = r.tags?.some((tag) => tag.toLowerCase().includes(q));
      const ingredientsMatch = r.ingredients.some(
        (ing) =>
          ing.name.toLowerCase().includes(q) ||
          (ing.nameHi && ing.nameHi.includes(q))
      );

      if (!nameMatch && !descMatch && !cuisineMatch && !tagsMatch && !ingredientsMatch) {
        return false;
      }
    }

    return true;
  });

  const handleGenerateAI = async () => {
    const dish = searchQuery.trim() || (isHi ? 'शाही शेफ स्पेशल' : 'Signature Chef Special');
    setIsGenerating(true);
    setGenError('');

    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dish,
          cuisine: activeCategory !== 'all' ? activeCategory : undefined,
          dietary: dietFilter === 'veg' ? 'Vegetarian' : dietFilter === 'non-veg' ? 'Non-Vegetarian' : undefined,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate recipe');
      }

      const generatedData = await res.json();
      const newRecipe: Recipe = {
        id: 'ai_' + Date.now(),
        name: isHi ? (generatedData.nameHi || generatedData.name || dish) : (generatedData.name || dish),
        nameHi: generatedData.nameHi || generatedData.name || dish,
        category: generatedData.category || (isHi ? 'विशेष डिश' : 'Special'),
        categoryHi: generatedData.categoryHi || generatedData.category || 'विशेष',
        image:
          dietFilter === 'non-veg'
            ? 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        prepTime: generatedData.prepTime || (isHi ? '15 मिनट' : '15 mins'),
        cookTime: generatedData.cookTime || (isHi ? '20 मिनट' : '20 mins'),
        difficulty: generatedData.difficulty || (isHi ? 'सरल' : 'Easy'),
        baseServings: generatedData.baseServings || 4,
        description: generatedData.description || (isHi ? 'एआई द्वारा तैयार स्वादिष्ट और ताज़ा रेसिपी।' : 'AI-crafted delicious recipe.'),
        descriptionHi: generatedData.description || 'एआई द्वारा तैयार स्वादिष्ट और ताज़ा रेसिपी।',
        cuisine: activeCategory === 'indian' ? 'Indian' : activeCategory === 'bakery' ? 'Bakery' : 'International',
        isVegetarian: dietFilter === 'veg' ? true : generatedData.isVegetarian ?? (dietFilter !== 'non-veg'),
        ingredients: generatedData.ingredients || [],
        instructions: generatedData.instructions || [],
        instructionsHi: isHi ? generatedData.instructions : undefined,
        tips: generatedData.tips || (isHi ? 'धीमी आंच पर पकाने से स्वाद पूरी तरह निखरता है।' : 'Simmer gently on low flame.'),
        tipsHi: generatedData.tips,
        isAiGenerated: true,
      };

      setRecipes([newRecipe, ...recipes]);
      setSelectedRecipe(newRecipe);
    } catch (err: any) {
      console.error(err);
      setGenError(isHi ? 'रेसिपी जनरेट करने में असमर्थ। कृपया पुनः प्रयास करें।' : 'Could not generate custom recipe right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGrocery = (recipe: Recipe) => {
    onSendToGrocery(recipe.ingredients, isHi ? recipe.nameHi || recipe.name : recipe.name);
    setGrocerySuccess(true);
    setTimeout(() => setGrocerySuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
              {t.recipesView.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.recipesView.subtitle}
            </p>
          </div>

          {/* Pure Veg vs Non-Veg Toggle Filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start md:self-auto">
            <button
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                dietFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.recipesView.all}
            </button>
            <button
              onClick={() => setDietFilter('veg')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                dietFilter === 'veg'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>{t.recipesView.veg}</span>
            </button>
            <button
              onClick={() => setDietFilter('non-veg')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                dietFilter === 'non-veg'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-rose-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300" />
              <span>{t.recipesView.nonVeg}</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-5 relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.recipesView.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition-all"
          />
        </div>

        {/* Cuisine & Category Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'all', label: t.recipesView.all },
            { id: 'indian', label: t.recipesView.indian },
            { id: 'international', label: t.recipesView.international },
            { id: 'bakery', label: t.recipesView.bakery },
            { id: 'quick', label: t.recipesView.quick },
            { id: 'healthy', label: t.recipesView.healthy },
            { id: 'desserts', label: t.recipesView.desserts },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* AI Recipe Generator Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {t.recipesView.generateCustom}
              </p>
              <p className="text-[11px] text-amber-800/80">
                {isHi
                  ? 'ऊपर किसी भी व्यंजन का नाम लिखें और किचनबी से पूरी विधि व सामग्री हिंदी में प्राप्त करें।'
                  : 'Type any dish name above and let KitchenBee craft a step-by-step recipe tailored to your preference.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            {isGenerating ? (
              <>
                <BeeLogo size={18} animate={true} />
                <span>{t.recipesView.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHi ? 'एआई से रेसिपी बनवाएं' : 'Generate with AI'}</span>
              </>
            )}
          </button>
        </div>

        {genError && (
          <p className="text-xs text-red-600 mt-2 font-medium">{genError}</p>
        )}
      </div>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <BeeLogo size={36} />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            {isHi ? 'संग्रह में यह व्यंजन नहीं मिला' : 'No exact matching recipes in the curated collection'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-4">
            {isHi
              ? `क्या आप किचनबी एआई से "${searchQuery || 'इस खोज'}" के लिए पूरी रेसिपी हिंदी में बनवाना चाहते हैं?`
              : `Would you like KitchenBee AI to generate a complete custom step-by-step recipe for "${searchQuery || 'this search'}"?`}
          </p>
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isHi ? 'एआई से नई रेसिपी बनवाएं' : 'Generate Recipe with AI'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const isFav = favoriteRecipeIds.includes(recipe.id);
            const displayName = isHi ? recipe.nameHi || recipe.name : recipe.name;
            const displayDesc = isHi ? recipe.descriptionHi || recipe.description : recipe.description;

            return (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl border border-[#DFEBDE] overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={recipe.image}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(recipe.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
                          isFav ? 'bg-white text-rose-600' : 'bg-black/30 text-white hover:bg-white hover:text-rose-600'
                        }`}
                        title={isHi ? 'पसंदीदा में जोड़ें' : 'Favorite'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                      {recipe.isVegetarian ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-800/85 text-white backdrop-blur-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                          {isHi ? 'शाकाहारी' : 'VEG'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-900/85 text-white backdrop-blur-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
                          {isHi ? 'मांसाहारी' : 'NON-VEG'}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900/75 text-white backdrop-blur-md">
                        {formatCuisine(recipe.cuisine)}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {displayDesc}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 mt-4 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formatTime(recipe.cookTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>{recipe.baseServings} {isHi ? 'लोग' : 'servings'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        <span>{formatDifficulty(recipe.difficulty)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <span>{isHi ? 'रेसिपी देखें' : 'View Recipe'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onScaleInCalculator(recipe)}
                    className="p-2.5 bg-[#FAF7F2] hover:bg-amber-100/70 text-amber-900 rounded-xl border border-stone-200/80 transition-colors"
                    title={isHi ? 'मात्रा कैलकुलेटर में खोलें' : 'Scale in Smart Calculator'}
                  >
                    <Scale className="w-4 h-4 text-amber-700" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-stone-200 overflow-y-auto flex flex-col">
            {/* Modal Image Header */}
            <div className="relative h-64 w-full shrink-0">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 transition-colors shadow-md text-xs font-bold"
              >
                ✕
              </button>

              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                    {isHi ? selectedRecipe.categoryHi || selectedRecipe.category : selectedRecipe.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-stone-900">
                    {formatDifficulty(selectedRecipe.difficulty)}
                  </span>
                  {selectedRecipe.isVegetarian ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white">
                      {isHi ? 'शुद्ध शाकाहारी' : 'VEG'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white">
                      {isHi ? 'मांसाहारी' : 'NON-VEG'}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {isHi ? selectedRecipe.nameHi || selectedRecipe.name : selectedRecipe.name}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {grocerySuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{t.recipesView.addedToGrocery}</span>
                </div>
              )}

              {/* Meta stats */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF7F2] rounded-2xl border border-stone-200/60 text-center">
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold block">{t.recipesView.prep}</span>
                  <span className="text-sm font-bold text-stone-800">{formatTime(selectedRecipe.prepTime)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold block">{t.recipesView.cook}</span>
                  <span className="text-sm font-bold text-stone-800">{formatTime(selectedRecipe.cookTime)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold block">{t.recipesView.serves}</span>
                  <span className="text-sm font-bold text-stone-800">{selectedRecipe.baseServings} {isHi ? 'लोग' : 'people'}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddGrocery(selectedRecipe)}
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.recipesView.addToGrocery}</span>
                </button>

                <button
                  onClick={() => {
                    const r = selectedRecipe;
                    setSelectedRecipe(null);
                    onScaleInCalculator(r);
                  }}
                  className="py-2.5 px-4 bg-[#FFF9EE] hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>{t.recipesView.scaleRecipe}</span>
                </button>
              </div>

              {/* Ingredients List */}
              <div>
                <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-700" />
                  <span>{t.recipesView.ingredients} ({selectedRecipe.ingredients.length})</span>
                </h3>
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200/60 divide-y divide-stone-200/60">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-stone-700 font-medium">
                        {isHi && ing.nameHi ? ing.nameHi : ing.name}
                      </span>
                      <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {ing.amount} {formatUnit(ing.unit)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by step instructions */}
              <div>
                <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-700" />
                  <span>{t.recipesView.instructions}</span>
                </h3>
                <ol className="space-y-3">
                  {(isHi && selectedRecipe.instructionsHi?.length
                    ? selectedRecipe.instructionsHi
                    : selectedRecipe.instructions
                  ).map((step, idx) => (
                    <li
                      key={idx}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-stone-700 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Chef tip */}
              {(selectedRecipe.tips || selectedRecipe.tipsHi) && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                  <BeeLogo size={28} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {t.recipesView.chefTip}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 mt-1 leading-relaxed">
                      {isHi && selectedRecipe.tipsHi
                        ? selectedRecipe.tipsHi
                        : selectedRecipe.tips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
