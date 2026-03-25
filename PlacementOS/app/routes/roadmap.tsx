import { useState, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "AI Roadmap Generator — PlacementOS" },
    { name: "description", content: "Your personalized dynamic placement syllabus" },
  ];
}

interface Topic {
  name: string;
  hours: number;
  youtubeLink: string;
  docLink: string;
  practice: string;
  completed: boolean;
}

interface Week {
  week: number;
  theme: string;
  hours: number;
  milestone: string;
  topics: Topic[];
}

interface Phase {
  phase: number;
  name: string;
  duration: string;
  weeks: Week[];
}

interface RoadmapData {
  title: string;
  totalWeeks: number;
  keyMilestones: string[];
  phases: Phase[];
  overallProgress: number;
}

export default function RoadmapGenerator() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);
  
  // Inputs
  const [targetRole, setTargetRole] = useState("Full Stack Dev");
  const [targetCompany, setTargetCompany] = useState("Tier 1 (MAANG)");
  const [targetPackage, setTargetPackage] = useState("15-25 LPA");
  const [duration, setDuration] = useState("3 months");
  const [dailyHours, setDailyHours] = useState(3);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      apiFetch("/roadmap", { token })
        .then(res => {
          // Only set if it looks like a valid roadmap (has phases array)
          if (res && Array.isArray((res as any).phases)) setRoadmap(res as any);
        })
        .catch(err => console.error("No existing roadmap", err));
    }
  }, [token]);

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter(i => i !== s));

  const generateRoadmap = async () => {
    if (!token) return setError("Please login first.");
    setLoading(true);
    setError(null);

    try {
      const prompt = `You are an expert career roadmap creator for Indian tech students.
Create a detailed week-by-week roadmap strictly in JSON format. Do not use markdown backticks around the json.

TARGET ROLE: ${targetRole}
TARGET COMPANY: ${targetCompany}
TARGET PACKAGE: ${targetPackage}
CURRENT SKILLS: ${skills.join(', ')}
DURATION: ${duration}
DAILY HOURS: ${dailyHours}

Return ONLY valid JSON matching this structure perfectly without any markdown block formatting:
{
  "title": "Full Stack Developer Roadmap — 3 Months",
  "phases": [
    {
      "phase": 1,
      "name": "Foundation",
      "duration": "Week 1-3",
      "weeks": [
        {
          "week": 1,
          "theme": "JavaScript Fundamentals",
          "hours": 21,
          "topics": [
            {
              "name": "ES6+ Features",
              "hours": 4,
              "youtubeLink": "Akshay Saini — Namaste JavaScript",
              "docLink": "MDN JavaScript Guide",
              "practice": "Build 3 small JS programs",
              "completed": false
            }
          ],
          "milestone": "Complete 5 JS problems"
        }
      ]
    }
  ],
  "totalWeeks": 12,
  "keyMilestones": [
    "Week 3: First project deployed"
  ]
}`;

      const parsedData = await callAIForJSON(prompt) as RoadmapData;
      
      // Save to backend (fire-and-forget — use parsedData directly for the UI)
      apiFetch("/roadmap/save", {
        method: "POST",
        token,
        body: JSON.stringify({
          targetRole, targetCompany, targetPackage, currentSkills: skills, duration, dailyHours, roadmapData: parsedData
        })
      }).catch(err => console.error("Failed to save roadmap", err));
      
      setRoadmap(parsedData);
      setExpandedWeek("1-1"); // Open first week of first phase
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate roadmap. Please try again or simplify inputs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (phaseIndex: number, weekIndex: number, topicIndex: number, currentVal: boolean) => {
    if (!roadmap || !token) return;
    
    // Optimistic UI update
    const rd = { ...roadmap };
    rd.phases[phaseIndex].weeks[weekIndex].topics[topicIndex].completed = !currentVal;
    
    let totalTopics = 0;
    let completedTopics = 0;
    rd.phases.forEach((p) => p.weeks.forEach((w) => w.topics.forEach((t) => {
      totalTopics++;
      if (t.completed) completedTopics++;
    })));
    rd.overallProgress = Math.round((completedTopics / totalTopics) * 100);
    setRoadmap(rd);

    // Persist
    try {
      await apiFetch("/roadmap/progress", {
        method: "PUT",
        token,
        body: JSON.stringify({ phaseIndex, weekIndex, topicIndex, completed: !currentVal })
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      <div className="bg-[#4C1D95] text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 dark:bg-purple-900/200/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/4"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">AI Roadmap Generator 🗺️</h1>
          <p className="text-xl text-purple-200 font-medium max-w-2xl">
            Get a personalized, week-by-week learning syllabus perfectly calibrated to your target role and current skill level.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* INPUT TILE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Role</label>
               <select value={targetRole} onChange={e=>setTargetRole(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 font-medium font-sans">
                 <option>Frontend Dev</option><option>Backend Dev</option><option>Full Stack Dev</option>
                 <option>Data Scientist</option><option>AI/ML Engineer</option><option>DevOps</option>
                 <option>Android Dev</option><option>iOS Dev</option><option>Cybersecurity</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Company Tier</label>
               <select value={targetCompany} onChange={e=>setTargetCompany(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 font-medium font-sans">
                 <option>Tier 1 (MAANG)</option><option>Tier 2 (Flipkart/Swiggy)</option>
                 <option>Service (TCS/Infosys)</option><option>Startup</option><option>Any</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Package</label>
               <select value={targetPackage} onChange={e=>setTargetPackage(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 font-medium font-sans">
                 <option>4-6 LPA</option><option>6-10 LPA</option><option>10-15 LPA</option><option>15-25 LPA</option><option>25+ LPA</option>
               </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Current Skills (Press Enter)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold flex items-center gap-1">
                    {s} <button onClick={() => removeSkill(s)} className="hover:text-red-500 rounded-full w-4 h-4 flex justify-center items-center">×</button>
                  </span>
                ))}
              </div>
              <input type="text" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="React, Python, Node..." className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 font-medium"/>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Time Available</label>
               <select value={duration} onChange={e=>setDuration(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 font-medium font-sans mb-4">
                 <option>1 month</option><option>2 months</option><option>3 months</option><option>6 months</option>
               </select>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Daily Study: {dailyHours} hours</label>
               <input type="range" min="1" max="8" value={dailyHours} onChange={e=>setDailyHours(parseInt(e.target.value))} className="w-full accent-purple-600"/>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6">
            {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
            {!error && <p className="text-gray-500 font-medium text-sm">Takes ~15 seconds to generate</p>}
            <button 
              onClick={generateRoadmap} 
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:-translate-y-0.5 transition-all text-lg ${loading ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? '✨ Architecting syllabus...' : '🚀 Generate My Roadmap'}
            </button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {roadmap && (
          <div className="animate-fade-in-up space-y-8">
            {/* Stat Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{roadmap.title}</h2>
                <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-600 dark:text-gray-400">
                  <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 px-3 py-1 rounded-lg">Target: {targetRole} ({targetPackage})</span>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 px-3 py-1 rounded-lg">Duration: {roadmap.totalWeeks} Weeks</span>
                </div>
              </div>
              <div className="text-center md:text-right w-full md:w-auto">
                <p className="text-sm font-bold text-gray-500 mb-1">Overall Progress</p>
                <div className="flex items-center justify-end gap-3 w-full">
                  <div className="w-full md:w-48 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000" style={{ width: `${roadmap.overallProgress}%` }}></div>
                  </div>
                  <span className="text-2xl font-black text-purple-700">{roadmap.overallProgress}%</span>
                </div>
              </div>
            </div>

            {/* Phases Visualizer */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {roadmap.phases.map((p, i) => (
                <div key={i} className="flex-1 min-w-[150px] bg-white dark:bg-gray-900 p-4 rounded-xl shadow border border-gray-100 dark:border-gray-800 border-t-4 border-t-purple-500 text-center">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Phase {p.phase}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                  <p className="text-xs text-gray-500 font-medium">({p.duration})</p>
                </div>
              ))}
            </div>

            {/* Accordion Weeks */}
            <div>
              {roadmap.phases.map((phase, pIdx) => (
                <div key={phase.phase} className="mb-6">
                  <h3 className="text-lg font-black text-gray-800 dark:text-gray-200 mb-4 pl-2 border-l-4 border-purple-500">Phase {phase.phase}: {phase.name}</h3>
                  <div className="space-y-3">
                    {phase.weeks.map((week, wIdx) => {
                      const id = `${phase.phase}-${week.week}`;
                      const isExpanded = expandedWeek === id;
                      
                      // Calculate week completion
                      const completedTopics = week.topics.filter(t => t.completed).length;
                      const isWeekDone = completedTopics === week.topics.length && week.topics.length > 0;

                      return (
                        <div key={id} className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border transition-all ${isWeekDone ? 'border-green-200 bg-green-50 dark:bg-green-900/20/30' : 'border-gray-200 dark:border-gray-800'}`}>
                          {/* Accordion Header */}
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:bg-gray-950/50"
                            onClick={() => setExpandedWeek(isExpanded ? null : id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${isWeekDone ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-700'}`}>
                                {isWeekDone ? '✓' : `W${week.week}`}
                              </div>
                              <div>
                                <h4 className={`font-bold text-[15px] ${isWeekDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{week.theme}</h4>
                                <p className="text-xs text-gray-500 font-medium">{week.hours} hrs expected</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-xs font-bold text-gray-400">{completedTopics}/{week.topics.length} done</span>
                               <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                          
                          {/* Accordion Body */}
                          {isExpanded && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/30">
                              <div className="space-y-4">
                                {week.topics.map((topic, tIdx) => (
                                  <div key={tIdx} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${topic.completed ? 'bg-white dark:bg-gray-900 border-green-200' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                                    <div className="mt-1">
                                      <input 
                                        type="checkbox" 
                                        checked={topic.completed} 
                                        onChange={() => toggleTopic(pIdx, wIdx, tIdx, topic.completed)}
                                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h5 className={`font-bold text-[15px] mb-1 ${topic.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{topic.name} <span className="text-xs text-purple-500 font-bold ml-2">~{topic.hours}h</span></h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">{topic.practice}</p>
                                      
                                      <div className="flex flex-wrap gap-2">
                                        {topic.youtubeLink && (
                                          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.youtubeLink)}`} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 rounded-lg font-bold flex items-center gap-1 transition-colors">
                                            ▶️ {topic.youtubeLink}
                                          </a>
                                        )}
                                        {topic.docLink && (
                                          <a href={`https://www.google.com/search?q=${encodeURIComponent(topic.docLink)}`} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1 transition-colors">
                                            📄 {topic.docLink}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 rounded-xl flex items-start gap-3">
                                <span className="text-xl">🏆</span>
                                <div>
                                  <p className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-1">Week Milestone</p>
                                  <p className="text-sm font-medium text-purple-900">{week.milestone}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
