import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sourcesContent = `* ترجمه ی مکارم شیراری - https://quran.makarem.ir
* متن عربی ساده: https://api.globalquran.com/complete/ar-simple-clean.json
* متن عربی با اعراب: https://api.globalquran.com/complete/ar-simple-enhanced.json

* نام سوره ها به انگلیسی: https://en.wikipedia.org/wiki/List_of_chapters_in_the_Quran
* نام سوره ها به فارسی: https://fa.wikipedia.org/wiki/%D9%81%D9%87%D8%B1%D8%B3%D8%AA_%D8%B3%D9%88%D8%B1%D9%87%E2%80%8C%D9%87%D8%A7%DB%8C_%D9%82%D8%B1%D8%A2%D9%86

* تفسیر نمونه - https://quran.makarem.ir/fa/interpretation
* شان نزول - https://wiki.ahlolbait.com
* فیش های رهبری - https://farsi.khamenei.ir`;

const SourcesModal: React.FC<SourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-200">منابع</h2>
        <div className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{sourcesContent}</ReactMarkdown>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export { SourcesModal };