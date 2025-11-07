
import { getPageMeta, findJuzByAyahId } from 'quran-meta';
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

  // The type 'Page' from the library is a number literal from 1 to 604.
  const pageMetaInfo = getPageMeta(pageNumber as any);

  const verses = quranData.filter((verse: Verse) => {
    return verse.id >= pageMetaInfo.firstAyahId && verse.id <= pageMetaInfo.lastAyahId;
  });

  if (verses.length === 0) {
    // Handle cases with no verses on a page if necessary, though unlikely for Quran pages.
    return {
        page: pageNumber,
        totalPages: TOTAL_PAGES,
        verses: [],
        meta: {
            page: pageNumber,
            surah: 0,
            ayah: 0,
            firstAyahId: 0,
            lastAyahId: 0,
            juz: [],
        }
    };
  }

  const firstAyahId = pageMetaInfo.firstAyahId;
  
  // Use the official quran-meta functions to get juz information
  const juzNumber = findJuzByAyahId(firstAyahId);

  const firstVerse = verses[0];

  return {
    page: pageNumber,
    totalPages: TOTAL_PAGES,
    verses: verses,
    meta: {
      page: pageNumber,
      surah: firstVerse.surah.number,
      ayah: firstVerse.ayah,
      firstAyahId: pageMetaInfo.firstAyahId,
      lastAyahId: pageMetaInfo.lastAyahId,
      juz: [juzNumber]
    }
  };
}
