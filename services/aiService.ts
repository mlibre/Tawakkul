import { AI_API_URL, DEFAULT_AI_PROMPT } from '../config';

export async function getAIInterpretation(verseText: string, customPrompt?: string): Promise<string> {
  const prompt = customPrompt || DEFAULT_AI_PROMPT;

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
            content: `${prompt} "${verseText}"`
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'تفسیری یافت نشد';
  } catch (error) {
    console.error('Error fetching AI interpretation:', error);
    return 'خطا در دریافت تفسیر هوش مصنوعی';
  }
}