import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export const initGemini = (apiKey: string) => {
    genAI = new GoogleGenerativeAI(apiKey);
};

export const generateCaption = async (apiKey: string, topic: string, tone: string) => {
    if (!genAI) initGemini(apiKey);

    if (!genAI) throw new Error("Generative AI not initialized");

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
     You are a social media expert for "PIK-R" (Pusat Informasi dan Konseling Remaja), a youth counseling organization.
     Create an Instagram caption about: "${topic}".
     Tone: ${tone}.
     
     Style Requirements:
     - Engaging and relevant to teenagers/youth.
     - Include hashtags likely used by PIK-R (e.g., #PIKR, #GenreIndonesia, #RemajaSehat).
     - Use emojis.
     - Keep it concise but impactful.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};
