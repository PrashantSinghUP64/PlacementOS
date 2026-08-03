import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Freelance Marketplace 💰 — PlacementOS" },
    { name: "description", content: "Find gigs, generate proposals, and track earnings." },
  ];
}

const MOCK_GIGS = [
  { id: "g1", title: "Looking for a React Native Developer for a Food App", client: "Startup (USA)", budget: "$1,500 - $3,000", type: "Fixed Price", platform: "Upwork", skills: ["React Native", "Firebase", "Redux"], desc: "Need an experienced dev to build the MVP of our food delivery app. Must have integrated Google Maps API before." },
  { id: "g2", title: "Build a modern landing page for my agency", client: "Design Agency (UK)", budget: "$500", type: "Fixed Price", platform: "Fiverr", skills: ["React", "Tailwind CSS", "Framer Motion"], desc: "I have the Figma design. I need it converted into a pixel-perfect React app with smooth animations." },
  { id: "g3", title: "Full Stack Developer for ongoing maintenance", client: "E-commerce Store (India)", budget: "$20 - $30 / hr", type: "Hourly", platform: "Upwork", skills: ["Node.js", "Express", "MongoDB", "React"], desc: "Looking for a reliable developer to help fix bugs and add new features to our MERN stack e-commerce store." },
  { id: "g4", title: "Python Scraper for Real Estate Data", client: "Real Estate Firm (Canada)", budget: "$300", type: "Fixed Price", platform: "Freelancer", skills: ["Python", "BeautifulSoup", "Selenium"], desc: "Need a script that can scrape property listings from specific websites daily and save to a CSV." },
  { id: "g5", title: "UI/UX Designer for SaaS Dashboard", client: "SaaS Startup (Aus)", budget: "$800 - $1,200", type: "Fixed Price", platform: "Upwork", skills: ["Figma", "UI/UX", "Wireframing"], desc: "We are building an analytics dashboard. Need clean, modern, dark-mode designs." },
];

