// Surah name mapping for URLs (when website uses different Persian names)
const SURAH_NAME_URL_MAP: Record<string, string> = {
  'سجده': 'سجدة',     // سجده -> سجدة (website uses سجدة with ت)
  'جاثیه': 'جاثية',   // جاثیه -> جاثية (website uses جاثية with ی)
  'انشراح': 'شرح'     // انشراح -> شرح (website uses shorter form)
};

// Global cache to prevent duplicate requests
const globalSourceCache = new Map<string, {khamenei: string, saan: string}>();

// Function to get the correct URL version of surah name
function getSurahNameForUrl(surahName: string): string {
  return SURAH_NAME_URL_MAP[surahName] || surahName;
}

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { getAIInterpretation } from '../services/aiService';
import { DEFAULT_AI_PROMPT } from '../config';
import type { Verse } from '../types';

interface AIInterpretationProps {
  verse: Verse;
}

export const AIInterpretation: React.FC<AIInterpretationProps> = ({ verse }) => {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_AI_PROMPT);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [khameneiText, setKhameneiText] = useState<string>('');
  const [almizanText, setAlmizanText] = useState<string>('');
  const [saanNuzulText, setSaanNuzulText] = useState<string>('');
  const [hasRequested, setHasRequested] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const { verse: verseData, surah, ayah } = verse;
  const surahNumber = surah.number;
  const ayahNumber = ayah;
  const verseText = verseData.ar;

  // Ref to track if sources are being loaded for this verse
  const loadingSources = React.useRef<string | null>(null);

  // Function to load sources for a verse with proper debouncing
  const loadSources = useCallback(async (verseRef: string, surahNum: number) => {
    // Prevent duplicate loading for the same verse
    if (loadingSources.current === verseRef) {
      return;
    }

    // Check global cache first
    if (globalSourceCache.has(verseRef)) {
      const cached = globalSourceCache.get(verseRef)!;
      setKhameneiText(cached.khamenei);
      setSaanNuzulText(cached.saan);
      return;
    }

    // Mark as loading
    loadingSources.current = verseRef;

    // Load both sources in parallel
    const promises = [];

    // Load Khamenei interpretation
    promises.push(
      fetch(`khamenei-interpretations/${surahNum}.json`)
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (data && data[verseRef]?.content) {
            return data[verseRef].content;
          }
          return '';
        })
        .catch(() => '')
    );

    // Load Saan Nuzul
    promises.push(
      fetch('saan-nuzul.json')
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (data && data[verseRef]?.content) {
            return data[verseRef].content;
          }
          return '';
        })
        .catch(() => '')
    );

    // Wait for both to complete
    Promise.all(promises).then(([khameneiContent, saanContent]) => {
      if (khameneiContent) {
        setKhameneiText(khameneiContent);
      }
      if (saanContent) {
        setSaanNuzulText(saanContent);
      }

      // Update global cache
      globalSourceCache.set(verseRef, {
        khamenei: khameneiContent,
        saan: saanContent
      });
    }).finally(() => {
      // Clear loading flag
      loadingSources.current = null;
    });
  }, []);

  useEffect(() => {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    
    // Reset interpretation state when verse changes
    setInterpretation('');
    setHasRequested(false);
    setAlmizanText('');
    
    // Load sources with a proper debounce to prevent multiple rapid calls
    if (surahNumber && ayahNumber) {
      const timeoutId = setTimeout(() => {
        loadSources(verseKey, surahNumber);
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [verse.id, loadSources, surahNumber, ayahNumber]);

  const handleRequestInterpretation = () => {
    setIsLoading(true);
    setHasRequested(true);
    setInterpretation('');

    const verseRef = surahNumber && ayahNumber ? `${surahNumber}:${ayahNumber}` : undefined;

    getAIInterpretation(
      verseText,
      customPrompt,
      khameneiText || undefined,
      almizanText || undefined,
      saanNuzulText || undefined,
      verseRef,
      (chunk: string) => setInterpretation(prev => prev + chunk)
    )
      .then(() => {})
      .catch((error) => {
        console.error('Error fetching AI interpretation:', error.stack || error);
        setInterpretation('خطا در دریافت تفسیر هوش مصنوعی');
      })
      .finally(() => setIsLoading(false));
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    setInterpretation('');

    const verseRef = surahNumber && ayahNumber ? `${surahNumber}:${ayahNumber}` : undefined;

    getAIInterpretation(
      verseText,
      customPrompt,
      khameneiText || undefined,
      almizanText || undefined,
      saanNuzulText || undefined,
      verseRef,
      (chunk: string) => setInterpretation(prev => prev + chunk)
    )
      .then(() => {})
      .catch((error) => {
        console.error('Error fetching AI interpretation:', error.stack || error);
        setInterpretation('خطا در دریافت تفسیر هوش مصنوعی');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* AI Interpretation Box */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            تفسیر هوش مصنوعی
          </h3>
          <div className="flex gap-2">
            {!hasRequested && (
              <button
                onClick={handleRequestInterpretation}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                دریافت تفسیر
              </button>
            )}
            {hasRequested && (
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className={`text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isLoading ? 'در حال تولید...' : 'تولید مجدد'}
                </button>
                <button
                  onClick={() => setShowPromptEditor(!showPromptEditor)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  تنظیمات پرسش
                </button>
              </div>
            )}
          </div>
        </div>

        {showPromptEditor && (
          <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">تنظیمات پرسش</h4>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm resize-none"
              rows={3}
              placeholder="پرسش خود را وارد کنید..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
              >
                تولید مجدد
              </button>
              <button
                onClick={() => setCustomPrompt(DEFAULT_AI_PROMPT)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-sm cursor-pointer"
              >
                بازنشانی
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg border border-slate-200 dark:border-slate-600 min-h-[150px]">
          <div className="text-right text-slate-800 dark:text-slate-200 leading-loose prose prose-sm dark:prose-invert max-w-none">
            {interpretation ? (
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            ) : hasRequested ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">در حال دریافت تفسیر...</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-600 dark:text-slate-400 text-sm text-center">برای دریافت تفسیر هوش مصنوعی، روی دکمه "دریافت تفسیر" کلیک کنید. منابع موجود (فیش رهبری، شان نزول) به صورت خودکار استفاده خواهند شد. امکان خطا و غلط وجود دارد.</p>
              </div>
            )}
            {interpretation && isLoading && (
              <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1"></span>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Supplementary Sources */}
      <div className="mt-4">
        <button
          onClick={() => setShowSources(!showSources)}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
        >
          {showSources ? 'پنهان کردن منابع' : 'نمایش منابع'}
        </button>

        {showSources && (
          <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                فیش های رهبری <a
                  href={`https://farsi.khamenei.ir/newspart-index?sid=${surahNumber || 1}&npt=7&aya=${ayahNumber || 1}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-2"
                >
                  لینک
                </a>
              </h3>
              <textarea
                value={khameneiText}
                onChange={(e) => setKhameneiText(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm resize-none"
                rows={3}
                placeholder="متن تفسیر رهبری را اینجا وارد کنید..."
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                ترجمه تفسیر المیزان <a
                  href={`https://quran.inoor.ir/fa/ayah/${surahNumber || 1}/${ayahNumber || 1}/commentary?book=121`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-2"
                >
                  لینک
                </a>
              </h3>
              <textarea
                value={almizanText}
                onChange={(e) => setAlmizanText(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm resize-none"
                rows={3}
                placeholder="متن تفسیر المیزان را اینجا وارد کنید..."
              />
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                شان نزول <a
                  href={saanNuzulText ? `https://wiki.ahlolbait.com/آیه_${ayahNumber || 1}_سوره_${getSurahNameForUrl(surah.farsi)}` : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline ml-2"
                >
                  لینک
                </a>
              </h3>
              <textarea
                value={saanNuzulText}
                onChange={(e) => setSaanNuzulText(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm resize-none"
                rows={4}
                placeholder="متن اسباب النزول را اینجا وارد کنید..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};