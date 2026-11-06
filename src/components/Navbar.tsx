import React from 'react';
import { ArrowLeft, Home, User as UserIcon, Globe, Sparkles, LogIn } from 'lucide-react';
import { BeeLogo } from './BeeLogo';
import { User, Language, ActiveView } from '../types';
import { getTranslation } from '../locales/translations';

interface NavbarProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  onBack: () => void;
  canGoBack: boolean;
  language: Language;
  onLanguageToggle: (lang: Language) => void;
  user: User | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onBack,
  canGoBack,
  language,
  onLanguageToggle,
  user,
  onOpenProfile,
  onOpenAuth,
}) => {
  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5EFE6] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Left Section: Back / Home or Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {canGoBack && currentView !== 'dashboard' ? (
            <div className="flex items-center gap-1 sm:gap-2 mr-1">
              <button
                onClick={onBack}
                aria-label={t.back}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-700 hover:text-emerald-800 hover:bg-[#EEF6EF] transition-all text-sm font-medium border border-stone-200/80 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">{t.back}</span>
              </button>

              <button
                onClick={() => setCurrentView('dashboard')}
                aria-label={t.home}
                className="p-2 rounded-xl text-stone-600 hover:text-emerald-800 hover:bg-[#EEF6EF] transition-all border border-stone-200/80 active:scale-95"
                title={t.home}
              >
                <Home className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          ) : null}

          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <BeeLogo size={42} animate={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#233528] group-hover:text-emerald-700 transition-colors">
                  {t.appName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-600" /> AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-emerald-800/80 hidden xs:block truncate max-w-[220px] sm:max-w-none">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Language Switcher & Profile / Guest */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#F2F7F2] p-1 rounded-xl border border-[#DCEADF]">
            <Globe className="w-3.5 h-3.5 text-emerald-700 ml-1.5 mr-1 hidden sm:block" />
            <button
              onClick={() => onLanguageToggle('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageToggle('hi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === 'hi'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* User / Guest Status */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#E0EBE2] bg-white hover:border-emerald-300 hover:bg-[#F8FCF8] transition-all shadow-xs text-left"
              title={user.name}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-stone-800 truncate max-w-[100px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-stone-500">
                  {user.isGuest ? t.guestBadge : t.myAccount}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-semibold shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
