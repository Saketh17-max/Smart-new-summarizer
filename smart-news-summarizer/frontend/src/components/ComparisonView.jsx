import React from 'react';
import { GitCompare, Minus, TrendingUp, TrendingDown } from 'lucide-react';

const ComparisonView = ({ comparisonText }) => {
    if (!comparisonText) return null;

    const lines = comparisonText.split('\n').filter(l => l.trim() !== '');

    return (
        <div style={{
            marginTop: '2.5rem',
            background: 'linear-gradient(135deg, var(--surface), var(--surface-solid))',
            border: '1px solid var(--border)',
            borderTop: '4px solid var(--primary)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            animation: 'slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '1rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GitCompare size={20} color="white" />
                </div>
                <div>
                    <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, margin: 0 }}>AI Article Comparison</h3>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', margin: 0 }}>Synthesis of Summary A vs Summary B</p>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', padding: '0.85rem 1.75rem', background: 'var(--surface-solid)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                    Summary A = Primary Article
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                    Summary B = Comparison Article
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.75rem' }}>
                {lines.map((line, i) => {
                    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
                    const text = isBullet ? line.replace(/^[\•\-\*]\s*/, '') : line;
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '0.75rem',
                            marginBottom: '0.85rem',
                            padding: isBullet ? '0.75rem 1rem' : '0',
                            background: isBullet ? 'var(--surface-solid)' : 'transparent',
                            borderRadius: isBullet ? 'var(--radius-sm)' : '0',
                            border: isBullet ? '1px solid var(--border)' : 'none',
                            alignItems: 'flex-start',
                        }}>
                            {isBullet && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: '0.45rem', flexShrink: 0 }} />
                            )}
                            <p style={{ fontSize: '0.975rem', color: 'var(--text-main)', lineHeight: 1.7, margin: 0, fontWeight: isBullet ? 500 : 400 }}>
                                {text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ComparisonView;
