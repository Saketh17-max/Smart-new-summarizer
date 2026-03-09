import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { extractArticle } from './services/extractor.js';
import { generateSummaryAndSentiment } from './services/aiService.js';
import { translateText } from './services/translatorService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.get("/", (req, res) => {
  res.send("Smart News Summarizer API Running 🚀");
});
app.post('/api/analyze', async (req, res) => {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Please provide an array of 1 or 2 URLs.' });
    }

    try {
        const results = [];
        for (const url of urls) {
            // 1. Extract content
            const article = await extractArticle(url);
            if (!article) {
                throw new Error(`Failed to extract content from ${url}`);
            }

            // Calculate original reading time (average 200 words per minute)
            const originalWordCount = article.textContent.split(/\s+/).length;
            const originalReadingTime = Math.ceil(originalWordCount / 200);

            // 2. Get AI Summary & Sentiment & Advanced features
            const aiResult = await generateSummaryAndSentiment(article.textContent, article.title);

            const summaryWordCount = aiResult.summary.split(/\s+/).length;
            const summaryReadingTime = Math.ceil(summaryWordCount / 200);
            const timeSaved = originalReadingTime - summaryReadingTime;

            results.push({
                url,
                title: article.title,
                originalContentOptions: article.textContent.substring(0, 15000), // send content to frontend for chat
                summary: aiResult.summary,
                sentiment: aiResult.sentiment,
                topic: aiResult.topic,
                explainSimply: aiResult.explainSimply,
                whyItMatters: aiResult.whyItMatters,
                timeline: aiResult.timeline,
                bias: aiResult.bias,
                facts: aiResult.facts,
                headline: aiResult.headline,
                difficulty: aiResult.difficulty,
                readingTime: {
                    original: originalReadingTime,
                    summary: summaryReadingTime,
                    saved: timeSaved > 0 ? timeSaved : 0
                }
            });
        }

        // If 2 URLs are provided, generate a comparison
        let comparison = null;
        if (urls.length === 2) {
            const { generateComparison } = await import('./services/aiService.js');
            comparison = await generateComparison(results[0].summary, results[1].summary);
        }

        res.json({ results, comparison });
    } catch (error) {
        console.error('Error analyzing urls:', error);
        res.status(500).json({ error: 'Failed to process articles', details: error.message, stack: error.stack });
    }
});

app.post('/api/translate', async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Text and target language are required.' });
    }
    try {
        const translatedText = await translateText(text, targetLang);
        res.json({ translatedText });
    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.post('/api/chat', async (req, res) => {
    const { messages, context } = req.body;
    if (!messages || !context) {
        return res.status(400).json({ error: 'Messages and context are required.' });
    }

    try {
        const { chatWithArticle } = await import('./services/aiService.js');
        const reply = await chatWithArticle(messages, context);
        res.json({ reply });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Chat processing failed' });
    }
});

// JSON file storage for saved articles
const SAVED_ARTICLES_FILE = './saved_articles.json';

const getSavedArticles = () => {
    if (!fs.existsSync(SAVED_ARTICLES_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(SAVED_ARTICLES_FILE, 'utf-8'));
    } catch { return []; }
};

app.get('/api/saved', (req, res) => {
    res.json(getSavedArticles());
});

app.post('/api/saved', (req, res) => {
    const article = req.body;
    if (!article.url) return res.status(400).json({ error: 'Article URL strictly required to save' });

    let articles = getSavedArticles();
    if (!articles.find(a => a.url === article.url)) {
        articles.push({ ...article, savedAt: new Date().toISOString() });
        fs.writeFileSync(SAVED_ARTICLES_FILE, JSON.stringify(articles, null, 2));
    }
    res.json({ success: true });
});

app.delete('/api/saved/:url', (req, res) => {
    const url = decodeURIComponent(req.params.url);
    let articles = getSavedArticles();
    articles = articles.filter(a => a.url !== url);
    fs.writeFileSync(SAVED_ARTICLES_FILE, JSON.stringify(articles, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
