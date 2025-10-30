import { AI_API_URL, DEFAULT_AI_PROMPT } from '../config';

export async function getAIInterpretation(
  verseText: string,
  customPrompt?: string,
  khameneiText?: string,
  almizanText?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const prompt = customPrompt || DEFAULT_AI_PROMPT;

  // Build the content with verse and optional texts
  let content = `
<VERSE>
${verseText}
</VERSE>
`;

  if (khameneiText) {
    content += `
<KHAMENYI_INTERPRTATION_RAW_TEXT>${khameneiText}</KHAMENYI_INTERPRTATION_RAW_TEXT>
`;
  }

  if (almizanText) {
    content += `
<ALMIZAN_INTERPERATION_RAW_TEXT>${almizanText}</ALMIZAN_INTERPERATION_RAW_TEXT>
`;
  }

  content += `

${prompt}
`;

  try {
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
        temperature: 0.3,
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
              onChunk?.(result);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }

    return result || 'تفسیری یافت نشد';
  } catch (error) {
    console.error('Error fetching AI interpretation:', error);
    return 'خطا در دریافت تفسیر هوش مصنوعی';
  }
}