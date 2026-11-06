import React, { useState } from 'react';
import { BeeLogo } from './BeeLogo';
import { User, Language } from '../types';
import { getTranslation } from '../locales/translations';
import { UserCheck, Sparkles, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, X } from 'lucide-react';

interface WelcomeScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  language: Language;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  isOpen,
  onClose,
  onLogin,
  language,
}) => {
  const t = getTranslation(language);
  const [tab, setTab] = useState<'welcome' | 'register' | 'login'>('welcome');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t.fillAllFields);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    // Save in localStorage
    localStorage.setItem('kitchenbee_user', JSON.stringify(newUser));
    // Save account registry
    const accounts = JSON.parse(localStorage.getItem('kitchenbee_accounts') || '[]');
    accounts.push({ ...newUser, passwordHash: btoa(password) });
    localStorage.setItem('kitchenbee_accounts', JSON.stringify(accounts));

    onLogin(newUser);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t.fillAllFields);
      return;
    }

    // Look up in registry or create session
    const accounts: any[] = JSON.parse(localStorage.getItem('kitchenbee_accounts') || '[]');
    const found = accounts.find((a) => a.email === email.trim().toLowerCase());

    const loggedUser: User = found
      ? {
          id: found.id,
          name: found.name,
          email: found.email,
          isGuest: false,
          createdAt: found.createdAt,
        }
      : {
          id: 'user_' + Date.now(),
          name: email.split('@')[0] || 'Chef',
          email: email.trim().toLowerCase(),
          isGuest: false,
          createdAt: new Date().toISOString(),
        };

    localStorage.setItem('kitchenbee_user', JSON.stringify(loggedUser));
    onLogin(loggedUser);
    onClose();
  };

  const handleGuest = () => {
    const guestUser: User = {
      id: 'guest_' + Date.now(),
      name: 'Guest',
      email: 'guest@kitchenbee.ai',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('kitchenbee_user', JSON.stringify(guestUser));
    onLogin(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden relative">
        {/* Subtle decorative background blob */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Close button if user already exists */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 relative">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BeeLogo size={76} animate={true} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#233528] tracking-tight">
              {t.appName}
            </h2>
            <p className="text-emerald-700 text-sm font-semibold mt-1">
              "{t.tagline}"
            </p>
            <p className="text-stone-500 text-xs sm:text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* View Tabs */}
          {tab === 'welcome' && (
            <div className="space-y-3">
              <button
                onClick={() => setTab('register')}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>{t.createAccount}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setTab('login')}
                className="w-full py-3.5 px-4 bg-stone-50 hover:bg-emerald-50 text-emerald-900 font-semibold rounded-2xl border border-stone-200/90 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>{t.login}</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-stone-400">
                    {language === 'hi' ? 'या सीधे अन्वेषण करें' : 'or explore freely'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleGuest}
                className="w-full py-3 px-4 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 text-sm font-semibold rounded-2xl border border-amber-200/70 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.continueAsGuest}</span>
              </button>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 flex items-start gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.guestNotice}</span>
              </div>
            </div>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-stone-800">{t.createAccount}</h3>
                <button
                  type="button"
                  onClick={() => setTab('welcome')}
                  className="text-xs text-emerald-700 font-medium hover:underline"
                >
                  ← {t.back}
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-md transition-all active:scale-[0.98]"
              >
                {t.createAccount}
              </button>

              <div className="text-center mt-3">
                <span className="text-xs text-stone-500">
                  {language === 'hi' ? 'पहले से पंजीकृत हैं? ' : 'Already registered? '}
                </span>
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  {t.login}
                </button>
              </div>
            </form>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-stone-800">{t.login}</h3>
                <button
                  type="button"
                  onClick={() => setTab('welcome')}
                  className="text-xs text-emerald-700 font-medium hover:underline"
                >
                  ← {t.back}
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.emailAddress}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-md transition-all active:scale-[0.98]"
              >
                {t.login}
              </button>

              <div className="text-center mt-3">
                <span className="text-xs text-stone-500">
                  {language === 'hi' ? 'खाता नहीं है? ' : "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  {t.createAccount}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
