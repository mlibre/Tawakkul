import React, { useState, useEffect, useCallback } from 'react';
import { LoadingProgressBar } from './components/LoadingProgressBar';
import { getPage, initQuranData } from './services/quranService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { VerseList } from './components/VerseList';
import { Pagination } from './components/Pagination';
import { ProgressBar } from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SourcesModal } from './components/SourcesModal';
import type { PageData } from './types';

const TOTAL_PAGES = 604;

function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useLocalStorage<number>('currentPage', 1);
  const [readPages, setReadPages] = useLocalStorage<number[]>('readPages', []);
  const [readAyahs, setReadAyahs] = useLocalStorage<number[]>('readAyahs', []);

  const readPagesSet = React.useMemo(() => new Set(readPages), [readPages]);
  const readAyahsSet = React.useMemo(() => new Set(readAyahs), [readAyahs]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        await initQuranData((progress) => setLoadingProgress(progress));
        setIsDataLoading(false);
      } catch (err) {
        console.error("Failed to load Quran data:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsDataLoading(false);
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

  const toggleAyahRead = useCallback((ayahId: number) => {
    const newReadAyahs = new Set(readAyahsSet);
    if (newReadAyahs.has(ayahId)) {
      newReadAyahs.delete(ayahId);
    } else {
      newReadAyahs.add(ayahId);
    }
    setReadAyahs(Array.from(newReadAyahs));

    // Auto-mark page as read when all ayahs are read
    if (pageData) {
      const pageAyahIds = pageData.verses.map(v => v.id);
      const allRead = pageAyahIds.length > 0 && pageAyahIds.every(id => newReadAyahs.has(id));
      if (allRead) {
        const newReadPages = new Set(readPagesSet);
        newReadPages.add(currentPage);
        setReadPages(Array.from(newReadPages));
      }
    }
  }, [readAyahsSet, setReadAyahs, pageData, currentPage, readPagesSet, setReadPages]);

  if (isDataLoading) {
    return (
      <>
        <LoadingProgressBar progress={loadingProgress} />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md shadow-md">
          <p className="font-semibold">Error loading Quran data:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-800 text-slate-800 dark:text-slate-200 transition-colors duration-500 font-persian">
        <div className="container mx-auto max-w-[61rem] p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Header
                pageData={pageData}
                theme={theme}
                setTheme={setTheme}
              />
              <main>
                {pageData ? (
                  <VerseList verses={pageData.verses} translationKey="farsi_makarem" readAyahs={readAyahsSet} onToggleAyahRead={toggleAyahRead} />
                ) : (
                  <div className="flex justify-center items-center h-96">
                      <p>درحال بارگذاری صفحه...</p>
                  </div>
                )}
              </main>
            </div>
            <div className="md:hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-4 mt-0 border border-white/30 dark:border-slate-700/50 flex flex-col gap-0 items-center">
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
            </div>
            <div className="hidden md:flex w-20 flex-col gap-6">
              <ProgressBar
                readCount={readPages.length}
                totalCount={TOTAL_PAGES}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={TOTAL_PAGES}
                onPageChange={handlePageChange}
                isPageRead={readPagesSet.has(currentPage)}
                onToggleRead={togglePageRead}
              />
            </div>
          </div>
          <footer className="mt-8 text-center">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setIsSourcesModalOpen(true)}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
              >
                منابع
              </button>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                ارتباط: <a href="mailto:m.gh@linuxmail.org" className="hover:text-slate-700 dark:hover:text-slate-300">m.gh@linuxmail.org</a>
              </div>
            </div>
          </footer>
          <SourcesModal isOpen={isSourcesModalOpen} onClose={() => setIsSourcesModalOpen(false)} />
        </div>
      </div>
    </>
  );
}

export default App;
