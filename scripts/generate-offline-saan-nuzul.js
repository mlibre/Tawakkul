import fs from 'fs';
import { JSDOM } from 'jsdom';
import axios from 'axios';

// Configuration
const OUTPUT_FILE = 'public/saan-nuzul.json';
const DELAY_MS = 3000; // Delay between requests to avoid rate limiting
const MAX_RETRIES = 3;
const CONCURRENT_REQUESTS = 50; // Number of parallel requests (lower for Iranian sites)

// Surah name mapping for URLs (when website uses different Persian names)
const SURAH_NAME_URL_MAP = {
  'سجده': 'سجدة',     // سجده -> سجدة (website uses سجدة with ت)
  'جاثیه': 'جاثیة',   // جاثیه -> جاثية (website uses جاثية with ی)
  'انشراح': 'شرح'     // انشراح -> شرح (website uses shorter form)
};

// Load Quran data to get accurate verse counts
let quranData = [];
try {
  quranData = JSON.parse(fs.readFileSync('public/quran.json', 'utf8'));
  console.log(`Loaded ${quranData.length} verses from quran.json`);
} catch (error) {
  console.error('Could not load quran.json:', error.message);
  process.exit(1);
}

async function fetchSaanNuzulHtml(url, retryCount = 0) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * (retryCount + 1)));
      return fetchSaanNuzulHtml(url, retryCount + 1);
    }
    console.error(`Failed to fetch ${url} after ${MAX_RETRIES} retries:`, error.message);
    throw error;
  }
}

async function extractSaanNuzulContent(htmlString, verseRef) {
  try {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    // Find the nuzul section
    const headers = Array.from(doc.querySelectorAll('.mw-parser-output h2'));
    const nuzulHeader = headers.find(h => {
      return h.textContent.includes("نزول");
    });

    if (!nuzulHeader) {
      return {
        content: null,
        found: false
      };
    }

    const saanNuzulTexts = [];
    let currentElement = nuzulHeader.nextElementSibling;
    
    while (currentElement && currentElement.tagName !== 'H2') {
      const text = currentElement.textContent.trim();
      if (text) {
        saanNuzulTexts.push(text);
      }
      currentElement = currentElement.nextElementSibling;
    }

    return {
      content: saanNuzulTexts.join('\n\n'),
      found: saanNuzulTexts.length > 0
    };

  } catch (error) {
    console.error(`Error extracting content for ${verseRef}:`, error.message);
    return {
      content: "خطا در استخراج محتوا",
      found: false
    };
  }
}

async function fetchSaanNuzulData(verseRef, retryCount = 0) {
  try {
    const [surah, ayah] = verseRef.split(':').map(Number);
    
    // Find the verse in quranData to get the farsi name
    const verse = quranData.find(v => v.surah.number === surah && v.ayah === ayah);
    if (!verse) {
      throw new Error(`Verse ${verseRef} not found in quran.json`);
    }

    // Use the Persian farsi name directly (no conversion needed)
    const surahFarsiName = verse.surah.farsi;
    
    // Apply URL mapping if needed
    const urlFarsiName = SURAH_NAME_URL_MAP[surahFarsiName] || surahFarsiName;
    
    const url = `https://wiki.ahlolbait.com/آیه_${ayah}_سوره_${urlFarsiName}`;
    console.log(`Fetching: ${verseRef} - ${url}`);

    const htmlString = await fetchSaanNuzulHtml(url);
    const extractedContent = await extractSaanNuzulContent(htmlString, verseRef);

    return {
      url: url,
      ...extractedContent
    };

  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying ${verseRef} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * (retryCount + 1)));
      return fetchSaanNuzulData(verseRef, retryCount + 1);
    }
    console.error(`Failed to fetch Saan Nuzul for ${verseRef} after ${MAX_RETRIES} retries:`, error.message);
    return {
      url: '',
      content: "خطا در دریافت اطلاعات",
      found: false
    };
  }
}

async function generateOfflineSaanNuzulData() {
  let saanNuzulData = {};

  // Load existing data if file exists
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      saanNuzulData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(saanNuzulData).length} existing Saan Nuzul entries`);
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

  // Get verses that need processing (starting with first surah for testing)
  const versesToProcess = Array.from(surahAyahMap.entries())
    .filter(([verseRef]) => !saanNuzulData[verseRef])

  console.log(`Processing ${versesToProcess.length} verses with ${CONCURRENT_REQUESTS} parallel requests...`);

  // Process verses in batches
  for (let i = 0; i < versesToProcess.length; i += CONCURRENT_REQUESTS) {
    const batch = versesToProcess.slice(i, i + CONCURRENT_REQUESTS);
    console.log(`Processing batch ${Math.floor(i / CONCURRENT_REQUESTS) + 1}/${Math.ceil(versesToProcess.length / CONCURRENT_REQUESTS)} (${batch.length} verses)`);

    // Process batch in parallel
    const promises = batch.map(async ([verseRef, verse]) => {
      console.log(`Processing ${verseRef}...`);

      const saanNuzul = await fetchSaanNuzulData(verseRef);
      if (saanNuzul) {
        saanNuzulData[verseRef] = saanNuzul;
        return verseRef;
      }
      return null;
    });

    // Wait for all requests in this batch to complete
    const results = await Promise.all(promises);
    const successful = results.filter(result => result !== null);

    if (successful.length > 0) {
      // Filter out entries with no content before saving to keep file size smaller
      const filteredSaanNuzulData = {};
      Object.entries(saanNuzulData).forEach(([verseRef, saanNuzul]) => {
        if (saanNuzul.found && saanNuzul.content && saanNuzul.content.trim()) {
          filteredSaanNuzulData[verseRef] = saanNuzul;
        }
      });
      
      // Save progress after each batch
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredSaanNuzulData, null, 2));
      console.log(`Batch completed: ${successful.length} successful, ${Object.keys(filteredSaanNuzulData).length} total Saan Nuzul entries with content saved`);
    }

    // Delay between batches to be respectful
    if (i + CONCURRENT_REQUESTS < versesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS * 2));
    }
  }

  // Filter out entries with no content before creating surah files to keep them smaller
  const filteredSaanNuzulData = {};
  Object.entries(saanNuzulData).forEach(([verseRef, saanNuzul]) => {
    if (saanNuzul.found && saanNuzul.content && saanNuzul.content.trim()) {
      filteredSaanNuzulData[verseRef] = saanNuzul;
    }
  });

  console.log(`Filtered from ${Object.keys(saanNuzulData).length} to ${Object.keys(filteredSaanNuzulData).length} entries with actual content`);

  // Save final filtered data to OUTPUT_FILE
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredSaanNuzulData, null, 2));
  console.log(`Final data saved to ${OUTPUT_FILE} with ${Object.keys(filteredSaanNuzulData).length} entries`);
}

// Run the script
generateOfflineSaanNuzulData().catch(console.error);