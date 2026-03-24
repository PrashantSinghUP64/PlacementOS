import { useState, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Company Intel 🏢 — PlacementOS" },
    { name: "description", content: "Research interview processes, salaries, and culture for any tech company" },
  ];
}

interface CompanyData {
  name: string;
  type: string;
  packageRange: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Very Hard";
  rating: number;
  about: string;
  techStack: string[];
  indiaOffices: string[];
  interviewProcess: { round: number; name: string; duration: string; difficulty: string }[];
  dsaTopics: string[];
  csTopics: string[];
  sampleQuestions: string[];
  salary: { fresher: string; twoToThree: string; fivePlus: string; joiningBonus: string; stockOptions: string };
  culture: { workLifeBalance: number; growth: number; tips: string[]; dosDonts: { dos: string[]; donts: string[] } };
  preparationChecklist: string[];
}

export default function CompanyResearch() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);

  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [savedCompanies, setSavedCompanies] = useState<any[]>([]);

  // Preparation checklist states
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (token) fetchSaved();
  }, [token]);

  const fetchSaved = async () => {
    try {
      const res = await apiFetch("/company-research", { token });
      if (res) setSavedCompanies(res as any);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateReadiness = () => {
    if (!company || company.preparationChecklist.length === 0) return 0;
    const total = company.preparationChecklist.length;
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  const researchCompany = async (nameToResearch: string = searchInput) => {
    if (!nameToResearch.trim()) return;
    setLoading(true);
    setError(null);
    setCompany(null);
    setCheckedItems({});
    setActiveTab(1);

    try {
      if (!window.puter?.ai?.chat) throw new Error("AI Engine offline.");

      const prompt = `You are an expert with deep knowledge of tech company hiring in India and globally.
Research this company for a student preparing for placement. Output strictly in JSON format. Do not use markdown backticks.

COMPANY: ${nameToResearch}

Return ONLY valid JSON exactly matching this structure:
{
  "name": "Google",
  "type": "MAANG",
  "packageRange": "20-45 LPA",
  "difficulty": "Very Hard",
  "rating": 5,
  "about": "Brief intro",
  "techStack": ["Python", "Go"],
  "indiaOffices": ["Bangalore"],
  "interviewProcess": [
    {"round": 1, "name": "Online Assessment", "duration": "90 min", "difficulty": "Medium"}
  ],
  "dsaTopics": ["Arrays"],
  "csTopics": ["OS"],
  "sampleQuestions": ["Question 1"],
  "salary": {
    "fresher": "X-Y LPA",
    "twoToThree": "X-Y LPA",
    "fivePlus": "X-Y LPA",
    "joiningBonus": "X LPA",
    "stockOptions": "Details"
  },
  "culture": {
    "workLifeBalance": 4,
    "growth": 5,
    "tips": ["Tip 1"],
    "dosDonts": {
      "dos": ["Do this"],
      "donts": ["Don't do this"]
    }
  },
  "preparationChecklist": ["Study X"]
}`;

      const parsedData = await callAIForJSON(prompt) as CompanyData;
      setCompany(parsedData);
      setSearchInput("");
      
    } catch (err) {
      console.error(err);
      setError(`Failed to research ${nameToResearch}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const saveCompany = async () => {
    if (!token || !company) return;
    try {
      await apiFetch("/company-research/save", {
        method: "POST",
        token,
        body: JSON.stringify({ companyName: company.name, researchData: company })
      });
      fetchSaved();
      alert(`${company.name} saved successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to save company");
    }
  };

  // Helper chips
  const POPULAR = ["Google", "Microsoft", "Amazon", "Flipkart", "TCS", "Infosys", "Zomato", "PhonePe", "Atlassian", "Uber"];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#042f2e] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">Company Intel 🏢</h1>
          <p className="text-xl text-teal-100 font-medium max-w-2xl mx-auto mb-10">
            Uncover interview processes, exact salary bands, and insider hiring secrets for any tech company.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); researchCompany(); }} className="relative max-w-2xl mx-auto shadow-2xl">
            <input 
              type="text" 
              placeholder="Search any company... eg Google, TCS, Zomato"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-6 pr-40 py-5 bg-white text-gray-900 rounded-2xl text-lg font-medium outline-none focus:ring-4 focus:ring-teal-500/50"
            />
            <button 
              type="submit" 
              disabled={loading || !searchInput.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-black rounded-xl transition-all shadow-md"
            >
              Research
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-3xl mx-auto">
            {POPULAR.map(name => (
              <button 
                key={name}
                onClick={() => researchCompany(name)}
                disabled={loading}
                className="px-4 py-2 bg-teal-900/60 hover:bg-teal-800 border border-teal-700/50 rounded-full text-sm font-bold transition-all text-teal-50"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-pulse border border-teal-100">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Gathering Intelligence...</h2>
            <p className="text-slate-500 font-bold">Scouring the web for interview processes, salaries, and secrets.</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 text-red-600 rounded-3xl shadow-xl p-8 text-center border border-red-200">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold">{error}</h2>
          </div>
        )}

        {/* PROFILE CARD */}
        {company && !loading && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
               <div className="relative z-10 w-full">
                 <div className="flex justify-between items-start w-full mb-3">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h2 className="text-4xl font-black tracking-tight text-gray-900">{company.name}</h2>
                       <span className="bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">{company.type}</span>
                     </div>
                     <p className="text-lg font-bold text-teal-600">Expected Package: {company.packageRange}</p>
                   </div>
                   <button onClick={saveCompany} className="p-3 bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-400 rounded-2xl transition-colors shadow-inner" title="Save Company">
                     🔖
                   </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 mt-6">
                   <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                     <span className="text-amber-500">⭐</span> {company.rating}/5 Rating
                   </div>
                   <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                     <span className="text-red-500">🎯</span> Difficulty: {company.difficulty}
                   </div>
                 </div>
               </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col md:flex-row">
              {/* Sidebar Tabs */}
              <div className="md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                {[
                  { id: 1, icon: '📊', label: 'Overview' },
                  { id: 2, icon: '⏱️', label: 'Interview Process' },
                  { id: 3, icon: '🧠', label: 'What They Ask' },
                  { id: 4, icon: '💰', label: 'Salary & Perks' },
                  { id: 5, icon: '🤝', label: 'Culture & Tips' },
                  { id: 6, icon: '✅', label: 'Prep Checklist' },
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left ${activeTab === t.id ? 'bg-white shadow-sm border border-gray-200 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'}`}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-8 md:p-10 min-h-[400px]">
                
                {/* 1. Overview */}
                {activeTab === 1 && (
                  <div className="animate-fade-in space-y-8">
                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">About</h3>
                      <p className="text-gray-700 font-medium leading-relaxed">{company.about}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.techStack.map(t => <span key={t} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 break-words">{t}</span>)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">India Offices</h3>
                      <div className="flex flex-wrap gap-2">
                        {company.indiaOffices.map(o => <span key={o} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border border-gray-200">{o}</span>)}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Interview Process */}
                {activeTab === 2 && (
                  <div className="animate-fade-in space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {company.interviewProcess.map((round, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-teal-500 text-white shadow font-black text-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ms-0 me-4 md:mx-auto">
                          {round.round}
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">{round.name}</h4>
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{round.duration}</span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">Difficulty: <span className="font-bold text-gray-700">{round.difficulty}</span></p>
                        </div>
                      </div>
                    ))}
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-[3rem] md:ml-[50%] md:translate-x-[2.5rem] mt-6 bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                      <p className="text-sm font-bold text-teal-800 text-center">⏱️ Process usually takes 2-4 weeks</p>
                    </div>
                  </div>
                )}

                 {/* 3. What They Ask */}
                 {activeTab === 3 && (
                  <div className="animate-fade-in space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span>💻</span> DSA Focus Areas</h3>
                        <ul className="space-y-2">
                          {company.dsaTopics.map(t => (
                            <li key={t} className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span className="text-teal-500">▸</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span>⚙️</span> CS Fundamentals</h3>
                        <ul className="space-y-2">
                          {company.csTopics.map(t => (
                            <li key={t} className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              <span className="text-teal-500">▸</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><span>❓</span> Real Interview Questions</h3>
                      <div className="space-y-3">
                        {company.sampleQuestions.map((q, i) => (
                           <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm relative overflow-hidden group">
                             <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-400 to-indigo-500"></div>
                             <p className="font-bold text-gray-800 text-[15px] pl-2">{q}</p>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Salary & Perks */}
                {activeTab === 4 && (
                  <div className="animate-fade-in space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center relative overflow-hidden">
                        <div className="text-4xl mb-2 opacity-20 absolute -right-2 -bottom-2">👶</div>
                        <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1 relative z-10">Fresher (SDE 1)</h3>
                        <p className="text-2xl font-black text-emerald-900 relative z-10">{company.salary.fresher}</p>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center relative overflow-hidden">
                        <div className="text-4xl mb-2 opacity-20 absolute -right-2 -bottom-2">👨‍💻</div>
                        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1 relative z-10">2-3 Years (SDE 2)</h3>
                        <p className="text-2xl font-black text-blue-900 relative z-10">{company.salary.twoToThree}</p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 text-center relative overflow-hidden">
                        <div className="text-4xl mb-2 opacity-20 absolute -right-2 -bottom-2">🧙‍♂️</div>
                        <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1 relative z-10">5+ Years (Senior)</h3>
                        <p className="text-2xl font-black text-purple-900 relative z-10">{company.salary.fivePlus}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-6">
                       <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                         <span className="text-2xl bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center border border-amber-200">🎁</span>
                         <div>
                           <h4 className="font-black text-gray-900">Joining Bonus / Sign-on</h4>
                           <p className="text-sm font-bold text-gray-600">{company.salary.joiningBonus}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="text-2xl bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center border border-indigo-200">📈</span>
                         <div>
                           <h4 className="font-black text-gray-900">Stock Options / RSUs</h4>
                           <p className="text-sm font-bold text-gray-600">{company.salary.stockOptions}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                 {/* 5. Culture & Tips */}
                 {activeTab === 5 && (
                  <div className="animate-fade-in space-y-8">
                    
                    <div className="flex items-center gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Work Life Balance</p>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-2xl ${s <= company.culture.workLifeBalance ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                        </div>
                      </div>
                      <div className="w-px h-12 bg-gray-200"></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Growth & Learning</p>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-2xl ${s <= company.culture.growth ? 'text-emerald-400' : 'text-gray-200'}`}>★</span>)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Insider Tips 💡</h3>
                      <div className="grid gap-3">
                         {company.culture.tips.map((t, i) => (
                           <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                             <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</span>
                             <p className="text-sm font-bold text-gray-700">{t}</p>
                           </div>
                         ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                        <h3 className="font-black text-green-800 mb-4 flex items-center gap-2"><span className="text-xl">✅</span> DO's</h3>
                        <ul className="space-y-3">
                          {company.culture.dosDonts.dos.map(d => (
                            <li key={d} className="text-sm font-bold text-green-900 flex items-start gap-2">
                              <span className="text-green-500 leading-tight">•</span> <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h3 className="font-black text-red-800 mb-4 flex items-center gap-2"><span className="text-xl">❌</span> DON'Ts</h3>
                        <ul className="space-y-3">
                          {company.culture.dosDonts.donts.map(d => (
                            <li key={d} className="text-sm font-bold text-red-900 flex items-start gap-2">
                              <span className="text-red-500 leading-tight">•</span> <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. Prep Checklist */}
                {activeTab === 6 && (
                  <div className="animate-fade-in relative">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                       <div>
                         <h3 className="text-xl font-black text-gray-900 mb-1">Your Readiness</h3>
                         <p className="text-sm font-bold text-gray-500">Check off items as you complete them.</p>
                       </div>
                       <div className="text-right">
                         <span className="text-3xl font-black text-teal-600">{calculateReadiness()}%</span>
                       </div>
                    </div>

                    <div className="space-y-3">
                       {company.preparationChecklist.map((item, i) => (
                          <label key={i} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${checkedItems[i] ? 'bg-teal-50/30 border-teal-200' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'}`}>
                             <div className="mt-0.5 shrink-0">
                               <input 
                                 type="checkbox" 
                                 checked={!!checkedItems[i]}
                                 onChange={() => setCheckedItems(prev => ({...prev, [i]: !prev[i]}))}
                                 className="w-5 h-5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500"
                               />
                             </div>
                             <p className={`font-bold text-[15px] select-none ${checkedItems[i] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item}</p>
                          </label>
                       ))}
                    </div>
                    
                    <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                       <h4 className="font-black text-amber-900 mb-2 flex items-center gap-2"><span>🎯</span> Bottom Line</h4>
                       <p className="text-sm font-bold text-amber-800 leading-relaxed">
                         {calculateReadiness() === 100 
                           ? `You are fully prepared! Go ahead and apply to ${company.name} with confidence. 🚀` 
                           : `You need to complete ${company.preparationChecklist.length - Object.values(checkedItems).filter(Boolean).length} more items before you are fully ready for ${company.name}. Keep grinding! 💪`
                         }
                       </p>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* SAVED COMPANIES LIST */}
        {!company && !loading && savedCompanies.length > 0 && (
          <div className="animate-fade-in-up mt-8">
            <h2 className="text-xl font-black text-slate-800 mb-4 px-2">Your Saved Research 🔖</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {savedCompanies.map((c) => (
                <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer relative group" onClick={() => { setCompany(c.researchData); setActiveTab(1); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-gray-900">{c.companyName}</h3>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">{c.researchData.difficulty}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-500 mb-4">{c.researchData.packageRange}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest truncate">{c.researchData.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
