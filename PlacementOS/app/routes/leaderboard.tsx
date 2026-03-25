import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";

export function meta() {
  return [
    { title: "Resume Score Leaderboard 🏆 — PlacementOS" },
    { name: "description", content: "Compare your resume score with students from your college" },
  ];
}

interface LeaderboardEntry {
  _id: string;
  userId: string;
  name: string;
  college: string;
  bestScore: number;
  totalAnalyses: number;
  badge: string;
  isPublic: boolean;
  streak: number;
  updatedAt: string;
}

interface UserRankInfo {
  entry: LeaderboardEntry;
  rank: number;
  totalStudents: number;
  avgScore: number;
}

export default function Leaderboard() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);

  const [filterCollege, setFilterCollege] = useState("All");
  const [filterTime, setFilterTime] = useState("all");
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCollege, setJoinCollege] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Get leaderboard
      const lbRes = await apiFetch(`/leaderboard?college=${encodeURIComponent(filterCollege)}&filter=${filterTime}`, { token });
      if (Array.isArray(lbRes)) setData(lbRes);

      // Get user rank info
      const rankRes = await apiFetch("/leaderboard/rank", { token });
      if (rankRes && !(rankRes as any).message) setUserRank(rankRes as any);
      
    } catch (err) {
      console.error("Leaderboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCollege, filterTime, token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !joinCollege.trim()) return;
    try {
      await apiFetch("/leaderboard/join", {
        method: "POST",
        token,
        body: JSON.stringify({
          name: user?.name,
          college: joinCollege,
          isPublic: true
        })
      });
      setShowJoinModal(false);
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to join leaderboard");
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch(badge) {
      case 'Diamond': return '💎';
      case 'On Fire': return '🔥';
      case 'Expert': return '👑';
      case 'Pro': return '🥈';
      case 'Advanced': return '🥉';
      case 'Intermediate': return '⭐';
      default: return '🌱';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      <div className="bg-[#1e1b4b] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">Resume Score Leaderboard 🏆</h1>
          <p className="text-xl text-indigo-200 font-medium max-w-2xl mx-auto drop-shadow">
            Compare your ATS score with peers, climb the ranks, and get hired faster.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* RANK CARD (If user joined) */}
        {!loading && userRank?.entry ? (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl shadow-2xl p-1 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-amber-200">
                  {userRank.rank === 1 ? '👑' : userRank.rank <= 3 ? '🥈' : '⭐'}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Rank #{userRank.rank} <span className="text-amber-500 font-bold text-lg">/ {userRank.totalStudents}</span></h2>
                  <p className="text-gray-600 dark:text-gray-400 font-bold">{userRank.entry.college}</p>
                </div>
              </div>
              
              <div className="flex gap-4 md:gap-8 w-full md:w-auto text-center md:text-left justify-around">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Best</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{userRank.entry.bestScore}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Badge</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 justify-center md:justify-start">
                    {getBadgeIcon(userRank.entry.badge)} {userRank.entry.badge}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">College Avg</p>
                  <p className="text-2xl font-black text-indigo-600">{userRank.avgScore}</p>
                </div>
              </div>

              <div className="w-full md:w-auto mt-4 md:mt-0">
                <Link to="/upload" className="w-full md:w-auto block text-center px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md">
                  Improve Score 🚀
                </Link>
              </div>
            </div>
          </div>
        ) : !loading && !userRank && (
           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 mb-8 text-center flex flex-col items-center">
             <div className="text-5xl mb-4">🎯</div>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Join the Competition</h2>
             <p className="text-gray-500 max-w-md mb-6">See how your resume stacks up against thousands of students from top colleges.</p>
             <button onClick={() => setShowJoinModal(true)} className="px-8 py-3 bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all text-lg">
               Join Leaderboard
             </button>
           </div>
        )}

        {/* CONTROLS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex w-full md:w-auto gap-2">
            <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-950 border border-r-0 border-gray-200 dark:border-gray-800 rounded-l-lg text-gray-500 font-bold text-sm">🏛️</span>
            <input 
              type="text" 
              placeholder="Filter by college name (e.g. IIT Delhi)"
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-r-lg focus:ring-2 focus:ring-indigo-500 w-full md:w-64 font-medium"
            />
            {filterCollege !== 'All' && (
              <button onClick={() => setFilterCollege("All")} className="ml-2 text-sm text-indigo-600 font-bold">Clear</button>
            )}
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            <button onClick={() => setFilterTime('week')} className={`flex-1 md:px-4 py-1.5 text-sm font-bold rounded transition-all ${filterTime === 'week' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>This Week</button>
            <button onClick={() => setFilterTime('month')} className={`flex-1 md:px-4 py-1.5 text-sm font-bold rounded transition-all ${filterTime === 'month' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>This Month</button>
            <button onClick={() => setFilterTime('all')} className={`flex-1 md:px-4 py-1.5 text-sm font-bold rounded transition-all ${filterTime === 'all' ? 'bg-white dark:bg-gray-900 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>All Time</button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-gray-400 font-bold">Loading leaderboard rankings...</div>
          ) : data.length === 0 ? (
             <div className="p-12 text-center">
               <div className="text-4xl mb-3">👻</div>
               <p className="text-gray-500 font-bold">No students found matching this criteria.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Rank</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">College</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Analyses</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Badge</th>
                    <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Best Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((entry, idx) => (
                    <tr key={entry._id} className={`hover:bg-gray-50 dark:bg-gray-950 transition-colors ${entry.userId === user?.id ? 'bg-amber-50 dark:bg-amber-900/20/50' : ''}`}>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700 dark:text-gray-300' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{entry.name} {entry.userId === user?.id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>}</td>
                      <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400">{entry.college}</td>
                      <td className="p-4 text-center text-sm font-bold text-gray-500">{entry.totalAnalyses}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                          {getBadgeIcon(entry.badge)} {entry.badge}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-lg font-black ${entry.bestScore >= 80 ? 'text-green-600' : entry.bestScore >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {entry.bestScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Join Leaderboard</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your college to see how you rank among your peers.</p>
            
            <form onSubmit={handleJoin}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your College Name</label>
                <input 
                  type="text" 
                  value={joinCollege}
                  onChange={(e) => setJoinCollege(e.target.value)}
                  placeholder="e.g. VIT Vellore, IIT Delhi"
                  required
                  autoFocus
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md">Join Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
