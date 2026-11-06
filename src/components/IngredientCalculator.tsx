import React, { useState, useEffect } from 'react';
import { Scale, Users, ShoppingBag, Plus, Trash2, Check, ChefHat } from 'lucide-react';
import { Recipe, Language, Ingredient } from '../types';
import { CURATED_RECIPES } from '../data/curatedRecipes';
import { getTranslation } from '../locales/translations';

interface IngredientCalculatorProps {
  language: Language;
  preloadedRecipe?: Recipe | null;
  onSendToGrocery: (items: Ingredient[], sourceName: string) => void;
}

export const IngredientCalculator: React.FC<IngredientCalculatorProps> = ({
  language,
  preloadedRecipe,
  onSendToGrocery,
}) => {
  const t = getTranslation(language);
  const isHi = language === 'hi';

  // Default to preloaded recipe or first curated recipe
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(
    preloadedRecipe?.id || CURATED_RECIPES[0].id
  );
  const [customRecipeName, setCustomRecipeName] = useState('');
  const [baseServings, setBaseServings] = useState<number>(
    preloadedRecipe?.baseServings || 4
  );
  const [targetServings, setTargetServings] = useState<number>(4);
  const [customServingsInput, setCustomServingsInput] = useState<string>('4');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    preloadedRecipe ? preloadedRecipe.ingredients : CURATED_RECIPES[0].ingredients
  );

  // New custom ingredient inputs
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState<string>('100');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // If preloadedRecipe changes from navigation
  useEffect(() => {
    if (preloadedRecipe) {
      setSelectedRecipeId(preloadedRecipe.id);
      setBaseServings(preloadedRecipe.baseServings || 4);
      setIngredients(preloadedRecipe.ingredients);
      setTargetServings(preloadedRecipe.baseServings || 4);
      setCustomServingsInput(String(preloadedRecipe.baseServings || 4));
    }
  }, [preloadedRecipe]);

  // When changing selected recipe dropdown
  const handleSelectRecipe = (id: string) => {
    setSelectedRecipeId(id);
    if (id === 'custom') {
      setIngredients([
        { name: 'Basmati Rice', nameHi: 'बासमती चावल', amount: 200, unit: 'g', category: 'Grains' },
        { name: 'Water', nameHi: 'पानी', amount: 400, unit: 'ml', category: 'Others' },
        { name: 'Salt', nameHi: 'नमक', amount: 1, unit: 'tsp', category: 'Spices & Oils' },
      ]);
      setBaseServings(2);
      setTargetServings(2);
      setCustomServingsInput('2');
      return;
    }

    const found = CURATED_RECIPES.find((r) => r.id === id);
    if (found) {
      setIngredients(found.ingredients);
      setBaseServings(found.baseServings);
      setTargetServings(found.baseServings);
      setCustomServingsInput(String(found.baseServings));
    }
  };

  const handleServingPreset = (servings: number) => {
    setTargetServings(servings);
    setCustomServingsInput(String(servings));
  };

  const handleCustomServingChange = (val: string) => {
    setCustomServingsInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 200) {
      setTargetServings(parsed);
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const amountNum = parseFloat(newIngAmount) || 1;
    const newIng: Ingredient = {
      name: newIngName.trim(),
      nameHi: newIngName.trim(),
      amount: amountNum,
      unit: newIngUnit,
      category: 'Others',
    };

    setIngredients([...ingredients, newIng]);
    setNewIngName('');
    setNewIngAmount('100');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Localized unit helper
  const formatUnit = (unit: string) => {
    if (!isHi) return unit;
    if (unit === 'g') return 'ग्राम';
    if (unit === 'kg') return 'किग्रा';
    if (unit === 'ml') return 'मिली';
    if (unit === 'L') return 'लीटर';
    if (unit === 'tsp') return 'छोटा चम्मच (tsp)';
    if (unit === 'tbsp') return 'बड़ा चम्मच (tbsp)';
    if (unit === 'pcs') return 'पीस';
    if (unit === 'cup') return 'कप';
    if (unit === 'pinch') return 'चुटकी';
    return (t.units as any)[unit] || unit;
  };

  // Unit-aware smart scaling calculation
  const scaleIngredient = (ing: Ingredient) => {
    const ratio = targetServings / (baseServings || 1);
    const rawAmount = ing.amount * ratio;

    let displayAmount: number | string = rawAmount;
    let displayUnit = ing.unit;

    // Unit conversions for clean presentation
    if (ing.unit === 'g' && rawAmount >= 1000) {
      displayAmount = parseFloat((rawAmount / 1000).toFixed(2));
      displayUnit = 'kg';
    } else if (ing.unit === 'ml' && rawAmount >= 1000) {
      displayAmount = parseFloat((rawAmount / 1000).toFixed(2));
      displayUnit = 'L';
    } else {
      // Round to 1 or 2 decimals if fraction
      if (rawAmount % 1 !== 0) {
        displayAmount = parseFloat(rawAmount.toFixed(1));
      }
    }

    return {
      amount: displayAmount,
      unit: displayUnit,
      rawScaledAmount: rawAmount,
    };
  };

  const handleSendToGrocery = () => {
    const scaledItems: Ingredient[] = ingredients.map((ing) => {
      const scaled = scaleIngredient(ing);
      return {
        ...ing,
        amount: typeof scaled.amount === 'number' ? scaled.amount : parseFloat(String(scaled.amount)),
        unit: scaled.unit,
      };
    });

    const currentFound = CURATED_RECIPES.find((r) => r.id === selectedRecipeId);
    const recipeTitle =
      selectedRecipeId === 'custom'
        ? customRecipeName || (isHi ? 'कस्टम रेसिपी' : 'Custom Recipe')
        : isHi
        ? currentFound?.nameHi || currentFound?.name || 'रेसिपी'
        : currentFound?.name || 'Scaled Recipe';

    onSendToGrocery(
      scaledItems,
      `${recipeTitle} (${targetServings} ${isHi ? 'लोग' : 'servings'})`
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>{isHi ? 'सटीक रसोई उपकरण (माप)' : 'Precision Kitchen Tool'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
            {t.calcView.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {t.calcView.subtitle}
          </p>
        </div>

        {/* Recipe Selection Dropdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.calcView.selectRecipe}
            </label>
            <select
              value={selectedRecipeId}
              onChange={(e) => handleSelectRecipe(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {CURATED_RECIPES.map((r) => (
                <option key={r.id} value={r.id}>
                  {isHi ? r.nameHi || r.name : r.name} ({r.baseServings} {isHi ? 'लोगों का आधार' : 'servings base'})
                </option>
              ))}
              <option value="custom">
                {isHi ? '✏️ कस्टम व्यंजन सामग्री बनाएं...' : '✏️ Build Custom Ingredient List...'}
              </option>
            </select>
          </div>

          {selectedRecipeId === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {isHi ? 'व्यंजन का नाम' : 'Dish Name'}
              </label>
              <input
                type="text"
                value={customRecipeName}
                onChange={(e) => setCustomRecipeName(e.target.value)}
                placeholder={isHi ? 'जैसे: खीर, हलवा, पराठा' : "e.g. Grandma's Kheer"}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          )}
        </div>

        {/* Servings Selector (2, 4, 6, 8, 10, or custom) */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <label className="block text-xs font-bold text-stone-700 mb-2.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>{t.calcView.servingsLabel}</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {[2, 4, 6, 8, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleServingPreset(num)}
                className={`w-12 h-11 rounded-2xl text-sm font-bold transition-all flex items-center justify-center ${
                  targetServings === num
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {num}
              </button>
            ))}

            {/* Custom Input */}
            <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-2xl border border-stone-200/80">
              <span className="text-xs font-semibold text-stone-600">
                {t.calcView.customServings}:
              </span>
              <input
                type="number"
                min="1"
                max="200"
                value={customServingsInput}
                onChange={(e) => handleCustomServingChange(e.target.value)}
                className="w-16 px-2 py-1 bg-white border border-stone-300 rounded-xl text-center text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="text-xs text-stone-500">{isHi ? 'लोग' : 'people'}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-2 font-medium">
            {t.calcView.baseServingsNotice.replace('{servings}', String(baseServings))}
          </p>
        </div>
      </div>

      {/* Scaled Ingredients Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-700" />
              <span>
                {t.calcView.ingredientTable} {targetServings} {t.calcView.people}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {isHi
                ? 'लोगों की संख्या बदलते ही सामग्री अपने आप सही इकाइयों (ग्राम से किग्रा, मिली से लीटर) में बदल जाती है।'
                : 'Amounts scale automatically with exact unit adjustments (grams to kg, ml to L).'}
            </p>
          </div>

          <button
            onClick={handleSendToGrocery}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.calcView.sendToGrocery}</span>
          </button>
        </div>

        {addedSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{t.calcView.addedToGrocery}</span>
          </div>
        )}

        {/* Ingredients Table */}
        <div className="border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-100">
          <div className="bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-stone-600 flex justify-between">
            <span>{isHi ? 'सामग्री का नाम' : 'Ingredient'}</span>
            <span>{isHi ? `${targetServings} लोगों के लिए आवश्यक मात्रा` : `Quantity for ${targetServings} people`}</span>
          </div>

          {ingredients.map((ing, idx) => {
            const scaled = scaleIngredient(ing);
            const displayName = isHi && ing.nameHi ? ing.nameHi : ing.name;

            return (
              <div
                key={idx}
                className="px-4 py-3 flex items-center justify-between hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-800">{displayName}</span>
                  <span className="text-[10px] text-stone-400">
                    ({isHi ? 'मूल' : 'base'}: {ing.amount} {formatUnit(ing.unit)})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-800 bg-[#EEF7F0] px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                    {scaled.amount} {formatUnit(scaled.unit)}
                  </span>

                  {selectedRecipeId === 'custom' && (
                    <button
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add custom ingredient form */}
        <form
          onSubmit={handleAddIngredient}
          className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-4 gap-2.5"
        >
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newIngName}
              onChange={(e) => setNewIngName(e.target.value)}
              placeholder={isHi ? 'अन्य सामग्री लिखें (जैसे: काजू, बादाम)' : 'Add another ingredient (e.g. Cashews)'}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div>
            <input
              type="number"
              step="any"
              value={newIngAmount}
              onChange={(e) => setNewIngAmount(e.target.value)}
              placeholder={isHi ? 'मूल मात्रा' : 'Base amount'}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={newIngUnit}
              onChange={(e) => setNewIngUnit(e.target.value)}
              className="flex-1 px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="g">{isHi ? 'ग्राम (g)' : 'g'}</option>
              <option value="kg">{isHi ? 'किग्रा (kg)' : 'kg'}</option>
              <option value="ml">{isHi ? 'मिली (ml)' : 'ml'}</option>
              <option value="L">{isHi ? 'लीटर (L)' : 'L'}</option>
              <option value="tsp">{isHi ? 'छोटा चम्मच (tsp)' : 'tsp'}</option>
              <option value="tbsp">{isHi ? 'बड़ा चम्मच (tbsp)' : 'tbsp'}</option>
              <option value="pcs">{isHi ? 'पीस (pcs)' : 'pcs'}</option>
              <option value="cup">{isHi ? 'कप (cup)' : 'cup'}</option>
            </select>

            <button
              type="submit"
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
