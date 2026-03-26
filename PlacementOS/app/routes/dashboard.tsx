import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import ProgressChart from "~/components/ProgressChart";
export function meta() {
  return [
    { title: "Dashboard — PlacementOS" },
    { name: "description", content: "Your resume analysis dashboard" },
  ];
}

interface Stats {
  averageScore: number;
  bestScore: number;
  totalAnalyses: number;
  improvement: number;
  scoreHistory: Array<{ score: number; date: string }>;
}

interface RecentAnalysis {
  _id: string;
  atsScore: number;
  jobTitle?: string;
  improvements: string[];
  createdAt: string;
}

export default function Dashboard() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const validateSession = useAppAuthStore((s) => s.validateSession);
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void validateSession();
  }, [validateSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          apiFetch("/history/stats", { token }),
          apiFetch("/history", { token }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (historyRes.ok) {
          const h = await historyRes.json() as RecentAnalysis[];
          setRecent(h.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard failed to fetch history APIs:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  const getScoreColor = (s: number) => s >= 70 ? "text-emerald-600" : s >= 40 ? "text-yellow-600" : "text-red-600";
  const getScoreBg = (s: number) => s >= 70 ? "bg-emerald-100" : s >= 40 ? "bg-yellow-100" : "bg-red-100";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's your resume analysis overview.</p>
          </div>
          <Link to="/upload" className="btn-primary">
            + Analyze New Resume
          </Link>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Analyses", value: stats?.totalAnalyses || 0, icon: "📊", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
              { label: "Best Score", value: `${stats?.bestScore || 0}/100`, icon: "🏆", color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Avg. Score", value: `${stats?.averageScore || 0}/100`, icon: "📈", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
              { label: "Improvement", value: `${(stats?.improvement || 0) > 0 ? "+" : ""}${stats?.improvement || 0}pts`, icon: "⚡", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s, i) => (
              <div key={s.label} className={`stat-card animate-fade-in-up delay-${i * 100}`}>
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-xl mb-2`}>{s.icon}</div>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="md:col-span-2 card animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Score Progress</h2>
            {loading ? (
              <div className="skeleton h-52" />
            ) : (
              <ProgressChart data={stats?.scoreHistory || []} />
            )}
          </div>

          {/* Quick actions */}
          <div className="card animate-fade-in-up delay-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/upload" className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 dark:bg-violet-900/20 border border-violet-100 transition-all">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Analyze Resume</p>
                  <p className="text-xs text-gray-500">Upload PDF + job description</p>
                </div>
              </Link>
              <Link to="/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:bg-blue-900/20 border border-blue-100 transition-all">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">View History</p>
                  <p className="text-xs text-gray-500">All {stats?.totalAnalyses || 0} past analyses</p>
                </div>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 border border-emerald-100 transition-all">
                <span className="text-2xl">⚙️</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Edit Profile</p>
                  <p className="text-xs text-gray-500">Update your target role & skills</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="mt-8 animate-fade-in-up delay-150">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Explore AI Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link to="/interview" className="card hover:border-violet-300 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">🎤</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Interview Prep</h3>
              <p className="text-xs text-gray-500 mb-3">Generate custom Q&A</p>
              <span className="text-xs font-semibold text-violet-600 mt-auto">Open →</span>
            </Link>
            
            <Link to="/cover-letter" className="card hover:border-blue-300 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">📝</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Cover Letter</h3>
              <p className="text-xs text-gray-500 mb-3">AI crafted letters</p>
              <span className="text-xs font-semibold text-blue-600 mt-auto">Open →</span>
            </Link>

            <Link to="/resume-builder" className="card hover:border-emerald-300 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">📄</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Resume Builder</h3>
              <p className="text-xs text-gray-500 mb-3">Build with AI tips</p>
              <span className="text-xs font-semibold text-emerald-600 mt-auto">Open →</span>
            </Link>

            <Link to="/salary" className="card hover:border-yellow-300 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Salary Check</h3>
              <p className="text-xs text-gray-500 mb-3">Market predictions</p>
              <span className="text-xs font-semibold text-yellow-600 mt-auto">Open →</span>
            </Link>

            <Link to="/linkedin" className="card hover:border-blue-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#E1F0FE] text-[#0A66C2] rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">💼</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">LinkedIn Tips</h3>
              <p className="text-xs text-gray-500 mb-3">Optimize your profile</p>
              <span className="text-xs font-semibold text-[#0A66C2] mt-auto">Open →</span>
            </Link>
          </div>
        </div>

        {/* Placement Ecosystem */}
        <div className="mt-8 animate-fade-in-up delay-[200ms]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Placement Ecosystem</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/career-guide" className="card hover:border-purple-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🎓</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Career Guide</h3>
              <p className="text-xs text-gray-500 mb-3">GATE, PSU, YouTube & more</p>
              <span className="text-xs font-semibold text-purple-600 mt-auto">Explore →</span>
            </Link>

            <Link to="/roadmap" className="card hover:border-emerald-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🗺️</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">AI Roadmap</h3>
              <p className="text-xs text-gray-500 mb-3">Custom study plans</p>
              <span className="text-xs font-semibold text-emerald-600 mt-auto">Open →</span>
            </Link>
            
            <Link to="/leaderboard" className="card hover:border-amber-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🏆</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Leaderboard</h3>
              <p className="text-xs text-gray-500 mb-3">Compete & rank</p>
              <span className="text-xs font-semibold text-amber-600 mt-auto">Open →</span>
            </Link>

            <Link to="/dsa" className="card hover:border-indigo-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">💻</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">DSA Tracker</h3>
              <p className="text-xs text-gray-500 mb-3">Track problem solving</p>
              <span className="text-xs font-semibold text-indigo-600 mt-auto">Open →</span>
            </Link>

            <Link to="/company-research" className="card hover:border-rose-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🏢</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Company Intel</h3>
              <p className="text-xs text-gray-500 mb-3">Salaries & rounds</p>
              <span className="text-xs font-semibold text-rose-600 mt-auto">Open →</span>
            </Link>

            <Link to="/referral" className="card hover:border-cyan-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🤝</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Referrals</h3>
              <p className="text-xs text-gray-500 mb-3">Connect with alumni</p>
              <span className="text-xs font-semibold text-cyan-600 mt-auto">Open →</span>
            </Link>

            <Link to="/jobs" className="card hover:border-blue-500 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🎯</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Job Board</h3>
              <p className="text-xs text-gray-500 mb-3">Aggregated hiring alerts</p>
              <span className="text-xs font-semibold text-blue-600 mt-auto">Browse →</span>
            </Link>
          </div>
        </div>

        {/* Student Toolkit */}
        <div className="mt-8 animate-fade-in-up delay-[300ms]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Student Toolkit 🎒</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link to="/free-resources" className="card hover:border-indigo-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">📚</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Free Resources</h3>
              <p className="text-xs text-gray-500 mb-3">Find free course alternatives</p>
              <span className="text-xs font-semibold text-indigo-600 mt-auto">Find Free →</span>
            </Link>

            <Link to="/hackathons" className="card hover:border-yellow-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🏆</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Hackathons</h3>
              <p className="text-xs text-gray-500 mb-3">Find & win hackathons</p>
              <span className="text-xs font-semibold text-yellow-600 mt-auto">Explore →</span>
            </Link>

            <Link to="/freelancing" className="card hover:border-emerald-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">💰</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Freelancing</h3>
              <p className="text-xs text-gray-500 mb-3">Earn while you study</p>
              <span className="text-xs font-semibold text-emerald-600 mt-auto">Start →</span>
            </Link>

            <Link to="/certifications" className="card hover:border-amber-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🏅</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Certifications</h3>
              <p className="text-xs text-gray-500 mb-3">What's actually worth it</p>
              <span className="text-xs font-semibold text-amber-600 mt-auto">View →</span>
            </Link>

            <Link to="/github-optimizer" className="card hover:border-gray-500 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gray-100 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🐙</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">GitHub Profile</h3>
              <p className="text-xs text-gray-500 mb-3">Impress recruiters</p>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-auto">Optimize →</span>
            </Link>

            <Link to="/linkedin-builder" className="card hover:border-blue-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">💼</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">LinkedIn Builder</h3>
              <p className="text-xs text-gray-500 mb-3">Step-by-step profile</p>
              <span className="text-xs font-semibold text-blue-600 mt-auto">Build →</span>
            </Link>
          </div>
        </div>

        {/* Real-World Tools */}
        <div className="mt-8 animate-fade-in-up delay-[350ms]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Explore Real-World Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link to="/roast" className="card hover:border-red-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🔥</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Resume Roast</h3>
              <p className="text-xs text-gray-500 mb-3">Brutal honest feedback</p>
              <span className="text-xs font-semibold text-red-600 mt-auto">Open →</span>
            </Link>
            
            <Link to="/mock-interview" className="card hover:border-indigo-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🎤</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Mock Interview</h3>
              <p className="text-xs text-gray-500 mb-3">Practice with AI</p>
              <span className="text-xs font-semibold text-indigo-600 mt-auto">Open →</span>
            </Link>

            <Link to="/skill-gap" className="card hover:border-teal-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">📊</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Skill Gap</h3>
              <p className="text-xs text-gray-500 mb-3">Find what's missing</p>
              <span className="text-xs font-semibold text-teal-600 mt-auto">Open →</span>
            </Link>

            <Link to="/job-tracker" className="card hover:border-blue-500 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">📋</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Job Tracker</h3>
              <p className="text-xs text-gray-500 mb-3">Track applications</p>
              <span className="text-xs font-semibold text-blue-600 mt-auto">Open →</span>
            </Link>

            <Link to="/campus" className="card hover:border-fuchsia-400 hover:shadow-xl transition-all group p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm">🏫</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Campus Data</h3>
              <p className="text-xs text-gray-500 mb-3">See placement trends</p>
              <span className="text-xs font-semibold text-fuchsia-600 mt-auto">Open →</span>
            </Link>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="mt-6 card animate-fade-in-up delay-[300ms]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Analyses</h2>
            <Link to="/history" className="text-sm text-violet-600 font-medium hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📄</p>
              <p className="font-medium">No analyses yet</p>
              <Link to="/upload" className="btn-primary mt-4 inline-flex">Start Analyzing</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((a) => (
                <div key={a._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl hover:bg-gray-100 transition-all">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${getScoreBg(a.atsScore)} ${getScoreColor(a.atsScore)} shrink-0`}>
                    {a.atsScore}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{a.jobTitle || "Resume Analysis"}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    {a.improvements?.[0] && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">💡 {a.improvements[0]}</p>
                    )}
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreBg(a.atsScore)} ${getScoreColor(a.atsScore)}`}>
                    {a.atsScore >= 70 ? "Good" : a.atsScore >= 40 ? "Fair" : "Low"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
