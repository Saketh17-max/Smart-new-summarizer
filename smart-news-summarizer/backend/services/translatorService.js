import fetch from 'node-fetch';

const translateChunk = async (chunk, targetLang) => {
    if (!chunk.trim()) return '';
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Translation API error: ${response.status}`);
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
        if (data.responseData.translatedText.includes('QUERY LENGTH LIMIT EXCEEDED')) {
            // fallback if still too long
            return chunk;
        }
        return data.responseData.translatedText;
    }
    return chunk;
};

export const translateText = async (text, targetLang) => {
    try {
        // Split text into chunks by newline to avoid the 500 character limit
        const chunks = text.split('\n');
        const translatedChunks = [];

        for (const chunk of chunks) {
            if (chunk.length > 490) {
                // If a single line is too long, try splitting by period
                const sentences = chunk.split('. ');
                let tempLine = '';
                for (const sentence of sentences) {
                    tempLine += (await translateChunk(sentence, targetLang)) + '. ';
                }
                translatedChunks.push(tempLine.trim());
            } else {
                translatedChunks.push(await translateChunk(chunk, targetLang));
            }
            // slight delay to prevent rate limit
            await new Promise(r => setTimeout(r, 200));
        }

        return translatedChunks.join('\n');
    } catch (error) {
        console.error('Error in translateText:', error);
        throw error;
    }
};
