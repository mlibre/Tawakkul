import { AI_API_URL, DEFAULT_AI_PROMPT, AI_STREAMING } from '../config';
import OpenAI from 'openai';

let saanNuzulCache: any = null;

// Cache for loaded Saan Nuzul data
async function loadSaanNuzul(verseRef: string): Promise<string | undefined> {
  try {
    if (saanNuzulCache) {
      return saanNuzulCache[verseRef]?.content;
    }

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

async function loadKhameneiInterpretation(verseRef: string): Promise<string | undefined> {
  try {
    const [surahNum] = verseRef.split(':');

    if (surahCache.has(surahNum)) {
      const surahData = surahCache.get(surahNum);
      return surahData[verseRef]?.content;
    }

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

  // Try to load local sources if not provided
  let localKhameneiText = khameneiText;
  if (verseRef && !khameneiText) {
    localKhameneiText = await loadKhameneiInterpretation(verseRef);
  }

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

  try {
    // Use OpenAI SDK for better handling
    const openai = new OpenAI({
      apiKey: "something",
      baseURL: AI_API_URL,
      dangerouslyAllowBrowser: true // Only for development
    });

    if (AI_STREAMING && onChunk) {
      // Streaming mode - use AI_STREAMING config
      const stream = await openai.chat.completions.create({
        model: 'temp',
        messages: [{
          role: 'user' as const,
          content: content
        }],
        temperature: 0,
        stream: true
      });
      
      let result = '';
      // Handle streaming with OpenAI SDK according to official docs
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          result += content;
          onChunk(content);
        }
      }
      return result || 'تفسیری یافت نشد';
    } else {
      // Non-streaming mode - use AI_STREAMING config
      const completion = await openai.chat.completions.create({
        model: 'temp',
        messages: [{
          role: 'user' as const,
          content: content
        }],
        temperature: 0,
        stream: false
      });
      const result = completion.choices[0]?.message?.content || 'تفسیری یافت نشد';
      
      // Send entire response as one chunk if callback provided
      if (onChunk) {
        onChunk(result);
      }
      return result;
    }
  } catch (error) {
    console.error('Error fetching AI interpretation:', error);
    return 'خطا در دریافت تفسیر هوش مصنوعی';
  }
}