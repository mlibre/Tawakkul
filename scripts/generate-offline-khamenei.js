import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';

// Configuration
const OUTPUT_FILE = 'public/khamenei-interpretations.json';
const DELAY_MS = 1000; // Delay between requests to avoid rate limiting
const MAX_RETRIES = 3;

// Load Quran data to get accurate verse counts
let quranData = [];
try {
  quranData = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
  console.log(`Loaded ${quranData.length} verses from quran.json`);
} catch (error) {
  console.error('Could not load quran.json:', error.message);
  process.exit(1);
}

async function getReadabilityOutput(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const dom = new JSDOM(response.data);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article ? article.textContent : "";
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw error;
  }
}

async function fetchKhameneiInterpretation(verseRef, retryCount = 0) {
  try {
    const [surah, ayah] = verseRef.split(':').map(Number);
    const url = `https://farsi.khamenei.ir/newspart-index?sid=${surah}&npt=7&aya=${ayah}`;
    console.log(`Fetching: ${verseRef} - ${url}`);

    const rdrview = await getReadabilityOutput(url);

    return {
      verseRef: verseRef,
      url: url,
      content: rdrview
    };

  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying ${verseRef} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * (retryCount + 1)));
      return fetchKhameneiInterpretation(verseRef, retryCount + 1);
    }
    console.error(`Failed to fetch ${verseRef} after ${MAX_RETRIES} retries:`, error.message);
    return null;
  }
}

async function generateOfflineKhameneiData() {
  let interpretations = {};

  // Load existing data if file exists
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      interpretations = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(interpretations).length} existing interpretations`);
    } catch (error) {
      console.log('Could not load existing file, starting fresh');
    }
  }

  // Group verses by surah and ayah to get accurate counts
  const surahAyahMap = new Map();

  quranData.forEach(verse => {
    const key = `${verse.surah.number}:${verse.ayah}`;
    if (!surahAyahMap.has(key)) {
      surahAyahMap.set(key, verse);
    }
  });

  // Process each verse from quran.json
  for (const [verseRef, verse] of surahAyahMap) {
    // Skip if already processed
    if (interpretations[verseRef]) {
      console.log(`Skipping ${verseRef} (already exists)`);
      continue;
    }

    console.log(`Processing ${verseRef}...`);

    const interpretation = await fetchKhameneiInterpretation(verseRef);
    if (interpretation) {
      interpretations[verseRef] = interpretation;

      // Save progress after each successful fetch
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(interpretations, null, 2));
      console.log(`Saved progress: ${Object.keys(interpretations).length} interpretations`);
    }

    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  console.log(`Completed! Total interpretations: ${Object.keys(interpretations).length}`);
}

// Run the script
generateOfflineKhameneiData().catch(console.error);