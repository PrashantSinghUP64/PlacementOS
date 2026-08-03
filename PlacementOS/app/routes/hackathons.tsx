import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Hackathon Hub 🚀 — PlacementOS" },
    { name: "description", content: "Discover hackathons, find teammates, and get AI-powered winning strategies." },
  ];
}

const MOCK_HACKATHONS = [
  { id: "h1", name: "Smart India Hackathon (SIH)", org: "Govt of India", mode: "Hybrid", prize: "₹1,00,000+", tech: "Multiple", diff: "Intermediate", link: "https://www.sih.gov.in/", icon: "🇮🇳", deadline: "2026-10-15", startDate: "2026-12-01", domain: "Social Good", teamSize: "6 (Must have 1 female)", rules: "Open to all Indian colleges.", desc: "India's biggest hackathon solving govt ministry problem statements." },
  { id: "h2", name: "Flipkart Grid 6.0", org: "Flipkart", mode: "Online", prize: "₹3,00,000 + PPO", tech: "Web/ML", diff: "Advanced", link: "https://unstop.com/hackathons/flipkartgrid", icon: "🛒", deadline: "2026-09-01", startDate: "2026-09-10", domain: "E-Commerce", teamSize: "1-3", rules: "BTech 2026/2027 grads.", desc: "Flagship hack. Top performers get direct SDE internship/PPO." },
  { id: "h3", name: "MLH Global Hack Week", org: "Major League Hacking", mode: "Online", prize: "$5000", tech: "Any", diff: "Beginner", link: "https://mlh.io/", icon: "🌐", deadline: "2026-08-10", startDate: "2026-08-15", domain: "General", teamSize: "1-4", rules: "Beginner friendly. Open global.", desc: "Week long hacking, workshops, and networking. Huge resume boost." },
  { id: "h4", name: "Amazon ML Challenge", org: "Amazon", mode: "Online", prize: "₹5,00,000", tech: "Machine Learning", diff: "Advanced", link: "#", icon: "📦", deadline: "2026-11-20", startDate: "2026-12-05", domain: "AI/ML", teamSize: "2-4", rules: "Only ML problems.", desc: "Solve real dataset problems. High chances of AWS/Amazon interviews." },
  { id: "h5", name: "ETHIndia", org: "Devfolio", mode: "Offline (Bangalore)", prize: "$50,000+", tech: "Web3/Blockchain", diff: "Advanced", link: "https://ethindia.co/", icon: "⛓️", deadline: "2026-11-01", startDate: "2026-12-10", domain: "Web3", teamSize: "2-5", rules: "Strict selection process.", desc: "Asia's largest Ethereum hackathon. Free travel and stay if selected." },
  { id: "h6", name: "Code for Good", org: "JP Morgan", mode: "Hybrid", prize: "SDE Offer", tech: "Full Stack", diff: "Intermediate", link: "#", icon: "🏦", deadline: "2026-06-15", startDate: "2026-07-01", domain: "FinTech", teamSize: "4-6", rules: "Invite only based on coding test.", desc: "24hr hackathon for NGOs. Direct job offers given at the end." },
  { id: "h7", name: "Google Solution Challenge", org: "Google", mode: "Online", prize: "$3000", tech: "Google Cloud/Flutter", diff: "Intermediate", link: "#", icon: "🔴", deadline: "2026-01-30", startDate: "2026-02-15", domain: "UN SDGs", teamSize: "1-4", rules: "GDSC member required.", desc: "Solve 17 UN Sustainable Development Goals using Google tech." },
];

const MOCK_TEAMMATES = [
  { id: "t1", name: "Aarav Sharma", role: "Frontend Developer", skills: ["React", "Tailwind", "Figma"], college: "IIT Delhi", year: "3rd Year", exp: "2 Hackathons won" },
  { id: "t2", name: "Priya Singh", role: "Backend Developer", skills: ["Node.js", "MongoDB", "AWS"], college: "VIT Vellore", year: "4th Year", exp: "Flipkart Grid Finalist" },
  { id: "t3", name: "Kabir Das", role: "AI/ML Engineer", skills: ["Python", "TensorFlow", "FastAPI"], college: "NIT Warangal", year: "2nd Year", exp: "Kaggle Expert" },
  { id: "t4", name: "Sneha Reddy", role: "UI/UX Designer", skills: ["Figma", "Framer", "User Research"], college: "NIFT", year: "3rd Year", exp: "Multiple UI awards" },
];

