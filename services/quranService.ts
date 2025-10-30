
import { getPageMeta } from 'quran-meta';
import type { QuranData, PageData, Verse } from '../types';

const CACHE_DURATION_MS = 60 * 24 * 60 * 1000;

let quranData: QuranData | null = null;
const TOTAL_PAGES = 604;

export async function initQuranData(): Promise<void> {
  if (quranData) {
    return;
  }
  // Check for cached data in localStorage
  const cached = localStorage.getItem('quranData');
  const cachedTime = localStorage.getItem('quranDataTimestamp');
  const now = Date.now();
  if (cached && cachedTime && now - Number(cachedTime) < CACHE_DURATION_MS) {
    quranData = JSON.parse(cached) as QuranData;
    return;
  }
  try {
    const response = await fetch('quran.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    quranData = await response.json();
    // Store fetched data in localStorage with timestamp
    localStorage.setItem('quranData', JSON.stringify(quranData));
    localStorage.setItem('quranDataTimestamp', Date.now().toString());
  } catch (error) {
    console.error("Could not fetch Quran data:", error);
    throw error;
  }
}

export function getPage(pageNumber: number): PageData | null {
  if (!quranData) {
    console.warn("Quran data not initialized. Call initQuranData() first.");
    return null;
  }

  if (pageNumber < 1 || pageNumber > TOTAL_PAGES) {
    console.error(`Invalid page number: ${pageNumber}`);
    return null;
  }

  // Cast to any to bypass type mismatch with the external library
  const pageMeta = getPageMeta(pageNumber as any) as any;

  const verses = quranData.filter((verse: Verse) => {
    return verse.id >= pageMeta.firstAyahId && verse.id <= pageMeta.lastAyahId;
  });

  return {
    page: pageNumber,
    totalPages: TOTAL_PAGES,
    verses: verses,
    meta: pageMeta
  };
}
