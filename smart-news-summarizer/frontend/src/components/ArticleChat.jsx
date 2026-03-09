import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const ArticleChat = ({ articleContext }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! Ask me any questions about this article.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Send the history (excluding the first greeting if we want, but it's fine to include)
            const chatHistory = [...messages, userMessage].filter(m => m.role !== 'assistant' || m.content !== 'Hi! Ask me any questions about this article.');

            const truncatedContext = articleContext ? articleContext.substring(0, 15000) : "";

            console.log("Sending chat request:", { messageCount: chatHistory.length, contextLength: truncatedContext.length });

            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatHistory,
                    context: truncatedContext
                })
            });

            console.log("Chat response status:", res.status);
            const data = await res.json();
            console.log("Chat response data:", data);
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to chat service.' }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="article-chat" style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-solid)',
            display: 'flex',
            flexDirection: 'column',
            height: '350px',
            marginTop: '1.5rem',
            overflow: 'hidden'
        }}>
            <div className="chat-header" style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Bot size={18} /> Chat with this Article
            </div>

            <div className="chat-messages" style={{
                flex: 1,
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}>
                        <div style={{
                            background: msg.role === 'user' ? 'var(--primary)' : 'var(--neutral-bg)',
                            color: msg.role === 'user' ? 'white' : 'var(--primary)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div style={{
                            background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            borderTopRightRadius: msg.role === 'user' ? 0 : '12px',
                            borderTopLeftRadius: msg.role === 'user' ? '12px' : 0,
                            maxWidth: '85%',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'var(--neutral-bg)', color: 'var(--primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={16} />
                        </div>
                        <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                            <Loader2 size={16} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{
                display: 'flex',
                padding: '0.75rem',
                borderTop: '1px solid var(--border)',
                gap: '0.5rem',
                background: 'var(--bg-color)'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isTyping}
                    style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'var(--surface-solid)',
                        color: 'var(--text-main)',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        width: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
                        opacity: (!input.trim() || isTyping) ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ArticleChat;
