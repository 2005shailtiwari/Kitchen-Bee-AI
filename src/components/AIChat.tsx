import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { getTranslation } from '../locales/translations';
import { BeeLogo } from './BeeLogo';

interface AIChatProps {
  language: Language;
}

// Helper function to render formatted culinary markdown (headers, bold, bullets, numbered steps)
const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 3 or 2 (### or ##)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^#{2,3}\s+/, '');
          return (
            <h4
              key={idx}
              className="font-bold text-stone-900 text-sm sm:text-base mt-2.5 mb-1 pb-0.5 border-b border-stone-200/70"
            >
              {renderInlineStyles(headingText)}
            </h4>
          );
        }

        // Numbered list item (e.g. "1. " or "1) ")
        const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
              <span className="font-bold text-emerald-800 shrink-0 select-none">
                {numberedMatch[1]}.
              </span>
              <span className="flex-1">{renderInlineStyles(numberedMatch[2])}</span>
            </div>
          );
        }

        // Bullet point (* or -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[\*\-•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0 select-none" />
              <span className="flex-1">{renderInlineStyles(bulletText)}</span>
            </div>
          );
        }

        // Regular paragraph line
        return <p key={idx}>{renderInlineStyles(trimmed)}</p>;
      })}
    </div>
  );
};

// Helper to parse **bold** and *italic*
const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-stone-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-stone-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

export const AIChat: React.FC<AIChatProps> = ({ language }) => {
  const t = getTranslation(language);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kitchenbee_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'initial',
        role: 'model',
        content:
          language === 'hi'
            ? 'नमस्ते! मैं किचनबी एआई हूँ 🐝 आपकी रसोई का स्मार्ट साथी। आप मुझसे किसी भी रेसिपी, सामग्री की मात्रा, बचे हुए खाने के उपयोग, पकाने की तकनीक या रसोई की किसी भी समस्या के बारे में सीधे पूछ सकते हैं। आज क्या पकाना है?'
            : "Hello Chef! I'm KitchenBee AI 🐝 Buzzing with smart kitchen ideas! How can I help you today? Ask me about any recipe, ingredient proportions, cooking techniques, leftovers, or kitchen fixes!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync greeting when user toggles language if chat is in initial state
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        prev[0].role === 'model' &&
        (prev[0].id === 'initial' || prev[0].id.startsWith('msg_fresh_'))
      ) {
        return [
          {
            ...prev[0],
            content:
              language === 'hi'
                ? 'नमस्ते! मैं किचनबी एआई हूँ 🐝 आपकी रसोई का स्मार्ट साथी। आप मुझसे किसी भी रेसिपी, सामग्री की मात्रा, बचे हुए खाने के उपयोग, पकाने की तकनीक या रसोई की किसी भी समस्या के बारे में सीधे पूछ सकते हैं। आज क्या पकाना है?'
                : "Hello Chef! I'm KitchenBee AI 🐝 Buzzing with smart kitchen ideas! How can I help you today? Ask me about any recipe, ingredient proportions, cooking techniques, leftovers, or kitchen fixes!",
          },
        ];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    localStorage.setItem('kitchenbee_chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || t.chatView.errorMessage);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: 'model_' + Date.now(),
        role: 'model',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || t.chatView.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStarter = (question: string) => {
    setInput(question);
    handleSend(question);
  };

  const clearChat = () => {
    const fresh: ChatMessage[] = [
      {
        id: 'msg_fresh_' + Date.now(),
        role: 'model',
        content:
          language === 'hi'
            ? 'चैट साफ कर दी गई है! मैं आपकी नई रसोई पूछताछ के लिए तैयार हूँ 🐝 क्या पकाना चाहते हैं?'
            : "Chat cleared! I'm ready for your fresh cooking questions 🐝 What would you like to cook?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(fresh);
    localStorage.removeItem('kitchenbee_chat_history');
    setErrorMessage('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterQuestions =
    language === 'hi'
      ? [
          'वेजिटेबल पुलाव कैसे बनाएं?',
          'मेरे पास आलू, प्याज और टमाटर हैं, मैं क्या बना सकती हूँ?',
          'अगर सब्जी में नमक ज्यादा हो जाए तो क्या करें?',
          'मुझे बिना ओवन के केक बनाना है, कैसे बनाऊँ?',
        ]
      : [
          'How can I make vegetable pulao?',
          'What can I cook with potatoes and onions?',
          'What is the difference between baking powder and baking soda?',
          'How do I store leftover food safely?',
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[840px] bg-white rounded-3xl border border-[#DFEBDE] shadow-xs overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#E5EFE6] bg-[#FAF8F5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200 shadow-2xs">
            <BeeLogo size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-800">
                {t.chatView.title}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-stone-500">{t.chatView.subtitle}</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="px-3 py-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 border border-stone-200/60"
          title={language === 'hi' ? 'नयी चैट शुरू करें' : 'Start Fresh Chat'}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'नयी चैट' : 'New Chat'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Beginner Starters Prompt if only 1-2 messages */}
        {messages.length <= 2 && (
          <div className="bg-[#F6FBF7] rounded-2xl p-4 border border-[#DCEDDE] mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t.chatView.starterTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStarter(q)}
                  className="text-left px-3.5 py-2.5 bg-white hover:bg-emerald-50/80 border border-emerald-100 hover:border-emerald-300 rounded-xl text-xs text-stone-700 hover:text-emerald-950 transition-all shadow-2xs font-medium flex items-center justify-between group active:scale-98"
                >
                  <span className="truncate mr-2">{q}</span>
                  <span className="text-emerald-600 group-hover:translate-x-0.5 transition-transform text-xs font-bold">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <BeeLogo size={24} />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-2xs relative group ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-[#F9FAF9] text-stone-800 border border-stone-200/80 rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                ) : (
                  renderFormattedContent(m.content)
                )}

                <div
                  className={`flex items-center justify-between gap-3 text-[10px] mt-2 pt-1 border-t ${
                    isUser
                      ? 'text-emerald-200 border-emerald-600/40'
                      : 'text-stone-400 border-stone-200/50'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(m.content, m.id)}
                      className="opacity-70 group-hover:opacity-100 transition-opacity p-0.5 hover:text-stone-700 flex items-center gap-1"
                      title={language === 'hi' ? 'जवाब कॉपी करें' : 'Copy response'}
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600">
                            {language === 'hi' ? 'कॉपी हो गया' : 'Copied'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">
                            {language === 'hi' ? 'कॉपी' : 'Copy'}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <BeeLogo size={24} animate={true} />
            </div>
            <div className="bg-[#FAFBF9] border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-600 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-medium">{t.chatView.thinking}</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-[11px] font-bold text-red-800 hover:underline px-2 py-1"
            >
              {language === 'hi' ? 'बंद करें' : 'Dismiss'}
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-[#E5EFE6] bg-[#FAF8F5]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white rounded-2xl border border-stone-300/80 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 transition-all shadow-xs"
        >
          <input
            type="text"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatView.inputPlaceholder}
            className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-stone-800 placeholder-stone-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl transition-all shadow-xs active:scale-95 shrink-0 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            aria-label={t.chatView.send}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
