import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import FeatureHeader from "~/components/FeatureHeader";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Campus Hub 🎓 — PlacementOS" },
    { name: "description", content: "Your complete campus placement ecosystem. Track drives, analyze stats, and prepare." },
  ];
}

const MOCK_DRIVES = [
  { id: "cd1", company: "Atlassian", type: "On-Campus", status: "Upcoming", role: "Software Engineer Grad", package: "₹82 LPA", ppo: "Yes (after 6m intern)", bond: "None", cgpa: "8.0+", branches: ["CSE", "IT", "SE"], process: "OA -> Tech 1 -> Tech 2 -> HR", regDeadline: "2024-09-10", oaDate: "2024-09-15" },
  { id: "cd2", company: "TCS Digital", type: "On-Campus", status: "Ongoing", role: "System Engineer", package: "₹7.5 LPA", ppo: "N/A", bond: "1 Year", cgpa: "7.0+", branches: ["All Circuit Branches"], process: "NQT -> Tech -> HR", regDeadline: "2024-08-01", oaDate: "2024-08-20" },
  { id: "cd3", company: "Amazon", type: "Off-Campus", status: "Upcoming", role: "SDE 1", package: "₹45 LPA", ppo: "Yes", bond: "None", cgpa: "None", branches: ["Any"], process: "OA -> DSA -> System Design -> Bar Raiser", regDeadline: "2024-09-25", oaDate: "2024-10-01" },
  { id: "cd4", company: "JPMorgan Chase", type: "On-Campus", status: "Completed", role: "Software Engineer Program", package: "₹18 LPA", ppo: "Yes", bond: "None", cgpa: "7.5+", branches: ["CSE", "IT", "ECE"], process: "Coding Test -> HireVue -> Super Day", regDeadline: "2024-07-15", oaDate: "2024-07-20" },
];

