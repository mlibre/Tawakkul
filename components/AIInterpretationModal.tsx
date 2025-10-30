import React, { useState, useEffect } from 'react';
import { getAIInterpretation } from '../services/aiService';
import { DEFAULT_AI_PROMPT } from '../config';

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

  useEffect(() => {
    if (isOpen && verseText) {
      setIsLoading(true);
      getAIInterpretation(verseText, customPrompt)
        .then(setInterpretation)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, verseText, customPrompt]);

  const handleRegenerate = () => {
    setIsLoading(true);
    getAIInterpretation(verseText, customPrompt)
      .then(setInterpretation)
      .finally(() => setIsLoading(false));
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              {!showPromptEditor && (
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline disabled:opacity-50"
                >
                  تولید مجدد
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">در حال دریافت تفسیر...</p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg border border-slate-200 dark:border-slate-600">
                <div
                  className="text-right text-slate-800 dark:text-slate-200 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(interpretation) }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};