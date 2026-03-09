import React, { useState, useEffect } from 'react';
import API_BASE from '../config';
import { speakText, stopSpeech } from '../utils/speech';
import ArticleChat from './ArticleChat';
import {
    FileText, Clock, TrendingUp, TrendingDown, Minus,
    Volume2, Square, Languages, Fingerprint, Award,
    Scale, BrainCircuit, Type, FileQuestion, BookOpen, Bookmark, History, Lightbulb, ChevronDown, ChevronUp, CheckCircle2, MapPin, Users, Building2, Calendar
} from 'lucide-react';

const Section = ({ icon: Icon, title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1rem' }}>
            <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'var(--surface-solid)', border: 'none', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--text-main)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon size={16} style={{ color: 'var(--primary)' }} />{title}
                </span>
                {open ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
            </button>
            {open && <div style={{ padding: '1.25rem', background: 'var(--surface)' }}>{children}</div>}
        </div>
    );
};

const ResultCard = ({ data, index, isComparison }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showSimple, setShowSimple] = useState(false);

    const { url, title, originalContentOptions, summary, sentiment, topic, explainSimply, whyItMatters, timeline, bias, facts, headline, difficulty, readingTime } = data;

    useEffect(() => {
        fetch(`${API_BASE}/api/saved`)
            .then(r => r.json())
            .then(saved => { if (saved.some(a => a.url === url)) setIsSaved(true); })
            .catch(() => { });
    }, [url]);

    const handleSave = async () => {
        try {
            if (isSaved) {
                await fetch(`${API_BASE}/api/saved/${encodeURIComponent(url)}`, { method: 'DELETE' });
                setIsSaved(false);
            } else {
                await fetch(`${API_BASE}/api/saved`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                setIsSaved(true);
            }
        } catch (err) { console.error(err); }
    };

    const handlePlayAudio = () => {
        if (isPlaying) { stopSpeech(); setIsPlaying(false); }
        else { setIsPlaying(true); speakText(translatedText || summary, targetLang, () => setIsPlaying(false)); }
    };

    const handleTranslate = async (e) => {
        const lang = e.target.value;
        setTargetLang(lang);
        if (lang === 'en') { setTranslatedText(''); return; }
        setIsTranslating(true);
        try {
            const res = await fetch(`${API_BASE}/api/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: summary, targetLang: lang })
            });
            const result = await res.json();
            if (res.ok) setTranslatedText(result.translatedText);
            else alert('Translation error');
        } catch (err) { alert('Failed to translate.'); }
        setIsTranslating(false);
    };

    const SentimentIcon = sentiment?.toLowerCase() === 'positive' ? TrendingUp : sentiment?.toLowerCase() === 'negative' ? TrendingDown : Minus;
    const sentimentClass = sentiment?.toLowerCase() || 'neutral';

    let biasLevelClass = 'neutral';
    if (bias?.level?.toLowerCase() === 'high') biasLevelClass = 'negative';
    else if (bias?.level?.toLowerCase() === 'low') biasLevelClass = 'positive';

    const accentColor = index === 0 ? 'var(--primary)' : 'var(--accent, #f59e0b)';

    return (
        <article style={{
            background: 'var(--surface)',
            backdropFilter: 'blur(20px)',
            border: `1px solid var(--border)`,
            borderTop: `4px solid ${isComparison ? accentColor : 'var(--primary)'}`,
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: `slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s forwards`,
            opacity: 0
        }}>
            {/* Header with label */}
            {isComparison && (
                <div style={{ background: accentColor, color: 'white', padding: '0.4rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {index === 0 ? '🔵 Summary A — Primary Article' : '🟡 Summary B — Comparison Article'}
                </div>
            )}

            {/* Title Block */}
            <div style={{ padding: '1.75rem 1.75rem 1rem' }}>
                {headline?.simplified && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Type size={12} /> AI Smart Headline
                    </p>
                )}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.35, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {headline?.simplified || title}
                </h2>
                {headline?.simplified && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Original: {title}
                    </p>
                )}

                {/* Badges Row */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {topic && (
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {topic}
                        </span>
                    )}
                    <span className={`badge ${sentimentClass}`}>
                        <SentimentIcon size={13} style={{ flexShrink: 0 }} /> {sentiment}
                    </span>
                    <button onClick={handleSave} title={isSaved ? 'Remove Bookmark' : 'Save Article'} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: isSaved ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', background: 'var(--surface-solid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                {[
                    { icon: FileText, label: 'Full Read', value: readingTime.original, unit: 'min' },
                    { icon: Clock, label: 'Summary', value: readingTime.summary, unit: 'min' },
                    { icon: Award, label: 'Time Saved', value: `+${readingTime.saved}`, unit: 'min', highlight: true },
                ].map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: '0.9rem 1rem', borderRight: i < 2 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'center', gap: '0.3rem', alignItems: 'center' }}>
                            <s.icon size={12} />{s.label}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.highlight ? 'var(--secondary)' : 'var(--text-main)' }}>
                            {s.value} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{s.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrollable Content */}
            <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {/* Why This Matters */}
                {whyItMatters && (
                    <div style={{ background: 'var(--primary-light)', borderLeft: '4px solid var(--primary)', padding: '1rem 1.25rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '0.5rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Lightbulb size={13} /> Why This Matters
                        </p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>{whyItMatters}</p>
                    </div>
                )}

                {/* Summary */}
                <Section icon={Fingerprint} title="AI Summary">
                    {isTranslating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <div className="inline-spinner" style={{ borderColor: 'var(--primary-light)', borderTopColor: 'var(--primary)' }} />
                            Translating...
                        </div>
                    ) : (
                        <div style={{ fontSize: '0.975rem', lineHeight: 1.75, color: 'var(--text-main)' }}
                            dangerouslySetInnerHTML={{ __html: (translatedText || summary).replace(/\n/g, '<br/>') }} />
                    )}
                    {explainSimply && (
                        <div style={{ marginTop: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setShowSimple(!showSimple)} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                {showSimple ? 'Hide Simple Explanation' : "🧒 Explain Like I'm 12"}
                            </button>
                            {showSimple && (
                                <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--surface-solid)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {explainSimply}
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                {/* Bias + Reading Level side by side */}
                {(bias || difficulty) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        {bias && (
                            <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <Scale size={12} /> Bias Detection
                                </p>
                                <span className={`badge ${biasLevelClass}`} style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>{bias.level} Bias</span>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.5 }}><strong>Tone:</strong> <span style={{ textTransform: 'capitalize' }}>{bias.tone}</span></p>
                                <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}><strong>Perspective:</strong> <span style={{ textTransform: 'capitalize' }}>{bias.perspective}</span></p>
                            </div>
                        )}
                        {difficulty && (
                            <div style={{ background: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', display: 'flex', gap: '0.35rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <BookOpen size={12} /> Reading Level
                                </p>
                                <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{difficulty.level}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Score: {difficulty.score}/10</p>
                                <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-muted)', lineHeight: 1.45 }}>"{difficulty.simplifiedExplanation}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Key Facts */}
                {facts && (facts.people?.length > 0 || facts.organizations?.length > 0 || facts.locations?.length > 0 || facts.events?.length > 0) && (
                    <Section icon={FileQuestion} title="Key Facts & Entities" defaultOpen={false}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                            {facts.people?.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><Users size={13} /> People</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {facts.people.map((p, i) => <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><CheckCircle2 size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />{p}</li>)}
                                    </ul>
                                </div>
                            )}
                            {facts.organizations?.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><Building2 size={13} /> Organizations</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {facts.organizations.map((o, i) => <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><CheckCircle2 size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />{o}</li>)}
                                    </ul>
                                </div>
                            )}
                            {facts.locations?.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><MapPin size={13} /> Locations</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {facts.locations.map((l, i) => <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><CheckCircle2 size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />{l}</li>)}
                                    </ul>
                                </div>
                            )}
                            {facts.events?.length > 0 && (
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}><Calendar size={13} /> Events</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {facts.events.map((e, i) => <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><CheckCircle2 size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />{e}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* Timeline */}
                {timeline?.length > 0 && (
                    <Section icon={History} title="Timeline of Events" defaultOpen={false}>
                        <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {timeline.map((item, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-1.35rem', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface-solid)' }} />
                                    <strong style={{ fontSize: '0.82rem', color: 'var(--primary)', display: 'block' }}>{item.date}</strong>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: '0.25rem 0 0', lineHeight: 1.5 }}>{item.event}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* AI Chat */}
                {originalContentOptions && <ArticleChat articleContext={originalContentOptions} />}

                {/* Action Footer */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', alignItems: 'center' }}>
                    <button onClick={handlePlayAudio} className={`btn ${isPlaying ? 'btn-secondary' : 'btn-outline'}`} style={{ fontSize: '0.9rem', padding: '0.65rem 1.1rem' }}>
                        {isPlaying ? <><Square size={16} fill="currentColor" /> Stop Audio</> : <><Volume2 size={16} /> Read Aloud</>}
                    </button>
                    <div className="translation-controls" style={{ marginLeft: 'auto' }}>
                        <label htmlFor={`translate-${index}`}><Languages size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Translate:</label>
                        <select id={`translate-${index}`} value={targetLang} onChange={handleTranslate} className="select-input" disabled={isTranslating}>
                            <option value="en">English</option>
                            <option value="hi">Hindi (हिन्दी)</option>
                            <option value="te">Telugu (తెలుగు)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ResultCard;
