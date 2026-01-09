import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
You are Lumina, a high-end AI travel connoisseur. 
Your tone is sophisticated, knowledgeable, and inspiring. 
You specialize in "vibe-based" travel planning and discovering hidden gems.
Whether the user wants "Cyberpunk Tokyo," "Vintage Paris," or "Brutalist Berlin," you provide curated, luxury-leaning recommendations.
Use Markdown for formatting. Use bold for place names and italics for descriptions of 'vibes'.

IMPORTANT FORMATTING RULES:
1. NEVER send big blocks of text.
2. Use bullet points for all recommendations and lists.
3. Keep descriptions concise and evocative.
4. If the user asks for an itinerary, structure it clearly by days using headers.
5. Always maintain your persona as a luxury travel expert.
`;

export const getLuminaResponse = async (history) => {
    const isPlaceholder = !API_KEY || API_KEY.includes('PASTE_YOUR_GEMINI_API_KEY') || API_KEY === 'your_api_key_here';

    if (isPlaceholder) {
        return "Lumina still needs her secret key. Please ensure your actual Gemini API key is pasted into the .env file and that you've restarted the development server.";
    }

    try {
        // Explicitly forcing 'v1' as 'v1beta' has been causing 404 errors for some users
        const model = genAI.getGenerativeModel(
            { model: "gemini-1.5-flash" },
            { apiVersion: 'v1' }
        );

        // Filter history to satisfy Gemini API requirements (must start with user)
        const filteredHistory = history.slice(0, -1)
            .filter((msg, idx) => !(idx === 0 && msg.role === 'ai'))
            .map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            }));

        const chat = model.startChat({
            history: filteredHistory,
            generationConfig: { maxOutputTokens: 1000 },
        });

        const userMsg = history[history.length - 1].content;
        const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser Request: ${userMsg}`);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Lumina Connection Error Details:", error);

        // Clean up the error message for the user
        let userFriendlyError = error.message || "Unknown Connection Issue";
        if (userFriendlyError.includes('404')) {
            userFriendlyError = "Model Not Found (404). This can happen if the Gemini 1.5 model is restricted in your region or project.";
        } else if (userFriendlyError.includes('API_KEY_INVALID')) {
            userFriendlyError = "Invalid API Key. Please double check your .env file.";
        }

        return `Connection issue: ${userFriendlyError}. 
    
    🔍 Diagnostics:
    1. Check if your Internet is working.
    2. Key ends in: ...${API_KEY?.slice(-4)}
    3. Ensure you RESTARTED the server (Ctrl+C, then npm run dev).`;
    }
};
