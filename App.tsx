
import React, { useState, useEffect, useCallback } from 'react';
import { getPage, initQuranData } from './services/quranService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { VerseList } from './components/VerseList';
import { Pagination } from './components/Pagination';
import { ProgressBar } from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { PageData, TranslationKey } from './types';

const TOTAL_PAGES = 604;

function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  
  const [currentPage, setCurrentPage] = useLocalStorage<number>('currentPage', 1);
  const [translation, setTranslation] = useLocalStorage<TranslationKey>('translation', 'farsi_makarem');
  const [readPages, setReadPages] = useLocalStorage<number[]>('readPages', []);

  const readPagesSet = React.useMemo(() => new Set(readPages), [readPages]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        await initQuranData();
        setIsDataLoading(false);
      } catch (error) {
        console.error("Failed to load Quran data:", error);
        // Handle error state in UI
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!isDataLoading) {
      const data = getPage(currentPage);
      setPageData(data);
    }
  }, [currentPage, isDataLoading]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= TOTAL_PAGES) {
      setCurrentPage(newPage);
    }
  }, [setCurrentPage]);

  const togglePageRead = useCallback(() => {
    const newReadPages = new Set(readPagesSet);
    if (newReadPages.has(currentPage)) {
      newReadPages.delete(currentPage);
    } else {
      newReadPages.add(currentPage);
    }
    setReadPages(Array.from(newReadPages));
  }, [currentPage, readPagesSet, setReadPages]);

  if (isDataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-800 text-slate-800 dark:text-slate-200 transition-colors duration-500 font-persian">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        <Header 
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          translation={translation}
          setTranslation={setTranslation}
          theme={theme}
          setTheme={setTheme}
        />
        <main>
          {pageData ? (
            <VerseList verses={pageData.verses} translationKey={translation} />
          ) : (
            <div className="flex justify-center items-center h-96">
                <p>درحال بارگذاری صفحه...</p>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onPageChange={handlePageChange}
            isPageRead={readPagesSet.has(currentPage)}
            onToggleRead={togglePageRead}
          />
          <ProgressBar
            readCount={readPages.length}
            totalCount={TOTAL_PAGES}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
