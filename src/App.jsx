import { useState, useRef, useEffect } from "react";

const BEAR_ASCII = "🐻";
const smokeFrames = ["·", "∘", "°", "˚", "·"];

export default function UlyssesChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "...Así que has encontrado la manera de hablar conmigo sin pasar por el capullo de Hugo. Interesante. Si te mandan Eva y Fran diles que son unos idiotas de mi parte. Bueno. ¿Qué quieres saber? No tengo todo el día",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [smokeIdx, setSmokeIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const messagesEndRef = useRef(null);
  const smokeInterval = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    smokeInterval.current = setInterval(() => {
      setSmokeIdx((i) => (i + 1) % smokeFrames.length);
    }, 400);
    return () => clearInterval(smokeInterval.current);
  }, []);

  const triggerGlitch = () => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 300);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    triggerGlitch();

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();
      const text =
        data.content?.find((b) => b.type === "text")?.text ||
        "...joder. Algo ha fallado.";

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Me cago en la puta. Se ha caído la conexión. Como todo en la vida de Hugo...",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.grain} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.bearWrapper}>
            <span style={styles.bearEmoji}>{BEAR_ASCII}</span>
            <span style={styles.smoke}>{smokeFrames[smokeIdx]}</span>
          </div>
          <div>
            <div style={styles.headerName}>ULYSSES</div>
            <div style={styles.headerSub}>oso de peluche · fumador · real</div>
          </div>
        </div>
        <div style={styles.headerStatus}>
          <span style={styles.statusDot} />
          en línea
        </div>
      </div>

      <div style={styles.divider} />

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.msgRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "assistant" && (
              <div style={styles.avatarSmall}>{BEAR_ASCII}</div>
            )}
            <div
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleBot),
                ...(i === messages.length - 1 &&
                msg.role === "assistant" &&
                glitch
                  ? styles.glitch
                  : {}),
              }}
            >
              {msg.content.split("\n").map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.content.split("\n").length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
            <div style={styles.avatarSmall}>{BEAR_ASCII}</div>
            <div
              style={{ ...styles.bubble, ...styles.bubbleBot, ...styles.typing }}
            >
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
              <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pregúntale algo a Ulysses..."
            style={styles.textarea}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendBtn,
              ...(loading || !input.trim() ? styles.sendBtnDisabled : {}),
            }}
          >
            ↑
          </button>
        </div>
        <div style={styles.footer}>cosas terribles · t1 · 2026</div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 2px; }
        textarea { resize: none; overflow: hidden; }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes glitchShift {
          0% { text-shadow: 1px 0 #c0392b, -1px 0 #2980b9; }
          50% { text-shadow: -2px 0 #c0392b, 2px 0 #2980b9; }
          100% { text-shadow: 1px 0 #c0392b, -1px 0 #2980b9; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes smokeFloat {
          0% { opacity: 0.8; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(1.4); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    background: "#080808",
    color: "#d4d0c8",
    fontFamily: "'IBM Plex Mono', monospace",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    maxWidth: "680px",
    margin: "0 auto",
  },
  grain: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 10,
    opacity: 0.6,
  },
  header: {
    padding: "20px 24px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#080808",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  bearWrapper: {
    position: "relative",
    fontSize: "32px",
    lineHeight: 1,
  },
  bearEmoji: {
    display: "block",
    filter: "grayscale(0.3) brightness(0.9)",
  },
  smoke: {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    fontSize: "10px",
    color: "#8a8680",
    animation: "smokeFloat 1.6s ease-out infinite",
    pointerEvents: "none",
  },
  headerName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "26px",
    letterSpacing: "4px",
    color: "#e8e4dc",
    lineHeight: 1,
  },
  headerSub: {
    fontSize: "10px",
    color: "#5a5650",
    letterSpacing: "2px",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "10px",
    color: "#5a5650",
    letterSpacing: "1px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#8a7a50",
    boxShadow: "0 0 6px #8a7a50",
    display: "inline-block",
  },
  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, #2a2a2a 20%, #2a2a2a 80%, transparent)",
    margin: "0 24px",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    animation: "fadeIn 0.25s ease-out",
  },
  avatarSmall: {
    fontSize: "20px",
    flexShrink: 0,
    marginBottom: "2px",
    filter: "grayscale(0.2)",
  },
  bubble: {
    maxWidth: "78%",
    padding: "12px 16px",
    borderRadius: "2px",
    fontSize: "13px",
    lineHeight: "1.7",
    letterSpacing: "0.3px",
  },
  bubbleBot: {
    background: "#111111",
    border: "1px solid #222222",
    color: "#ccc8be",
    borderBottomLeftRadius: "0px",
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
  },
  bubbleUser: {
    background: "#1a1a14",
    border: "1px solid #2e2e1e",
    color: "#a8a898",
    borderBottomRightRadius: "0px",
    textAlign: "right",
  },
  glitch: {
    animation: "glitchShift 0.3s steps(2) forwards",
  },
  typing: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "14px 18px",
    minWidth: "60px",
  },
  dot: {
    display: "inline-block",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#5a5650",
    animation: "dotPulse 1.4s ease-in-out infinite",
  },
  inputArea: {
    padding: "16px 20px 20px",
    borderTop: "1px solid #1a1a1a",
    background: "#080808",
  },
  inputWrapper: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#0f0f0f",
    border: "1px solid #252525",
    borderRadius: "2px",
    color: "#ccc8be",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "13px",
    padding: "12px 14px",
    outline: "none",
    lineHeight: "1.6",
    letterSpacing: "0.3px",
  },
  sendBtn: {
    background: "#1e1e14",
    border: "1px solid #3a3a20",
    color: "#a8a060",
    borderRadius: "2px",
    width: "42px",
    height: "42px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.3,
    cursor: "default",
  },
  footer: {
    marginTop: "10px",
    fontSize: "9px",
    color: "#2e2e2e",
    letterSpacing: "3px",
    textTransform: "uppercase",
    textAlign: "center",
  },
};
