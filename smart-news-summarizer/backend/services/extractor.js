import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';

export const extractArticle = async (url) => {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000 // 15 seconds timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }

        const html = await response.text();
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        if (!article) {
            throw new Error('Readability failed to parse article');
        }

        return {
            title: article.title,
            textContent: article.textContent, // Clean text
            htmlContent: article.content,
            excerpt: article.excerpt
        };
    } catch (error) {
        console.error('Error in extractArticle:', error);
        throw error;
    }
};
