import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Salary Predictor — PlacementOS" },
    { name: "description", content: "Predict your market value with AI" },
  ];
}

interface SalaryPrediction {
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  currency: string;
  marketDemand: "High" | "Medium" | "Low";
  entryLevel: number;
  midLevel: number;
  seniorLevel: number;
  topCompanies: { name: string; avgSalary: number }[];
  skillsToAdd: string[];
  negotiationTips: string[];
  insight: string;
}

export default function SalaryPredictor() {
  const [role, setRole] = useState("Software Engineer");
  const [years, setYears] = useState(2);
  const [location, setLocation] = useState("Bangalore");
  const [education, setEducation] = useState("B.Tech");
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryPrediction | null>(null);

  const ROLES = ["Software Engineer", "Data Scientist", "Frontend Dev", "Backend Dev", "Full Stack Dev", "DevOps", "AI/ML Engineer", "Product Manager", "UI/UX Designer"];
  const LOCATIONS = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Remote", "USA", "UK", "Canada"];
  const EDU_LEVELS = ["10th", "12th", "Diploma", "B.Tech", "M.Tech", "MBA", "PhD", "Self-Taught"];

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills(skills.filter(i => i !== s));

  const formatCurrency = (val: number, cur: string) => {
    if (cur === "INR") {
      if (val >= 10000000) return `₹${(val/10000000).toFixed(1)}Cr`;
      if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const handlePredict = async () => {
    if (skills.length === 0) {
      setError("Please add at least one skill.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const prompt = `You are a salary expert with knowledge of Indian and global tech job markets.

JOB ROLE: ${role}
EXPERIENCE: ${years} years
LOCATION: ${location}
SKILLS: ${skills.join(', ')}
EDUCATION: ${education}

Return ONLY valid JSON:
{
  "minSalary": 800000,
  "maxSalary": 1400000,
  "avgSalary": 1100000,
  "currency": "INR",
  "marketDemand": "High",
  "entryLevel": 600000,
  "midLevel": 1100000,
  "seniorLevel": 2000000,
  "topCompanies": [
    {"name": "Google", "avgSalary": 2500000},
    {"name": "Microsoft", "avgSalary": 2200000},
    {"name": "Target", "avgSalary": 1800000}
  ],
  "skillsToAdd": ["System Design", "AWS", "Kubernetes"],
  "negotiationTips": ["Research market rates before negotiating", "Highlight scale of past projects"],
  "insight": "React developers in Bangalore command premium salaries due to startup boom."
}`;

      const parsed = await callAIForJSON(prompt) as SalaryPrediction;
      setResult(parsed);

    } catch (err: any) {
      console.error("AI Prediction Error:", err);
      setError(err.message || "Failed to predict salary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Navbar />
      
      {/* Header section */}
      <div className="bg-[#1E293B] text-white pb-24 pt-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/20 text-yellow-300 font-semibold text-sm mb-4 border border-yellow-500/30 shadow-sm">
            💰 Market Intelligence
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            AI Salary Predictor
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium">
            Discover your true market value based on real-time data, specific skills, and location trends.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column - Input Form */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Your Profile</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-medium">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  <span>Years of Experience</span>
                  <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">{years} YOE</span>
                </label>
                <input type="range" min="0" max="20" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium"><span>Fresher</span><span>Senior</span></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-medium">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Education Level</label>
                <select value={education} onChange={e => setEducation(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 transition-all text-sm font-medium">
                  {EDU_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Top Skills</label>
                <input 
                  type="text" 
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type a skill and press Enter..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 transition-all text-sm mb-3"
                />
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s} className="pl-3 pr-2 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="w-4 h-4 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg border border-red-100 flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <button
              onClick={handlePredict}
              disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                loading ? "bg-[#334155] cursor-wait" : "bg-[#0F172A] hover:bg-[#1E293B] hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? "Analyzing market data..." : "🎯 Predict My Salary"}
            </button>
          </div>

          {/* Right Column - Results Area */}
          <div className="lg:col-span-8">
            {result ? (
              <div className="space-y-6 animate-fade-in-up delay-100">
                
                {/* Top Insight Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-yellow-200 p-5 flex gap-4 items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="text-3xl relative z-10">💡</div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Market Insight</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{result.insight}</p>
                  </div>
                </div>

                {/* Hero Salary Range */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                  <div className="flex justify-center mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      result.marketDemand === 'High' ? 'bg-green-100 text-green-700' : 
                      result.marketDemand === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {result.marketDemand} Demand
                    </span>
                  </div>
                  <h2 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Estimated Annual Salary</h2>
                  <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-4 tracking-tighter pb-1">
                    {formatCurrency(result.minSalary, result.currency)} - {formatCurrency(result.maxSalary, result.currency)}
                  </div>
                  <p className="text-lg text-gray-500 font-medium">
                    Average: <span className="text-gray-900 dark:text-white font-black">{formatCurrency(result.avgSalary, result.currency)}</span>
                  </p>
                </div>

                {/* Level Breakdown Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: "Entry Level", value: result.entryLevel, sub: "0-2 Years", pattern: "bg-blue-50 dark:bg-blue-900/20/50" },
                    { title: "Mid Level", value: result.midLevel, sub: "3-5 Years", pattern: "bg-violet-50 dark:bg-violet-900/20/50" },
                    { title: "Senior Level", value: result.seniorLevel, sub: "6+ Years", pattern: "bg-emerald-50/50" }
                  ].map((lvl, i) => (
                    <div key={i} className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 ${lvl.pattern}`}>
                      <h3 className="text-sm font-bold text-gray-500 mb-1">{lvl.title}</h3>
                      <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1">{formatCurrency(lvl.value, result.currency)}</p>
                      <p className="text-xs text-gray-400 font-medium">{lvl.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Bottom Row: Companies & Tips */}
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Top Companies */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">🏢</div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Top Paying Companies</h3>
                    </div>
                    <div className="space-y-4">
                      {result.topCompanies.map((c, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                            <span className="w-5 text-gray-400 text-xs text-right">#{i+1}</span>
                            {c.name}
                          </span>
                          <span className="font-black text-gray-900 dark:text-white">{formatCurrency(c.avgSalary, result.currency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">Skills to increase salary</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skillsToAdd.map((s, i) => (
                          <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Tips */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">💬</div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Negotiation Strategy</h3>
                    </div>
                    <ul className="space-y-5 relative before:absolute before:inset-y-0 before:left-3 before:-ml-px before:w-0.5 before:bg-gray-100">
                      {result.negotiationTips.map((tip, i) => (
                        <li key={i} className="relative flex gap-4">
                          <div className="flex-none w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-purple-500 flex items-center justify-center -ml-0.5 z-10 shadow-sm text-[10px] font-black text-purple-600">
                            {i+1}
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-4xl mb-4 relative">
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                  </span>
                  💸
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Awaiting Your Data</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Fill in your profile details on the left and click predict. Our AI will analyze millions of data points to estimate your precise market value.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
