import React, { useState, useEffect } from 'react';
import ArticleInput from './components/ArticleInput';
import ResultCard from './components/ResultCard';
import ComparisonView from './components/ComparisonView';
import { stopSpeech } from './utils/speech';
import SavedArticles from './components/SavedArticles';
import { Moon, Sun, AlertTriangle, Cpu, Zap, Library, Bookmark } from 'lucide-react';
import './index.css';
import API_BASE, { ROUTES } from './config';

function App() {
  const [results, setResults] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'saved'

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleAnalyze = async (urls) => {
    setCurrentView('home');
    setIsLoading(true);
    setError(null);
    setResults([]);
    setComparison(null);
    stopSpeech();

    try {
      const response = await fetch(ROUTES.analyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze articles');
      }

      setResults(data.results);
      if (data.comparison) {
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="app-container">
        <nav className="nav-bar">
          <button
            onClick={() => setCurrentView(currentView === 'home' ? 'saved' : 'home')}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Bookmark size={18} fill={currentView === 'saved' ? 'currentColor' : 'none'} />
            {currentView === 'home' ? 'Saved Articles' : 'Back to Home'}
          </button>
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        {currentView === 'home' && (
          <header className="header">
            <div className="header-badge">
              <Zap size={16} /> Powering Readers
            </div>
            <h1>Smart News Summarizer</h1>
            <p>Drop a news link to instantly extract AI summaries, check the sentiment, translate content, and reclaim your time.</p>
          </header>
        )}

        <main>
          <ArticleInput onSubmit={handleAnalyze} isLoading={isLoading} />

          {error && (
            <div className="alert-error">
              <AlertTriangle className="alert-icon" size={24} />
              <div>
                <strong>Failed to Analyze</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="loader-container">
              <div className="loader-icons">
                <div className="loader-icon pulse"><Cpu size={24} /></div>
                <div className="loader-icon pulse"><Library size={24} /></div>
                <div className="loader-icon pulse"><Zap size={24} /></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="loader-text">Analyzing your articles...</p>
                <p className="loader-subtext">Extracting content and running AI models</p>
              </div>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className={`results-grid ${results.length === 2 ? 'two-cols' : ''}`}>
              {results.map((res, idx) => (
                <ResultCard key={idx} data={res} index={idx} isComparison={results.length === 2} />
              ))}
            </div>
          )}

          {!isLoading && comparison && (
            <ComparisonView comparisonText={comparison} />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
