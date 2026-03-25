import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { apiFetch } from "~/lib/api";
import { useAppAuthStore } from "~/lib/app-auth";

export function meta() {
  return [
    { title: "Job Board & Aggregator — PlacementOS" },
    { name: "description", content: "Find and track the best jobs and internships." },
  ];
}

interface Job {
  _id: string;
  companyName: string;
  roleType: string;
  deadline: string | null;
  skills: string[];
  location: string;
  description?: string;
  url: string;
  salary?: string;
  source: string;
  category: string;
  jobType: string;
  bookmarkedBy: string[];
  appliedBy: string[];
  createdAt: string;
}

export default function JobsBoard() {
  const token = useAppAuthStore((s) => s.token);
  const user = useAppAuthStore((s) => s.user);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobType, setJobType] = useState("All");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchJobs();
  }, [category, jobType, isAuthenticated]);

  const fetchJobs = async (searchQuery = search) => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (category !== "All") q.append("category", category);
      if (jobType !== "All") q.append("jobType", jobType);
      if (searchQuery) q.append("search", searchQuery);

      const res = await apiFetch(`/jobs?${q.toString()}`, { token });
      if (res.ok) {
        setJobs(await res.json());
      }
    } catch (e) {
      console.error("Error fetching jobs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (jobId: string) => {
    if (!token) return;
    try {
      const res = await apiFetch(`/jobs/${jobId}/bookmark`, { method: "POST", token });
      if (res.ok) {
        setJobs(jobs.map((j) => {
          if (j._id === jobId) {
            const isSaved = j.bookmarkedBy.includes(user?.id || "");
            return {
              ...j,
              bookmarkedBy: isSaved 
                ? j.bookmarkedBy.filter(id => id !== user?.id)
                : [...j.bookmarkedBy, user?.id || ""]
            };
          }
          return j;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTimeLeft = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return "Expired";
    if (days === 0) return "Ends Today";
    if (days === 1) return "Ends Tomorrow";
    return `${days} days left`;
  };

  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "bg-gray-100 text-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:text-gray-300";
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days <= 1) return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
    if (days <= 3) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300";
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize tracking-tight flex items-center gap-2">
              <span className="text-4xl text-blue-600">🎯</span> Job Aggregator
            </h1>
            <p className="text-gray-500 mt-2">Find off-campus opportunities aggregated from multiple top portals.</p>
          </div>
          
          <Link to="/job-tracker" className="btn-primary py-2.5 px-6 whitespace-nowrap">
            My Tracked Jobs →
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="card mb-8 p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Search roles, companies or skills... (e.g. SDE Bangalore)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
              className="pl-10"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select className="w-full md:w-48" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="SDE">Software Dev (SDE)</option>
              <option value="Analyst">Data/Analyst</option>
              <option value="Design">UI/UX Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
            
            <select className="w-full md:w-48" value={jobType} onChange={e => setJobType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="On-Campus">On-Campus</option>
              <option value="Off-Campus">Off-Campus</option>
              <option value="Internship">Internship</option>
            </select>
            
            <button onClick={() => fetchJobs()} className="btn-primary py-3 px-6 whitespace-nowrap">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-2xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center flex flex-col items-center">
            <span className="text-6xl mb-4">📭</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Jobs Found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const isSaved = job.bookmarkedBy.includes(user?.id || "");
              const isApplied = job.appliedBy.includes(user?.id || "");
              const timeLeft = getTimeLeft(job.deadline);
              
              return (
                <div key={job._id} className="card relative p-6 flex flex-col border-2 hover:border-blue-500 transition-colors">
                  <button 
                    onClick={() => handleBookmark(job._id)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className={`text-xl ${isSaved ? "text-yellow-500 drop-shadow-sm" : "text-gray-300 dark:text-gray-600 dark:text-gray-400 grayscale"}`}>
                      🔖
                    </span>
                  </button>

                  <div className="flex items-center gap-4 mb-4 pr-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center rounded-xl text-xl font-black text-blue-700 dark:text-blue-300 shadow-sm shrink-0">
                      {job.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight truncate">{job.roleType}</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">{job.companyName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs font-semibold">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                      📍 {job.location}
                    </span>
                    <span className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-lg">
                      👔 {job.jobType}
                    </span>
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
                      🔗 {job.source}
                    </span>
                  </div>

                  <div className="mb-6 flex-1">
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[11px] font-medium px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 text-gray-400">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Deadline</span>
                      {timeLeft ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md mt-1 w-fit ${getDeadlineColor(job.deadline)}`}>
                          ⏳ {timeLeft}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-500 mt-1">Not specified</span>
                      )}
                    </div>
                    
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform hover:-translate-y-0.5 ${isApplied ? 'bg-gray-100 text-gray-600 dark:text-gray-400 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {isApplied ? 'Applied ✓' : 'Apply Now ↗'}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
