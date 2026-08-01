import { useState, useEffect } from "react";
import Navbar from "~/components/Navbar";
import FeatureHeader from "~/components/FeatureHeader";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Job Tracker Pro 🚀 — PlacementOS" },
    { name: "description", content: "Track applications, discover jobs, and prepare for interviews with AI." },
  ];
}

const JOB_STATUSES = [
  "Saved", "Applied", "Under Review", "Online Assessment", 
  "Shortlisted", "Tech Round", "Managerial Round", "HR Round", 
  "Offered", "Rejected", "Withdrawn"
];

const MOCK_DISCOVERY_JOBS = [
  { id: "dj1", company: "Google", role: "Software Engineer L3", location: "Bangalore (Hybrid)", salary: "₹25L - ₹35L", skills: ["C++", "Python", "System Design", "DSA"], type: "Full-time", source: "Company Portal" },
  { id: "dj2", company: "Microsoft", role: "SDE I", location: "Hyderabad", salary: "₹18L - ₹28L", skills: ["C#", "React", "Azure", "DSA"], type: "Full-time", source: "LinkedIn" },
  { id: "dj3", company: "Uber", role: "Backend Engineer II", location: "Bangalore", salary: "₹30L - ₹45L", skills: ["Go", "Microservices", "Kafka", "PostgreSQL"], type: "Full-time", source: "Wellfound" },
  { id: "dj4", company: "Stripe", role: "Frontend Engineer", location: "Remote", salary: "$120k - $150k", skills: ["React", "TypeScript", "Node.js"], type: "Full-time", source: "Greenhouse" },
];

