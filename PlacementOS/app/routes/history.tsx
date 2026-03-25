import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/lib/api";
import { useAppAuthStore } from "~/lib/app-auth";
import Navbar from "~/components/Navbar";
import ProgressChart from "~/components/ProgressChart";
export function meta() {
  return [
    { title: "History — PlacementOS" },
    { name: "description", content: "View all your past resume analyses" },
  ];
}

interface Analysis {
  _id: string;
  atsScore: number;
  jobTitle?: string;
  dimensions: { skillsMatch: number; experienceMatch: number; educationMatch: number; keywordsMatch: number; toneStyle: number };
  missingKeywords: string[];
  improvements: string[];
  suggestions: string[];
  createdAt: string;
}

interface Stats {
  averageScore: number;
  bestScore: number;
  totalAnalyses: number;
  improvement: number;
  scoreHistory: Array<{ score: number; date: string }>;
}

export default function History() {
  const token = useAppAuthStore((s) => s.token);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated, navigate]);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const [histRes, statsRes] = await Promise.all([
        apiFetch("/history", { token }),
        apiFetch("/history/stats", { token }),
      ]);
      if (histRes.ok) setAnalyses(await histRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token]);

  async function deleteAnalysis(id: string) {
    if (!token) return;
    setDeleting(id);
    const res = await apiFetch(`/history/${id}`, { method: "DELETE", token });
    if (res.ok) {
      setAnalyses((prev) => prev.filter((a) => a._id !== id));
      if (stats) setStats({ ...stats, totalAnalyses: stats.totalAnalyses - 1 });
    }
    setDeleting(null);
  }

  const getScoreColor = (s: number) => s >= 70 ? "text-emerald-600" : s >= 40 ? "text-yellow-600" : "text-red-600";
  const getScoreBg = (s: number) => s >= 70 ? "bg-emerald-100" : s >= 40 ? "bg-yellow-100" : "bg-red-100";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
          <p className="text-gray-500 mt-1">Track your resume improvement over time.</p>
        </div>

        {/* Stats row */}
        {stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
            {[
              { label: "Total", value: stats.totalAnalyses, icon: "📊" },
              { label: "Best", value: `${stats.bestScore}/100`, icon: "🏆" },
              { label: "Average", value: `${stats.averageScore}/100`, icon: "📈" },
              { label: "Net Change", value: `${stats.improvement > 0 ? "+" : ""}${stats.improvement}`, icon: "⚡" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <span className="text-xl">{s.icon}</span>
                <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {stats && stats.scoreHistory.length > 1 && (
          <div className="card mb-8 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Score Trend</h2>
            <ProgressChart data={stats.scoreHistory} />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : analyses.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">No analyses yet</p>
            <p className="text-gray-400 mt-2">Upload and analyze your first resume to see it here.</p>
            <button onClick={() => navigate("/upload")} className="btn-primary mt-6 inline-flex">
              Analyze Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((a) => (
              <div key={a._id} className="card animate-fade-in">
                <div className="flex items-center gap-4">
                  {/* Score badge */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${getScoreBg(a.atsScore)} ${getScoreColor(a.atsScore)}`}>
                    {a.atsScore}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{a.jobTitle || "Resume Analysis"}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {a.missingKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {a.missingKeywords.slice(0, 4).map((kw) => (
                          <span key={kw} className="chip-red text-[10px] px-2 py-0.5">{kw}</span>
                        ))}
                        {a.missingKeywords.length > 4 && <span className="text-xs text-gray-400">+{a.missingKeywords.length - 4} more</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpanded(expanded === a._id ? null : a._id)}
                      className="text-sm text-violet-600 hover:underline"
                    >
                      {expanded === a._id ? "▲ Less" : "▼ More"}
                    </button>
                    <button
                      onClick={() => deleteAnalysis(a._id)}
                      disabled={deleting === a._id}
                      className="btn-danger text-xs py-1 px-2"
                    >
                      {deleting === a._id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === a._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 animate-fade-in">
                    <div>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Score Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                        {[
                          ["Skills", a.dimensions.skillsMatch],
                          ["Experience", a.dimensions.experienceMatch],
                          ["Education", a.dimensions.educationMatch],
                          ["Keywords", a.dimensions.keywordsMatch],
                          ["Tone", a.dimensions.toneStyle],
                        ].map(([label, val]) => (
                          <div key={label as string} className={`rounded-xl py-2 px-1 ${getScoreBg(val as number)}`}>
                            <p className={`font-black text-lg ${getScoreColor(val as number)}`}>{val}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {a.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Improvements</p>
                        <ul className="space-y-1">
                          {a.improvements.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                              <span className="text-yellow-500">●</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
