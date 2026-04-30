import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../lib/api';

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', content: 'Hi! I am DriveBot. How can I help you with your vehicle today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chat, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/message', { 
        message,
        conversationHistory: chat 
      });
      setChat(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="chatbot-toggle btn-primary" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window card animate-fade">
          <div className="chatbot-header">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span font-weight-600>DriveBot AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}>
              <X size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {chat.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                <div className="chat-content">{msg.content}</div>
              </div>
            ))}
            {loading && <div className="chat-bubble assistant">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBotWidget;
