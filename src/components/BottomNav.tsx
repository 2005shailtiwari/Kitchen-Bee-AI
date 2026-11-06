import React from 'react';
import { Home, MessageSquareHeart, BookOpen, Scale, ShoppingBag, Wrench } from 'lucide-react';
import { ActiveView, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface BottomNavProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  language: Language;
  groceryCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  language,
  groceryCount,
}) => {
  const t = getTranslation(language);

  const navItems = [
    {
      id: 'dashboard' as ActiveView,
      label: t.home,
      icon: Home,
    },
    {
      id: 'recipes' as ActiveView,
      label: language === 'hi' ? 'रेसिपी' : 'Recipes',
      icon: BookOpen,
    },
    {
      id: 'calculator' as ActiveView,
      label: language === 'hi' ? 'कैलकुलेटर' : 'Scaler',
      icon: Scale,
    },
    {
      id: 'chat' as ActiveView,
      label: language === 'hi' ? 'चैट' : 'AI Chat',
      icon: MessageSquareHeart,
    },
    {
      id: 'grocery' as ActiveView,
      label: language === 'hi' ? 'किराना' : 'Grocery',
      icon: ShoppingBag,
      badge: groceryCount,
    },
    {
      id: 'solver' as ActiveView,
      label: language === 'hi' ? 'निवारक' : 'Fixer',
      icon: Wrench,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EFE6] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-extrabold bg-emerald-600 text-white rounded-full min-w-3.5 h-3.5 flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[54px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
