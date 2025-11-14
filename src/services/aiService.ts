import { AI_API_URL, DEFAULT_AI_PROMPT, AI_STREAMING } from '../config';
import OpenAI from 'openai';

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

  // Use the provided texts directly - no need for duplicate fetching
  const localKhameneiText = khameneiText || '';
  const localSaanNuzulText = saanNuzulText || '';

  // Build the content with verse and optional texts
  const [surah, ayah] = verseRef ? verseRef.split(':') : [];

  let content = `## Quran Verse${surah && ayah ? ` (${surah}:${ayah})` : ''}

${verseText}
`;

  if (localSaanNuzulText) {
    content += `

### Occasion of Revelation

${localSaanNuzulText}
`;
  }

  if (localKhameneiText) {
    content += `

### Interpretation by Ayatollah Seyyed Ali Khamenei

${localKhameneiText}
`;
  }

  if (almizanText) {
    content += `

### Interpretation by Allameh Mohammad Hossein Tabatabaee

${almizanText}
`;
  }

  content += `

${prompt}
`;

  console.log("content: ", content);

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