export interface Surah {
  number: number;
  persian_number: string;
  arabic: string;
  english: string;
  farsi: string;
}

export type TranslationKey = 'farsi_makarem';

// Fix: Moved Theme type here to be globally accessible.
export type Theme = 'light' | 'dark';

export interface VerseDetails {
  farsi_makarem: string;
  arabic_enhanced: string;
}

export interface Verse {
  id: number;
  id_persian: string;
  surah: Surah;
  ayah: number;
  ayah_persian: string;
  verse: VerseDetails;
}

export type QuranData = Verse[];

export interface PageMeta {
    page: number;
    surah: number;
    ayah: number;
    firstAyahId: number;
    lastAyahId: number;
    juz: number[];
}

export interface PageData {
    page: number;
    totalPages: number;
    verses: Verse[];
    meta: PageMeta;
}