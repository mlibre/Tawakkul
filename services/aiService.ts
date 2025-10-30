const API_URL = 'https://unified-ai-router.onrender.com';

export async function getAIInterpretation(verseText: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'temp',
        messages: [
          {
            role: 'user',
            content: `با استفاده از دیدگاه‌های شیعه دوازده‌امامی، این آیه قرآن را تفسیر کن: "${verseText}"`
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