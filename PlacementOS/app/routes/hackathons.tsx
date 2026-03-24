import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Hackathon Finder 🏆 — PlacementOS" },
    { name: "description", content: "Find hackathons, prepare to win, and find team members" },
  ];
}

const HACKATHONS = [
  { name: "Smart India Hackathon (SIH)", org: "Govt of India", mode: "Offline", prize: "₹1 Lakh+", tech: "Any", diff: "Intermediate", link: "https://www.sih.gov.in/", icon: "🇮🇳", date: "Dec 2025 onwards", desc: "India's biggest hackathon. Problem statements from govt ministries." },
  { name: "HackerEarth Monthly Challenges", org: "HackerEarth", mode: "Online", prize: "₹10K-50K", tech: "Coding/ML", diff: "Beginner", link: "https://www.hackerearth.com/challenges/", icon: "💻", date: "Monthly", desc: "Regular coding challenges with job opportunities for winners." },
  { name: "Devfolio Hackathons", org: "Devfolio", mode: "Online/Offline", prize: "Various", tech: "Web3/Projects", diff: "Intermediate", link: "https://devfolio.co/hackathons", icon: "🔗", date: "Ongoing", desc: "India's largest hackathon platform — hundreds every month." },
  { name: "MLH Hackathons", org: "Major League Hacking", mode: "Online", prize: "$500-$5000", tech: "Varied", diff: "Any", link: "https://mlh.io/seasons/2025/events", icon: "🌐", date: "Weekly", desc: "International hackathons with global participants. Great for resume." },
  { name: "Flipkart Grid", org: "Flipkart", mode: "Online", prize: "Internship + Prize", tech: "Full Stack/ML", diff: "Advanced", link: "https://unstop.com/hackathons/flipkartgrid", icon: "🛒", date: "Sep-Nov", desc: "Flipkart's flagship competition. Internship for top performers." },
  { name: "Amazon ML Challenge", org: "Amazon", mode: "Online", prize: "₹5L + PPO", tech: "Machine Learning", diff: "Advanced", link: "https://www.hackerearth.com/challenges/", icon: "📦", date: "Jan-Mar", desc: "Pure ML challenge from Amazon. Pre-Placement Offer for winners." },
  { name: "TCS CodeVita", org: "TCS", mode: "Online", prize: "Job + ₹2L", tech: "Competitive Coding", diff: "Beginner to Advanced", link: "https://www.tcscodevita.com/", icon: "🏢", date: "Apr-Sep", desc: "TCS's global coding competition. Direct job offer for finalists." },
  { name: "HackWithInfy", org: "Infosys", mode: "Online", prize: "Job + ₹1L", tech: "Any", diff: "Beginner", link: "https://unstop.com/", icon: "💡", date: "Nov-Jan", desc: "Infosys hackathon for students. Internship + job for winners." },
  { name: "Google Solution Challenge", org: "Google", mode: "Online", prize: "$3000 + Trip", tech: "Google Tech", diff: "Intermediate", link: "https://developers.google.com/community/gdsc-solution-challenge", icon: "🔴", date: "Oct-Apr", desc: "Social impact + Google tech. Need GDSC membership. Huge recognition." },
  { name: "Unstop Competitions", org: "Unstop", mode: "Online", prize: "Varies", tech: "Any", diff: "All levels", link: "https://unstop.com/", icon: "🏅", date: "Daily", desc: "1000+ competitions. Great for beginners to build portfolio." },
];

const WIN_TIPS = [
  { t: "Team Composition", icon: "👥", tip: "Ideal team: 1 Frontend + 1 Backend + 1 ML/AI + 1 UI Design/Presentation. Each person must know at least 2 skills." },
  { t: "Problem Selection", icon: "🎯", tip: "Choose problem where you have some domain knowledge. Don't pick the most complex one — pick one you can actually solve in 24-48 hours." },
  { t: "48-Hour Schedule", icon: "⏰", tip: "Hour 1-4: Plan + Design. 4-16: Core features. 16-28: Polish + Testing. 28-36: Demo prep. 36-48: Buffer + presentation." },
  { t: "Winning Presentation", icon: "🎤", tip: "3 mins max. Show working demo first. Then explain tech. Then business impact. Judges care about: Does it work? Does it solve real problem?" },
  { t: "Common Mistakes", icon: "⚠️", tip: "Over-engineering. Not having a demo. No user research. Complex tech but no working product. Underestimating presentation." },
];