export default function CampusHub() {
  const [activeTab, setActiveTab] = useState<"drives" | "calendar" | "analytics">("drives");
  
  // Drives State
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDrive, setSelectedDrive] = useState<any>(null);

  // AI Assistant State
  const [aiMode, setAiMode] = useState<"Eligibility" | "Preparation" | "Insights">("Eligibility");
  const [aiTargetProfile, setAiTargetProfile] = useState("CGPA: 8.2, Branch: CSE, Skills: React, Node.js");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const filteredDrives = MOCK_DRIVES.filter(d => filterStatus === "All" || d.status === filterStatus);

  const getAiAction = async () => {
    if (!selectedDrive) return;
    setAiLoading(true);
    setAiResult("");
    try {
      let prompt = "";
      if (aiMode === "Eligibility") {
        prompt = `Act as a Placement Coordinator. Based on this profile: "${aiTargetProfile}", is the student eligible for ${selectedDrive.company}? Requirements: CGPA ${selectedDrive.cgpa}, Branches: ${selectedDrive.branches.join(", ")}. Answer YES/NO and explain why briefly.`;
      } else if (aiMode === "Preparation") {
        prompt = `Act as an Alumni. Give me a 3-step preparation strategy for the ${selectedDrive.company} interview process: ${selectedDrive.process}.`;
      } else if (aiMode === "Insights") {
        prompt = `Act as a Career Counselor. Analyze this drive: ${selectedDrive.company} offering ${selectedDrive.package}. Discuss the PPO probability (${selectedDrive.ppo}) and Bond terms (${selectedDrive.bond}). Should a student accept this?`;
      }
      
      const res = await callAI(prompt);
      setAiResult(res);
    } catch (err) {
      setAiResult(`🔥 **Fallback Mode:** AI limit reached. Based on standard criteria, ${selectedDrive.cgpa} is strictly enforced. Ensure you practice DSA thoroughly for the ${selectedDrive.process.split("->")[0]} round.`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      <FeatureHeader
        title="Campus Hub 🎓"
        icon="🏫"
        description="Your complete campus placement ecosystem. Track upcoming drives, verify eligibility with AI, and view placement analytics."
        whatItDoes="Acts as a centralized portal for all On-Campus and Mega Off-Campus placement drives. It provides detailed company profiles and uses AI to determine your eligibility and prepare a study plan."
        howItWorks={[
          "Browse the Drives tab for Upcoming and Ongoing company visits.",
          "Select a drive to view deep details (Bond, CGPA, Process).",
          "Enter your profile and let the AI Assistant check your eligibility instantly.",
          "Check the Calendar to track registration and OA deadlines."
        ]}
        whyItMatters={[
          "Never miss a campus deadline.",
          "Avoid applying to companies where you don't meet the hidden criteria.",
          "Understand the interview process (e.g., OA -> Tech -> HR) before applying."
        ]}
        aiCapabilities={[
          "Eligibility Checking Engine",
          "Company-Specific Preparation Strategies",
          "Bond and PPO Analysis"
        ]}
        tips={[
          "Always keep your CGPA updated in the AI profile context.",
          "Companies marked as 'Mega Hiring' usually have lower cutoff criteria."
        ]}
        gradient="from-indigo-700 to-fuchsia-700"
      />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "drives", label: "🏢 Campus Drives" },
            { id: "calendar", label: "📅 Placement Calendar" },
            { id: "analytics", label: "📊 College Analytics" }
          ].map(t => (
             <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === t.id ? "bg-fuchsia-600 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"}`}
              >
                {t.label}
              </button>
          ))}
        </div>

        {/* --- TAB: DRIVES --- */}
        {activeTab === "drives" && (
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up">
            
            {/* Drive List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 flex gap-2">
                {["All", "Upcoming", "Ongoing", "Completed"].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${filterStatus === status ? "bg-fuchsia-100 text-fuchsia-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredDrives.map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => { setSelectedDrive(d); setAiResult(""); }}
                    className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border cursor-pointer transition-all ${selectedDrive?.id === d.id ? 'border-fuchsia-500 shadow-md ring-2 ring-fuchsia-500/20' : 'border-gray-200 dark:border-gray-800 hover:border-fuchsia-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{d.company}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${d.status === 'Upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' : d.status === 'Ongoing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-fuchsia-600 mb-3">{d.role}</p>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">{d.type}</span>
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">{d.package}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drive Details & AI Panel */}
            <div className="lg:col-span-2">
              {selectedDrive ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full sticky top-6">
                  
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{selectedDrive.company}</h2>
                        <p className="text-lg font-bold text-fuchsia-600">{selectedDrive.role}</p>
                      </div>
                      <div className="text-right">
                         <span className="block text-2xl font-black text-green-600">{selectedDrive.package}</span>
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{selectedDrive.type}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Eligibility (CGPA)</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedDrive.cgpa}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Bond</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedDrive.bond}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">PPO Available</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedDrive.ppo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Branches</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-xs mt-1">{selectedDrive.branches.join(", ")}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Selection Process</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedDrive.process.split("->").map((step: string, i: number, arr: any[]) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700">{step.trim()}</span>
                            {i < arr.length - 1 && <span className="text-gray-400">➔</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Section */}
                  <div className="p-8 bg-fuchsia-50/30 dark:bg-fuchsia-900/5 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-fuchsia-900 dark:text-fuchsia-400 flex items-center gap-2 mb-4">
                      <span>🤖</span> AI Campus Assistant
                    </h3>
                    
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">My Profile Context (Editable)</label>
                      <input 
                        type="text" 
                        value={aiTargetProfile} 
                        onChange={e => setAiTargetProfile(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-gray-950 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <button onClick={() => { setAiMode("Eligibility"); getAiAction(); }} className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${aiMode === 'Eligibility' ? 'bg-fuchsia-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50 border border-gray-200 dark:border-gray-800'}`}>Am I Eligible?</button>
                      <button onClick={() => { setAiMode("Preparation"); getAiAction(); }} className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${aiMode === 'Preparation' ? 'bg-fuchsia-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50 border border-gray-200 dark:border-gray-800'}`}>How to Prepare?</button>
                      <button onClick={() => { setAiMode("Insights"); getAiAction(); }} className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${aiMode === 'Insights' ? 'bg-fuchsia-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-50 border border-gray-200 dark:border-gray-800'}`}>Bond & PPO Insights</button>
                    </div>

                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/30 p-6 min-h-[200px] overflow-y-auto custom-scrollbar">
                      {aiLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-fuchsia-700 dark:text-fuchsia-500 font-bold animate-pulse text-sm">Consulting Placement AI...</p>
                        </div>
                      ) : aiResult ? (
                        <div className="prose dark:prose-invert prose-fuchsia max-w-none prose-sm font-medium">
                          <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: aiResult.replace(/\*\*(.*?)\*\*/g, '<strong class="text-fuchsia-700 dark:text-fuchsia-400 font-black">$1</strong>').replace(/\n/g, '<br/>')}}></div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center">
                          <p className="text-gray-400 font-bold">Select a question above to ask the AI Assistant.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center h-full flex flex-col items-center justify-center">
                  <span className="text-6xl mb-4 opacity-30">🏢</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a Drive</h3>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">Click on any campus drive on the left to view detailed eligibility criteria and consult the AI.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: CALENDAR --- */}
        {activeTab === "calendar" && (
          <div className="animate-fade-in-up bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">Upcoming Deadlines 📅</h2>
            <div className="space-y-6">
              {MOCK_DRIVES.filter(d => d.status !== "Completed").map(d => (
                <div key={d.id} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="md:w-1/3">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{d.company}</h3>
                    <p className="text-sm font-bold text-fuchsia-600">{d.role}</p>
                  </div>
                  <div className="md:w-2/3 flex flex-col md:flex-row gap-6 md:gap-12">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Registration Closes</p>
                      <p className="font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded inline-block border border-red-100">{d.regDeadline}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Expected OA Date</p>
                      <p className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded inline-block border border-blue-100">{d.oaDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: ANALYTICS --- */}
        {activeTab === "analytics" && (
          <div className="animate-fade-in-up max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-3xl shadow-lg text-white">
                <p className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2">Highest Package</p>
                <h3 className="text-5xl font-black">₹82 <span className="text-2xl">LPA</span></h3>
                <p className="text-sm font-medium mt-4 bg-black/20 inline-block px-3 py-1 rounded-lg">Atlassian (On-Campus)</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Average Package</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white">₹14.5 <span className="text-2xl">LPA</span></h3>
                <p className="text-sm font-medium mt-4 text-gray-500">+12% from last year</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Median Package</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white">₹10.2 <span className="text-2xl">LPA</span></h3>
                <p className="text-sm font-medium mt-4 text-gray-500">Most common offer</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Placement Trends 📈</h3>
              <div className="h-64 flex items-end gap-4 justify-between border-b border-l border-gray-200 dark:border-gray-700 pl-4 pb-4">
                {/* Mock Chart */}
                {[
                  { year: '2021', h: '40%', val: '75%' },
                  { year: '2022', h: '60%', val: '85%' },
                  { year: '2023', h: '80%', val: '92%' },
                  { year: '2024', h: '100%', val: '96%' }
                ].map(bar => (
                  <div key={bar.year} className="w-full max-w-[80px] flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{bar.val}</span>
                    <div className="w-full bg-fuchsia-500 rounded-t-xl transition-all" style={{ height: bar.h }}></div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{bar.year}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-gray-500 mt-6">Overall Placement Percentage (2021 - 2024)</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
