import React, { useState, useRef } from 'react';
import { 
  Wrench, 
  Camera, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  RotateCcw, 
  X, 
  HelpCircle, 
  MessageSquare, 
  Utensils, 
  Flame, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../locales/translations';
import { BeeLogo } from './BeeLogo';

interface ProblemSolverProps {
  language: Language;
}

interface ProblemCategory {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  examples: { textEn: string; textHi: string }[];
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({ language }) => {
  const t = getTranslation(language);

  const [activeCategory, setActiveCategory] = useState<string>('gravy');
  const [problemText, setProblemText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Problem categories as specifically requested
  const problemCategories: ProblemCategory[] = [
    {
      id: 'gravy',
      nameEn: 'Gravy & Curry',
      nameHi: 'ग्रेवी और करी',
      icon: '🍲',
      examples: [
        { textEn: 'My gravy has become too watery and thin', textHi: 'मेरी ग्रेवी बहुत पतली हो गई है' },
        { textEn: 'Curry split or curdled after adding dahi / cream', textHi: 'दही या मलाई डालने के बाद ग्रेवी फट गई' },
        { textEn: 'Gravy has too much oil floating on top', textHi: 'सब्जी के ऊपर बहुत ज्यादा तेल तैर रहा है' },
        { textEn: 'Curry is too spicy and hot to eat', textHi: 'सब्जी में मिर्च बहुत तेज हो गई है' },
      ],
    },
    {
      id: 'rice',
      nameEn: 'Rice & Pulses (Dal)',
      nameHi: 'चावल और दाल',
      icon: '🍚',
      examples: [
        { textEn: 'My rice has become mushy, sticky and overcooked', textHi: 'चावल बहुत गीले और चिपचिपे हो गए हैं' },
        { textEn: 'Rice grains are hard and undercooked inside', textHi: 'चावल के दाने अंदर से कच्चे और कड़े रह गए' },
        { textEn: 'Rice or dal burned at the bottom of the cooker', textHi: 'कुकर के नीचे चावल या दाल जल गई है' },
        { textEn: 'Dal is too watery and thin', textHi: 'दाल में पानी ज्यादा और दाल पतली हो गई है' },
      ],
    },
    {
      id: 'dough',
      nameEn: 'Dough & Chapati',
      nameHi: 'आटा और रोटी',
      icon: '🫓',
      examples: [
        { textEn: 'My dough is too hard and stiff to roll', textHi: 'आटा बहुत कड़क और सख्त गुंध गया है' },
        { textEn: 'Dough became overly wet and sticky', textHi: 'आटा बहुत गीला और चिपचिपा हो गया है' },
        { textEn: 'Chapatis turn hard and rubbery after cooling', textHi: 'रोटियां ठंडी होने के बाद पापड़ जैसी कड़क हो जाती हैं' },
        { textEn: 'Rotis are not puffing up on the tawa', textHi: 'तवे पर रोटियां फूल नहीं रही हैं' },
      ],
    },
    {
      id: 'bakery',
      nameEn: 'Cakes & Bakery',
      nameHi: 'केक और बेकरी',
      icon: '🧁',
      examples: [
        { textEn: 'My cake sank / collapsed in the center', textHi: 'केक बीच में से बैठ गया (फूला नहीं)' },
        { textEn: 'Cake top is severely cracked and peaked', textHi: 'केक ऊपर से फट गया और दरारें आ गई हैं' },
        { textEn: 'Cookies spread too thin and flat like pancakes', textHi: 'कुकीज बहुत ज्यादा फैलकर चपटी हो गईं' },
        { textEn: 'Yeast bread did not rise at all', textHi: 'ब्रेड का आटा फूला नहीं (खमीर नहीं उठा)' },
      ],
    },
    {
      id: 'seasoning',
      nameEn: 'Taste & Seasoning',
      nameHi: 'स्वाद, नमक व मिर्च',
      icon: '🧂',
      examples: [
        { textEn: 'My food tastes way too salty (namak jyada hai)', textHi: 'सब्जी/दाल में नमक बहुत ज्यादा हो गया है' },
        { textEn: 'Gravy or soup has an overwhelming bitter taste', textHi: 'ग्रेवी या सूप में कड़वाहट आ गई है' },
        { textEn: 'Food tastes overly sour due to excess tomatoes/dahi', textHi: 'टमाटर या दही से खाना बहुत खट्टा हो गया है' },
        { textEn: 'Dish tastes bland and lacks depth of flavor', textHi: 'खाने में स्वाद कम है और फीका लग रहा है' },
      ],
    },
    {
      id: 'storage',
      nameEn: 'Food Storage & Leftovers',
      nameHi: 'भोजन भंडारण व सुरक्षा',
      icon: '❄️',
      examples: [
        { textEn: 'How can I safely store cooked dal and rice overnight?', textHi: 'बची हुई दाल और चावल को रात भर सुरक्षित कैसे रखें?' },
        { textEn: 'How to keep cut paneer and vegetables fresh in the fridge?', textHi: 'कटा हुआ पनीर और सब्जियां फ्रिज में ताजा कैसे रखें?' },
        { textEn: 'My milk smells slightly sour, can it be saved?', textHi: 'दूध में हल्की खटास आ गई है, क्या यह सुरक्षित है?' },
        { textEn: 'How long can cooked chicken remain safe in freezer?', textHi: 'पका हुआ चिकन फ्रीजर में कितने दिन तक सुरक्षित रहता है?' },
      ],
    },
  ];

  const handleQuickPick = (item: string) => {
    setProblemText(item);
    handleSolve(item);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSolve = async (overrideText?: string) => {
    const prompt = overrideText || problemText;
    if (!prompt.trim() && !imageBase64) return;

    setLoading(true);
    setErrorMessage('');
    setSolution(null);

    try {
      const res = await fetch('/api/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: prompt,
          imageBase64,
          mimeType,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze kitchen issue.');
      }

      const data = await res.json();
      setSolution(data.solution);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not analyze kitchen problem right now.');
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryData = problemCategories.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFEBDE] shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold mb-3">
            <Wrench className="w-3.5 h-3.5 text-rose-600" />
            <span>
              {language === 'hi' ? 'एआई रसोई आपातकालीन मार्गदर्शक' : 'AI Kitchen Emergency Doctor'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#233528]">
            {t.solverView.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {t.solverView.subtitle}
          </p>
        </div>

        {/* Problem Category Selector */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-700 block mb-2.5">
            {language === 'hi' ? 'समस्या की श्रेणी चुनें:' : 'Select Problem Category:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {problemCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{language === 'hi' ? cat.nameHi : cat.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Quick Click Fixes for Active Category */}
          {currentCategoryData && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentCategoryData.examples.map((item, idx) => {
                const label = language === 'hi' ? item.textHi : item.textEn;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPick(label)}
                    className="text-left px-3.5 py-2.5 bg-stone-50 hover:bg-rose-50/80 border border-stone-200 hover:border-rose-200 rounded-xl text-xs font-medium text-stone-700 hover:text-rose-950 transition-all flex items-center justify-between group active:scale-98"
                  >
                    <span className="truncate mr-2">{label}</span>
                    <span className="text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold shrink-0">
                      {language === 'hi' ? 'सुधारें →' : 'Fix →'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Input & Photo Upload */}
        <div className="mt-6 pt-5 border-t border-stone-100 space-y-4">
          <div>
              <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                {language === 'hi'
                  ? 'या अपनी समस्या अपने शब्दों में लिखें (हिंदी, अंग्रेजी या हिंग्लिश में):'
                  : 'Or describe your mishap in your own words (English, Hindi, or Hinglish):'}
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                {language === 'hi' ? 'हिंग्लिश व हिंदी दोनों समर्थित' : 'Hinglish Supported'}
              </span>
            </div>

            <textarea
              rows={3}
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder={t.solverView.problemPlaceholder}
              className="w-full p-3.5 text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          {/* Photo Upload Area */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200/80 transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>{t.solverView.uploadPhoto}</span>
              </button>
            ) : (
              <div className="relative inline-flex items-center gap-2 p-1.5 pr-3 bg-stone-100 rounded-2xl border border-stone-200">
                <img
                  src={imagePreview}
                  alt="Uploaded dish"
                  className="w-10 h-10 object-cover rounded-xl"
                />
                <span className="text-xs text-stone-600 font-medium">
                  {language === 'hi' ? 'फोटो संलग्न है' : 'Photo attached'}
                </span>
                <button
                  onClick={removeImage}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <span className="text-[11px] text-stone-400">
              {t.solverView.photoHelp}
            </span>
          </div>

          {/* Submit button */}
          <div>
            <button
              onClick={() => handleSolve()}
              disabled={(!problemText.trim() && !imageBase64) || loading}
              className="px-6 py-3.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <BeeLogo size={20} animate={true} />
                  <span>{t.solverView.solving}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{t.solverView.solveBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-red-600 mt-3 font-semibold">{errorMessage}</p>
        )}
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-[#FFFDF5] border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
            {t.solverView.safetyBannerTitle}
          </h4>
          <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
            {t.solverView.safetyBannerText}
          </p>
        </div>
      </div>

      {/* Solution Display Card */}
      {solution && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-800">
                  {language === 'hi' ? 'किचनबी का समाधान और सुधार गाइड' : "KitchenBee's Emergency Recovery Guide"}
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {language === 'hi'
                    ? 'सटीक कारण, तुरंत समाधान और भविष्य के सुझाव'
                    : 'Accurate diagnosis, immediate fix, and prevention plan'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSolution(null);
                setProblemText('');
                removeImage();
              }}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रीसेट' : 'Reset'}</span>
            </button>
          </div>

          {/* Formatted Solution Output */}
          <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
            {solution}
          </div>
        </div>
      )}
    </div>
  );
};