export default function Hackathons() {
  const [activeTab, setActiveTab] = useState<"discover" | "tracker" | "team">("discover");
  
  // Filters
  const [filterMode, setFilterMode] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterDomain, setFilterDomain] = useState("All");
  const [search, setSearch] = useState("");

  // AI Modal
  const [aiModalTarget, setAiModalTarget] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Tracker State (LocalStorage)
  const [tracked, setTracked] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("placementos_hackathons");
    if (saved) setTracked(JSON.parse(saved));
  }, []);

  const toggleTrack = (hackathon: any, status: string = "Registered") => {
    let next: any[];
    if (tracked.find(t => t.id === hackathon.id)) {
      next = tracked.filter(t => t.id !== hackathon.id);
    } else {
      next = [...tracked, { ...hackathon, status }];
    }
    setTracked(next);
    localStorage.setItem("placementos_hackathons", JSON.stringify(next));
  };

  const filteredHacks = MOCK_HACKATHONS.filter(h => {
    if (filterMode !== "All" && !h.mode.includes(filterMode)) return false;
    if (filterDiff !== "All" && h.diff !== filterDiff) return false;
    if (filterDomain !== "All" && h.domain !== filterDomain) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.org.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const domains = Array.from(new Set(MOCK_HACKATHONS.map(h => h.domain)));

  const analyzeHackathon = async (hackathon: any) => {
    setAiModalTarget(hackathon);
    setAiAnalysis("");
    setAiLoading(true);
    try {
      const prompt = `Act as an expert Hackathon Mentor. Analyze the hackathon "${hackathon.name}" by "${hackathon.org}" (Domain: ${hackathon.domain}, Tech: ${hackathon.tech}).
      Provide a highly structured markdown response with:
      1. **Difficulty & PPO Chances**: Is this good for getting hired/internships?
      2. **Winning Strategy**: How to stand out.
      3. **Project Idea**: 1 highly innovative, winning project idea suited for this.
      4. **Tech Stack**: Best tools to build it in 48 hours.
      Keep it punchy, practical, and under 250 words.`;
      
      const res = await callAI(prompt);
      setAiAnalysis(res);
    } catch (err) {
      setAiAnalysis("🔥 **Winning Strategy**: Focus on a working prototype rather than perfect code. \n\n💡 **Idea**: Build a platform that solves a real localized issue. \n\n🚀 **PPO Chances**: High if you present business value.");
    } finally {
      setAiLoading(false);
    }
  };

  const isTracked = (id: string) => !!tracked.find(t => t.id === id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">Hackathon Hub 🚀</h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-8">
            Discover hackathons, find your dream team, and get AI-powered winning strategies to secure PPOs and cash prizes.
          </p>

          <div className="flex justify-center bg-white dark:bg-gray-900/10 p-1.5 rounded-2xl w-fit mx-auto border border-white/20 backdrop-blur-md">
            {[
              { id: "discover", label: "🔍 Discover", icon: "🌐" },
              { id: "tracker", label: "📊 My Tracker", icon: "📈" },
              { id: "team", label: "👥 Team Builder", icon: "🤝" }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.id ? "bg-white dark:bg-gray-900 text-slate-900 shadow-lg" : "text-white hover:bg-white dark:bg-gray-900/10"}`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">

        {/* --- TAB: DISCOVER --- */}
        {activeTab === "discover" && (
          <div className="animate-fade-in-up space-y-6">
            
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="text" 
                placeholder="🔍 Search hackathons or organizers..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none" 
              />
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="All">All Modes</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none">
                  <option value="All">All Domains</option>
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Hackathon List */}
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredHacks.length === 0 ? (
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-sm">
                  <span className="text-5xl mb-4 opacity-50 block">🕵️‍♂️</span>
                  <p className="font-bold text-gray-500 dark:text-gray-400">No hackathons match your filters.</p>
                </div>
              ) : (
                filteredHacks.map(h => (
                  <div key={h.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent dark:from-orange-900/20 rounded-bl-full -z-0"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">{h.icon}</div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-orange-600 transition-colors">{h.name}</h3>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{h.org}</p>
                          </div>
                        </div>
                        <button onClick={() => toggleTrack(h)} className="p-2 text-xl hover:scale-110 transition-transform">
                          {isTracked(h.id) ? '🔖' : <span className="grayscale opacity-30">🔖</span>}
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-5 line-clamp-2">{h.desc}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                        <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Mode & Team</p>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{h.mode} • {h.teamSize}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Prize Pool</p>
                          <p className="text-xs font-black text-green-600 dark:text-green-400">{h.prize}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Deadline</p>
                          <p className="text-xs font-bold text-red-600 dark:text-red-400">{h.deadline}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Tech/Domain</p>
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{h.domain}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => analyzeHackathon(h)} className="flex-1 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 font-bold rounded-xl text-sm transition-colors border border-orange-200 dark:border-orange-800/50">
                          🤖 AI Strategy
                        </button>
                        <a href={h.link} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-center font-bold rounded-xl text-sm transition-colors shadow">
                          Register ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB: TRACKER --- */}
        {activeTab === "tracker" && (
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 min-h-[60vh]">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">My Dashboard 📊</h2>
              
              {tracked.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4 opacity-50">📂</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Hackathons Tracked</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto mb-6">Bookmark hackathons from the Discover tab to build your hacking roadmap.</p>
                  <button onClick={() => setActiveTab("discover")} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md">Browse Hackathons</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tracked.map(t => (
                    <div key={t.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between bg-gray-50 dark:bg-gray-950">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{t.icon}</span>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-base">{t.name}</h4>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{t.startDate} • {t.mode}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <select 
                          value={t.status}
                          onChange={(e) => {
                            const next = tracked.map(item => item.id === t.id ? { ...item, status: e.target.value } : item);
                            setTracked(next);
                            localStorage.setItem("placementos_hackathons", JSON.stringify(next));
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer border ${t.status === 'Won' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : t.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                        >
                          <option value="Registered">Registered</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                          <option value="Won">Won 🏆</option>
                        </select>
                        <button onClick={() => toggleTrack(t)} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: TEAM BUILDER --- */}
        {activeTab === "team" && (
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Find Teammates 🤝</h2>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Connect with skilled developers to build your dream team.</p>
                </div>
                <button className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow w-full md:w-auto">
                  + Create Team Profile
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_TEAMMATES.map(tm => (
                  <div key={tm.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all text-center flex flex-col bg-gray-50 dark:bg-gray-950">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 border-2 border-white shadow-sm">
                      {tm.name.charAt(0)}
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white">{tm.name}</h3>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">{tm.role}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">{tm.college} • {tm.year}</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4 flex-1">
                      {tm.skills.map(s => <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">{s}</span>)}
                    </div>
                    
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 bg-gray-100 dark:bg-gray-900 py-1 rounded">Exp: {tm.exp}</div>
                    
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors">
                      Send Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      {aiModalTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in-up flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">🤖</span> AI Strategy: {aiModalTarget.name}
                </h2>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Generated by PlacementOS AI Analyst</p>
              </div>
              <button onClick={() => setAiModalTarget(null)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl custom-scrollbar">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4 shadow"></div>
                  <p className="text-orange-700 dark:text-orange-400 font-bold animate-pulse text-sm">Analyzing hackathon constraints & generating winning project ideas...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-orange max-w-none prose-sm font-medium leading-relaxed">
                  {/* Basic markdown rendering without external libraries by using whitespace-pre-wrap and some basic styling */}
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong class="text-orange-700 dark:text-orange-400 font-black">$1</strong>').replace(/\n/g, '<br/>')}}></div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 flex gap-3">
               <button onClick={() => setAiModalTarget(null)} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-bold rounded-xl transition-all">Close</button>
               {!isTracked(aiModalTarget.id) && (
                 <button onClick={() => { toggleTrack(aiModalTarget); setAiModalTarget(null); }} className="flex-[2] px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md">Add to Tracker 🔖</button>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
