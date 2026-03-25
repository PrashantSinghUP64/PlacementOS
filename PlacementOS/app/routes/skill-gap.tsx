import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { callAIForJSON } from "~/lib/aiHelper";
import { apiFetch } from "~/lib/api";

export default function SkillGap() {
  const token = useAppAuthStore((s) => s.token);

  // Inputs
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [dreamJob, setDreamJob] = useState("");
  const [dreamCompany, setDreamCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  // Handlers
  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!currentSkills.includes(skillInput.trim())) {
        setCurrentSkills([...currentSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter(s => s !== skill));
  };

  const analyzeGap = async () => {
    if (!dreamJob.trim() || currentSkills.length === 0) {
      setError("Please add at least one current skill and a dream job title.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const prompt = `You are a career advisor and tech educator. Analyze the skill gap for this candidate.

CURRENT SKILLS: ${currentSkills.join(', ')}
DREAM JOB: ${dreamJob}
DREAM COMPANY: ${dreamCompany || 'any top tech company'}
EXPERIENCE: ${experienceLevel}

Return ONLY valid JSON:
{
  "readinessScore": number (0-100),
  "matchingSkills": ["string", "string"],
  "missingSkills": [
    {"skill": "string", "priority": "Must Have | Good to Have | Bonus", "reason": "string", "howToLearn": "string (short tip)"}
  ],
  "skillsToImprove": [
    {"skill": "string", "currentLevel": "Basic | Intermediate", "targetLevel": "Advanced", "tip": "string"}
  ],
  "learningPlan": {
    "week1": [{"topic": "string", "resource": "string", "hours": number}],
    "week2": [{"topic": "string", "resource": "string", "hours": number}],
    "week3": [{"topic": "string", "resource": "string", "hours": number}],
    "week4": [{"topic": "string", "resource": "string", "hours": number}]
  },
  "companyInsights": {
    "interviewProcess": "string",
    "focusTopics": ["string", "string"],
    "difficulty": "High | Medium | Low",
    "tips": ["string", "string"]
  }
}`;

    try {
      const parsed = await callAIForJSON(prompt);
      setResults(parsed);

      try {
        await apiFetch("/skill-gap/save", {
          method: "POST",
          token,
          body: JSON.stringify({
            currentSkills,
            dreamJob,
            dreamCompany,
            experienceLevel,
            ...parsed
          })
        });
      } catch (err) {
        console.error("Failed to save skill gap history", err);
      }
    } catch (err: any) {
      setError("Failed to generate skill gap analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return "#ef4444"; // red-500
    if (score < 70) return "#eab308"; // yellow-500
    return "#22c55e"; // green-500
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <div className="bg-teal-900 border-b border-teal-800 text-white pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Skill Gap Analyzer 📊</h1>
          <p className="text-teal-100/80 text-lg max-w-2xl mx-auto">
            Find exactly what you're missing for your dream job and get a 30-day roadmap to bridge the gap.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100 flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        {!results && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 max-w-3xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 border-b pb-4">Define Your Target</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Skills (Press Enter to add)</label>
                <div className="flex flex-wrap gap-2 mb-3 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl min-h-[50px] border border-gray-200 dark:border-gray-800 focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-50 transition-all">
                  {currentSkills.map((skill, i) => (
                    <span key={i} className="flex items-center gap-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500 text-teal-500 ml-1 font-bold">&times;</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder={currentSkills.length === 0 ? "e.g. React, Node.js, Python..." : "Add another skill..."}
                    className="flex-1 min-w-[150px] bg-transparent outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Dream Job Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={dreamJob}
                    onChange={e => setDreamJob(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full text-input focus:ring-teal-100 focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Dream Company (Optional)</label>
                  <input
                    type="text"
                    value={dreamCompany}
                    onChange={e => setDreamCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon, Stripe..."
                    className="w-full text-input focus:ring-teal-100 focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                  className="w-full text-input focus:ring-teal-100 focus:border-teal-400"
                >
                  <option>Fresher</option>
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </div>

              <button
                onClick={analyzeGap}
                disabled={isLoading}
                className="w-full py-4 text-white font-bold text-lg rounded-2xl bg-teal-600 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/30 mt-8 relative overflow-hidden group disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <><span className="animate-spin text-xl">⚙️</span> Analyzing the Gap...</>
                  ) : (
                    "Analyze Gap 🚀"
                  )}
                </span>
                {isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS SECTION */}
        {results && (
          <div className="animate-fade-in-up space-y-8">
            {/* Top Score */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-2" style={{ backgroundColor: getScoreColor(results.readinessScore) }}></div>
              <p className="text-gray-500 font-bold tracking-widest uppercase mb-4 text-sm mt-2">Overall Readiness</p>
              
              <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    style={{ stroke: getScoreColor(results.readinessScore) }}
                    className="transition-all duration-1000 ease-out"
                    strokeDasharray={`${results.readinessScore}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-gray-800 dark:text-gray-200">{results.readinessScore}%</span>
                  <span className="text-xs font-bold text-gray-400 mt-1 uppercase">Ready</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 max-w-xl">
                You are {results.readinessScore}% ready for <span className="text-teal-600">{dreamJob}</span>
                {dreamCompany ? ` at ${dreamCompany}` : ''}
              </h2>
            </div>

            {/* 3 Columns */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Column 1: Strengths */}
              <div className="bg-white dark:bg-gray-900 border-t-4 border-green-500 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-green-500">✨</span> Skills You Have
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-4 pb-4 border-b">These are your strengths</p>
                <ul className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                  {results.matchingSkills.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20/50 p-3 rounded-xl border border-green-100">
                      <span className="text-green-500 bg-white dark:bg-gray-900 shadow-sm w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{skill}</span>
                    </li>
                  ))}
                  {results.matchingSkills.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No exact matches found. Start learning!</p>
                  )}
                </ul>
              </div>

              {/* Column 2: Missing Skills */}
              <div className="bg-white dark:bg-gray-900 border-t-4 border-red-500 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-red-500">❌</span> Skills Missing
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-4 pb-4 border-b">Critical gaps to fill</p>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                  {results.missingSkills.map((item: any, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setExpandedSkill(expandedSkill === item.skill ? null : item.skill)}
                      className={`cursor-pointer transition-all border p-3 rounded-xl ${expandedSkill === item.skill ? 'bg-red-50 dark:bg-red-900/20 border-red-300' : 'bg-red-50 dark:bg-red-900/20/30 border-red-100 hover:border-red-300'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{item.skill}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${item.priority === 'Must Have' ? 'bg-red-200 text-red-800' : item.priority === 'Good to Have' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800 dark:text-gray-200'}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-red-700/80 font-medium">{item.reason}</p>
                      
                      {expandedSkill === item.skill && (
                        <div className="mt-3 pt-3 border-t border-red-200/50 text-sm">
                          <p className="font-bold text-red-900 mb-1 flex items-center gap-1"><span>📚</span> How to learn:</p>
                          <p className="text-red-800 italic">{item.howToLearn || "Look up tutorials on YouTube or official docs."}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {results.missingSkills.length === 0 && (
                    <p className="text-sm text-gray-500 italic">You have all the required skills!</p>
                  )}
                </div>
              </div>

              {/* Column 3: Skills to Improve */}
              <div className="bg-white dark:bg-gray-900 border-t-4 border-yellow-400 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-yellow-500">📈</span> To Improve
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-4 pb-4 border-b">Skills to master</p>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                  {results.skillsToImprove.map((item: any, i: number) => (
                    <div key={i} className="bg-yellow-50/50 border border-yellow-100 p-3 rounded-xl">
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">{item.skill}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-gray-500 line-through">{item.currentLevel}</span>
                        <span className="text-[10px]">➡️</span>
                        <span className="text-[10px] font-black text-yellow-700 uppercase bg-yellow-100 px-2 py-0.5 rounded">{item.targetLevel}</span>
                      </div>
                      <p className="text-xs text-yellow-800/80 font-medium bg-yellow-100/50 p-2 rounded-lg">{item.tip}</p>
                    </div>
                  ))}
                  {results.skillsToImprove.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No specific skills need immediate upskilling.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="bg-teal-100 text-teal-600 w-10 h-10 rounded-xl flex items-center justify-center">🗓️</span>
                Your 30-Day Learning Plan
              </h3>
              
              <div className="grid md:grid-cols-4 gap-6">
                {['week1', 'week2', 'week3', 'week4'].map((week, idx) => {
                  const items = results.learningPlan[week] || [];
                  return (
                    <div key={week} className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-inner">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <span className="font-black text-gray-900 dark:text-white uppercase">Week {idx + 1}</span>
                        <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                          {items.reduce((acc: number, cur: any) => acc + (cur.hours || 0), 0)}h
                        </span>
                      </div>
                      <ul className="space-y-4">
                        {items.map((item: any, i: number) => (
                          <li key={i} className="text-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 leading-tight mb-1">{item.topic}</p>
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.resource || item.topic)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium pb-1">
                              📺 {item.resource}
                            </a>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                              <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Company Insights */}
            {dreamCompany && results.companyInsights && (
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <svg className="absolute right-0 top-0 w-64 h-64 text-white/5 -mt-10 -mr-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                
                <h3 className="text-2xl font-black mb-6 relative z-10 flex items-center gap-3">
                  <span className="bg-white dark:bg-gray-900/10 p-2 rounded-xl text-2xl">🏢</span>
                  What {dreamCompany} Looks For
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Difficulty</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-black ${results.companyInsights.difficulty === 'High' ? 'bg-red-50 dark:bg-red-900/200/20 text-red-300 border border-red-500/50' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'}`}>
                        {results.companyInsights.difficulty}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Interview Process</h4>
                      <p className="text-blue-50 font-medium leading-relaxed bg-white dark:bg-gray-900/5 p-4 rounded-xl border border-white/10">
                        {results.companyInsights.interviewProcess}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Focus Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.companyInsights.focusTopics.map((t: string, i: number) => (
                          <span key={i} className="bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 px-3 py-1 rounded-lg text-sm font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Insider Tips</h4>
                      <ul className="space-y-2">
                        {results.companyInsights.tips.map((tip: string, i: number) => (
                          <li key={i} className="text-blue-50 text-sm flex gap-2">
                            <span className="text-indigo-400">💡</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center pt-8">
              <button onClick={() => setResults(null)} className="text-gray-500 font-medium hover:text-gray-800 dark:text-gray-200 underline">
                Analyze another role
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
