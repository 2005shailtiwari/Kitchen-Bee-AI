import React, { useState, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  Search, 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  Flame, 
  ShoppingBag, 
  ChevronRight, 
  X, 
  RotateCcw, 
  UtensilsCrossed, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { Language, Ingredient, RecipeSuggestion } from '../types';
import { getTranslation } from '../locales/translations';
import { INGREDIENT_LIBRARY, INGREDIENT_CATEGORIES } from '../data/ingredientLibrary';
import { BeeLogo } from './BeeLogo';

interface ExploreIngredientsViewProps {
  language: Language;
  initialIngredients?: string[];
  initialVegOnly?: boolean;
  onSendToGrocery: (items: Ingredient[], sourceName: string) => void;
  onOpenRecipe?: (dishName: string) => void;
}

export const ExploreIngredientsView: React.FC<ExploreIngredientsViewProps> = ({
  language,
  initialIngredients = ['Potatoes (Aloo)', 'Onions (Pyaz)', 'Tomatoes (Tamatar)'],
  initialVegOnly = true,
  onSendToGrocery,
  onOpenRecipe,
}) => {
  const t = getTranslation(language);

  // Selected ingredients (names)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialIngredients);
  const [vegOnly, setVegOnly] = useState<boolean>(initialVegOnly);
  
  // Library search and category
  const [libraryCategory, setLibraryCategory] = useState<string>('all');
  const [searchLibraryQuery, setSearchLibraryQuery] = useState('');
  
  // Custom ingredient input
  const [customInput, setCustomInput] = useState('');

  // AI suggestions state
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [batch, setBatch] = useState(1);
  const [error, setError] = useState('');
  const [grocerySuccess, setGrocerySuccess] = useState<string | null>(null);

  // Auto-search on initial load if provided ingredients
  useEffect(() => {
    if (initialIngredients.length > 0) {
      fetchSuggestions(initialIngredients, initialVegOnly, 1);
    }
  }, []);

  // Filter library ingredients based on category, search query, and vegOnly
  const filteredLibrary = useMemo(() => {
    return INGREDIENT_LIBRARY.filter((item) => {
      if (vegOnly && !item.isVegetarian) return false;
      if (libraryCategory !== 'all' && item.category !== libraryCategory) return false;

      if (!searchLibraryQuery.trim()) return true;
      const q = searchLibraryQuery.toLowerCase();
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.nameHi.includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [libraryCategory, searchLibraryQuery, vegOnly]);

  const toggleLibraryItem = (name: string) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (clean && !selectedIngredients.includes(clean)) {
      setSelectedIngredients([...selectedIngredients, clean]);
      setCustomInput('');
    }
  };

  const removeSelected = (name: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
  };

  const handleClearAll = () => {
    setSelectedIngredients([]);
    setSuggestions([]);
  };

  const fetchSuggestions = async (list: string[], isVeg: boolean, batchNum: number) => {
    if (list.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/explore-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: list,
          vegetarianOnly: isVeg,
          language,
          batch: batchNum,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to find matching recipes.');
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not reach recipe generator. Displaying chef recommended alternatives below.');
      // Never show "Recipe Not Found"
      setSuggestions([
        {
          dishName: language === 'hi' ? 'आलू प्याज की सूखी सब्जी' : 'Homestyle Potato & Onion Stir-Fry',
          dishNameHi: 'आलू प्याज की सूखी सब्जी',
          matchPercentage: 90,
          description: language === 'hi'
            ? 'आपकी उपलब्ध सामग्री से बनने वाला एक आसान, पौष्टिक और झटपट बनने वाला भारतीय व्यंजन।'
            : 'A comforting, flavorful skillet meal made effortlessly using your kitchen staples.',
          usedIngredients: list.slice(0, 3),
          missingIngredients: ['Cooking Oil', 'Cumin & Salt'],
          cookTime: '15 mins',
          difficulty: 'Easy',
          isVegetarian: isVeg,
          category: 'Homestyle',
          alternativeDishes: ['Spiced Vegetable Pulao', 'Crispy Vegetable Cutlets'],
          quickInstructions: [
            language === 'hi' ? 'कड़ाही में 1 चम्मच तेल गरम करें और जीरा चटकाएं।' : 'Heat 1 tbsp oil in a pan and temper with cumin seeds.',
            language === 'hi' ? 'उपलब्ध कटी सब्जियां डालें और मध्यम आंच पर 8-10 मिनट ढककर पकाएं।' : 'Add your chopped ingredients and sauté on medium heat for 8-10 minutes.',
            language === 'hi' ? 'हल्का नमक और हरा धनिया डालकर गर्मागर्म परोसें।' : 'Finish with a sprinkle of salt and fresh herbs, then serve warm.',
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFindRecipes = () => {
    setBatch(1);
    fetchSuggestions(selectedIngredients, vegOnly, 1);
  };

  const handleAskMore = () => {
    const nextBatch = batch + 1;
    setBatch(nextBatch);
    fetchSuggestions(selectedIngredients, vegOnly, nextBatch);
  };

  const handleSendMissingToGrocery = (sug: RecipeSuggestion) => {
    const items: Ingredient[] = sug.missingIngredients.map((item) => ({
      name: item,
      amount: 1,
      unit: 'item',
      category: 'Others',
    }));

    onSendToGrocery(items, `${sug.dishName} (Pantry Missing Items)`);
    setGrocerySuccess(sug.dishName);
    setTimeout(() => setGrocerySuccess(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Pantry Library</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
              {t.exploreSection.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.exploreSection.subtitle}
            </p>
          </div>

          {/* Vegetarian Toggle */}
          <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-[#EEF6EF] px-4 py-2.5 rounded-2xl border border-emerald-200 cursor-pointer select-none self-start sm:self-auto shadow-2xs">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
            <span>{t.exploreSection.vegOnly}</span>
          </label>
        </div>

        {/* Selected Ingredients Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-stone-700">
              {t.exploreSection.selectedTitle.replace(
                '{count}',
                String(selectedIngredients.length)
              )}
            </span>
            {selectedIngredients.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-stone-400 hover:text-red-600 transition-colors"
              >
                {t.exploreSection.clearAll}
              </button>
            )}
          </div>

          {selectedIngredients.length === 0 ? (
            <p className="text-xs text-stone-400 italic">
              {language === 'hi'
                ? 'अभी कोई सामग्री नहीं चुनी गई है। नीचे लाइब्रेरी से चुनें या खुद लिखें।'
                : 'No ingredients selected yet. Check items from the library below or type custom ingredients.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold shadow-2xs group"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeSelected(item)}
                    className="p-0.5 text-emerald-600 hover:text-red-600 rounded-md transition-colors"
                    title={language === 'hi' ? 'हटाएं' : 'Remove'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Manual Text Input Option */}
          <form onSubmit={handleAddCustom} className="mt-4 flex gap-2 max-w-md">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={t.exploreSection.placeholder}
              className="flex-1 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.exploreSection.addBtn}</span>
            </button>
          </form>

          {/* Find Recipes Button */}
          <div className="mt-5">
            <button
              onClick={handleFindRecipes}
              disabled={selectedIngredients.length === 0 || loading}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <BeeLogo size={20} animate={true} />
                  <span>{t.exploreSection.finding}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.exploreSection.btn} ({selectedIngredients.length} items)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ingredient Selection Library */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-800">
              {language === 'hi' ? 'रसोई सामग्री लाइब्रेरी (चुनें)' : 'Pantry Ingredient Library'}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'hi'
                ? 'सामग्री श्रेणियों से चुनें या सर्च करके अपनी रसोई में उपलब्ध चीजें टिक करें।'
                : 'Browse categories or search to check items available in your kitchen.'}
            </p>
          </div>

          {/* Library Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchLibraryQuery}
              onChange={(e) => setSearchLibraryQuery(e.target.value)}
              placeholder={t.exploreSection.searchLibraryPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pb-4 border-b border-stone-100">
          {INGREDIENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setLibraryCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                libraryCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{language === 'hi' ? cat.nameHi : cat.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Checkbox Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto p-1">
          {filteredLibrary.map((item) => {
            const displayName = language === 'hi' ? `${item.nameHi} (${item.nameEn})` : item.nameEn;
            const isChecked = selectedIngredients.includes(item.nameEn) || selectedIngredients.includes(item.nameHi);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleLibraryItem(item.nameEn)}
                className={`p-2.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center gap-2 select-none ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-400'
                    : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="shrink-0 text-stone-400">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-300" />
                  )}
                </div>
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipe Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-800">
                {language === 'hi' ? 'सुझाए गए व्यंजन (हमेशा उपलब्ध!)' : 'Recommended Recipes for Your Ingredients:'}
              </h3>
              <p className="text-xs text-stone-500">
                {language === 'hi'
                  ? 'किचनबी ने आपकी रसोई की अधिकतम सामग्रियों का उपयोग करके ये स्वादिष्ट व्यंजन तैयार किए हैं।'
                  : 'KitchenBee crafted these dishes using maximum items from your kitchen.'}
              </p>
            </div>

            {/* Ask AI for more suggestions */}
            <button
              onClick={handleAskMore}
              disabled={loading}
              className="px-4 py-2 bg-[#FFF9EE] hover:bg-amber-100 border border-amber-200 text-amber-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.exploreSection.askMoreSuggestions}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map((sug, idx) => {
              const displayTitle = language === 'hi' && sug.dishNameHi ? sug.dishNameHi : sug.dishName;
              const formattedCookTime =
                language === 'hi'
                  ? sug.cookTime
                      .replace(/mins?/gi, 'मिनट')
                      .replace(/hours?/gi, 'घंटे')
                  : sug.cookTime;
              const formattedDifficulty =
                language === 'hi'
                  ? sug.difficulty.toLowerCase().includes('easy')
                    ? 'सरल'
                    : sug.difficulty.toLowerCase().includes('medium')
                    ? 'मध्यम'
                    : 'कठिन'
                  : sug.difficulty;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-[#DFEBDE] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-base font-bold text-stone-800">
                        {displayTitle}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                        {sug.matchPercentage}% {t.exploreSection.matchScore}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                      {sug.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-stone-500 mb-4 pb-3 border-b border-stone-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {formattedCookTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        {formattedDifficulty}
                      </span>
                      {sug.isVegetarian && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                          {language === 'hi' ? 'शाकाहारी' : 'VEG'}
                        </span>
                      )}
                    </div>

                    {/* Used vs Missing Ingredients */}
                    <div className="space-y-2 mb-4 text-xs">
                      <div>
                        <span className="font-bold text-emerald-900 block mb-1">
                          ✓ {language === 'hi' ? 'आपकी रसोई से:' : 'Using from your kitchen:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {sug.usedIngredients.map((u, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium"
                            >
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>

                      {sug.missingIngredients?.length > 0 && (
                        <div>
                          <span className="font-bold text-amber-900 block mb-1">
                            + {t.exploreSection.missing}:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {sug.missingIngredients.map((m, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[11px] font-medium"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Steps */}
                    <div className="mb-4">
                      <span className="font-bold text-xs text-stone-700 block mb-1.5">
                        {t.exploreSection.quickSteps}:
                      </span>
                      <ol className="space-y-1.5 text-xs text-stone-600">
                        {sug.quickInstructions.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="font-bold text-emerald-700 shrink-0">
                              {sIdx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Alternative Dishes */}
                    {sug.alternativeDishes && sug.alternativeDishes.length > 0 && (
                      <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                        <span className="font-bold text-stone-700 block mb-1">
                          {t.exploreSection.alternativeDishesTitle}
                        </span>
                        <p className="text-stone-600 text-[11px]">
                          {sug.alternativeDishes.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                    {sug.missingIngredients?.length > 0 && (
                      <button
                        onClick={() => handleSendMissingToGrocery(sug)}
                        className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {grocerySuccess === sug.dishName
                            ? (language === 'hi' ? 'किराना सूची में जोड़ा गया! ✓' : 'Added to Grocery! ✓')
                            : t.exploreSection.sendMissingToGrocery}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
