import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { getAIInterpretation } from '../services/aiService';
import { DEFAULT_AI_PROMPT } from '../config';
import type { Verse } from '../types';

// Surah name mapping for URLs (when website uses different Persian names)
const SURAH_NAME_URL_MAP: Record<string, string> = {
  'سجده': 'سجدة',     // سجده -> سجدة (website uses سجدة with ت)
  'جاثیه': 'جاثية',   // جاثیه -> جاثية (website uses جاثية with ی)
  'انشراح': 'شرح'     // انشراح -> شرح (website uses shorter form)
};


function getSurahNameForUrl(surahName: string): string {
  return SURAH_NAME_URL_MAP[surahName] || surahName;
}

// Global cache to prevent duplicate requests
const globalSourceCache = new Map<string, { khamenei: string; saan: string }>();
// Global map of in-flight requests to deduplicate simultaneous loads for the same verse
const inFlightRequests = new Map<string, Promise<{ khamenei: string; saan: string }>>();

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

  // track per-source loaded state so effects can respond reliably
  const [sourcesLoaded, setSourcesLoaded] = useState<{ khamenei: boolean; saan: boolean; complete: boolean }>({
    khamenei: false,
    saan: false,
    complete: false
  });

  const autoTriggered = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { verse: verseData, surah, ayah } = verse;
  const surahNumber = surah.number;
  const ayahNumber = ayah;
  const verseText = verseData.ar;

  // Load sources for a verse with deduplication and abort support
  const loadSources = useCallback((verseRef: string, surahNum: number) => {
    // If cached, apply and return resolved promise
    if (globalSourceCache.has(verseRef)) {
      const cached = globalSourceCache.get(verseRef)!;
      setKhameneiText(cached.khamenei);
      setSaanNuzulText(cached.saan);
      setSourcesLoaded({ khamenei: !!cached.khamenei, saan: !!cached.saan, complete: true });
      return Promise.resolve({ khamenei: cached.khamenei, saan: cached.saan });
    }

    // If there's already an in-flight request for this verse, reuse it
    if (inFlightRequests.has(verseRef)) {
      return inFlightRequests.get(verseRef)!;
    }

    // create an abort controller for this load
    const controller = new AbortController();
    const { signal } = controller;
    abortControllerRef.current = controller;

    const promise = new Promise<{ khamenei: string; saan: string }>(async (resolve) => {
      try {
        // Fetch both in parallel. We use allSettled to be explicit about partial failures.
        const khameneiFetch = fetch(`khamenei-interpretations/${surahNum}.json`, { signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data && data[verseRef]?.content ? data[verseRef].content : ''))
          .catch(() => '');

        const saanFetch = fetch('saan-nuzul.json', { signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data && data[verseRef]?.content ? data[verseRef].content : ''))
          .catch(() => '');

        const [khameneiContent, saanContent] = await Promise.all([khameneiFetch, saanFetch]);

        // Apply results
        if (khameneiContent) setKhameneiText(khameneiContent);
        if (saanContent) setSaanNuzulText(saanContent);

        setSourcesLoaded({ khamenei: Boolean(khameneiContent), saan: Boolean(saanContent), complete: true });

        // cache
        globalSourceCache.set(verseRef, { khamenei: khameneiContent, saan: saanContent });

        resolve({ khamenei: khameneiContent, saan: saanContent });
      } catch (err) {
        // If fetch was aborted, just resolve with empty strings
        resolve({ khamenei: '', saan: '' });
      } finally {
        // cleanup in-flight map
        inFlightRequests.delete(verseRef);
        // clear controller if it's the same one
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    });

    inFlightRequests.set(verseRef, promise);
    return promise;
  }, []);

  useEffect(() => {
    const verseKey = `${surahNumber}:${ayahNumber}`;

    // Reset interpretation and related UI when verse changes
    setInterpretation('');
    setHasRequested(false);
    setAlmizanText('');
    setKhameneiText('');
    setSaanNuzulText('');

    setSourcesLoaded({ khamenei: false, saan: false, complete: false });
    autoTriggered.current = false;

    // Abort any in-flight fetch for previous verse
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (surahNumber && ayahNumber) {
      const timeoutId = setTimeout(() => {
        loadSources(verseKey, surahNumber);
      }, 150);

      return () => {
        clearTimeout(timeoutId);
        // Abort the load initiated by this effect if still running
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      };
    }

    return undefined;
  }, [verse.id, loadSources, surahNumber, ayahNumber]);

  // Auto-trigger AI only once when sources are completely loaded
  useEffect(() => {
    if (
      !autoTriggered.current &&
      !hasRequested &&
      sourcesLoaded.complete &&
      (khameneiText || saanNuzulText)
    ) {
      autoTriggered.current = true;
      handleRequestInterpretation();
    }
  }, [khameneiText, saanNuzulText, hasRequested, sourcesLoaded.complete]);

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
      (chunk: string) => setInterpretation((prev) => prev + chunk)
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
      (chunk: string) => setInterpretation((prev) => prev + chunk)
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
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">تفسیر هوش مصنوعی</h3>
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
                  className={`text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50 ${
                    isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
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
              <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1" />
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