export default function JobTracker() {
  const [activeTab, setActiveTab] = useState<"kanban" | "discover" | "dashboard">("kanban");
  
  // Tracker State (LocalStorage)
  const [trackedJobs, setTrackedJobs] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    appliedDate: new Date().toISOString().split("T")[0],
    salary: "",
    url: "",
    notes: ""
  });

  // AI Insights State
  const [aiModalTarget, setAiModalTarget] = useState<any>(null);
  const [aiMode, setAiMode] = useState<"Insights" | "Prep">("Insights");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Drag and Drop
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("placementos_jobtracker");
    if (saved) setTrackedJobs(JSON.parse(saved));
  }, []);

  const saveToVault = (jobs: any[]) => {
    setTrackedJobs(jobs);
    localStorage.setItem("placementos_jobtracker", JSON.stringify(jobs));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      const next = trackedJobs.map(j => j.id === editingJob.id ? { ...j, ...formData } : j);
      saveToVault(next);
    } else {
      const next = [...trackedJobs, { ...formData, id: Date.now().toString() }];
      saveToVault(next);
    }
    setIsModalOpen(false);
  };

  const updateStatus = (id: string, status: string) => {
    const next = trackedJobs.map(j => j.id === id ? { ...j, status } : j);
    saveToVault(next);
  };

  const removeJob = (id: string) => {
    if (!confirm("Remove this application?")) return;
    const next = trackedJobs.filter(j => j.id !== id);
    saveToVault(next);
  };

  const openForm = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({ company: job.company, role: job.role, status: job.status, appliedDate: job.appliedDate, salary: job.salary || "", url: job.url || "", notes: job.notes || "" });
    } else {
      setEditingJob(null);
      setFormData({ company: "", role: "", status: "Applied", appliedDate: new Date().toISOString().split("T")[0], salary: "", url: "", notes: "" });
    }
    setIsModalOpen(true);
  };

  const addDiscoveredJob = (job: any) => {
    const next = [...trackedJobs, { company: job.company, role: job.role, status: "Saved", appliedDate: new Date().toISOString().split("T")[0], salary: job.salary, url: "", notes: `Source: ${job.source}\nSkills: ${job.skills.join(", ")}`, id: Date.now().toString() }];
    saveToVault(next);
    alert(`${job.company} added to your tracker as 'Saved'!`);
  };

  const getAiAction = async (target: any, mode: "Insights" | "Prep" | "DiscoveryScore") => {
    setAiLoading(true);
    setAiResult("");
    try {
      let prompt = "";
      if (mode === "DiscoveryScore") {
        prompt = `Act as an ATS AI. Score this job against a BTech CSE Fresher profile: Company: ${target.company}, Role: ${target.role}, Skills: ${target.skills.join(", ")}. Return Match %, Missing Skills, and Interview Probability. Keep it short.`;
      } else if (mode === "Insights") {
        prompt = `Act as a Career Coach. For the role "${target.role}" at "${target.company}", analyze ATS compatibility, missing keywords, and competition level. Provide 3 bullet points.`;
      } else if (mode === "Prep") {
        prompt = `Act as a Technical Interviewer at ${target.company}. Generate 3 technical questions, 1 HR question, and the expected Online Assessment (OA) pattern for the role of ${target.role}.`;
      }
      const res = await callAI(prompt);
      setAiResult(res);
    } catch (err) {
      setAiResult("🔥 **Offline Mode:** AI API limit reached. Default Advice: Ensure your resume highlights your strongest projects. Expect standard DSA and System Design rounds for this role.");
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (["Saved", "Applied", "Under Review"].includes(status)) return "bg-blue-100 text-blue-700 border-blue-200";
    if (["Online Assessment", "Shortlisted"].includes(status)) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (["Tech Round", "Managerial Round", "HR Round"].includes(status)) return "bg-purple-100 text-purple-700 border-purple-200";
    if (status === "Offered") return "bg-green-100 text-green-700 border-green-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  // Stats
  const total = trackedJobs.length;
  const offered = trackedJobs.filter(j => j.status === "Offered").length;
  const rejected = trackedJobs.filter(j => j.status === "Rejected").length;
  const interviewing = trackedJobs.filter(j => ["Tech Round", "Managerial Round", "HR Round"].includes(j.status)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      <FeatureHeader
        title="Job Tracker Pro"
        icon="🎯"
        description="A complete end-to-end placement pipeline. Discover jobs, track your applications across 10 stages, and get AI interview prep."
        whatItDoes="Manages your entire job hunt workflow from saving a job to receiving an offer. It visually organizes your applications in a Kanban board and uses AI to generate company-specific interview questions."
        howItWorks={[
          "Browse the Discovery tab to find AI-curated job matches.",
          "Add jobs to your Tracker and move them across stages (e.g. Applied -> Tech Round).",
          "Click on any tracked job to generate an AI Interview Prep sheet.",
          "Analyze your success rate in the Dashboard."
        ]}
        whyItMatters={[
          "Never miss an assessment deadline again.",
          "Prepare for interviews using actual company patterns.",
          "Analyze which stage of the funnel you are failing in."
        ]}
        aiCapabilities={[
          "Job Match Scoring",
          "ATS Compatibility Analysis",
          "Company-Specific Interview Question Generation",
          "OA Pattern Prediction"
        ]}
        tips={[
          "Move jobs to 'Rejected' rather than deleting them to maintain accurate analytics.",
          "Use the AI Insights feature before applying to tailor your resume keywords."
        ]}
        gradient="from-blue-600 to-cyan-600"
      />

      <div className="max-w-full mx-auto px-6 mt-8">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "kanban", label: "📋 Application Board" },
            { id: "discover", label: "🔍 AI Discovery" },
            { id: "dashboard", label: "📊 Analytics" }
          ].map(t => (
             <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === t.id ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"}`}
              >
                {t.label}
              </button>
          ))}
          {activeTab === "kanban" && (
            <button onClick={() => openForm()} className="ml-auto px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition-all">
              + Add Application
            </button>
          )}
        </div>

        {/* --- TAB: KANBAN BOARD --- */}
        {activeTab === "kanban" && (
          <div className="flex overflow-x-auto pb-8 gap-4 snap-x min-h-[60vh] custom-scrollbar">
            {JOB_STATUSES.map(status => {
              const columnJobs = trackedJobs.filter(j => j.status === status);
              return (
                <div 
                  key={status} 
                  className={`w-72 flex-shrink-0 snap-center flex flex-col bg-gray-100 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 ${draggedJobId ? 'ring-2 ring-transparent hover:ring-blue-400' : ''}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (draggedJobId) updateStatus(draggedJobId, status);
                  }}
                >
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span className="font-black text-gray-700 dark:text-gray-300 text-sm tracking-tight">{status}</span>
                    <span className="bg-white dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-bold shadow-sm">{columnJobs.length}</span>
                  </div>
                  
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[65vh]">
                    {columnJobs.map(job => (
                      <div
                        key={job.id}
                        draggable
                        onDragStart={() => setDraggedJobId(job.id)}
                        onDragEnd={() => setDraggedJobId(null)}
                        className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors group relative"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded p-1 shadow border border-gray-100 dark:border-gray-800">
                          <button onClick={() => { setAiModalTarget(job); setAiMode("Insights"); getAiAction(job, "Insights"); }} className="p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded">🤖</button>
                          <button onClick={() => openForm(job)} className="p-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 rounded">✏️</button>
                          <button onClick={() => removeJob(job.id)} className="p-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">🗑️</button>
                        </div>
                        
                        <h4 className="font-black text-gray-900 dark:text-white mb-1 pr-16 leading-tight">{job.company}</h4>
                        <p className="text-xs font-bold text-blue-600 mb-3">{job.role}</p>
                        
                        {job.salary && <p className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded inline-block mb-3 border border-green-100">💰 {job.salary}</p>}
                        
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span>📅 {job.appliedDate}</span>
                          {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Link ↗</a>}
                        </div>
                      </div>
                    ))}
                    {columnJobs.length === 0 && (
                      <div className="h-16 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 opacity-50">
                        Drop Here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TAB: DISCOVERY --- */}
        {activeTab === "discover" && (
          <div className="animate-fade-in-up max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {MOCK_DISCOVERY_JOBS.map(job => (
                <div key={job.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md mb-2 inline-block border border-blue-100">{job.source}</span>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">{job.company}</h3>
                      <p className="font-bold text-gray-600 dark:text-gray-400">{job.role}</p>
                    </div>
                    <button onClick={() => addDiscoveredJob(job)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-lg" title="Save to Tracker">
                      🔖
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-1 text-sm font-medium">
                    <p className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-1"><span className="text-gray-500">Location</span> <span className="text-gray-900 dark:text-gray-100">{job.location}</span></p>
                    <p className="flex justify-between border-b border-gray-50 dark:border-gray-800 pb-1"><span className="text-gray-500">Salary</span> <span className="text-green-600 font-bold">{job.salary}</span></p>
                    <div className="flex flex-wrap gap-1 mt-2 pt-2">
                      {job.skills.map(s => <span key={s} className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-bold">{s}</span>)}
                    </div>
                  </div>
                  
                  <button onClick={() => { setAiModalTarget(job); setAiMode("Insights"); getAiAction(job, "DiscoveryScore"); }} className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 font-bold rounded-xl transition-colors border border-blue-100 dark:border-blue-900/30">
                    🤖 AI Score Match
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in-up max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
                <p className="text-xs font-bold text-gray-500 uppercase">Total Apps</p>
                <h3 className="text-4xl font-black mt-1">{total}</h3>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl shadow-sm border border-purple-200 text-center">
                <p className="text-xs font-bold text-purple-600 uppercase">Interviewing</p>
                <h3 className="text-4xl font-black text-purple-700 mt-1">{interviewing}</h3>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl shadow-sm border border-green-200 text-center">
                <p className="text-xs font-bold text-green-600 uppercase">Offers</p>
                <h3 className="text-4xl font-black text-green-700 mt-1">{offered}</h3>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl shadow-sm border border-red-200 text-center">
                <p className="text-xs font-bold text-red-600 uppercase">Rejected</p>
                <h3 className="text-4xl font-black text-red-700 mt-1">{rejected}</h3>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center min-h-[300px]">
               <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Application Success Rate</h3>
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={`${total > 0 ? (offered/total)*553 : 0} 553`} className="text-green-500 transition-all duration-1000" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{total > 0 ? Math.round((offered/total)*100) : 0}%</span>
                    <span className="block text-xs font-bold text-gray-500 uppercase">Conversion</span>
                  </div>
               </div>
               <p className="text-sm font-medium text-gray-500 mt-6 text-center max-w-sm">Industry average conversion from application to offer is ~2%. A rate above 5% means your resume and interview skills are excellent!</p>
            </div>
          </div>
        )}

      </div>

      {/* --- FORMS AND MODALS --- */}

      {/* Add/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingJob ? 'Edit Application' : 'Add Application'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm border w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name *</label>
                  <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Job Role *</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold outline-none">
                    {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Applied Date</label>
                  <input type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expected Salary</label>
                  <input type="text" placeholder="e.g. ₹20L - ₹25L" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                  <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none resize-none" />
                </div>
              </div>
              <div className="pt-4 mt-2 flex justify-end gap-3">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">Save Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiModalTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50 dark:bg-gray-950/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-3xl">🤖</span> AI Copilot: {aiModalTarget.company}
                </h2>
                <p className="text-xs font-bold text-gray-500 mt-1">{aiModalTarget.role}</p>
              </div>
              <button onClick={() => setAiModalTarget(null)} className="text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 shadow-sm border w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-950 p-2 gap-2 justify-center border-b border-gray-200 dark:border-gray-800">
              <button onClick={() => { setAiMode("Insights"); getAiAction(aiModalTarget, "Insights"); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aiMode === 'Insights' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>Resume Insights</button>
              <button onClick={() => { setAiMode("Prep"); getAiAction(aiModalTarget, "Prep"); }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aiMode === 'Prep' ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}>Interview Prep</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-blue-50/50 dark:bg-blue-900/10 custom-scrollbar">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow"></div>
                  <p className="text-blue-700 dark:text-blue-400 font-bold animate-pulse text-sm">Analyzing company trends & generating {aiMode}...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-blue max-w-none prose-sm font-medium leading-relaxed">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: aiResult.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700 dark:text-blue-400 font-black">$1</strong>').replace(/\n/g, '<br/>')}}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
