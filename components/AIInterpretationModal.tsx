import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { getAIInterpretation } from '../services/aiService';
import { DEFAULT_AI_PROMPT } from '../config';

interface AIInterpretationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  surahNumber?: number;
  ayahNumber?: number;
}

export const AIInterpretationModal: React.FC<AIInterpretationModalProps> = ({
  isOpen,
  onClose,
  verseText,
  surahNumber,
  ayahNumber
}) => {
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_AI_PROMPT);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [khameneiText, setKhameneiText] = useState<string>('');
  const [almizanText, setAlmizanText] = useState<string>('');
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInterpretation('');
      setHasRequested(false);
      setKhameneiText('');
      setAlmizanText('');

      // Auto-load Khamenei interpretation if available
      if (surahNumber && ayahNumber) {
        const verseRef = `${surahNumber}:${ayahNumber}`;
        // Load Khamenei text in background
        fetch(`khamenei-interpretations/${surahNumber}.json`)
          .then(response => response.ok ? response.json() : null)
          .then(data => {
            if (data && data[verseRef]?.content) {
              setKhameneiText(data[verseRef].content);
            }
          })
          .catch(error => {
            console.warn('Could not auto-load Khamenei interpretation:', error);
          });
      }
    }
  }, [isOpen, surahNumber, ayahNumber]);

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
      verseRef,
      (chunk) => setInterpretation(chunk)
    )
      .then(() => {})
      .catch((error) => {
        console.error('Error fetching AI interpretation:', error);
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
      verseRef,
      (chunk) => setInterpretation(chunk)
    )
      .then(() => {})
      .catch((error) => {
        console.error('Error fetching AI interpretation:', error);
        setInterpretation('خطا در دریافت تفسیر هوش مصنوعی');
      })
      .finally(() => setIsLoading(false));
  };


  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            تفسیر هوش مصنوعی
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-right text-slate-800 dark:text-slate-200 font-arabic text-lg leading-relaxed">
                {verseText}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              محتوی فیش های رهبری <a
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
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none"
              rows={3}
              placeholder="متن تفسیر رهبری را اینجا وارد کنید..."
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              محتوی ترجمه تفسیر المزیان <a
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
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none"
              rows={3}
              placeholder="متن تفسیر المزیان را اینجا وارد کنید..."
            />
          </div>

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
                      className={`text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'در حال تولید...' : 'تولید مجدد'}
                    </button>
                    <button
                      onClick={() => setShowPromptEditor(!showPromptEditor)}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                      تنظیمات پرسش
                    </button>
                  </div>
                )}
              </div>
            </div>

            {showPromptEditor && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">تنظیمات پرسش</h4>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none"
                  rows={3}
                  placeholder="پرسش خود را وارد کنید..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    تولید مجدد
                  </button>
                  <button
                    onClick={() => setCustomPrompt(DEFAULT_AI_PROMPT)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                  >
                    بازنشانی
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg border border-slate-200 dark:border-slate-600 min-h-[200px]">
              <div className="text-right text-slate-800 dark:text-slate-200 leading-loose prose prose-sm dark:prose-invert max-w-none">
                {interpretation ? (
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                ) : hasRequested ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">در حال دریافت تفسیر...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-600 dark:text-slate-400 text-sm">برای دریافت تفسیر هوش مصنوعی، ابتدا متن‌های مورد نیاز را وارد کرده و سپس روی دکمه "دریافت تفسیر" کلیک کنید.</p>
                  </div>
                )}
                {interpretation && isLoading && (
                  <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(modalContent, modalRoot);
};