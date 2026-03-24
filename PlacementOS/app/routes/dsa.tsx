import { useState, useEffect, useCallback } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DSA_SHEET, TOTAL_PROBLEMS } from "~/data/dsaSheet";

export function meta() {
  return [
    { title: "DSA Practice Tracker 💻 — PlacementOS" },
    { name: "description", content: "Track your LeetCode progress and follow LPA-based DSA sheets" },
  ];
}

interface DSAProblem {
  _id: string;
  name: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  status: "Solved" | "Attempted" | "Revisit";
  timeTaken: number;
  notes: string;
  date: string;
}

const COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };
const STATUS_COLORS = { Solved: 'bg-green-100 text-green-700', Attempted: 'bg-yellow-100 text-yellow-700', Revisit: 'bg-red-100 text-red-700' };
const DIFF_STYLE: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  Hard: 'bg-red-100 text-red-700 border border-red-200',
};

const LS_KEY = "dsa_progress";

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(data: Record<string, boolean>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Mini confetti burst
function ConfettiBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  const pieces = Array.from({ length: 24 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] flex items-center justify-center" aria-hidden>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const distance = 80 + Math.random() * 120;
        const size = 8 + Math.random() * 8;
        const colors = ['#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#EC4899'];
        return (
          <div
            key={i}
            className="absolute rounded-sm animate-confetti-piece"
            style={{
              width: size, height: size,
              background: colors[i % colors.length],
              transform: `rotate(${angle}deg) translateY(-${distance}px)`,
              opacity: 0,
              animation: `confettiFly 2.4s ease-out ${i * 0.04}s forwards`,
            }}
          />
        );
      })}
      <div className="text-5xl animate-bounce">🎉</div>
    </div>
  );
}

