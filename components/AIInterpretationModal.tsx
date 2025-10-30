import React, { useState, useEffect } from 'react';
import { getAIInterpretation } from '../services/aiService';

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

  useEffect(() => {
    if (isOpen && verseText) {
      setIsLoading(true);
      getAIInterpretation(verseText)
        .then(setInterpretation)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, verseText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            تفسیر هوش مصنوعی
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            آیه:
          </h3>
          <p className="text-right text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-3 rounded">
            {verseText}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            تفسیر:
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="mr-2 text-slate-600 dark:text-slate-400">در حال دریافت تفسیر...</span>
            </div>
          ) : (
            <div className="text-right text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 p-3 rounded min-h-[100px]">
              {interpretation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};