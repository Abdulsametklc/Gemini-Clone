import React, { useState, useRef, useEffect } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { runGemini } from '../../config/gemini';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Main = ({ messages, setMessages }) => {
  const [prompt, setPrompt] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const hasChat = messages.length > 0;

  const handleSend = async () => {
    const p = prompt.trim();
    if (!p) return;

    setMessages(prev => [...prev, { sender: 'user', text: p }]);
    setPrompt('');
    setTyping(true);

    try {
      const res = await runGemini(p);

      // 403 / billing kapalı / yetki hatası yakalama
      const isServiceOff =
        res?.error?.code === 403 ||
        res?.error?.status === 'PERMISSION_DENIED' ||
        res?.error?.message?.toString?.().toLowerCase?.().includes('billing') ||
        res?.error?.message?.toString?.().toLowerCase?.().includes('disabled');

      if (isServiceOff) {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: '⚠️ Servis şu anda devre dışı (limit). Lütfen daha sonra tekrar deneyin.' }
        ]);
      } else {
        const text = res?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          setMessages(prev => [...prev, { sender: 'ai', text }]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: 'ai', text: 'Cevap alınamadı. Lütfen daha sonra tekrar deneyin.' }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
      const emsg = (e?.message || '').toLowerCase();
      const is403 =
        e?.status === 403 ||
        emsg.includes('403') ||
        emsg.includes('billing') ||
        emsg.includes('permission_denied');

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: is403
            ? '⚠️ Servis şu anda devre dışı (faturalama/limit). Lütfen daha sonra tekrar deneyin.'
            : 'Bir hata oluştu, tekrar deneyin.'
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className='main'>
      <div className="nav">
        <p>Gemini</p>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Tema değiştir">
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          <img src={assets.user_icon} alt="" />
        </div>
      </div>

      <div className="main-container">
        {!hasChat && (
          <>
            <div className="greet">
              <p><span>Hello, Dev.</span></p>
              <p>How can I help you today?</p>
            </div>

            <div className="cards">
              <div className="card">
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card">
                <p>Briefly summarize this concept: urban planning</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card">
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div className="card">
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </>
        )}

        {hasChat && (
          <div className="chat-box">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-message ${m.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            ))}

            {typing && (
              <div className="chat-message ai-message typing">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={endRef} />
          </div>
        )}

        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter a prompt here (max 500 chars)"
              value={prompt}
              onChange={(e) => {
                if (e.target.value.length <= 500) { // 500 karakter limiti
                  setPrompt(e.target.value);
                }
              }}
              onKeyDown={onKeyDown}
            />
            <div>
              <img
                src={assets.send_icon}
                alt="send"
                style={{ cursor: 'pointer' }}
                onClick={handleSend}
              />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'gray', marginTop: '4px' }}>
            {500 - prompt.length} characters left
          </p>
          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
