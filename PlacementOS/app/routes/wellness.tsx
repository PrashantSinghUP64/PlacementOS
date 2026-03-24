import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Wellness Corner 💚 — PlacementOS" },
    { name: "description", content: "Mental health support and motivation for BTech placement students" },
  ];
}

const MOODS = [
  { emoji: "😊", label: "Great", color: "bg-green-100 border-green-400 text-green-700" },
  { emoji: "😐", label: "Okay", color: "bg-yellow-100 border-yellow-400 text-yellow-700" },
  { emoji: "😟", label: "Stressed", color: "bg-orange-100 border-orange-400 text-orange-700" },
  { emoji: "😰", label: "Anxious", color: "bg-red-100 border-red-400 text-red-700" },
  { emoji: "😭", label: "Overwhelmed", color: "bg-purple-100 border-purple-400 text-purple-700" },
];

const QUOTES = [
  { q: "Rejection ek redirect hai, failure nahi.", by: "Priya, Tier 3 → Amazon" },
  { q: "DSA roz ek problem — 6 mahine mein top companies.", by: "Rahul, Backlog → Flipkart" },
  { q: "Off-campus se aya job mera best decision tha.", by: "Ankit, No campus job → Swiggy" },
  { q: "CGPA 6.5, phir bhi Zoho mera pehla call tha.", by: "Sneha, Pune → Zoho 9LPA" },
  { q: "Comparison mat karo — tumhara journey tumhara hai.", by: "Dev, IIT reject → Razorpay" },
];

const FEARS = [
  { f: "Mera kuch nahi hoga 😔", r: "TCS, Wipro, Infosys lete hain tier 3 se. Off-campus year-round hoti hain. Skills build karo — opportunities aayengi.", a: "Aaj AMCAT profile banao." },
  { f: "Sab mujhse aage hain 😰", r: "LinkedIn pe sirf success dikhti hai — struggle nahi. Dusron ki placement tumhari devaluation nahi. Progress track karo.", a: "DSA Tracker kholo — apna graph dekho." },
  { f: "Family pressure bahut hai 😤", r: "Weekly update do. GitHub/LeetCode profile dikhao. Timeline explain karo — 4-6 months normal hai.", a: "Is hafte resume family ko dikhao." },
  { f: "Main intelligent nahi hoon 😟", r: "Coding sikhna language sikhne jaisa hai — time lagta hai. Consistency beats talent. 1 problem daily = 365/year.", a: "Striver ka pehla problem aaj solve karo." },
  { f: "Placement nahi hui to log kya bolenge 😱", r: "Log ek hafte mein bhool jaate hain. Off-campus mein zyada jobs hain. Skills > placement label.", a: "LinkedIn optimize karo. Daily apply karo." },
];

const STORIES = [
  { n: "Priya Sharma", bg: "Govt college, Bihar. CGPA 7.2.", ch: "2 Amazon rejections in final year.", did: "Striver sheet — 5 months. 50+ companies applied.", r: "Amazon SDE-1 at ₹32 LPA 🎉", c: "border-l-green-500" },
  { n: "Rahul Verma", bg: "Tier 3 college, Lucknow. 3 backlogs.", ch: "Most companies rejected due to backlogs.", did: "Cleared all backlogs. DSA from scratch.", r: "12 LPA at L&T Infotech via AMCAT 💪", c: "border-l-blue-500" },
  { n: "Ankit Gupta", bg: "No campus placements college.", ch: "Zero experience, zero placement.", did: "freeCodeCamp + 200 LinkedIn applications.", r: "Swiggy via referral at ₹14 LPA 🚀", c: "border-l-orange-500" },
];

const HABITS = [
  "Aaj ek DSA problem solve ki ✅",
  "30 min kuch naya seekha",
  "Ek job apply kiya ya connection banaya",
  "Pani khub piya",
  "Study ke beech breaks liye",
  "Ek cheez ke liye grateful hoon aaj",
];

const BURNOUT_QS = [
  "Main subah uthne ke baad bhi thaka hoon",
  "Coding ya padhne ka mann nahi karta",
  "Main dusron se apna comparison karta hun",
  "Mujhe lag raha hai mehnat ka koi fayda nahi",
  "Mujhe bahut anxiety feel hoti hai future se",
  "Main social ho gaya hoon",
  "Main plan karta hoon but complete nahi karta",
  "Neend aane mein problem hoti hai",
];

