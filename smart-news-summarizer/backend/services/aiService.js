import fetch from 'node-fetch';

export const generateSummaryAndSentiment = async (text, title = "") => {
    try {
        const API_KEY = process.env.OPENROUTER_API_KEY;
        if (!API_KEY) {
            throw new Error('OPENROUTER_API_KEY is missing in environment');
        }

        // Limit text length to avoid token limits if the article is too huge
        const truncatedText = text.substring(0, 15000);

        const prompt = `
You are a Smart News Summarizer AI. Output valid JSON ONLY! No markdown formatting like \`\`\`json.
Task:
1. Summarize the following news article text in 3 to 5 clear, concise bullet points.
2. Analyze the overall sentiment of the article and classify it as exactly one of these: "Positive", "Negative", or "Neutral".
3. Bias Detection: Analyze if the article shows political bias, emotional manipulation, or neutral reporting.
4. Key Facts Extraction: Extract important people, organizations, locations, dates, and major events.
5. Smart Headline: Generate a simplified and clearer headline that summarizes the main idea.
6. Article Difficulty: Analyze the complexity of the reading level.
7. Topic Classification: Automatically classify the article into a category (e.g. Technology, Politics, Business, Health, Sports, Entertainment, etc.).
8. Explain Simply: Convert the article summary into a short paragraph using very simple language (Like Explain Like I'm 12).
9. Why This Matters: Explain why this news is important and its impact.
10. Timeline: If there are multiple events described, create a chronological timeline array.

Original title: ${title || "Unknown"}
Input Text:
"""
${truncatedText}
"""

Format your response exactly as this JSON structure:
{
  "topic": "Technology",
  "explainSimply": "A very simple paragraph explaining the whole thing for a 12 year old...",
  "whyItMatters": "This matters because...",
  "summary": "• Point 1\n• Point 2\n• Point 3",
  "sentiment": "Positive",
  "bias": {
    "level": "Low",
    "tone": "objective and factual",
    "perspective": "neutral observer"
  },
  "facts": {
    "people": ["Name 1", "Name 2"],
    "organizations": ["Org 1"],
    "locations": ["Place 1"],
    "dates": ["Date 1"],
    "events": ["Event 1"]
  },
  "timeline": [
    { "date": "2024", "event": "Something happened..." }
  ],
  "headline": {
    "original": "The original headline",
    "simplified": "A clearer, simpler headline"
  },
  "difficulty": {
    "level": "High School",
    "score": 8,
    "simplifiedExplanation": "A one sentence simple explanation of the whole article."
  }
}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash",
                "max_tokens": 4000,
                "messages": [
                    { "role": "user", "content": prompt }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const messageContent = data.choices[0].message.content;

        // Parse JSON
        try {
            const parsed = JSON.parse(messageContent);
            return {
                summary: parsed.summary,
                sentiment: parsed.sentiment,
                topic: parsed.topic || "General News",
                explainSimply: parsed.explainSimply,
                whyItMatters: parsed.whyItMatters,
                timeline: parsed.timeline || [],
                bias: parsed.bias,
                facts: parsed.facts,
                headline: parsed.headline,
                difficulty: parsed.difficulty
            };
        } catch (e) {
            // Fallback parsing if JSON parsing fails
            console.error("Failed to parse JSON response from LLM:", messageContent);
            return {
                summary: "• Summary could not be parsed properly.\n• Please try again.",
                sentiment: "Neutral",
                topic: "General News",
                whyItMatters: "Could not generate importance.",
                explainSimply: "Could not generate simple explanation.",
                timeline: [],
                bias: { level: "Unknown", tone: "Unknown", perspective: "Unknown" },
                facts: { people: [], organizations: [], locations: [], dates: [], events: [] },
                headline: { original: title || "Unknown", simplified: "Could not generate headline" },
                difficulty: { level: "Unknown", score: 0, simplifiedExplanation: "Failed to process." }
            };
        }
    } catch (error) {
        console.error('Error in AI Service:', error);
        throw error;
    }
};

export const generateComparison = async (summary1, summary2) => {
    try {
        const API_KEY = process.env.OPENROUTER_API_KEY;

        const prompt = `
You are a Smart News Summarizer AI. Provide a short comparison between two article summaries on the same topic. Focus on what differs between them (e.g., tone, facts, focus), or what they agree on.
Summary A:
${summary1}

Summary B:
${summary2}

Format as a short paragraph or 2-3 bullet points. No JSON, just standard text.
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash",
                "max_tokens": 1000,
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Error generating comparison:', error);
        return "Error generating comparison.";
    }
};

export const chatWithArticle = async (messages, context) => {
    try {
        const API_KEY = process.env.OPENROUTER_API_KEY;
        const systemPrompt = `You are a helpful AI assistant that answers questions based ONLY on the provided article context. Do not use outside knowledge. If the answer is not in the text, say "I don't have enough information from the article to answer that."\n\nArticle Context:\n${context}`;

        const apiMessages = [
            { role: "system", "content": systemPrompt },
            ...messages
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash",
                "max_tokens": 1500,
                "messages": apiMessages
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Error in chatWithArticle:', error);
        throw error;
    }
};
