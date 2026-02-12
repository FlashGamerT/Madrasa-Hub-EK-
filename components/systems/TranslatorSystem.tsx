
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface TranslatorSystemProps {
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'English', label: 'English', native: 'English' },
  { code: 'Arabic', label: 'Arabic', native: 'العربية' }
];

const TranslatorSystem: React.FC<TranslatorSystemProps> = ({ onClose }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Malayalam');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text from ${fromLang} to ${toLang}. Only provide the translated text as the response, no explanations: "${sourceText}"`,
      });
      
      setTranslatedText(response.text || 'Translation failed. Try again.');
    } catch (error) {
      console.error("Translation Error:", error);
      alert("Failed to connect to translation service. Please check your internet.");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-[#FDF8F5] animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-[#2D235C] text-white flex justify-between items-center rounded-b-[40px] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Translator</h2>
            <p className="text-indigo-200 text-[10px] uppercase font-black tracking-widest">Multi-language Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        {/* Language Selectors */}
        <div className="glass-card p-4 rounded-[32px] flex items-center justify-between gap-4 border-gray-100">
          <select 
            value={fromLang} 
            onChange={(e) => setFromLang(e.target.value)}
            className="flex-1 bg-transparent font-bold text-[#2D235C] focus:outline-none text-sm appearance-none text-center cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          
          <button onClick={swapLanguages} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#2D235C] active:rotate-180 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          <select 
            value={toLang} 
            onChange={(e) => setToLang(e.target.value)}
            className="flex-1 bg-transparent font-bold text-[#2D235C] focus:outline-none text-sm appearance-none text-center cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              placeholder={`Type something in ${fromLang}...`}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full h-48 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#2D235C11] focus:outline-none text-lg font-medium text-[#2D235C] resize-none"
            />
            {sourceText && (
              <button 
                onClick={() => setSourceText('')}
                className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            )}
          </div>

          <button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full h-16 bg-[#2D235C] text-white rounded-[24px] font-bold text-lg shadow-xl shadow-[#2D235C33] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isTranslating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Translating...
              </>
            ) : (
              'Translate Now'
            )}
          </button>
        </div>

        {/* Result Area */}
        {(translatedText || isTranslating) && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 relative min-h-[160px]">
            {isTranslating ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <>
                <p className={`text-xl font-bold text-[#2D235C] ${toLang === 'Arabic' ? 'text-right font-arabic' : ''}`} dir={toLang === 'Arabic' ? 'rtl' : 'ltr'}>
                  {translatedText}
                </p>
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => copyToClipboard(translatedText)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-[#2D235C] transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Result
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorSystem;