export default function Wellness() {
  const [mood, setMood] = useState<number | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [expandedFear, setExpandedFear] = useState<number | null>(null);
  const [habits, setHabits] = useState<boolean[]>(Array(HABITS.length).fill(false));
  const [burnoutAnswers, setBurnoutAnswers] = useState<number[]>([]);
  const [burnoutDone, setBurnoutDone] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Breathe In");
  const [breathCount, setBreathCount] = useState(4);

  const startBreathing = () => {
    setBreathing(true);
    const phases = ["Breathe In", "Hold", "Breathe Out", "Hold"];
    let pi = 0; let c = 4;
    setBreathPhase(phases[pi]); setBreathCount(c);
    const t = setInterval(() => {
      c--;
      if (c <= 0) { pi = (pi + 1) % 4; c = 4; setBreathPhase(phases[pi]); }
      setBreathCount(c);
    }, 1000);
    setTimeout(() => { clearInterval(t); setBreathing(false); setBreathPhase("Done! 🌟"); }, 30000);
  };

  const handleBurnout = (score: number) => {
    const a = [...burnoutAnswers, score];
    setBurnoutAnswers(a);
    if (a.length >= BURNOUT_QS.length) setBurnoutDone(true);
  };

  const burnoutScore = burnoutAnswers.reduce((a, b) => a + b, 0);
  const bl = burnoutScore >= 16 ? "High" : burnoutScore >= 8 ? "Moderate" : "Low";

  const sendChat = async () => {
    if (!chatMsg.trim() || chatLoading) return;
    setChatLoading(true);
    try {
      const moodLabel = mood !== null ? MOODS[mood].label : "stressed";
      const raw = await callAI(`Student mood: ${moodLabel}. Message: "${chatMsg}". You are an empathetic counselor for Indian BTech students. Respond in Hinglish warmly. Max 80 words. End with encouragement.`);
      setChatReply(raw);
    } catch { setChatReply("Teri baat samajh aayi 💙 Sab theek hoga — ek din ek step!"); }
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 pb-20 font-sans">
      <Navbar />
      <div className="bg-gradient-to-br from-green-700 to-teal-600 text-white pt-16 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Wellness Corner 💚</h1>
          <p className="text-green-100 text-xl font-medium">"Placement stress real hai — but so is your strength."</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-10 space-y-8">

        {/* Mood */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">How are you feeling today? 🌤️</h2>
          <div className="flex gap-3 flex-wrap">
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)}
                className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 font-bold text-sm transition-all ${mood === i ? m.color + " scale-105 shadow" : "border-gray-200 bg-gray-50"}`}>
                <span className="text-3xl mb-1">{m.emoji}</span>{m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Relief */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Breathing */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 flex flex-col items-center">
            <h3 className="font-black text-gray-900 mb-1 self-start">Box Breathing 🌬️</h3>
            <p className="text-xs text-gray-500 mb-4 self-start">4-4-4-4 technique reduces anxiety instantly</p>
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 transition-all duration-1000 ${breathing ? "bg-blue-100 scale-110" : "bg-gray-100"}`}>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-700">{breathCount}</div>
                <div className="text-[10px] font-bold text-gray-500">{breathing ? breathPhase : "Press Start"}</div>
              </div>
            </div>
            <button onClick={startBreathing} disabled={breathing}
              className="px-5 py-2 bg-blue-600 disabled:bg-gray-300 text-white font-bold rounded-xl text-sm transition-colors">
              {breathing ? "Breathing..." : "▶ Start"}
            </button>
          </div>

          {/* Motivation */}
          <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-5 flex flex-col">
            <h3 className="font-black text-gray-900 mb-1">Quick Motivation ⚡</h3>
            <p className="text-xs text-gray-500 mb-3">Real tier 3 students who made it</p>
            <div className="flex-1 bg-yellow-50 rounded-xl p-4 flex flex-col justify-center mb-3">
              <p className="text-gray-800 font-bold italic mb-2">"{QUOTES[quoteIdx].q}"</p>
              <p className="text-xs text-yellow-700 font-bold">— {QUOTES[quoteIdx].by}</p>
            </div>
            <button onClick={() => setQuoteIdx(q => (q + 1) % QUOTES.length)}
              className="w-full py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold text-sm rounded-xl transition-colors">↻ New Quote</button>
          </div>

          {/* Habits */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
            <h3 className="font-black text-gray-900 mb-1">Daily Habits ✅</h3>
            <p className="text-xs text-gray-500 mb-3">{habits.filter(Boolean).length}/{HABITS.length} done today</p>
            <div className="space-y-2">
              {HABITS.map((h, i) => (
                <label key={i} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${habits[i] ? "bg-teal-50 text-gray-400 line-through" : "text-gray-700 hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={habits[i]} onChange={() => { const a = [...habits]; a[i] = !a[i]; setHabits(a); }} className="w-4 h-4 text-teal-600 rounded" />
                  {h}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Common Fears */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-xl font-black text-indigo-900">Common Fears — Honest Answers 🧠</h2>
          </div>
          {FEARS.map((f, i) => (
            <div key={i} className="border-b border-gray-50 last:border-0">
              <button onClick={() => setExpandedFear(expandedFear === i ? null : i)}
                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition-colors font-black text-gray-800">
                {f.f} <span className={`text-gray-400 text-xl transition-transform ${expandedFear === i ? "rotate-180" : ""}`}>▾</span>
              </button>
              {expandedFear === i && (
                <div className="px-4 pb-4 bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium mb-3 italic">{f.r}</p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">Aaj ka action</p>
                    <p className="text-sm font-bold text-indigo-900">{f.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Real Success Stories 🏆</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {STORIES.map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl border-l-4 ${s.c} shadow-sm p-5 text-sm`}>
                <h3 className="font-black text-gray-900 mb-2">{s.n}</h3>
                <p className="text-gray-500 mb-1"><span className="font-black">Background: </span>{s.bg}</p>
                <p className="text-gray-500 mb-1"><span className="font-black">Challenge: </span>{s.ch}</p>
                <p className="text-gray-500 mb-2"><span className="font-black">Action: </span>{s.did}</p>
                <div className="bg-green-50 rounded-xl p-2"><span className="font-black text-green-700">{s.r}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Burnout Detector */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Burnout Detector 🔍</h2>
          {!burnoutDone ? (
            burnoutAnswers.length < BURNOUT_QS.length ? (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Q{burnoutAnswers.length + 1}/{BURNOUT_QS.length}</p>
                <p className="font-bold text-gray-900 mb-4">{BURNOUT_QS[burnoutAnswers.length]}</p>
                <div className="flex flex-wrap gap-2">
                  {["Kabhi nahi (0)", "Kabhi kabhi (1)", "Aksar (2)", "Hamesha (3)"].map((o, j) => (
                    <button key={j} onClick={() => handleBurnout(j)}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-bold text-sm rounded-xl transition-colors">{o}</button>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-2">{bl === "High" ? "😰" : bl === "Moderate" ? "😐" : "😊"}</div>
              <h3 className="text-2xl font-black mb-1">Burnout: {bl}</h3>
              <div className={`mt-3 p-4 rounded-xl text-sm font-bold text-left ${bl === "High" ? "bg-red-50 text-red-800" : bl === "Moderate" ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-800"}`}>
                {bl === "High" && "⚠️ 2-3 din break lo. Walk, sleep, family. Mental health > placement."}
                {bl === "Moderate" && "⚡ Daily 1 break lo. Weekly 1 full rest day. Marathon hai sprint nahi."}
                {bl === "Low" && "✅ Acha kar rahe ho! Consistency banaya rakho."}
              </div>
              <button onClick={() => { setBurnoutAnswers([]); setBurnoutDone(false); }} className="mt-4 px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm">Retake</button>
            </div>
          )}
        </div>

        {/* AI Chat */}
        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black mb-1">Baat Karo — AI Sunata Hai 💬</h2>
          <p className="text-green-100 text-sm mb-4">Jo mann mein hai keh do — Hinglish mein. Empathetic jawab milega.</p>
          <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} rows={3}
            placeholder="Jo feel kar rahe ho woh likh do..."
            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-green-200 text-sm font-medium mb-3 focus:outline-none resize-none" />
          {chatReply && <div className="bg-white/20 rounded-xl p-3 mb-3 text-sm font-medium">{chatReply}</div>}
          <button onClick={sendChat} disabled={chatLoading || !chatMsg.trim()}
            className="px-6 py-2.5 bg-white text-green-700 font-black rounded-xl text-sm hover:bg-green-50 disabled:opacity-60 transition-colors">
            {chatLoading ? "Thinking..." : "Send 💙"}
          </button>
        </div>

      </div>
    </div>
  );
}
