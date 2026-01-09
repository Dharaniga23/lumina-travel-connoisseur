const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY?.trim();

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

export const getLuminaGroqResponse = async (history) => {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_groq_key')) {
        return "Lumina is waiting for her Groq Key. Please add VITE_GROQ_API_KEY to your .env file.";
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...history.map(msg => ({
                        role: msg.role === 'ai' ? 'assistant' : 'user',
                        content: msg.content
                    }))
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("Groq Error:", error);
        return `Lumina encountered a slight delay in the Groq clouds: ${error.message}. Please check your API key and connection.`;
    }
};
