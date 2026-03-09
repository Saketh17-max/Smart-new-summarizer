import React, { useEffect, useState } from 'react';
import API_BASE, { ROUTES } from '../config';
import { Bookmark, Clock, Trash2, ExternalLink } from 'lucide-react';
import ResultCard from './ResultCard';

const SavedArticles = () => {
    const [saved, setSaved] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewingArticle, setViewingArticle] = useState(null);

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            const res = await fetch(ROUTES.saved);
            const data = await res.json();
            setSaved(data);
        } catch (err) {
            console.error('Failed to fetch saved articles', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e, url) => {
        e.stopPropagation();
        try {
            await fetch(`${ROUTES.saved}/${encodeURIComponent(url)}`, { method: 'DELETE' });
            setSaved(prev => prev.filter(a => a.url !== url));
            if (viewingArticle?.url === url) setViewingArticle(null);
        } catch (err) {
            console.error('Failed to delete article', err);
        }
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading saved articles...</div>;
    }

    if (viewingArticle) {
        return (
            <div>
                <button
                    onClick={() => setViewingArticle(null)}
                    style={{ marginBottom: '1rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
                >
                    &larr; Back to Saved List
                </button>
                <ResultCard data={viewingArticle} index={0} isComparison={false} />
            </div>
        );
    }

    if (saved.length === 0) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Bookmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No saved articles yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>Articles you bookmark will appear here for easy reading later.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {saved.map((article, idx) => (
                <div
                    key={idx}
                    className="glass-card"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                    onClick={() => setViewingArticle(article)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <span className={`badge ${article.sentiment?.toLowerCase() || 'neutral'}`} style={{ fontSize: '0.75rem' }}>
                            {article.topic || 'General News'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}>
                                <ExternalLink size={18} />
                            </a>
                            <button onClick={(e) => handleDelete(e, article.url)} style={{ background: 'transparent', border: 'none', color: 'var(--negative)', cursor: 'pointer', padding: 0 }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.headline?.simplified || article.title}
                    </h4>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> {article.readingTime?.summary} min read</span>
                        <span>{new Date(article.savedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SavedArticles;
