// Central API configuration — change this URL when switching environments
const API_BASE = 'https://smart-new-summarizer.onrender.com';

// Route paths on the deployed backend (no /api/ prefix)
export const ROUTES = {
    analyze: `${API_BASE}/analyze`,
    translate: `${API_BASE}/translate`,
    chat: `${API_BASE}/chat`,
    saved: `${API_BASE}/saved`,
};

export default API_BASE;
