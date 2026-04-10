import { useState, useEffect, useRef, useCallback } from "react";
import { callAI } from "~/lib/aiHelper";

const LS_KEY = "career_chatbot_history";
const LS_SEEN_KEY = "career_chatbot_seen";

const systemContext = `You are an expert career counselor 
for BTech CSE students from Tier 3 colleges in India.

You have knowledge of:
- Indian tech job market (TCS, Infosys, product companies)
- GATE exam and PSU recruitment (BHEL, NTPC, ONGC etc)
- Govt jobs for CSE graduates
- YouTube career as content creator
- Off-campus placement strategy
- DSA preparation roadmap
- Salary negotiation in India
- MBA after BTech
- MS abroad options
- Mental health and motivation
- Freelancing (Fiverr, Upwork)
- Free learning resources

RULES:
- Read the EXACT question and answer ONLY that
- Give DIFFERENT answer for DIFFERENT questions
- Be specific, not generic
- Respond in Hinglish (Hindi + English mix)
- Keep response under 150 words
- Use bullet points for lists
- Be honest and realistic
- Give actionable steps`;

const WELCOME_MSG = `Namaste! 👋 Main tumhara personal career guide hoon.

Main in saari cheezohn mein help kar sakta hoon:
• GATE exam guidance
• Govt jobs / PSU careers
• Placement vs higher studies
• YouTube channel advice
• Off-campus strategy
• Salary negotiation
• Any career confusion!

Koi bhi sawaal poochho — Hindi ya English mein! 😊`;

const QUICK_CHIPS = [
  "GATE dena chahiye ya nahi? 🎓",
  "PSU job kaise milega? 🏛️",
  "Govt job vs Private job ⚖️",
  "YouTube channel start karoon? 📺",
  "10 LPA kaise paayein? 💰",
  "Tier 3 college se FAANG possible? 🚀",
  "Kaunse YouTube channel follow karoon? 📱",
  "MBA karna chahiye ya nahi? 🎯",
  "Startup join karoon ya badi company? 🏢",
  "Off campus apply kaise karoon? 📝",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveHistory(msgs: Message[]) {
  // Keep last 40 messages only
  const trimmed = msgs.slice(-40);
  localStorage.setItem(LS_KEY, JSON.stringify(trimmed));
}

export default function CareerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retryPrompt, setRetryPrompt] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const history = loadHistory();
    setMessages(history);
    const seen = localStorage.getItem(LS_SEEN_KEY);
    if (!seen) setShowBadge(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(LS_SEEN_KEY, "1");
      setShowBadge(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (userMessage: string, isRetry = false) => {
    const trimmed = userMessage.trim();
    if (!trimmed || loading) return;

    let newMsgs = messages;
    if (!isRetry) {
      const userMsg: Message = { role: "user", content: trimmed, ts: Date.now() };
      newMsgs = [...messages, userMsg];
      setMessages(newMsgs);
      saveHistory(newMsgs);
      setInput("");
    }
    
    setLoading(true);
    setRetryCountdown(null);

    try {
      // Build conversation history for context (last 6 messages)
      const recentHistory = newMsgs.slice(-6)
        .map(m => `${m.role === "user" ? "Student" : "Counselor"}: ${m.content}`)
        .join('\n');

      const fullPrompt = `${systemContext}\n\nPrevious conversation:\n${recentHistory}\n\nStudent's new question: "${trimmed}"\n\nAnswer this specific question based on context above.`;

      const aiText = await callAI(fullPrompt);

      if (aiText.includes("⏳ AI service is currently busy")) {
        setRetryPrompt(trimmed);
        setRetryCountdown(60);
      } else {
        const assistantMsg: Message = { role: "assistant", content: aiText, ts: Date.now() };
        const updated = [...newMsgs, assistantMsg];
        setMessages(updated);
        saveHistory(updated);
      }
    } catch (error) {
      console.error(error);
      const errMsg: Message = {
        role: "assistant",
        content: "🔧 Something went wrong. Please try again in a moment.",
        ts: Date.now()
      };
      const updated = [...newMsgs, errMsg];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setTimeout(() => {
        setRetryCountdown(prev => prev! - 1);
      }, 1000);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
      // Auto-retry the original prompt
      sendMessage(retryPrompt, true);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCountdown, retryPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
        {/* Badge */}
        {showBadge && !isOpen && (
          <div className="bg-white dark:bg-gray-900 border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            Ask me anything! 💬
          </div>
        )}
        <button
          onClick={() => setIsOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform relative"
          aria-label="Open Career Guide Chatbot"
        >
          {isOpen ? "✕" : "🎓"}
          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-purple-50 dark:bg-purple-900/200/40 animate-ping" />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[999] w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-900/50 flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="font-black text-base leading-tight">Career Guide AI 🎓</h3>
              <p className="text-purple-200 text-xs font-medium">Your personal BTech career counselor</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearHistory}
                title="Clear chat"
                className="text-purple-200 hover:text-white text-xs font-bold hover:bg-white dark:bg-gray-900/20 px-2 py-1 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button onClick={() => setIsOpen(false)} className="text-purple-200 hover:text-white text-xl font-bold leading-none">
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-950">
            {/* Welcome */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30 rounded-2xl rounded-tl-none p-3 text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed whitespace-pre-line">
              {WELCOME_MSG}
            </div>

            {/* Quick chips (show only if no messages yet) */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-[11px] font-bold px-2.5 py-1.5 bg-white dark:bg-gray-900 dark:bg-gray-800 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-600 dark:hover:bg-purple-600 hover:text-white dark:hover:text-white transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* History */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none font-medium"
                      : "bg-white dark:bg-gray-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none font-medium shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-900 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm">
                  <span className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}

            {/* Retry Countdown Tracker */}
            {retryCountdown !== null && (
              <div className="flex justify-start">
                <div className="bg-orange-50 dark:bg-gray-900 border border-orange-200 dark:border-gray-700 text-orange-800 dark:text-orange-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm text-sm font-medium">
                  ⏳ AI service is currently busy. Retrying in {retryCountdown}s...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={handleKeyDown}
                  placeholder="Koi bhi sawaal poochho..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none focus:bg-white dark:bg-gray-900 dark:focus:bg-gray-800 dark:text-white"
                  disabled={loading}
                />
                <span className="absolute bottom-2 right-2 text-[10px] text-gray-400 dark:text-gray-500 font-bold">{input.length}/500</span>
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 rotate-90" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
