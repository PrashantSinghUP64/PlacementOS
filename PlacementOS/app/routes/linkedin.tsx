import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "LinkedIn Optimizer — PlacementOS" },
    { name: "description", content: "Optimize your LinkedIn profile for recruiters" },
  ];
}

interface ActionItem {
  item: string;
  priority: "High" | "Medium" | "Low";
}

interface LinkedInAnalysis {
  overallScore: number;
  breakdown: {
    headline: number;
    about: number;
    skills: number;
    completeness: number;
    keywords: number;
  };
  optimizedHeadline: string;
  alternativeHeadlines: string[];
  improvedAbout: string;
  skillsToAdd: string[];
  skillsToRemove: string[];
  trendingSkills: string[];
  actionItems: ActionItem[];
}

export default function LinkedInOptimizer() {
  const [aboutText, setAboutText] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkedInAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState(1);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const ROLES = ["Software Engineer", "Data Scientist", "Frontend Dev", "Backend Dev", "Full Stack Dev", "Product Manager", "UI/UX Designer", "Data Analyst"];

  useEffect(() => {
    // Load checked items from local storage
    try {
      const saved = localStorage.getItem("linkedin-action-items");
      if (saved) setCheckedItems(JSON.parse(saved));
    } catch(e) {}
  }, []);

  const toggleCheck = (item: string) => {
    const newChecked = checkedItems.includes(item) 
      ? checkedItems.filter(i => i !== item)
      : [...checkedItems, item];
    setCheckedItems(newChecked);
    try { localStorage.setItem("linkedin-action-items", JSON.stringify(newChecked)); } catch(e) {}
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(p => ({ ...p, [id]: true }));
      setTimeout(() => setCopiedStates(p => ({ ...p, [id]: false })), 2000);
    } catch (err) {}
  };

  const handleOptimize = async () => {
    if (!aboutText.trim() || !currentTitle.trim() || !skills.trim()) {
      setError("Please fill in all profile fields to get a complete analysis.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setActiveTab(1);

    try {


      const prompt = `You are a LinkedIn optimization expert and career coach. Analyze this LinkedIn profile.

ABOUT SECTION: ${aboutText}
CURRENT TITLE: ${currentTitle}
SKILLS: ${skills}
TARGET ROLE: ${targetRole}

Return ONLY valid JSON:
{
  "overallScore": 65,
  "breakdown": {
    "headline": 15,
    "about": 12,
    "skills": 14,
    "completeness": 13,
    "keywords": 11
  },
  "optimizedHeadline": "Full Stack Developer | React & Node.js | Building Scalable Web Apps",
  "alternativeHeadlines": [
    "Software Engineer | MERN Stack | Open to New Opportunities",
    "React Developer | 2+ Years Experience | CSE Graduate 2025"
  ],
  "improvedAbout": "Passionate software engineer with expertise in...",
  "skillsToAdd": ["System Design", "Docker", "AWS"],
  "skillsToRemove": ["MS Office", "Typing"],
  "trendingSkills": ["Gen AI", "LangChain", "Vector Databases"],
  "actionItems": [
    {"item": "Add a professional headshot", "priority": "High"},
    {"item": "Write a compelling headline with keywords", "priority": "High"},
    {"item": "Add at least 5 featured projects", "priority": "Medium"}
  ]
}`;

      const parsed = await callAIForJSON(prompt) as LinkedInAnalysis;
      setResult(parsed);

    } catch (err: any) {
      console.error("AI Error:", err);
      setError(err.message || "Failed to analyze profile.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === "High") return "bg-red-100 text-red-700 border-red-200";
    if (p === "Medium") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const ScoreCircle = ({ score, label }: { score: number, label: string }) => {
    const cls = score >= 17 ? "text-emerald-500" : score >= 12 ? "text-yellow-500" : "text-red-500";
    return (
      <div className="flex flex-col items-center">
        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black ${cls} border-current bg-white dark:bg-gray-900 shadow-sm mb-2`}>
          {score}/20
        </div>
        <span className="text-xs font-bold text-gray-500">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] pb-20 font-sans">
      <Navbar />

      <div className="bg-[#0A66C2] text-white pb-32 pt-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
           <span className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-gray-900 text-[#0A66C2] font-black tracking-widest text-[10px] mb-4 shadow-sm uppercase">
             Profile Scanner
           </span>
           <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
             LinkedIn Optimizer
           </h1>
           <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium">
             Turn your LinkedIn profile into a recruiter magnet with personalized AI recommendations.
           </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                Your Profile Data
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Job Title</label>
                  <input value={currentTitle} onChange={e => setCurrentTitle(e.target.value)} placeholder="e.g. Frontend Developer" className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all text-sm"/>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
                  <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all text-sm font-medium">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 pr-2">LinkedIn About Section</label>
                  <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} placeholder="Paste your current About / Summary section here..." className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all resize-none text-sm leading-relaxed"/>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Top Skills Listed</label>
                  <textarea value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Node.js, Leadership, Agile..." className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] outline-none transition-all resize-none text-sm leading-relaxed"/>
                </div>
              </div>

              {error && (
                <div className="mt-5 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
            </div>
            
            <button
               onClick={handleOptimize}
               disabled={loading}
               className={`w-full py-4 font-bold text-white transition-all text-lg ${
                 loading ? "bg-[#084C91] cursor-wait" : "bg-[#0A66C2] hover:bg-[#084C91]"
               }`}
            >
               {loading ? "Analyzing profile..." : "✨ Optimize My LinkedIn"}
            </button>
          </div>

          {/* Right Results */}
          <div className="lg:col-span-8">
            {result ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up delay-100 flex flex-col min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar">
                  {[
                    { id: 1, label: "Score" },
                    { id: 2, label: "Headline" },
                    { id: 3, label: "About" },
                    { id: 4, label: "Skills" },
                    { id: 5, label: "Action Items" }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`flex-1 min-w-[100px] py-4 text-sm font-bold border-b-2 transition-all ${
                        activeTab === t.id ? "border-[#0A66C2] text-[#0A66C2] bg-white dark:bg-gray-900" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-white hover:bg-gray-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 flex-1">
                  
                  {/* TAB 1: Score */}
                  {activeTab === 1 && (
                    <div className="animate-fade-in text-center h-full flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Profile Optimization Score</h3>
                      
                      <div className="flex justify-center mb-12">
                        <div className="relative">
                          {/* Circular progress background */}
                          <svg className="w-48 h-48 transform -rotate-90">
                            <circle cx="96" cy="96" r="88" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                            <circle cx="96" cy="96" r="88" fill="none" stroke={result.overallScore >= 80 ? "#10B981" : result.overallScore >= 60 ? "#F59E0B" : "#EF4444"} strokeWidth="16" 
                                   strokeDasharray={2 * Math.PI * 88} 
                                   strokeDashoffset={2 * Math.PI * 88 * (1 - result.overallScore / 100)} 
                                   className="transition-all duration-1000 ease-out" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-gray-900 dark:text-white">{result.overallScore}</span>
                            <span className="text-sm font-bold text-gray-500 mt-1">/ 100</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        <ScoreCircle score={result.breakdown.headline} label="Headline" />
                        <ScoreCircle score={result.breakdown.about} label="About" />
                        <ScoreCircle score={result.breakdown.skills} label="Skills" />
                        <ScoreCircle score={result.breakdown.completeness} label="Completeness" />
                        <ScoreCircle score={result.breakdown.keywords} label="Keywords" />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Headline */}
                  {activeTab === 2 && (
                    <div className="animate-fade-in space-y-8">
                       <div>
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Your Current Headline</h3>
                         <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 line-through decoration-red-400/50">
                           {currentTitle}
                         </div>
                       </div>
                       
                       <div>
                         <h3 className="text-sm font-black text-[#0A66C2] uppercase tracking-wider mb-3 flex items-center gap-2">
                           ✨ Top Recommendation
                         </h3>
                         <div className="p-5 bg-[#E1F0FE] rounded-xl border border-blue-200">
                           <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">{result.optimizedHeadline}</p>
                           <button onClick={() => copyToClipboard(result.optimizedHeadline, 'head-main')} className="text-sm font-bold text-[#0A66C2] flex items-center gap-1 hover:underline">
                             {copiedStates['head-main'] ? "✓ Copied" : "📋 Copy Headline"}
                           </button>
                         </div>
                       </div>

                       <div>
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Alternative Options</h3>
                         <div className="space-y-3">
                           {result.alternativeHeadlines.map((h, i) => (
                             <div key={i} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl flex justify-between items-center group hover:border-[#0A66C2] transition-colors">
                               <p className="font-medium text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap flex-1 pr-4">{h}</p>
                               <button onClick={() => copyToClipboard(h, `head-alt-${i}`)} className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                                 {copiedStates[`head-alt-${i}`] ? "✓" : "📋"}
                               </button>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* TAB 3: About */}
                  {activeTab === 3 && (
                    <div className="animate-fade-in space-y-6">
                      <div className="flex justify-between items-center rounded-xl bg-[#E1F0FE] border border-blue-200 p-4">
                        <div>
                          <h3 className="text-sm font-black text-[#0A66C2] uppercase tracking-wider">✨ Optimized About Section</h3>
                          <p className="text-xs text-blue-700 mt-1">Structured for readability and rich in ATS keywords.</p>
                        </div>
                        <button onClick={() => copyToClipboard(result.improvedAbout, 'about')} className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg text-sm font-bold text-[#0A66C2] shadow-sm hover:shadow">
                          {copiedStates['about'] ? "✓ Copied" : "📋 Copy HTML/Text"}
                        </button>
                      </div>

                      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-serif">
                        {result.improvedAbout}
                      </div>

                      <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                         <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3">Original Version</h3>
                         <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 text-sm text-gray-500 whitespace-pre-wrap">
                           {aboutText}
                         </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Skills */}
                  {activeTab === 4 && (
                    <div className="animate-fade-in space-y-8">
                       <div className="grid md:grid-cols-2 gap-6">
                         
                         <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
                           <h3 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                             ✅ Skills to Add
                           </h3>
                           <div className="flex flex-wrap gap-2">
                             {result.skillsToAdd.map((s,i) => (
                               <span key={i} className="bg-white dark:bg-gray-900 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                                 + {s}
                               </span>
                             ))}
                             {result.skillsToAdd.length === 0 && <p className="text-sm text-emerald-600/70 italic">Your skills look perfect!</p>}
                           </div>
                         </div>

                         <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 p-5">
                           <h3 className="text-sm font-black text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                             ❌ Skills to Remove
                           </h3>
                           <div className="flex flex-wrap gap-2">
                             {result.skillsToRemove.map((s,i) => (
                               <span key={i} className="bg-white dark:bg-gray-900 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm line-through">
                                 {s}
                               </span>
                             ))}
                             {result.skillsToRemove.length === 0 && <p className="text-sm text-red-600/70 italic">No irrelevant skills found.</p>}
                           </div>
                         </div>

                       </div>

                       <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 p-5">
                         <h3 className="text-sm font-black text-[#0A66C2] uppercase tracking-wider mb-4 flex items-center gap-2">
                           📈 Trending in your industry
                         </h3>
                         <div className="flex flex-wrap gap-2">
                           {result.trendingSkills.map((s,i) => (
                             <span key={i} className="bg-[#0A66C2] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                               {s}
                             </span>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {/* TAB 5: Action Items */}
                  {activeTab === 5 && (
                    <div className="animate-fade-in space-y-4">
                      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Action Checklist</h3>
                          <p className="text-sm text-gray-500">Complete these items to boost your profile views.</p>
                        </div>
                        <div className="text-3xl font-black text-[#0A66C2]">
                          {checkedItems.length}<span className="text-lg text-gray-400">/{result.actionItems.length}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {result.actionItems.map((ai, i) => {
                          const isChecked = checkedItems.includes(ai.item);
                          return (
                            <div 
                              key={i} 
                              onClick={() => toggleCheck(ai.item)}
                              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                isChecked ? "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 opacity-70" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#0A66C2] shadow-sm"
                              }`}
                            >
                              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                                isChecked ? "bg-emerald-500 border-emerald-500" : "bg-white dark:bg-gray-900 border-gray-300"
                              }`}>
                                {isChecked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-semibold transition-colors ${isChecked ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                                  {ai.item}
                                </p>
                              </div>
                              <div className="shrink-0">
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${getPriorityColor(ai.priority)}`}>
                                  {ai.priority}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-[#E1F0FE] rounded-full flex items-center justify-center text-[#0A66C2] mb-6">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Optimize Your Profile</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Provide your current LinkedIn details on the left, and our AI will restructure your headline, rewrite your summary, and give you an actionable checklist to improve your visibility.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