export default function Hackathons() {
  const [filter, setFilter] = useState({ mode: "All", diff: "All", search: "" });
  const [aiTips, setAiTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [hackType, setHackType] = useState("Web Development");

  const filtered = HACKATHONS.filter(h => {
    if (filter.mode !== "All" && !h.mode.includes(filter.mode)) return false;
    if (filter.diff !== "All" && !h.diff.includes(filter.diff)) return false;
    if (filter.search && !h.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const getAiTips = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Give 5 actionable winning tips for a ${hackType} hackathon for Indian BTech students. Be specific and practical. Format as numbered list.`);
      setAiTips(raw);
    } catch { setAiTips("AI busy hai. General tips: Plan first, demo matters most, working prototype > perfect code."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Hackathon Finder 🏆</h1>
          <p className="text-yellow-100 text-xl font-medium">Hackathons = fastest way to build portfolio + win prizes + get noticed by companies</p>
          <div className="flex justify-center gap-6 mt-5 text-sm font-bold text-yellow-100 flex-wrap">
            <span>🏆 10+ curated hackathons</span>
            <span>💰 Win up to ₹5L+ prizes</span>
            <span>🚀 PPO opportunities</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10 space-y-8">

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="🔍 Search hackathon..." value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-400 focus:outline-none" />
          <div className="flex gap-2 flex-wrap">
            {["All", "Online", "Offline"].map(m => (
              <button key={m} onClick={() => setFilter(f => ({ ...f, mode: m }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${filter.mode === m ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600"}`}>{m}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Beginner", "Intermediate", "Advanced"].map(d => (
              <button key={d} onClick={() => setFilter(f => ({ ...f, diff: d }))}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${filter.diff === d ? "bg-yellow-500 text-white border-yellow-500" : "border-gray-200 text-gray-600"}`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Hackathon Cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map(h => (
            <div key={h.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{h.icon}</span>
                    <div>
                      <h3 className="font-black text-gray-900 text-base leading-tight">{h.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">{h.org}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.mode.includes("Online") ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{h.mode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.diff === "Beginner" ? "bg-green-100 text-green-700" : h.diff === "Advanced" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{h.diff.split(" ")[0]}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-3">{h.desc}</p>
                <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">💰 {h.prize}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">🛠️ {h.tech}</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">📅 {h.date}</span>
                </div>
                <a href={h.link} target="_blank" rel="noreferrer"
                  className="block w-full text-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                  Register / View ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* How to Win */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-yellow-50 border-b border-yellow-100">
            <h2 className="text-xl font-black text-yellow-900">How to Win Hackathons 🏆</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100 p-0">
            {WIN_TIPS.map(tip => (
              <div key={tip.t} className="p-5">
                <div className="text-2xl mb-2">{tip.icon}</div>
                <h3 className="font-black text-gray-900 mb-2">{tip.t}</h3>
                <p className="text-sm text-gray-600 font-medium">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tips */}
        <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black mb-2">Get AI Tips for Your Hackathon Type 🤖</h2>
          <p className="text-yellow-100 text-sm mb-4">Specific prep tips based on what type of hackathon you're joining</p>
          <div className="flex gap-3 flex-wrap mb-4">
            {["Web Development", "Machine Learning", "Mobile App", "Blockchain / Web3", "Social Impact", "Competitive Coding"].map(t => (
              <button key={t} onClick={() => setHackType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${hackType === t ? "bg-white text-orange-600 border-white" : "border-white/40 text-white hover:border-white"}`}>{t}</button>
            ))}
          </div>
          <button onClick={getAiTips} disabled={loading} className="px-6 py-2.5 bg-white text-orange-600 font-black rounded-xl text-sm hover:bg-orange-50 disabled:opacity-60 transition-colors mb-4">
            {loading ? "Getting tips..." : "Get AI Tips 🤖"}
          </button>
          {aiTips && <div className="bg-white/20 rounded-xl p-4 whitespace-pre-wrap text-sm font-medium">{aiTips}</div>}
        </div>

      </div>
    </div>
  );
}
