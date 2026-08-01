import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Certification Vault & Planner 🏅 — PlacementOS" },
    { name: "description", content: "Find the best IT certifications, plan your study, and track your progress." },
  ];
}

const MOCK_CERTS = [
  { id: "c1", name: "AWS Certified Solutions Architect – Associate", provider: "Amazon Web Services", domain: "Cloud Computing", cost: "$150", duration: "130 mins", validity: "3 Years", difficulty: "Intermediate", pattern: "65 Multiple Choice", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", icon: "☁️" },
  { id: "c2", name: "Google Data Analytics Professional Certificate", provider: "Coursera / Google", domain: "Data Science", cost: "Free / $39/mo", duration: "Self-paced", validity: "Lifetime", difficulty: "Beginner", pattern: "Module Quizzes + Capstone", url: "https://www.coursera.org/professional-certificates/google-data-analytics", icon: "📊" },
  { id: "c3", name: "Certified Kubernetes Administrator (CKA)", provider: "CNCF", domain: "DevOps", cost: "$395", duration: "120 mins", validity: "3 Years", difficulty: "Advanced", pattern: "Hands-on Command Line", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", icon: "🚢" },
  { id: "c4", name: "Meta Front-End Developer Professional", provider: "Coursera / Meta", domain: "Web Development", cost: "$39/mo", duration: "Self-paced", validity: "Lifetime", difficulty: "Beginner", pattern: "Assignments + Capstone", url: "https://www.coursera.org/professional-certificates/meta-front-end-developer", icon: "⚛️" },
  { id: "c5", name: "Microsoft Certified: Azure Fundamentals (AZ-900)", provider: "Microsoft", domain: "Cloud Computing", cost: "$99", duration: "45 mins", validity: "Lifetime", difficulty: "Beginner", pattern: "Multiple Choice", url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/", icon: "🪟" },
];

export default function Certifications() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "aiPlanner">("dashboard");
  
  // Dashboard & Vault State (LocalStorage)
  const [trackedCerts, setTrackedCerts] = useState<any[]>([]);
  const [newCert, setNewCert] = useState({ name: "", status: "In Progress", provider: "", completionDate: "" });

  useEffect(() => {
    const saved = localStorage.getItem("placementos_certs");
    if (saved) setTrackedCerts(JSON.parse(saved));
  }, []);

  const addCertToVault = () => {
    if (!newCert.name) return;
    const next = [...trackedCerts, { ...newCert, id: Date.now().toString() }];
    setTrackedCerts(next);
    localStorage.setItem("placementos_certs", JSON.stringify(next));
    setNewCert({ name: "", status: "In Progress", provider: "", completionDate: "" });
  };

  const updateCertStatus = (id: string, status: string) => {
    const next = trackedCerts.map(c => c.id === id ? { ...c, status } : c);
    setTrackedCerts(next);
    localStorage.setItem("placementos_certs", JSON.stringify(next));
  };

  const removeCert = (id: string) => {
    const next = trackedCerts.filter(c => c.id !== id);
    setTrackedCerts(next);
    localStorage.setItem("placementos_certs", JSON.stringify(next));
  };

  // AI Recommender / Planner State
  const [aiTarget, setAiTarget] = useState({ goal: "Cloud Engineer", skills: "Basic Linux, Networking", domain: "Cloud" });
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"Recommend" | "Plan">("Recommend");
  const [selectedCertForPlan, setSelectedCertForPlan] = useState<any>(null);

  const runAiTool = async () => {
    setAiResult("");
    setAiLoading(true);
    try {
      let prompt = "";
      if (aiMode === "Recommend") {
        prompt = `Act as an expert Career Counselor. Suggest the top 3 certifications for a student whose goal is "${aiTarget.goal}", current skills are "${aiTarget.skills}", and domain is "${aiTarget.domain}".
        Format in markdown. For each, give: 1. Name 2. Why it fits 3. Estimated ROI/Salary Impact.`;
      } else if (aiMode === "Plan" && selectedCertForPlan) {
        prompt = `Act as an expert Certification Tutor. Generate a strict 4-week study plan to pass the "${selectedCertForPlan.name}" by ${selectedCertForPlan.provider}.
        Format in markdown: Week 1-4 goals, Daily hours required, and a Revision Checklist.`;
      }
      
      if (!prompt) return;
      const res = await callAI(prompt);
      setAiResult(res);
    } catch (err) {
      setAiResult("🔥 **AI Error:** Looks like the server is busy. For Cloud Engineers, I highly recommend starting with AWS Cloud Practitioner or AZ-900, followed by the AWS Solutions Architect!");
    } finally {
      setAiLoading(false);
    }
  };

  // Stats
  const completedCount = trackedCerts.filter(c => c.status === "Completed").length;
  const inProgressCount = trackedCerts.filter(c => c.status === "In Progress").length;
  const expiredCount = trackedCerts.filter(c => c.status === "Expired").length;
  const total = trackedCerts.length;
  const successRate = total > 0 ? Math.round((completedCount / (completedCount + inProgressCount)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">Certification Vault 🏅</h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-8">
            Discover the highest ROI certifications, get AI study plans, and track your global credentials.
          </p>

          <div className="flex justify-center bg-white/10 p-1.5 rounded-2xl w-fit mx-auto border border-white/20 backdrop-blur-md">
            {[
              { id: "dashboard", label: "📊 Vault", icon: "🔐" },
              { id: "catalog", label: "📚 Catalog", icon: "🌐" },
              { id: "aiPlanner", label: "🤖 AI Planner", icon: "🧠" }
            ].map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === t.id ? "bg-white text-slate-900 shadow-lg" : "text-white hover:bg-white/10"}`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">

        {/* --- TAB: DASHBOARD / VAULT --- */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in-up">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase">Total</p>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-1">{total}</h3>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-sm font-bold text-green-100 uppercase">Completed</p>
                <h3 className="text-4xl font-black mt-1">{completedCount}</h3>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-sm font-bold text-blue-500 uppercase">In Progress</p>
                <h3 className="text-4xl font-black text-blue-600 mt-1">{inProgressCount}</h3>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase">Success Rate</p>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-1">{successRate}%</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">My Vault 🔐</h2>
              
              <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <input type="text" placeholder="Cert Name (e.g. AWS SAA-C03)" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} className="flex-[2] p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                <input type="text" placeholder="Provider (e.g. Amazon)" value={newCert.provider} onChange={e => setNewCert({...newCert, provider: e.target.value})} className="flex-1 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                <select value={newCert.status} onChange={e => setNewCert({...newCert, status: e.target.value})} className="flex-1 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Expired</option>
                </select>
                <button onClick={addCertToVault} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shrink-0">
                  Save to Vault
                </button>
              </div>

              {trackedCerts.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-5xl opacity-30 mb-4 block">🗄️</span>
                  <p className="text-gray-500 font-medium">Your vault is empty. Log your first certification above!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {trackedCerts.map(c => (
                    <div key={c.id} className="flex flex-col md:flex-row justify-between md:items-center p-5 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{c.name}</h4>
                        <p className="text-sm text-gray-500 font-medium">{c.provider || "Unknown Provider"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          value={c.status}
                          onChange={(e) => updateCertStatus(c.id, e.target.value)}
                          className={`text-xs font-bold px-4 py-2 rounded-lg outline-none cursor-pointer border ${c.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' : c.status === 'Expired' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                        >
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Expired</option>
                        </select>
                        <button onClick={() => removeCert(c.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: CATALOG --- */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in-up">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_CERTS.map(c => (
                  <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-4xl">{c.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${c.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' : c.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {c.difficulty}
                        </span>
                      </div>
                      <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 transition-colors">{c.name}</h3>
                      <p className="text-sm font-bold text-gray-500 mb-6">{c.provider}</p>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Domain</span>
                          <span className="font-bold text-gray-900 dark:text-white">{c.domain}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Cost</span>
                          <span className="font-bold text-gray-900 dark:text-white">{c.cost}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Duration</span>
                          <span className="font-bold text-gray-900 dark:text-white">{c.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Validity</span>
                          <span className="font-bold text-gray-900 dark:text-white">{c.validity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex gap-2">
                      <button onClick={() => { setActiveTab("aiPlanner"); setSelectedCertForPlan(c); setAiMode("Plan"); }} className="flex-[2] py-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl text-sm hover:bg-blue-200 transition-colors">
                        🧠 Generate Plan
                      </button>
                      <a href={c.url} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-center font-bold rounded-xl text-sm transition-colors shadow">
                        Link ↗
                      </a>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* --- TAB: AI PLANNER --- */}
        {activeTab === "aiPlanner" && (
          <div className="animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-10 flex flex-col lg:flex-row gap-8">
              
              <div className="flex-[1]">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">AI Copilot 🤖</h2>
                
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-950 rounded-xl">
                  <button onClick={() => { setAiMode("Recommend"); setAiResult(""); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${aiMode === 'Recommend' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'text-gray-500'}`}>Recommender</button>
                  <button onClick={() => { setAiMode("Plan"); setAiResult(""); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${aiMode === 'Plan' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'text-gray-500'}`}>Study Planner</button>
                </div>

                {aiMode === "Recommend" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Career Goal</label>
                      <input type="text" value={aiTarget.goal} onChange={e => setAiTarget({...aiTarget, goal: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Skills</label>
                      <input type="text" value={aiTarget.skills} onChange={e => setAiTarget({...aiTarget, skills: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Preferred Domain</label>
                      <select value={aiTarget.domain} onChange={e => setAiTarget({...aiTarget, domain: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Cloud Computing</option>
                        <option>Data Science</option>
                        <option>DevOps</option>
                        <option>Web Development</option>
                        <option>Cybersecurity</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-500">Select a certification from the Catalog to generate a study plan.</p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                      {selectedCertForPlan ? (
                        <div>
                          <p className="text-[10px] font-black uppercase text-blue-500 mb-1">Selected</p>
                          <h4 className="font-bold text-blue-900 dark:text-blue-300 leading-tight">{selectedCertForPlan.name}</h4>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-400">No Certification Selected</p>
                      )}
                    </div>
                  </div>
                )}

                <button onClick={runAiTool} disabled={aiLoading || (aiMode === 'Plan' && !selectedCertForPlan)} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-md">
                  {aiLoading ? "AI is thinking..." : aiMode === 'Recommend' ? 'Generate Career Path 🚀' : 'Generate Study Plan 📅'}
                </button>
              </div>

              <div className="flex-[2] bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 relative min-h-[400px]">
                {aiLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm z-10 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow"></div>
                    <p className="text-blue-600 font-bold animate-pulse text-sm">Consulting AI Knowledge Base...</p>
                  </div>
                ) : null}
                
                {aiResult ? (
                   <div className="prose dark:prose-invert prose-blue max-w-none prose-sm font-medium">
                     <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: aiResult.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600 dark:text-blue-400 font-black">$1</strong>').replace(/\n/g, '<br/>')}}></div>
                   </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <span className="text-6xl mb-4">✨</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Awaiting Instructions</h3>
                    <p className="text-gray-500 text-sm max-w-sm mt-2">Fill out the parameters on the left and hit generate to see the magic.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
