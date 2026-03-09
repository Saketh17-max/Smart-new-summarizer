import React, { useState } from 'react';
import { Link, Plus, Minus, Search, Sparkles } from 'lucide-react';

const ArticleInput = ({ onSubmit, isLoading }) => {
    const [isCompare, setIsCompare] = useState(false);
    const [url1, setUrl1] = useState('');
    const [url2, setUrl2] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url1.trim()) return;

        if (isCompare && url2.trim()) {
            onSubmit([url1.trim(), url2.trim()]);
        } else {
            onSubmit([url1.trim()]);
        }
    };

    return (
        <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto', zIndex: 5 }}>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Primary Article URL</label>
                    <div className="input-wrapper">
                        <Link className="input-icon" size={20} />
                        <input
                            type="url"
                            value={url1}
                            onChange={(e) => setUrl1(e.target.value)}
                            className="text-input"
                            placeholder="https://example.com/news-article..."
                            required
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {isCompare && (
                    <div className="input-group" style={{ animation: 'slideUpFade 0.4s ease forwards' }}>
                        <label className="input-label">Second Article URL (For AI Comparison)</label>
                        <div className="input-wrapper">
                            <Link className="input-icon" size={20} />
                            <input
                                type="url"
                                value={url2}
                                onChange={(e) => setUrl2(e.target.value)}
                                className="text-input"
                                placeholder="https://example.com/another-article..."
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={isLoading || !url1}>
                    {isLoading ? (
                        <>
                            <div className="inline-spinner"></div> Analyzing...
                        </>
                    ) : (
                        isCompare ? <><Sparkles size={20} /> Analyze & Compare Article</> : <><Search size={20} /> Summarize Article</>
                    )}
                </button>

                <button
                    type="button"
                    className="toggle-link"
                    onClick={() => setIsCompare(!isCompare)}
                    disabled={isLoading}
                    aria-label={isCompare ? "Remove comparison article" : "Add article to compare"}
                >
                    {isCompare ? <><Minus size={16} /> Remove comparison</> : <><Plus size={16} /> Compare another article</>}
                </button>
            </form>
        </div>
    );
};

export default ArticleInput;
