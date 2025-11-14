import { getPageMeta, findJuzByAyahId } from 'quran-meta';
import type { QuranData, PageData, Verse } from '../types';

const CACHE_DURATION_MS = 60 * 24 * 60 * 1000;

let quranData: QuranData | null = null;
const TOTAL_PAGES = 604;

export async function initQuranData(progressCallback?: (progress: number) => void): Promise<void> {
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
    if (progressCallback) {
      progressCallback(10); // Indicate that we are starting the fetch
    }
    const response = await fetch('quran.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (progressCallback) {
      progressCallback(50); // Indicate that the fetch is complete
    }
    quranData = await response.json();
    
    if (progressCallback) {
      progressCallback(90); // Indicate that we are processing the data
    }
    // Store fetched data in localStorage with timestamp
    localStorage.setItem('quranData', JSON.stringify(quranData));
    localStorage.setItem('quranDataTimestamp', Date.now().toString());
    if (progressCallback) {
      progressCallback(100); // Indicate that we are done
    }
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

export function getAllSurahs(): Array<{ number: number; farsi: string; arabic: string; firstPage: number }> {
  if (!quranData) {
    console.warn("Quran data not initialized. Call initQuranData() first.");
    return [];
  }

  const surahs = new Map<number, { number: number; farsi: string; arabic: string; firstPage: number }>();
  quranData.forEach((verse: Verse) => {
    const surah = verse.surah;
    if (!surahs.has(surah.number)) {
      let firstPageNumber = 1;
      // Find the actual first page for this surah
      for (let page = 1; page <= TOTAL_PAGES; page++) {
        const pageMeta = getPageMeta(page as any);
        if (quranData!.some(v => v.id >= pageMeta.firstAyahId && v.id <= pageMeta.lastAyahId && v.surah.number === surah.number)) {
          firstPageNumber = page;
          break;
        }
      }
      
      surahs.set(surah.number, {
        number: surah.number,
        farsi: surah.farsi,
        arabic: surah.arabic,
        firstPage: firstPageNumber
      });
    }
  });

  return Array.from(surahs.values()).sort((a, b) => a.number - b.number);
}