export default function DSATracker() {
  const token = useAppAuthStore((s) => s.token);

  const [activeTab, setActiveTab] = useState<"progress" | "sheets" | "calendar" | "complete">("progress");

  // --- My Progress state ---
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "", platform: "LeetCode", difficulty: "Easy", topic: "Array", status: "Solved", timeTaken: "", notes: ""
  });

  // --- Complete Sheet state ---
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [expandedPatterns, setExpandedPatterns] = useState<Record<number, boolean>>({ 0: true });
  const [filterDiff, setFilterDiff] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [filterPattern, setFilterPattern] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [confettiPattern, setConfettiPattern] = useState<string | null>(null);

  // Load localStorage on mount
  useEffect(() => { setProgress(loadProgress()); }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const probRes = await apiFetch("/dsa", { token });
      if (Array.isArray(probRes)) setProblems(probRes);
      const statRes = await apiFetch("/dsa/stats", { token });
      if (statRes) setStats(statRes);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formData.name) return;
    try {
      await apiFetch("/dsa/add", { method: "POST", token, body: JSON.stringify(formData) });
      setIsAdding(false);
      setFormData({ name: "", platform: "LeetCode", difficulty: "Easy", topic: "Array", status: "Solved", timeTaken: "", notes: "" });
      fetchData();
    } catch (err) { alert("Failed to add problem"); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this record?")) return;
    try { await apiFetch(`/dsa/${id}`, { method: "DELETE", token }); fetchData(); } catch {}
  };

  // --- Sheet progress handlers ---
  const toggleProblem = useCallback((key: string, patternIdx: number) => {
    setProgress(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveProgress(next);

      // Check if pattern is now fully solved
      const pat = DSA_SHEET[patternIdx];
      const patternKeys = pat.problems.map((_, i) => `${patternIdx}-${i}`);
      const allSolved = patternKeys.every(k => !!next[k]);
      if (allSolved && !prev[key]) setConfettiPattern(pat.pattern);

      return next;
    });
  }, []);

  const togglePattern = (idx: number) =>
    setExpandedPatterns(prev => ({ ...prev, [idx]: !prev[idx] }));

  // --- Computed sheet stats ---
  const totalSolved = Object.values(progress).filter(Boolean).length;
  const progressPct = Math.round((totalSolved / TOTAL_PROBLEMS) * 100);

  const easySolved = DSA_SHEET.reduce((sum, pat, pi) =>
    sum + pat.problems.filter((p, i) => p.difficulty === "Easy" && !!progress[`${pi}-${i}`]).length, 0);
  const mediumSolved = DSA_SHEET.reduce((sum, pat, pi) =>
    sum + pat.problems.filter((p, i) => p.difficulty === "Medium" && !!progress[`${pi}-${i}`]).length, 0);
  const hardSolved = DSA_SHEET.reduce((sum, pat, pi) =>
    sum + pat.problems.filter((p, i) => p.difficulty === "Hard" && !!progress[`${pi}-${i}`]).length, 0);

  const patternsDone = DSA_SHEET.filter((pat, pi) =>
    pat.problems.every((_, i) => !!progress[`${pi}-${i}`])).length;

  const shareText = () => {
    const txt = `I've solved ${totalSolved}/${TOTAL_PROBLEMS} DSA problems on PlacementOS! 🔥\nPattern mastery: ${patternsDone}/14 complete.\nJoin me at resumeai.app`;
    navigator.clipboard.writeText(txt).then(() => alert("Copied to clipboard! 🚀")).catch(() => alert(txt));
  };

  // --- Filter logic ---
  const filteredSheet = DSA_SHEET.map((pat, pi) => ({
    ...pat,
    _idx: pi,
    filteredProblems: pat.problems.map((p, i) => ({ ...p, _key: `${pi}-${i}`, _globalIdx: i }))
      .filter(p => {
        if (filterDiff !== "All" && p.difficulty !== filterDiff) return false;
        if (filterPattern !== "All" && pat.pattern !== filterPattern) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
  })).filter(pat => pat.filteredProblems.length > 0);

  // Chart data
  const pieData = stats?.difficulties ? stats.difficulties.map((d: any) => ({ name: d._id, value: d.count })) : [];
  const barData = stats?.topics ? stats.topics.map((t: any) => ({ name: t._id, count: t.count })) : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {confettiPattern && (
        <ConfettiBurst onDone={() => setConfettiPattern(null)} />
      )}

      <style>{`
        @keyframes confettiFly {
          0%   { transform: rotate(var(--r,0deg)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--r,0deg)) translateY(-200px) scale(0.3); opacity: 0; }
        }
      `}</style>

      <Navbar />

      {/* HEADER */}
      <div className="bg-[#0f172a] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">DSA Practice Tracker 💻</h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl">
            Master Data Structures &amp; Algorithms. Track your daily solving streak and follow our curated LPA-targeted study sheets.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">

        {/* TABS */}
        <div className="flex flex-wrap bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-8 gap-1">
          {([
            { id: "progress", label: "📊 My Progress" },
            { id: "sheets", label: "📄 DSA Sheets by LPA" },
            { id: "complete", label: "📋 Complete DSA Sheet" },
            { id: "calendar", label: "🔥 Streak Calendar" },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === t.id ? "bg-slate-900 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* =============== TAB: MY PROGRESS =============== */}
        {activeTab === "progress" && (
          <div className="animate-fade-in-up space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-slate-900">{stats?.totalSolved || 0}</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Total Solved</span>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-orange-500">{stats?.currentStreak || 0} 🔥</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Current Streak</span>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-emerald-500">{stats?.bestStreak || 0}</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Best Streak</span>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black">{Math.max(0, 3 - (stats?.currentStreak || 0))}</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">To Hit Daily Goal</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  {!isAdding ? (
                    <button onClick={() => setIsAdding(true)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">
                      + Log New Problem
                    </button>
                  ) : (
                    <form onSubmit={handleAddProblem} className="animate-fade-in space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-gray-900">Log Problem</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-red-500 font-bold">✕</button>
                      </div>
                      <input type="text" placeholder="Problem Name (e.g. Two Sum)" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                          <option>LeetCode</option><option>GFG</option><option>HackerRank</option><option>Codeforces</option>
                        </select>
                        <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                          <option>Easy</option><option>Medium</option><option>Hard</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                          <option>Array</option><option>String</option><option>Linked List</option><option>Tree</option>
                          <option>Graph</option><option>DP</option><option>Math</option><option>Other</option>
                        </select>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
                          <option>Solved</option><option>Attempted</option><option>Revisit</option>
                        </select>
                      </div>
                      <input type="number" placeholder="Time Taken (mins)" value={formData.timeTaken} onChange={e => setFormData({ ...formData, timeTaken: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium" />
                      <textarea placeholder="Notes / Approach..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium h-20 resize-none" />
                      <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors">Save Log</button>
                    </form>
                  )}
                </div>

                {pieData.length > 0 && (
                  <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest text-center">Difficulty Split</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={(COLORS as any)[entry.name] || '#CBD5E1'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {barData.length > 0 && (
                  <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest text-center">Topics Conquered</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[800px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Logs</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">{problems.length} records</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {problems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="text-5xl mb-4 opacity-50">📝</div>
                      <p className="font-bold text-gray-400">No problems logged yet.<br />Time to start grinding!</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-100">
                        {problems.map(p => (
                          <tr key={p._id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-4">
                              <div className="font-bold text-gray-900 text-[15px] mb-1">{p.name}</div>
                              <div className="flex gap-2 text-xs font-medium">
                                <span className="text-gray-500">{p.platform}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500">{p.topic}</span>
                                {p.timeTaken > 0 && <><span className="text-gray-300">•</span><span className="text-gray-400">⏱️ {p.timeTaken}m</span></>}
                              </div>
                              {p.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded truncate max-w-sm">{p.notes}</p>}
                            </td>
                            <td className="p-4 align-top w-24">
                              <span className={`inline-block w-full text-center px-2 py-1 rounded text-xs font-bold ${p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{p.difficulty}</span>
                            </td>
                            <td className="p-4 align-top w-28">
                              <span className={`inline-block w-full text-center px-2 py-1 rounded text-xs font-bold ${(STATUS_COLORS as any)[p.status]}`}>{p.status}</span>
                            </td>
                            <td className="p-4 align-top text-right w-12">
                              <button onClick={() => handleDelete(p._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============== TAB: DSA SHEETS BY LPA =============== */}
        {activeTab === "sheets" && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Targeted DSA Sheets</h2>
              <p className="text-gray-500 font-medium">Which companies ask what — categorized by package tier.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { lpa: "4-6 LPA", tier: "Service Based (TCS, WIPRO)", color: "blue", emoji: "💼", topics: ["Arrays & Strings", "Basic Sort/Search", "Simple OOPs", "Basic SQL"], count: 20 },
                { lpa: "6-10 LPA", tier: "Mid Level (L&T, Capgemini)", color: "emerald", emoji: "🏢", topics: ["HashMaps & Two Pointer", "Recursion Basics", "Binary Search", "Linked Lists"], count: 30 },
                { lpa: "10-15 LPA", tier: "Good Product (Zomato, Paytm)", color: "purple", emoji: "🚀", topics: ["Basic DP & Backtracking", "Trees & BST", "Graphs (BFS/DFS)", "Stack & Queue Tricks"], count: 40 },
                { lpa: "15-25 LPA", tier: "Top Product (Flipkart, Swiggy)", color: "amber", emoji: "🔥", topics: ["Advanced DP", "Advanced Graph Algos", "Disjoint Sets & Tries", "System Design Intro"], count: 50 },
              ].map(c => (
                <div key={c.lpa} className={`bg-white border hover:border-${c.color}-300 transition-all rounded-2xl p-6 shadow-sm group relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${c.color}-400`} />
                  <div className="text-3xl mb-3">{c.emoji}</div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{c.lpa}</h3>
                  <p className={`text-xs font-bold text-gray-500 uppercase tracking-wider mb-4`}>{c.tier}</p>
                  <div className="space-y-2 mb-6">
                    {c.topics.map(t => <div key={t} className="text-sm border-b border-gray-100 pb-2"><span className={`text-${c.color}-500 mr-2`}>✓</span>{t}</div>)}
                  </div>
                  <button onClick={() => setActiveTab("complete")} className={`w-full py-3 bg-${c.color}-50 text-${c.color}-700 font-bold rounded-xl group-hover:bg-${c.color}-600 group-hover:text-white transition-colors`}>
                    View {c.count} Target Problems →
                  </button>
                </div>
              ))}
              <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-black text-white border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-6 md:mb-0">
                    <div className="text-4xl mb-3">👑</div>
                    <h3 className="text-2xl font-black text-white mb-1">25-50+ LPA</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">MAANG (Google, Meta, Microsoft)</p>
                    <div className="flex flex-wrap gap-2">
                      {["Hard DP", "Segment Trees", "HLD / LLD Design", "Behavioral (STAR)"].map(t =>
                        <span key={t} className="px-2 py-1 bg-white/10 rounded font-bold text-xs">{t}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("complete")} className="w-full md:w-auto px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1">
                    Open Complete Sheet →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============== TAB: COMPLETE DSA SHEET =============== */}
        {activeTab === "complete" && (
          <div className="animate-fade-in-up space-y-6">

            {/* Top Stats Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-slate-900">{TOTAL_PROBLEMS}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-600">{totalSolved}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Solved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">{TOTAL_PROBLEMS - totalSolved}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Remaining</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-violet-600">{progressPct}%</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Progress</div>
                  </div>
                </div>
              </div>
              {/* Main progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <input
                type="text"
                placeholder="🔍 Search problem name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-2 flex-wrap">
                {(["All", "Easy", "Medium", "Hard"] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setFilterDiff(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                      filterDiff === d
                        ? d === "Easy" ? "bg-emerald-500 text-white border-emerald-500"
                          : d === "Medium" ? "bg-amber-500 text-white border-amber-500"
                          : d === "Hard" ? "bg-red-500 text-white border-red-500"
                          : "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >{d}</button>
                ))}
              </div>
              <select
                value={filterPattern}
                onChange={e => setFilterPattern(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All">All Patterns</option>
                {DSA_SHEET.map(p => <option key={p.pattern} value={p.pattern}>{p.pattern}</option>)}
              </select>
            </div>

            {/* Accordion Patterns */}
            <div className="space-y-3">
              {filteredSheet.map((pat) => {
                const pi = pat._idx;
                const solvedInPat = pat.filteredProblems.filter(p => !!progress[p._key]).length;
                const totalInPat = pat.filteredProblems.length;
                const patPct = Math.round((solvedInPat / totalInPat) * 100);
                const isOpen = !!expandedPatterns[pi];

                return (
                  <div key={pi} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Pattern Header */}
                    <button
                      onClick={() => togglePattern(pi)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-base font-black text-gray-900 leading-tight">{pat.pattern}</h3>
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{totalInPat} problems</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${solvedInPat === totalInPat ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {solvedInPat}/{totalInPat} solved {solvedInPat === totalInPat ? '✅' : ''}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${solvedInPat === totalInPat ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${patPct}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-gray-400 font-bold text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>

                    {/* Problems Table */}
                    {isOpen && (
                      <div className="border-t border-gray-100 overflow-x-auto">
                        <table className="w-full text-left min-w-[540px]">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="px-4 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest w-10">#</th>
                              <th className="px-4 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Problem</th>
                              <th className="px-4 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest w-24">Difficulty</th>
                              <th className="px-4 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest w-48">Links</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {pat.filteredProblems.map((p, rowIdx) => {
                              const solved = !!progress[p._key];
                              return (
                                <tr key={p._key} className={`transition-colors hover:bg-gray-50/80 ${solved ? 'bg-emerald-50/30' : ''}`}>
                                  <td className="px-4 py-3 align-middle">
                                    <input
                                      type="checkbox"
                                      checked={solved}
                                      onChange={() => toggleProblem(p._key, pi)}
                                      className="w-4 h-4 rounded text-emerald-600 cursor-pointer accent-emerald-500"
                                    />
                                  </td>
                                  <td className="px-4 py-3 align-middle">
                                    <span className={`font-bold text-sm ${solved ? 'line-through text-gray-400' : 'text-gray-900'}`}>{p.name}</span>
                                  </td>
                                  <td className="px-4 py-3 align-middle">
                                    <span className={`text-[11px] font-black px-2 py-1 rounded ${DIFF_STYLE[p.difficulty]}`}>{p.difficulty}</span>
                                  </td>
                                  <td className="px-4 py-3 align-middle">
                                    <div className="flex gap-2 flex-wrap">
                                      <a href={p.link1} target="_blank" rel="noreferrer" className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">Solve ↗</a>
                                      {p.link2 && <a href={p.link2} target="_blank" rel="noreferrer" className="text-[11px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Alt 1</a>}
                                      {p.link3 && <a href={p.link3} target="_blank" rel="noreferrer" className="text-[11px] font-bold px-2.5 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Alt 2</a>}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="font-black text-gray-900 mb-4">Your Breakdown</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                      <div className="font-black text-gray-700 text-lg">{patternsDone} / {DSA_SHEET.length}</div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">Patterns Done</div>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                      <div className="font-black text-emerald-700 text-lg">{easySolved}</div>
                      <div className="text-xs text-emerald-500 font-bold uppercase tracking-wide mt-1">Easy Solved</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-center">
                      <div className="font-black text-amber-700 text-lg">{mediumSolved}</div>
                      <div className="text-xs text-amber-500 font-bold uppercase tracking-wide mt-1">Medium Solved</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                      <div className="font-black text-red-700 text-lg">{hardSolved}</div>
                      <div className="text-xs text-red-500 font-bold uppercase tracking-wide mt-1">Hard Solved</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-center text-gray-500 font-medium text-sm max-w-xs">
                    Keep grinding! {totalSolved === 0 ? "Start with Pattern 1 — Two Pointers 🚀" : `You've solved ${totalSolved} problem${totalSolved !== 1 ? 's' : ''} so far. Keep it up! 💪`}
                  </p>
                  <button
                    onClick={shareText}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                  >
                    📤 Share My Progress
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =============== TAB: STREAK CALENDAR =============== */}
        {activeTab === "calendar" && (
          <div className="animate-fade-in-up flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
            <div className="text-6xl mb-6">📅</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Streak Calendar Coming Soon</h2>
            <p className="text-gray-500 font-medium max-w-md">
              A GitHub-style contribution calendar will be mounted here to visually track your daily coding hustle. Keep logging problems in the meantime!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
