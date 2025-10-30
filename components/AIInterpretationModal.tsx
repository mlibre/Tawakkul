import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { getAIInterpretation } from '../services/aiService';
import { DEFAULT_AI_PROMPT, AI_API_URL } from '../config';

interface AIInterpretationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
}

export const AIInterpretationModal: React.FC<AIInterpretationModalProps> = ({
  isOpen,
  onClose,
  verseText
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
    }
  }, [isOpen]);

  const handleRequestInterpretation = () => {
    setIsLoading(true);
    setHasRequested(true);
    getAIInterpretation(verseText, customPrompt, khameneiText || undefined, almizanText || undefined)
      .then(setInterpretation)
      .finally(() => setIsLoading(false));
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    getAIInterpretation(verseText, customPrompt, khameneiText || undefined, almizanText || undefined)
      .then(setInterpretation)
      .finally(() => setIsLoading(false));
  };


  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
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
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              آیه قرآن
            </h3>
            <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <p className="text-right text-slate-800 dark:text-slate-200 font-arabic text-lg leading-relaxed">
                {verseText}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              محتوی فیش ها رهبری (اختیاری)
            </h3>
            <textarea
              value={khameneiText}
              onChange={(e) => setKhameneiText(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none"
              rows={4}
              placeholder="متن تفسیر رهبری را اینجا وارد کنید..."
            />
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              محتوی ترجمه تفسیر المزیان (اختیاری)
            </h3>
            <textarea
              value={almizanText}
              onChange={(e) => setAlmizanText(e.target.value)}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm resize-none"
              rows={4}
              placeholder="متن تفسیر المزیان را اینجا وارد کنید..."
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                تنظیمات پرسش
              </h3>
              <button
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
              >
                {showPromptEditor ? 'پنهان کردن' : 'ویرایش پرسش'}
              </button>
            </div>

            {showPromptEditor && (
              <div className="mb-4">
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

            <div className="text-xs text-slate-500 dark:text-slate-500 mb-4 p-2 bg-slate-50 dark:bg-slate-700 rounded">
              پرسش ارسال شده: <strong>{customPrompt}</strong> "{verseText}"
            </div>
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
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    دریافت تفسیر
                  </button>
                )}
                {hasRequested && !showPromptEditor && (
                  <button
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50"
                  >
                    تولید مجدد
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg border border-slate-200 dark:border-slate-600 min-h-[200px]">
              {isLoading && interpretation === '' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">در حال دریافت تفسیر...</p>
                </div>
              ) : (
                <div className="text-right text-slate-800 dark:text-slate-200 leading-loose prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{interpretation || (hasRequested ? 'در حال دریافت تفسیر...' : 'برای دریافت تفسیر هوش مصنوعی، ابتدا متن‌های مورد نیاز را وارد کرده و سپس روی دکمه "دریافت تفسیر" کلیک کنید.')}</ReactMarkdown>
                  {isLoading && (
                    <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1"></span>
                  )}
                </div>
              )}
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