export default function Freelancing() {
  const [activeTab, setActiveTab] = useState<"discover" | "aiTools" | "dashboard">("discover");
  
  // Discover Tab State
  const [filterSkill, setFilterSkill] = useState("");
  const [selectedGig, setSelectedGig] = useState<any>(null);
  
  // AI Match & Proposal State
  const [userProfile, setUserProfile] = useState("I am a 3rd year BTech student proficient in React, Tailwind, and Node.js.");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [proposalType, setProposalType] = useState("Short");
  
  // Profile Builder State
  const [bioSkills, setBioSkills] = useState("");
  const [aiBio, setAiBio] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  // Dashboard State (LocalStorage)
  const [earnings, setEarnings] = useState<any[]>([]);
  const [newEarning, setNewEarning] = useState({ project: "", amount: "", platform: "Upwork" });

  useEffect(() => {
    const saved = localStorage.getItem("placementos_earnings");
    if (saved) setEarnings(JSON.parse(saved));
  }, []);

  const addEarning = () => {
    if (!newEarning.project || !newEarning.amount) return;
    const next = [...earnings, { ...newEarning, id: Date.now().toString(), amount: parseInt(newEarning.amount) }];
    setEarnings(next);
    localStorage.setItem("placementos_earnings", JSON.stringify(next));
    setNewEarning({ project: "", amount: "", platform: "Upwork" });
  };

  const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);

  const filteredGigs = MOCK_GIGS.filter(g => {
    if (filterSkill && !g.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) && !g.title.toLowerCase().includes(filterSkill.toLowerCase())) return false;
    return true;
  });

  const analyzeGig = async (gig: any) => {
    setAiAnalysis("");
    setAiLoading(true);
    try {
      const prompt = `Act as an expert Upwork/Fiverr mentor. Analyze this gig: "${gig.title}" with description "${gig.desc}". 
      My profile: "${userProfile}".
      
      Generate a markdown response with:
      1. **Match Percentage**: Give a realistic % based on my skills.
      2. **Missing Skills**: What do I need to learn to win this?
      3. **Pricing Strategy**: What should I bid based on their budget of ${gig.budget}?
      4. **${proposalType} Proposal**: Write a ready-to-copy, highly converting ${proposalType} proposal for this gig. Keep it professional and focused on their problem.`;
      
      const res = await callAI(prompt);
      setAiAnalysis(res);
    } catch (err) {
      setAiAnalysis("🔥 **Match:** 85%\n\n💡 **Pricing:** Bid exactly in the middle of their range.\n\n📝 **Proposal:** Hi, I saw you need help with this project. I have extensive experience in this tech stack and can start immediately. Let's chat!");
    } finally {
      setAiLoading(false);
    }
  };

  const generateBio = async () => {
    setAiBio("");
    setBioLoading(true);
    try {
      const prompt = `Write a highly converting, SEO-optimized Upwork/Fiverr bio for a freelancer with these skills: ${bioSkills}. 
      Make it punchy, professional, and focus on the value provided to clients. Don't use generic words like "passionate". Under 150 words.`;
      const res = await callAI(prompt);
      setAiBio(res);
    } catch (err) {
      setAiBio("I am an expert developer specializing in building scalable, modern web applications. Let's bring your vision to life.");
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">Freelance AI Hub 💰</h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-8">
            Find high-paying gigs, generate winning proposals with AI, and track your global earnings.
          </p>

          <div className="flex justify-center bg-white dark:bg-gray-900/10 p-1.5 rounded-2xl w-fit mx-auto border border-white/20 backdrop-blur-md">
            {[
              { id: "discover", label: "🔍 Find Gigs", icon: "💼" },
              { id: "aiTools", label: "🤖 AI Tools", icon: "🛠️" },
              { id: "dashboard", label: "📈 Dashboard", icon: "💸" }
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
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
            
            {/* Gig List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
                <input 
                  type="text" 
                  placeholder="🔍 Filter by skill or title..." 
                  value={filterSkill} 
                  onChange={e => setFilterSkill(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>

              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredGigs.map(g => (
                  <div 
                    key={g.id} 
                    onClick={() => { setSelectedGig(g); setAiAnalysis(""); }}
                    className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border cursor-pointer transition-all ${selectedGig?.id === g.id ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-emerald-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${g.platform === 'Upwork' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : g.platform === 'Fiverr' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {g.platform}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{g.budget}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2">{g.title}</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      {g.skills.map(s => <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Panel */}
            <div className="lg:col-span-2">
              {selectedGig ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-6">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{selectedGig.title}</h2>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Client: {selectedGig.client} • Type: {selectedGig.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                      <p className="text-xl font-black text-emerald-600">{selectedGig.budget}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-8 leading-relaxed">
                    {selectedGig.desc}
                  </p>

                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-400 flex items-center gap-2">🤖 AI Match & Proposal Generator</h3>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 mt-1">Make sure your profile is updated before generating.</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <select value={proposalType} onChange={e => setProposalType(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold focus:outline-none">
                          <option value="Short">Short Pitch</option>
                          <option value="Long">Detailed Proposal</option>
                          <option value="Premium">Premium Expert Pitch</option>
                        </select>
                        <button onClick={() => analyzeGig(selectedGig)} disabled={aiLoading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shrink-0">
                          {aiLoading ? "Analyzing..." : "Generate 🚀"}
                        </button>
                      </div>
                    </div>
                    
                    {aiLoading ? (
                      <div className="flex flex-col items-center py-8">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-emerald-700 dark:text-emerald-500 font-bold animate-pulse text-sm">Matching skills & writing highly-converting proposal...</p>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="prose dark:prose-invert prose-emerald max-w-none prose-sm font-medium">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-700 dark:text-emerald-400 font-black">$1</strong>').replace(/\n/g, '<br/>')}}></div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-emerald-700 dark:text-emerald-600 font-bold">Click generate to let AI analyze this job and write your proposal.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center h-full flex flex-col items-center justify-center">
                  <span className="text-6xl mb-4 opacity-30">💼</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a Gig</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">Click on any freelance opportunity on the left to view details and generate AI proposals.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: AI TOOLS --- */}
        {activeTab === "aiTools" && (
          <div className="animate-fade-in-up grid md:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">👨‍💻 My Profile Context</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">This context is used by the AI to write your proposals.</p>
              
              <textarea 
                value={userProfile} 
                onChange={e => setUserProfile(e.target.value)}
                rows={6}
                className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none mb-4"
                placeholder="Describe your current skills, year of study, and past projects..."
              />
              <button className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow">
                Save Context
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">✨ AI Bio Generator</h2>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">Generate an SEO-optimized Fiverr/Upwork profile bio.</p>
              
              <input 
                type="text" 
                value={bioSkills} 
                onChange={e => setBioSkills(e.target.value)}
                placeholder="E.g., Next.js, UI/UX, Firebase"
                className="w-full p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
              />
              <button onClick={generateBio} disabled={bioLoading || !bioSkills.trim()} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow mb-6">
                {bioLoading ? "Writing Bio..." : "Generate Killer Bio 🚀"}
              </button>

              {aiBio && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {aiBio}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-10">
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-2">Total Earnings</p>
                  <h3 className="text-4xl font-black">${totalEarned.toLocaleString()}</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Projects Completed</p>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white">{earnings.length}</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Avg. per Project</p>
                  <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400">${earnings.length > 0 ? Math.round(totalEarned / earnings.length).toLocaleString() : 0}</h3>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Log New Earnings 💵</h2>
                  <div className="space-y-4">
                    <input type="text" placeholder="Project Name" value={newEarning.project} onChange={e => setNewEarning({...newEarning, project: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <div className="flex gap-4">
                      <input type="number" placeholder="Amount ($)" value={newEarning.amount} onChange={e => setNewEarning({...newEarning, amount: e.target.value})} className="flex-1 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                      <select value={newEarning.platform} onChange={e => setNewEarning({...newEarning, platform: e.target.value})} className="flex-1 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
                        <option>Upwork</option>
                        <option>Fiverr</option>
                        <option>Freelancer</option>
                        <option>Direct Client</option>
                      </select>
                    </div>
                    <button onClick={addEarning} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md">
                      Add to Dashboard +
                    </button>
                  </div>
                </div>

                <div className="flex-[2]">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Transaction History 📜</h2>
                  {earnings.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No earnings logged yet. Time to close your first client!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {[...earnings].reverse().map(e => (
                        <div key={e.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl">
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{e.project}</h4>
                            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">{e.platform}</span>
                          </div>
                          <span className="text-xl font-black text-emerald-600">+ ${e.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
