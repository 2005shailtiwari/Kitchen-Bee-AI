import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Check, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Tag, 
  Sparkles, 
  X, 
  Share2 
} from 'lucide-react';
import { GroceryItem, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface GroceryListProps {
  language: Language;
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'addedAt'>) => void;
  onUpdateItem: (item: GroceryItem) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export const GroceryList: React.FC<GroceryListProps> = ({
  language,
  groceryItems,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onUpdateItem,
  onClearCompleted,
  onClearAll,
}) => {
  const t = getTranslation(language);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState<GroceryItem['category']>('Vegetables');

  // Edit modal state
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      amount: amount.trim() || '1',
      unit,
      category,
      completed: false,
    });

    setName('');
    setAmount('1');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  const handleShareList = () => {
    const text = groceryItems
      .map(
        (i) => `${i.completed ? '✅' : '⬜'} ${i.name} - ${i.amount} ${i.unit} [${i.category}]`
      )
      .join('\n');
    navigator.clipboard.writeText(`🛒 KitchenBee AI Grocery List:\n\n${text}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const totalCount = groceryItems.length;
  const completedCount = groceryItems.filter((i) => i.completed).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categories = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Spices & Oils',
    'Others',
  ] as const;

  const filteredItems = groceryItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header & Stats Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold mb-3">
              <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
              <span>{language === 'hi' ? 'स्मार्ट पेंट्री प्रबंधक' : 'Smart Pantry Manager'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
              {t.groceryView.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.groceryView.subtitle}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <>
                <button
                  onClick={handleShareList}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? copiedShare
                        ? 'कॉपी हो गया! ✓'
                        : 'सूची शेयर करें'
                      : copiedShare
                      ? 'Copied! ✓'
                      : 'Share List'}
                  </span>
                </button>

                {completedCount > 0 && (
                  <button
                    onClick={onClearCompleted}
                    className="px-3 py-2 text-stone-500 hover:text-red-700 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    {t.groceryView.clearCompleted}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span>
                {t.groceryView.progress
                  .replace('{completed}', String(completedCount))
                  .replace('{total}', String(totalCount))
                  .replace('{pct}', String(progressPct))}
              </span>
              <span className="text-emerald-700">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Manual Add Item Form */}
        <form onSubmit={handleAdd} className="mt-6 pt-5 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-700 block mb-2">
            {t.groceryView.addItem}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.groceryView.itemName}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.groceryView.itemQty}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="pcs">{language === 'hi' ? 'संख्या/टुकड़े (pcs)' : 'pcs'}</option>
                <option value="g">{language === 'hi' ? 'ग्राम (g)' : 'g'}</option>
                <option value="kg">{language === 'hi' ? 'किग्रा (kg)' : 'kg'}</option>
                <option value="ml">{language === 'hi' ? 'मिली (ml)' : 'ml'}</option>
                <option value="L">{language === 'hi' ? 'लीटर (L)' : 'L'}</option>
                <option value="tsp">{language === 'hi' ? 'छोटा चम्मच (tsp)' : 'tsp'}</option>
                <option value="tbsp">{language === 'hi' ? 'बड़ा चम्मच (tbsp)' : 'tbsp'}</option>
                <option value="bunch">{language === 'hi' ? 'गुच्छा (bunch)' : 'bunch'}</option>
                <option value="packet">{language === 'hi' ? 'पैकेट (packet)' : 'packet'}</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex-1 px-2 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.groceryView.categories[cat as keyof typeof t.groceryView.categories] || cat}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t.groceryView.addBtn}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {t.groceryView.categories.all} ({totalCount})
        </button>

        {categories.map((cat) => {
          const count = groceryItems.filter((i) => i.category === cat).length;
          const catLabel = t.groceryView.categories[cat as keyof typeof t.groceryView.categories] || cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {catLabel} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Grocery Items List */}
      <div className="bg-white rounded-3xl border border-[#DFEBDE] overflow-hidden shadow-xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-800">
              {t.groceryView.emptyTitle}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {t.groceryView.emptySub}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                  item.completed ? 'bg-stone-50/70 text-stone-400' : 'hover:bg-stone-50/50'
                }`}
              >
                {/* Left: Checkbox & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className="shrink-0 p-1 text-stone-400 hover:text-emerald-700 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 hover:text-emerald-600" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        item.completed ? 'line-through text-stone-400' : 'text-stone-800'
                      }`}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-stone-100 font-medium">
                        {t.groceryView.categories[item.category as keyof typeof t.groceryView.categories] || item.category}
                      </span>
                      {item.recipeSource && (
                        <span className="italic truncate max-w-[150px]">
                          {language === 'hi' ? `स्रोत: ${item.recipeSource}` : `from ${item.recipeSource}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity badge & Edit/Delete actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      item.completed
                        ? 'bg-stone-100 text-stone-400 border-stone-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {item.amount} {item.unit}
                  </span>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    title={language === 'hi' ? 'सामान बदलें' : 'Edit Item'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={language === 'hi' ? 'हटाएं' : 'Delete Item'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-800">
                {language === 'hi' ? 'सामान विवरण बदलें' : 'Edit Item'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.groceryView.itemName}
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t.groceryView.itemQty}
                  </label>
                  <input
                    type="text"
                    value={editingItem.amount}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {t.groceryView.itemUnit}
                  </label>
                  <input
                    type="text"
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {t.groceryView.itemCategory}
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t.groceryView.categories[cat as keyof typeof t.groceryView.categories] || cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
                >
                  {t.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-200"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
