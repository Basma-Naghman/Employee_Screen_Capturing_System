import React, { useState } from 'react';
import axios from 'axios';

const C = {
  bgBase: '#09090B',
  bgCard: 'rgba(39,39,42,0.70)',
  bgCardHover: 'rgba(39,39,42,0.90)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentDim: 'rgba(99,102,241,0.12)',
  success: '#10b981',
  successDim: 'rgba(16,185,129,0.12)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.12)',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  textPrimary: '#fafafa',
  textSec: '#a1a1aa',
  textMuted: '#71717a',
  shadow: '0 0 0 1px rgba(255,255,255,0.05)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.40)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.50)',
  radiusSm: '10px',
  radiusMd: '12px',
  radiusLg: '14px',
};

const AnalystChat = () => {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    const BASE_URL = "http://192.168.1.6:8000";

    const handleAsk = async () => {
        if (!query.trim()) return;
        const userQuery = query;
        setLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
        setQuery("");
        setResponse("");
        try {
            const res = await axios.post(`${BASE_URL}/ask-analyst`, {
                prompt: userQuery
            });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Failed to connect to the Analyst. Check if the server is running." }]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    return (
        <div style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: C.radiusMd,
            backdropFilter: 'blur(16px)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <div style={{
                    width: 28, height: 28,
                    background: 'rgba(99,102,241,0.15)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                }}>🤖</div>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary }}>
                        AI Productivity Analyst
                    </div>
                    <div style={{ fontSize: '11px', color: C.textMuted }}>
                        Ask questions about work patterns and productivity
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                maxHeight: '240px',
                overflowY: 'auto',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {messages.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '24px',
                        color: C.textMuted,
                        fontSize: '13px',
                    }}>
                        Ask me anything about employee productivity, work patterns, or capture statistics...
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                        <div style={{
                            maxWidth: '80%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user'
                                ? '16px 16px 4px 16px'
                                : '16px 16px 16px 4px',
                            background: msg.role === 'user'
                                ? 'rgba(99,102,241,0.20)'
                                : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.25)' : C.border}`,
                            color: C.textPrimary,
                            fontSize: '13px',
                            lineHeight: '1.6',
                        }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: msg.role === 'user' ? C.accentLight : C.textMuted, display: 'block', marginBottom: '4px' }}>
                                {msg.role === 'user' ? 'You' : 'AI'}
                            </span>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '16px 16px 16px 4px',
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${C.border}`,
                            color: C.textMuted,
                            fontSize: '13px',
                        }}>
                            Analyzing...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about employee productivity, work patterns..."
                        rows={1}
                        style={{
                            flex: 1,
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${C.border}`,
                            borderRadius: C.radiusMd,
                            color: C.textPrimary,
                            fontSize: '13px',
                            outline: 'none',
                            resize: 'none',
                            fontFamily: 'inherit',
                            lineHeight: '1.5',
                            transition: 'border-color 0.2s, background 0.2s',
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = 'rgba(99,102,241,0.40)';
                            e.target.style.background = 'rgba(99,102,241,0.06)';
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = C.border;
                            e.target.style.background = 'rgba(255,255,255,0.04)';
                        }}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={loading}
                        style={{
                            padding: '12px 18px',
                            background: loading ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                            color: loading ? C.textMuted : '#ffffff',
                            border: 'none',
                            borderRadius: C.radiusMd,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(99,102,241,0.30)',
                        }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalystChat;
