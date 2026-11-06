import React, { useState } from 'react';
import { User, Language } from '../types';
import { getTranslation } from '../locales/translations';
import { X, User as UserIcon, Mail, Heart, ShoppingBag, Globe, LogOut, Check, Sparkles } from 'lucide-react';
import { BeeLogo } from './BeeLogo';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  language: Language;
  onLanguageToggle: (lang: Language) => void;
  savedRecipesCount: number;
  groceryItemsCount: number;
  onOpenAuth: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  language,
  onLanguageToggle,
  savedRecipesCount,
  groceryItemsCount,
  onOpenAuth,
}) => {
  const t = getTranslation(language);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: User = {
      ...user,
      name: name.trim(),
    };

    localStorage.setItem('kitchenbee_user', JSON.stringify(updatedUser));
    onUpdateUser(updatedUser);
    setIsEditing(false);
    setMessage(t.nameUpdated);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{user.name}</h3>
                {user.isGuest ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400 text-amber-950">
                    {t.guestBadge}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                    {language === 'hi' ? 'प्रमाणित शेफ' : 'Verified Chef'}
                  </span>
                )}
              </div>
              <p className="text-emerald-100/90 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Guest Upgrade Prompt */}
          {user.isGuest && (
            <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 text-amber-950 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.loginToSync}</span>
              </div>
              <p className="text-xs text-amber-800/90">
                {t.guestNotice}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="mt-1 self-start px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {t.createAccount} / {t.login}
              </button>
            </div>
          )}

          {/* Edit Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-600">{t.fullName}</label>
              {!isEditing && (
                <button
                  onClick={() => {
                    setName(user.name);
                    setIsEditing(true);
                  }}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  {language === 'hi' ? 'बदलें' : 'Edit'}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-colors"
                >
                  {t.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-stone-500 text-xs hover:bg-stone-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
              </form>
            ) : (
              <p className="text-sm font-medium text-stone-800 bg-stone-50 px-3 py-2 rounded-xl border border-stone-100">
                {user.name}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-stone-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <span className="text-lg font-bold text-stone-800">{savedRecipesCount}</span>
                <p className="text-[11px] text-stone-500 font-medium">
                  {language === 'hi' ? 'पसंदीदा व्यंजन' : 'Favorite Recipes'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-stone-200/60 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <span className="text-lg font-bold text-stone-800">{groceryItemsCount}</span>
                <p className="text-[11px] text-stone-500 font-medium">
                  {language === 'hi' ? 'किराना वस्तुएं' : 'Grocery Items'}
                </p>
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <div>
                <p className="text-xs font-bold text-stone-800">Language / भाषा</p>
                <p className="text-[11px] text-stone-500">
                  {language === 'en' ? 'English is active' : 'हिन्दी सक्रिय है'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => onLanguageToggle('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                  language === 'en' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageToggle('hi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                  language === 'hi' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 text-stone-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
