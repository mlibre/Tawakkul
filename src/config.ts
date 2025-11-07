export const BASENAME = "/Tawakkul";
export const AI_API_URL = 'https://unified-ai-router-personal.onrender.com';
// export const DEFAULT_AI_PROMPT = 'Analyze the provided Islamic interpretations and provide a comprehensive yet concise explanation in Persian. Be truthful and base your response only on the provided texts. Write your response in Persian language.';
export const DEFAULT_AI_PROMPT = `
Analyze the provided Quran verse and its Islamic interpretations, and then:
* Provide a detailed, comprehensive, yet concise explanation.
* Rely ONLY on the content inside the <quran-verse> and <interpretation> tags.
* Respond in Persian, using an active and direct style.
* Be truthful and base your response solely on the provided content.
`;