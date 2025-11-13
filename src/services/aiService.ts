import { AI_API_URL, DEFAULT_AI_PROMPT } from '../config';

let saanNuzulCache: any = null;

// Cache for loaded Saan Nuzul data
// Load Saan Nuzul from local file
async function loadSaanNuzul(verseRef: string): Promise<string | undefined> {
  try {
    // Check cache first
    if (saanNuzulCache) {
      return saanNuzulCache[verseRef]?.content;
    }

    // Load saan-nuzul file
    const response = await fetch('saan-nuzul.json');
    if (!response.ok) {
      console.warn('Could not load Saan Nuzul data');
      return undefined;
    }

    saanNuzulCache = await response.json();

    return saanNuzulCache[verseRef]?.content?.trim().replace(/^\s+/, '');
  } catch (error) {
    console.warn('Error loading local Saan Nuzul:', error);
    return undefined;
  }
}

// Cache for loaded surah interpretations
const surahCache = new Map<string, any>();

// Load Khamenei interpretation from local files
async function loadKhameneiInterpretation(verseRef: string): Promise<string | undefined> {
  try {
    const [surahNum] = verseRef.split(':');

    // Check cache first
    if (surahCache.has(surahNum)) {
      const surahData = surahCache.get(surahNum);
      return surahData[verseRef]?.content;
    }

    // Load surah file
    const response = await fetch(`khamenei-interpretations/${surahNum}.json`);
    if (!response.ok) {
      console.warn(`Could not load interpretations for surah ${surahNum}`);
      return undefined;
    }

    const surahData = await response.json();
    surahCache.set(surahNum, surahData);

    return surahData[verseRef]?.content?.trim().replace(/^\s+/, '');
  } catch (error) {
    console.warn('Error loading local Khamenei interpretation:', error);
    return undefined;
  }
}

export async function getAIInterpretation(
  verseText: string,
  customPrompt?: string,
  khameneiText?: string,
  almizanText?: string,
  saanNuzulText?: string,
  verseRef?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const prompt = customPrompt || DEFAULT_AI_PROMPT;

  // Try to load Khamenei interpretation from local files if verseRef is provided
  let localKhameneiText = khameneiText;
  if (verseRef && !khameneiText) {
    localKhameneiText = await loadKhameneiInterpretation(verseRef);
  }

  // Try to load Saan Nuzul from local files if verseRef is provided
  let localSaanNuzulText = saanNuzulText;
  if (verseRef && !saanNuzulText) {
    localSaanNuzulText = await loadSaanNuzul(verseRef);
  }

  // Build the content with verse and optional texts
  const [surah, ayah] = verseRef ? verseRef.split(':') : [];

  let content = `
<QURAN-VERSE${surah ? ` surah="${surah}"` : ''}${ayah ? ` ayah="${ayah}"` : ''}>
${verseText}
</QURAN-VERSE>
`;

  if (localSaanNuzulText) {
    content += `
<OCCASION-OF-REVELATION>
${localSaanNuzulText}
</OCCASION-OF-REVELATION>
`;
  }

  if (localKhameneiText) {
    content += `
<INTERPRETATION author="Ayatollah Seyyed Ali Khamenei">\n${localKhameneiText}\n</INTERPRETATION>
`;
  }

  if (almizanText) {
    content += `
<INTERPRETATION author="Allameh Mohammad Hossein Tabatabaei">\n${almizanText}\n</INTERPRETATION>
`;
  }

  content += `

${prompt}
`;

  console.log(content);
  try
  {
    const response = await fetch(`${AI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'temp',
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let result = '';

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              result += content;
              onChunk?.(content);
            }
          } catch (e) {
            console.log(e, line);
          }
        }
      }
    }
    return result || 'تفسیری یافت نشد';
  }
  catch (error)
  {
    console.error('Error fetching AI interpretation:', error);
    return 'خطا در دریافت تفسیر هوش مصنوعی';
  }
}