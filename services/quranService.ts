
import { getPageMeta } from 'quran-meta';
import type { QuranData, PageData, Verse } from '../types';

let quranData: QuranData | null = null;
const TOTAL_PAGES = 604;

export async function initQuranData(): Promise<void> {
  if (quranData) {
    return;
  }
  try {
    const response = await fetch('/quran.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    quranData = await response.json();
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

  const pageMeta = getPageMeta(pageNumber);

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
