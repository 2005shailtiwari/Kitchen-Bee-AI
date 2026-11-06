import React, { useState } from 'react';
import { 
  MessageSquareHeart, 
  BookOpen, 
  Scale, 
  ShoppingBag, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  ChefHat, 
  Plus, 
  Check, 
  Search, 
  Flame, 
  Leaf 
} from 'lucide-react';
import { ActiveView, Language, User } from '../types';
import { getTranslation } from '../locales/translations';
import { BeeLogo } from './BeeLogo';

interface DashboardProps {
  user: User | null;
  language: Language;
  onNavigate: (view: ActiveView) => void;
  onExploreWithIngredients: (ingredients: string[], vegOnly: boolean) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  language,
  onNavigate,
  onExploreWithIngredients,
}) => {
  const t = getTranslation(language);

  // Explore ingredients state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Potatoes',
    'Onions',
    'Tomatoes',
  ]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [vegOnly, setVegOnly] = useState(true);

  const quickPantryItems = [
    { en: 'Potatoes', hi: 'आलू' },
    { en: 'Onions', hi: 'प्याज' },
    { en: 'Tomatoes', hi: 'टमाटर' },
    { en: 'Basmati Rice', hi: 'बासमती चावल' },
    { en: 'Paneer', hi: 'पनीर' },
    { en: 'Wheat Flour', hi: 'गेहूं का आटा' },
    { en: 'Chicken', hi: 'चिकन' },
    { en: 'Eggs', hi: 'अंडे' },
    { en: 'Garlic', hi: 'लहसुन' },
    { en: 'Ginger', hi: 'अदरक' },
    { en: 'Spinach', hi: 'पालक' },
    { en: 'Milk', hi: 'दूध' },
    { en: 'Pasta', hi: 'पास्ता' },
    { en: 'Toor Dal', hi: 'अरहर/तुअर दाल' },
  ];

  const toggleIngredient = (itemKey: string) => {
    if (selectedIngredients.includes(itemKey)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== itemKey));
    } else {
      setSelectedIngredients([...selectedIngredients, itemKey]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient('');
    }
  };

  const greeting = user
    ? user.isGuest
      ? t.welcomeGuest
      : t.welcomeBack.replace('{name}', user.name)
    : t.welcomeGuest;

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAF4EB] via-[#F4F9F4] to-[#FAF6EE] p-6 sm:p-10 border border-[#D7E8DA] shadow-xs">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-xs mb-4">
            <BeeLogo size={24} />
            <span className="text-xs font-semibold text-emerald-900 tracking-wide">
              {t.tagline}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#213225] tracking-tight leading-tight">
            {greeting}
          </h1>

          <p className="text-base sm:text-lg font-medium text-emerald-800/90 mt-2">
            {t.chefGreeting}
          </p>

          <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            {t.subGreeting}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate('chat')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>{t.features.chat.btn}</span>
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold rounded-2xl border border-stone-200 shadow-xs transition-all flex items-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>{t.features.recipes.btn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5 Main Feature Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
              {language === 'hi' ? 'मुख्य सुविधाएं' : 'Smart Kitchen Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              {language === 'hi'
                ? 'आपकी कुकिंग को आसान और मजेदार बनाने के 5 खास उपकरण'
                : 'Five beginner-friendly AI modules designed for effortless daily cooking'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. AI Kitchen Chat */}
          <div
            onClick={() => onNavigate('chat')}
            className="group relative bg-white p-6 rounded-3xl border border-[#E3EDE4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageSquareHeart className="w-7 h-7 text-amber-700" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {t.features.chat.title}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Gemini AI
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {t.features.chat.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
              <span>{t.features.chat.btn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Find Recipes */}
          <div
            onClick={() => onNavigate('recipes')}
            className="group relative bg-white p-6 rounded-3xl border border-[#E3EDE4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7 text-emerald-700" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {t.features.recipes.title}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Global & Indian
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {t.features.recipes.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
              <span>{t.features.recipes.btn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Calculate Ingredients */}
          <div
            onClick={() => onNavigate('calculator')}
            className="group relative bg-white p-6 rounded-3xl border border-[#E3EDE4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Scale className="w-7 h-7 text-teal-700" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {t.features.calculator.title}
                </h3>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  Smart Scaler
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {t.features.calculator.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
              <span>{t.features.calculator.btn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. My Grocery List */}
          <div
            onClick={() => onNavigate('grocery')}
            className="group relative bg-white p-6 rounded-3xl border border-[#E3EDE4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-orange-100/80 text-orange-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-7 h-7 text-orange-700" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {t.features.grocery.title}
                </h3>
                <span className="text-[11px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                  Organized
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {t.features.grocery.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
              <span>{t.features.grocery.btn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Kitchen Problem Solver */}
          <div
            onClick={() => onNavigate('solver')}
            className="group relative bg-white p-6 rounded-3xl border border-[#E3EDE4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-13 h-13 rounded-2xl bg-rose-100/80 text-rose-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Wrench className="w-7 h-7 text-rose-700" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                  {t.features.solver.title}
                </h3>
                <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Quick Recovery
                </span>
              </div>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                {t.features.solver.desc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
              <span>{t.features.solver.btn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Quick Daily Chef Bee Tip */}
          <div className="relative bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-6 h-6 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  {language === 'hi' ? 'शेफ बी का खास नुस्खा' : "Chef Bee's Daily Wisdom"}
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-800">
                {language === 'hi'
                  ? 'सब्जी में नमक ज्यादा हो जाए तो?'
                  : 'Too much salt in your curry?'}
              </h4>
              <p className="text-stone-700 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {language === 'hi'
                  ? 'एक कच्चा छिला हुआ आलू काटकर या गुंधे हुए आटे की छोटी गोलियां ग्रेवी में 10 मिनट उबालें—यह अतिरिक्त नमक सोख लेती हैं!'
                  : 'Drop peeled raw potato slices or small balls of kneaded wheat dough into the gravy for 10 minutes. They absorb the excess salt naturally!'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('solver')}
              className="mt-4 text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5"
            >
              <span>{language === 'hi' ? 'और समाधान देखें' : 'More emergency tips'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Explore Ingredients Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-700" />
              <h3 className="text-xl font-bold text-stone-800">
                {t.exploreSection.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.exploreSection.subtitle}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-[#EEF6EF] px-3 py-1.5 rounded-xl border border-emerald-200 cursor-pointer self-start md:self-auto select-none">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
            />
            <span>{t.exploreSection.vegOnly}</span>
          </label>
        </div>

        {/* Selected ingredients & custom input */}
        <div className="space-y-4">
          <form onSubmit={handleAddCustom} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              placeholder={t.exploreSection.placeholder}
              className="flex-1 px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{t.exploreSection.addBtn}</span>
            </button>
          </form>

          {/* Quick pantry badges */}
          <div>
            <span className="text-xs font-semibold text-stone-500 block mb-2">
              {language === 'hi' ? 'जल्दी से चुनें:' : 'Tap to select items you have:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPantryItems.map((item) => {
                const label = language === 'hi' ? item.hi : item.en;
                const isSelected =
                  selectedIngredients.includes(item.en) ||
                  selectedIngredients.includes(item.hi);
                return (
                  <button
                    key={item.en}
                    type="button"
                    onClick={() => toggleIngredient(language === 'hi' ? item.hi : item.en)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => onExploreWithIngredients(selectedIngredients, vegOnly)}
              disabled={selectedIngredients.length === 0}
              className="py-3 px-6 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>{t.exploreSection.btn} ({selectedIngredients.length})</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
