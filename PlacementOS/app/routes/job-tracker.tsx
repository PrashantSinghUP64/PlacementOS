import { useState, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

type JobStatus = "Applied" | "Interview" | "Offered" | "Rejected";

interface Job {
  _id: string;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  appliedDate: string;
  status: JobStatus;
  salary?: string;
  notes?: string;
}

export default function JobTracker() {
  const token = useAppAuthStore((s) => s.token);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    jobTitle: "",
    jobUrl: "",
    appliedDate: new Date().toISOString().split("T")[0],
    salary: "",
    notes: "",
    status: "Applied" as JobStatus
  });

  // Drag & Drop
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await apiFetch("/jobs-tracker", { token });
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = editingJob 
      ? `/jobs-tracker/${editingJob._id}` 
      : `/jobs-tracker/add`;
    const method = editingJob ? "PUT" : "POST";

    try {
      const res = await apiFetch(path, {
        method,
        token,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchJobs();
      }
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiFetch(`/jobs-tracker/${id}`, {
        method: "DELETE",
        token
      });
      fetchJobs();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const updateStatus = async (id: string, newStatus: JobStatus) => {
    try {
      // Optimistic update
      setJobs(jobs.map(j => j._id === id ? { ...j, status: newStatus } : j));
      
      await apiFetch(`/jobs-tracker/${id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      fetchJobs(); // Revert on failure
    }
  };

  const openModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        company: job.company,
        jobTitle: job.jobTitle,
        jobUrl: job.jobUrl || "",
        appliedDate: new Date(job.appliedDate).toISOString().split("T")[0],
        salary: job.salary || "",
        notes: job.notes || "",
        status: job.status
      });
    } else {
      setEditingJob(null);
      setFormData({
        company: "",
        jobTitle: "",
        jobUrl: "",
        appliedDate: new Date().toISOString().split("T")[0],
        salary: "",
        notes: "",
        status: "Applied"
      });
    }
    setIsModalOpen(true);
  };

  // Stats Logic
  const total = jobs.length;
  const interviews = jobs.filter(j => j.status === "Interview").length;
  const offers = jobs.filter(j => j.status === "Offered").length;
  const successRate = total > 0 ? ((offers / total) * 100).toFixed(1) : "0";

  const getDaysAgo = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
    return days === 0 ? "Today" : `${days} d ago`;
  };

  // Filtered Jobs
  const filteredJobs = jobs.filter(j => 
    j.company.toLowerCase().includes(search.toLowerCase()) || 
    j.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const columns: { title: string; status: JobStatus; color: string; bg: string; borderColor: string }[] = [
    { title: "Applied", status: "Applied", color: "text-blue-700", bg: "bg-blue-50 dark:bg-blue-900/20/50", borderColor: "border-blue-200" },
    { title: "Interview", status: "Interview", color: "text-yellow-700", bg: "bg-yellow-50/50", borderColor: "border-yellow-200" },
    { title: "Offered", status: "Offered", color: "text-green-700", bg: "bg-green-50 dark:bg-green-900/20/50", borderColor: "border-green-200" },
    { title: "Rejected", status: "Rejected", color: "text-red-700", bg: "bg-red-50 dark:bg-red-900/20/50", borderColor: "border-red-200" }
  ];

  // Chart Data preparation
  const statusData = [
    { name: "Applied", value: jobs.filter(j => j.status === "Applied").length, color: "#3b82f6" },
    { name: "Interview", value: jobs.filter(j => j.status === "Interview").length, color: "#eab308" },
    { name: "Offered", value: jobs.filter(j => j.status === "Offered").length, color: "#22c55e" },
    { name: "Rejected", value: jobs.filter(j => j.status === "Rejected").length, color: "#ef4444" }
  ].filter(d => d.value > 0);

  // Weekly applications (last 4 weeks)
  const getWeeklyData = () => {
    const now = new Date();
    const weeks = Array(4).fill(0).map((_, i) => {
      const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { 
        name: `Week ${4-i}`, 
        count: jobs.filter(j => {
          const d = new Date(j.appliedDate);
          return d >= start && d <= end;
        }).length 
      };
    }).reverse();
    return weeks;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-6 px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-2xl">📋</span>
                Job Application Tracker
              </h1>
              <p className="text-gray-500 font-medium mt-1 ml-1">Manage your job hunt in one place</p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search company..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 text-sm font-medium w-full md:w-64 transition-all outline-none"
                />
              </div>
              <button onClick={() => openModal()} className="btn-primary py-2 px-6 whitespace-nowrap shadow-md shadow-blue-500/20">
                + Add App
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Apps</p>
              <p className="text-3xl font-black text-gray-800 dark:text-gray-200">{total}</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
              <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider mb-1">Interviews</p>
              <p className="text-3xl font-black text-yellow-700">{interviews}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Offers</p>
              <p className="text-3xl font-black text-green-700">{offers}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 flex flex-col justify-end">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Success Rate</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-blue-700">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin text-4xl">🔄</div></div>
        ) : (
          <>
            {/* KANBAN BOARD */}
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x min-h-[60vh]">
              {columns.map(col => (
                <div 
                  key={col.status} 
                  className={`w-80 flex-shrink-0 snap-center flex flex-col`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (draggedJobId) updateStatus(draggedJobId, col.status);
                  }}
                >
                  <div className={`px-4 py-3 rounded-t-2xl font-black border-b ${col.bg} ${col.color} ${col.borderColor} flex justify-between items-center`}>
                    <span>{col.title}</span>
                    <span className="bg-white dark:bg-gray-900/50 px-2 py-0.5 rounded-lg text-sm">{filteredJobs.filter(j => j.status === col.status).length}</span>
                  </div>
                  
                  <div className={`flex-1 p-3 bg-white dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-2xl shadow-sm space-y-3 ${draggedJobId ? 'bg-gray-50 dark:bg-gray-950/50' : ''}`}>
                    {filteredJobs.filter(j => j.status === col.status).map(job => (
                      <div
                        key={job._id}
                        draggable
                        onDragStart={() => setDraggedJobId(job._id)}
                        onDragEnd={() => setDraggedJobId(null)}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl shadow-sm hover:shadow hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group relative"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white dark:bg-gray-900/90 rounded shadow-sm border border-gray-100 dark:border-gray-800 backdrop-blur-sm z-10">
                          <button onClick={() => openModal(job)} className="p-1.5 text-gray-400 hover:text-blue-500" title="Edit">✏️</button>
                          <button onClick={() => handleDelete(job._id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Delete">🗑️</button>
                        </div>

                        <h3 className="font-bold text-gray-900 dark:text-white pr-12">{job.company}</h3>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{job.jobTitle}</p>
                        
                        {job.salary && (
                          <div className="inline-block bg-green-50 dark:bg-green-900/20 text-green-700 text-xs font-bold px-2 py-1 rounded mb-3 border border-green-100">
                            💰 {job.salary}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs font-semibold text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                          <span className="flex items-center gap-1">📅 {getDaysAgo(job.appliedDate)}</span>
                          {job.jobUrl && (
                            <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Link ↗</a>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredJobs.filter(j => j.status === col.status).length === 0 && (
                      <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-sm font-medium text-gray-400 opacity-50">
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DASHBOARD CHARTS */}
            {jobs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">Applications Trend (Last 4 Weeks)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getWeeklyData()}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">Status Breakdown</h3>
                  <div className="h-64 relative flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
                      <span className="text-3xl font-black text-gray-800 dark:text-gray-200">{total}</span>
                      <span className="text-xs font-bold text-gray-400">Total</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingJob ? 'Edit Application' : 'Add Application'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                  <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
                  <input required type="text" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as JobStatus})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500">
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Applied Date</label>
                  <input type="date" value={formData.appliedDate} onChange={e => setFormData({...formData, appliedDate: e.target.value})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Expected Salary</label>
                  <input type="text" placeholder="e.g. $120k - $150k" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Job URL</label>
                  <input type="url" placeholder="https://" value={formData.jobUrl} onChange={e => setFormData({...formData, jobUrl: e.target.value})} className="w-full text-input focus:ring-blue-100 focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea rows={3} placeholder="Any details..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full text-input resize-none focus:ring-blue-100 focus:border-blue-500"></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-8">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
