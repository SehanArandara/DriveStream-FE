import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, Phone, Clock } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

/* ── Suggested prompts shown before the user types ── */
const SUGGESTED_PROMPTS = [
  '🚗 Services for my Toyota Corolla',
  '📅 Are you free this weekend?',
  '💰 What are your prices?',
  '📞 How do I contact you?',
];

/* ── Renders message text with basic markdown-lite formatting ── */
const MessageText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="ds-chat-text">
      {lines.map((line, i) => {
        // Bold: **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          return <div key={i} className="ds-chat-bullet" dangerouslySetInnerHTML={{ __html: '&bull; ' + formatted.slice(2) }} />;
        }
        if (line.trim() === '') return <div key={i} style={{ height: '0.4rem' }} />;
        return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
};

/* ── Animated typing indicator ── */
const TypingDots = () => (
  <div className="ds-typing-indicator">
    <span /><span /><span />
  </div>
);

const ChatBotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      role: 'assistant',
      content: user
        ? `Welcome back! 👋 I'm DriveBot. I can see your active jobs and help you manage your bookings. What can I do for you today?`
        : `Hi there! 👋 I'm **DriveBot**, the AI assistant for DriveStream.\n\nI can help you explore our services, check availability, and guide you through booking. What would you like to know?`,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chat, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  const sendMsg = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    console.log('📩 [DriveBot UI] User sent:', text);

    try {
      const endpoint = user ? '/chatbot/message' : '/chatbot/public';
      const { data } = await api.post(endpoint, {
        message: text,
        history: chat.slice(1),
      });
      console.log('✅ [DriveBot UI] Bot reply received:\n', data.reply);
      setChat(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      console.error('❌ [DriveBot UI] Request failed:', err);
      setChat(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again or call us at **+94 11 234 5678**." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMsg(message);
  };

  const handleSuggestion = (prompt) => {
    // Strip emoji prefix
    const clean = prompt.replace(/^[\u{1F300}-\u{1FFFF}]\s*/u, '').trim();
    sendMsg(clean);
  };

  const showSuggestions = chat.length === 1 && !loading;

  return (
    <>
      {/* ── Inline Styles ── */}
      <style>{`
        .ds-chatbot-fab {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .ds-fab-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006aff, #0045cc);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 106, 255, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .ds-fab-btn:hover { transform: scale(1.08); box-shadow: 0 12px 30px rgba(0, 106, 255, 0.55); }

        .ds-fab-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid white;
          animation: ds-pulse 1.5s infinite;
        }
        @keyframes ds-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        .ds-fab-label {
          background: white;
          color: #006aff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          white-space: nowrap;
          animation: ds-fade-up 0.4s ease;
        }
        @keyframes ds-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Chat Window ── */
        .ds-chat-window {
          position: fixed;
          bottom: 7rem;
          right: 2rem;
          z-index: 1000;
          width: 380px;
          height: 560px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 106, 255, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: ds-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(0, 106, 255, 0.1);
        }
        @keyframes ds-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 440px) {
          .ds-chat-window { width: calc(100vw - 2rem); right: 1rem; bottom: 6rem; height: 70vh; }
        }

        /* ── Header ── */
        .ds-chat-header {
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #006aff 0%, #0045cc 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .ds-chat-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ds-bot-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .ds-bot-online {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid #006aff;
        }
        .ds-chat-title { color: white; font-weight: 700; font-size: 0.95rem; margin: 0; }
        .ds-chat-subtitle { color: rgba(255,255,255,0.75); font-size: 0.72rem; margin: 0; }
        .ds-header-actions { display: flex; gap: 0.5rem; }
        .ds-header-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .ds-header-btn:hover { background: rgba(255,255,255,0.25); }

        /* ── Info Banner ── */
        .ds-chat-banner {
          background: #eff6ff;
          border-bottom: 1px solid #dbeafe;
          padding: 0.5rem 1.25rem;
          display: flex;
          gap: 1.5rem;
          flex-shrink: 0;
        }
        .ds-banner-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: #3b82f6;
          font-weight: 600;
        }

        /* ── Messages Area ── */
        .ds-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background: #f8fafc;
          scroll-behavior: smooth;
        }
        .ds-chat-messages::-webkit-scrollbar { width: 4px; }
        .ds-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .ds-chat-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

        /* ── Message Bubbles ── */
        .ds-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }
        .ds-msg-row.user { flex-direction: row-reverse; }

        .ds-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .ds-msg-avatar.bot { background: linear-gradient(135deg, #006aff, #0045cc); color: white; }
        .ds-msg-avatar.usr { background: #e2e8f0; color: #64748b; }

        .ds-msg-bubble {
          max-width: 82%;
          padding: 0.75rem 1rem;
          border-radius: 16px;
          font-size: 0.875rem;
          line-height: 1.55;
        }
        .ds-msg-bubble.bot {
          background: white;
          color: #0f172a;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .ds-msg-bubble.user {
          background: linear-gradient(135deg, #006aff, #0050dd);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .ds-chat-text strong { font-weight: 700; }
        .ds-chat-bullet {
          padding-left: 0.5rem;
          margin: 0.15rem 0;
          display: flex;
          gap: 0.4rem;
        }
        .ds-msg-time {
          font-size: 0.65rem;
          opacity: 0.55;
          margin-top: 0.3rem;
          display: block;
          text-align: right;
        }
        .ds-msg-bubble.bot .ds-msg-time { text-align: left; }

        /* ── Typing Indicator ── */
        .ds-typing-indicator {
          display: flex;
          gap: 4px;
          padding: 0.2rem 0;
          align-items: center;
        }
        .ds-typing-indicator span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          animation: ds-bounce 1.2s infinite;
        }
        .ds-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .ds-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ds-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        /* ── Suggestions ── */
        .ds-suggestions {
          padding: 0 1.25rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex-shrink: 0;
          background: #f8fafc;
        }
        .ds-suggestion-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
        .ds-suggestion-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .ds-chip {
          background: white;
          border: 1.5px solid #e2e8f0;
          color: #334155;
          font-size: 0.73rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .ds-chip:hover { border-color: #006aff; color: #006aff; background: #eff6ff; transform: translateY(-1px); }

        /* ── Input Area ── */
        .ds-chat-input-area {
          padding: 0.85rem 1rem;
          border-top: 1px solid #f1f5f9;
          background: white;
          flex-shrink: 0;
        }
        .ds-chat-form { display: flex; gap: 0.5rem; align-items: center; }
        .ds-chat-input {
          flex: 1;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          background: #f8fafc;
        }
        .ds-chat-input:focus { border-color: #006aff; background: white; }
        .ds-chat-input::placeholder { color: #94a3b8; }
        .ds-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #006aff, #0045cc);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 12px rgba(0, 106, 255, 0.35);
        }
        .ds-send-btn:hover:not(:disabled) { transform: scale(1.07); }
        .ds-send-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
        .ds-input-footer { font-size: 0.62rem; color: #cbd5e1; text-align: center; margin-top: 0.5rem; }
      `}</style>

      {/* ── FAB Trigger ── */}
      <div className="ds-chatbot-fab">
        {!isOpen && (
          <>
            <span className="ds-fab-label">💬 Ask DriveBot</span>
            <button className="ds-fab-btn" onClick={handleOpen} id="drivebot-open-btn">
              <MessageSquare size={24} />
              {hasNewMessage && <span className="ds-fab-badge" />}
            </button>
          </>
        )}
        {isOpen && (
          <button className="ds-fab-btn" onClick={() => setIsOpen(false)} id="drivebot-close-btn">
            <X size={22} />
          </button>
        )}
      </div>

      {/* ── Chat Window ── */}
      {isOpen && !isMinimized && (
        <div className="ds-chat-window" id="drivebot-chat-window">

          {/* Header */}
          <div className="ds-chat-header">
            <div className="ds-chat-header-left">
              <div className="ds-bot-avatar">
                <Bot size={20} color="white" />
                <span className="ds-bot-online" />
              </div>
              <div>
                <p className="ds-chat-title">DriveBot AI</p>
                {/* <p className="ds-chat-subtitle">✨ Powered by Gemini · Always Online</p> */}
              </div>
            </div>
            <div className="ds-header-actions">
              <button className="ds-header-btn" onClick={() => setIsMinimized(true)} title="Minimize">
                <ChevronDown size={16} />
              </button>
              <button className="ds-header-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Info Banner */}
          {/* <div className="ds-chat-banner">
            <span className="ds-banner-item"><Clock size={11} /> Mon–Sat 8AM–6PM</span>
            <span className="ds-banner-item"><Phone size={11} /> +94 11 234 5678</span>
            <span className="ds-banner-item"><Sparkles size={11} /> AI-Powered</span>
          </div> */}

          {/* Messages */}
          <div className="ds-chat-messages">
            {chat.map((msg, i) => {
              const isBot = msg.role === 'assistant';
              const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              return (
                <div key={i} className={`ds-msg-row ${isBot ? 'bot' : 'user'}`}>
                  <div className={`ds-msg-avatar ${isBot ? 'bot' : 'usr'}`}>
                    {isBot ? <Bot size={14} /> : (user?.name?.[0] || 'U')}
                  </div>
                  <div className={`ds-msg-bubble ${isBot ? 'bot' : 'user'}`}>
                    <MessageText text={msg.content} />
                    <span className="ds-msg-time">{time}</span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="ds-msg-row bot">
                <div className="ds-msg-avatar bot"><Bot size={14} /></div>
                <div className="ds-msg-bubble bot">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts */}
          {showSuggestions && (
            <div className="ds-suggestions">
              <p className="ds-suggestion-label">Quick Questions</p>
              <div className="ds-suggestion-chips">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button key={i} className="ds-chip" onClick={() => handleSuggestion(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="ds-chat-input-area">
            <form className="ds-chat-form" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                className="ds-chat-input"
                placeholder="Ask about services, prices, availability..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                id="drivebot-input"
              />
              <button
                type="submit"
                className="ds-send-btn"
                disabled={!message.trim() || loading}
                id="drivebot-send-btn"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="ds-input-footer">DriveBot may make mistakes. Contact us to confirm details.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
