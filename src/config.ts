export const BASENAME = "/Tawakkul";
export const AI_API_URL = 'https://unified-ai-router-personal.onrender.com';
export const AI_STREAMING = false; // Enable/disable streaming for AI responses
// export const DEFAULT_AI_PROMPT = 'Analyze the provided Islamic interpretations and provide a comprehensive yet concise explanation in Persian. Be truthful and base your response only on the provided texts. Write your response in Persian language.';
export const DEFAULT_AI_PROMPT = `

## AI Analysis Guidelines

Analyze the provided Quran verse and its Islamic interpretations:

* Provide a detailed, comprehensive, yet concise explanation.
* Rely ONLY on the content inside the markdown sections above (Quran Verse, Occasion of Revelation, Interpretations).
* Respond in Persian, using an active and direct style.
* Be truthful and base your response solely on the provided content.
`;