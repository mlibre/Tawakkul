import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';

// Configuration
const OUTPUT_FILE = 'public/khamenei-interpretations.json';
const SURAH_FOLDER = 'public/khamenei-interpretations';
const DELAY_MS = 1000; // Delay between requests to avoid rate limiting
const MAX_RETRIES = 3;
const CONCURRENT_REQUESTS = 99; // Number of parallel requests

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

  // Get verses that need processing
  const versesToProcess = Array.from(surahAyahMap.entries()).filter(([verseRef]) => !interpretations[verseRef]);

  console.log(`Processing ${versesToProcess.length} verses with ${CONCURRENT_REQUESTS} parallel requests...`);

  // Process verses in batches
  for (let i = 0; i < versesToProcess.length; i += CONCURRENT_REQUESTS) {
    const batch = versesToProcess.slice(i, i + CONCURRENT_REQUESTS);
    console.log(`Processing batch ${Math.floor(i / CONCURRENT_REQUESTS) + 1}/${Math.ceil(versesToProcess.length / CONCURRENT_REQUESTS)} (${batch.length} verses)`);

    // Process batch in parallel
    const promises = batch.map(async ([verseRef, verse]) => {
      console.log(`Processing ${verseRef}...`);

      const interpretation = await fetchKhameneiInterpretation(verseRef);
      if (interpretation) {
        interpretations[verseRef] = interpretation;
        return verseRef;
      }
      return null;
    });

    // Wait for all requests in this batch to complete
    const results = await Promise.all(promises);
    const successful = results.filter(result => result !== null);

    if (successful.length > 0) {
      // Save progress after each batch
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(interpretations, null, 2));
      console.log(`Batch completed: ${successful.length} successful, ${Object.keys(interpretations).length} total interpretations saved`);
    }

    // Small delay between batches to be respectful
    if (i + CONCURRENT_REQUESTS < versesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`Completed! Total interpretations: ${Object.keys(interpretations).length}`);

  // Create per-surah JSON files
  await createSurahFiles(interpretations);
}

// Create individual JSON files for each surah
async function createSurahFiles(interpretations) {
  console.log('Creating per-surah JSON files...');

  // Ensure the folder exists
  if (!fs.existsSync(SURAH_FOLDER)) {
    fs.mkdirSync(SURAH_FOLDER, { recursive: true });
  }

  // Group interpretations by surah
  const surahInterpretations = {};

  Object.entries(interpretations).forEach(([verseRef, interpretation]) => {
    const [surahNum] = verseRef.split(':').map(Number);
    if (!surahInterpretations[surahNum]) {
      surahInterpretations[surahNum] = {};
    }
    surahInterpretations[surahNum][verseRef] = interpretation;
  });

  // Create a JSON file for each surah
  for (const [surahNum, surahData] of Object.entries(surahInterpretations)) {
    const filePath = path.join(SURAH_FOLDER, `${surahNum}.json`);
    fs.writeFileSync(filePath, JSON.stringify(surahData, null, 2));
    console.log(`Created ${filePath} with ${Object.keys(surahData).length} verses`);
  }

  console.log(`Created ${Object.keys(surahInterpretations).length} surah files`);
}

// Run the script
generateOfflineKhameneiData().catch(console.error);