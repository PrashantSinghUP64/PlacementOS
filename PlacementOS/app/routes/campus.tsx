import { useState, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import { callAIForJSON } from "~/lib/aiHelper";

type CompanyType = "Service" | "Product" | "Startup" | "MAANG";

interface CampusRecord {
  _id: string;
  college: string;
  company: string;
  role: string;
  package: number;
  studentsSelected: number;
  visitDate: string;
  companyType: CompanyType;
  process: string;
  eligibility: string;
  notes: string;
  year: number;
  userId: string;
}

export default function CampusTracker() {
  const token = useAppAuthStore((s) => s.token);
  const user = useAppAuthStore((s) => s.user);

  const [records, setRecords] = useState<CampusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [collegeSearch, setCollegeSearch] = useState("Delhi Technological University");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CampusRecord | null>(null);
  const [formData, setFormData] = useState({
    college: "",
    company: "",
    role: "",
    package: "",
    studentsSelected: "",
    visitDate: new Date().toISOString().split("T")[0],
    companyType: "Product" as CompanyType,
    process: "",
    eligibility: "",
    notes: "",
    year: new Date().getFullYear()
  });

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (collegeSearch.trim() && collegeSearch.length > 2) {
      const delayInfo = setTimeout(() => {
        fetchRecords(collegeSearch);
      }, 500);
      return () => clearTimeout(delayInfo);
    }
  }, [collegeSearch]);

  const fetchRecords = async (college: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/campus/${encodeURIComponent(college)}`, { token });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = editingRecord 
      ? `/campus/${editingRecord._id}` 
      : `/campus/add`;
    const method = editingRecord ? "PUT" : "POST";

    try {
      const res = await apiFetch(path, {
        method,
        token,
        body: JSON.stringify({
          ...formData,
          college: formData.college || collegeSearch,
          package: Number(formData.package),
          studentsSelected: Number(formData.studentsSelected),
          year: Number(formData.year)
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchRecords(collegeSearch);
      }
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this placement record?")) return;
    try {
      await apiFetch(`/campus/${id}`, {
        method: "DELETE",
        token
      });
      fetchRecords(collegeSearch);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const openModal = (record?: CampusRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        college: record.college,
        company: record.company,
        role: record.role,
        package: record.package.toString(),
        studentsSelected: record.studentsSelected.toString(),
        visitDate: new Date(record.visitDate).toISOString().split("T")[0],
        companyType: record.companyType,
        process: record.process,
        eligibility: record.eligibility,
        notes: record.notes,
        year: record.year
      });
    } else {
      setEditingRecord(null);
      setFormData({
        college: collegeSearch,
        company: "",
        role: "",
        package: "",
        studentsSelected: "",
        visitDate: new Date().toISOString().split("T")[0],
        companyType: "Product",
        process: "",
        eligibility: "",
        notes: "",
        year: yearFilter
      });
    }
    setIsModalOpen(true);
  };

  const generateInsights = async () => {
    if (records.length === 0) return;
    setIsAnalyzing(true);
    setInsights(null);

    const yearRecords = records.filter(r => r.year === yearFilter);

    const prompt = `Analyze this campus placement data for ${collegeSearch} in ${yearFilter} and give insights.
Data: ${JSON.stringify(yearRecords.map(r => ({ company: r.company, role: r.role, package: r.package, students: r.studentsSelected, type: r.companyType })))}

Return ONLY JSON:
{
  "summary": "string",
  "trend": "string",
  "topSkills": ["string", "string"],
  "insights": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"]
}`;

    try {
      const parsed = await callAIForJSON(prompt);
      setInsights(parsed);
    } catch (err) {
      console.error("Failed to generate insights", err);
      alert("Failed to analyze data. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered & Stats Data
  const filteredRecords = records.filter(r => 
    r.year === yearFilter && 
    (typeFilter === "All" || r.companyType === typeFilter)
  ).sort((a, b) => b.package - a.package);

  const totalCompanies = filteredRecords.length;
  const totalStudents = filteredRecords.reduce((acc, r) => acc + r.studentsSelected, 0);
  const highestPackage = filteredRecords.length > 0 ? Math.max(...filteredRecords.map(r => r.package)) : 0;
  const avgPackage = totalCompanies > 0 ? (filteredRecords.reduce((acc, r) => acc + r.package, 0) / totalCompanies).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-fuchsia-900 border-b border-fuchsia-800 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <svg className="absolute right-0 top-0 w-96 h-96 text-white/5 -mt-20 -mr-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2.24-1.22V17h2V8.45L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/></svg>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <span className="bg-white dark:bg-gray-900/10 p-2 rounded-xl text-3xl">🏫</span>
              Campus Placement Tracker
            </h1>
            <p className="text-fuchsia-200 text-lg">See trends, packages, and recruiting companies at your college.</p>
          </div>
          
          <button onClick={() => openModal()} className="bg-white dark:bg-gray-900 text-fuchsia-900 hover:bg-fuchsia-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 whitespace-nowrap">
            + Add Placement Record
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* Filters Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 p-4 border border-gray-100 dark:border-gray-800 items-center justify-between mb-8">
          <div className="flex-1 w-full">
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400 font-bold">🎓</span>
              <input 
                type="text" 
                value={collegeSearch}
                onChange={e => setCollegeSearch(e.target.value)}
                placeholder="Enter college name... (e.g. DTU, IIT, NIT)"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-950 rounded-2xl outline-none focus:ring-2 focus:ring-fuchsia-500 font-bold text-gray-800 dark:text-gray-200 transition-all border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={yearFilter} 
              onChange={e => setYearFilter(Number(e.target.value))}
              className="py-3 px-4 bg-gray-50 dark:bg-gray-950 rounded-2xl font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-fuchsia-500 min-w-[120px]"
            >
              {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="py-3 px-4 bg-gray-50 dark:bg-gray-950 rounded-2xl font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="All">All Companies</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
              <option value="Startup">Startup</option>
              <option value="MAANG">MAANG</option>
            </select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-2">🏢</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Companies Visited</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalCompanies}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mb-2">🎓</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Students Placed</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center text-xl mb-2">💰</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Highest Package</p>
            <p className="text-3xl font-black text-fuchsia-600">{highestPackage} <span className="text-lg">LPA</span></p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl mb-2">📊</div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Avg Package</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{avgPackage} <span className="text-lg">LPA</span></p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Main Table Area */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Placement Records ({filteredRecords.length})</h2>
              {isLoading && <span className="animate-spin">🔄</span>}
            </div>
            
            <div className="overflow-x-auto">
              {filteredRecords.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-950">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Company</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Role</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Package</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Students</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">Type</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r, i) => (
                      <tr key={r._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{r.company}</div>
                          <div className="text-xs text-gray-500">{new Date(r.visitDate).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{r.role}</td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">
                            {r.package} LPA
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-700 dark:text-gray-300">{r.studentsSelected}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                            ${r.companyType === 'MAANG' ? 'bg-purple-100 text-purple-700' : 
                              r.companyType === 'Product' ? 'bg-blue-100 text-blue-700' : 
                              r.companyType === 'Startup' ? 'bg-orange-100 text-orange-700' : 
                              'bg-gray-100 text-gray-700 dark:text-gray-300'}`}
                          >
                            {r.companyType}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {r.userId === user?.id && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => openModal(r)} className="text-gray-400 hover:text-blue-600 bg-white dark:bg-gray-900 shadow-sm border py-1 px-3 rounded-lg text-sm font-medium">Edit</button>
                              <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600 bg-white dark:bg-gray-900 shadow-sm border py-1 px-3 rounded-lg text-sm font-medium">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Records Found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">There are no placement records for {collegeSearch} in {yearFilter} matching your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="xl:w-96 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-max">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-gray-900/5 rounded-full blur-2xl"></div>
              
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <span>🤖</span> Campus AI Insights
              </h3>
              <p className="text-indigo-200 text-sm mb-6">Analyze trends and get recommendations based on the collected placement data.</p>
              
              {!insights ? (
                <button 
                  onClick={generateInsights} 
                  disabled={isAnalyzing || filteredRecords.length === 0}
                  className="w-full bg-white dark:bg-gray-900 text-indigo-900 hover:bg-indigo-50 font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? "Analyzing Data..." : "Generate AI Analysis"}
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">Summary</h4>
                    <p className="bg-white dark:bg-gray-900/10 p-3 rounded-xl text-sm leading-relaxed">{insights.summary}</p>
                  </div>
                  <div>
                    <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">Trend</h4>
                    <p className="bg-white dark:bg-gray-900/10 p-3 rounded-xl text-sm leading-relaxed">{insights.trend}</p>
                  </div>
                  <div>
                    <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">Top Skills Demanded</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.topSkills.map((skill: string, i: number) => (
                        <span key={i} className="bg-indigo-500/40 border border-indigo-400/30 text-xs px-2 py-1 rounded-md">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">Key Insights</h4>
                    <ul className="space-y-2">
                      {insights.insights.map((s: string, i: number) => <li key={i} className="text-sm flex gap-2"><span>•</span>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-indigo-200 font-bold text-xs uppercase tracking-wider mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {insights.recommendations.map((s: string, i: number) => <li key={i} className="text-sm flex gap-2"><span>💡</span>{s}</li>)}
                    </ul>
                  </div>
                  <button onClick={() => setInsights(null)} className="text-indigo-300 text-xs w-full text-center hover:text-white underline">Clear Analysis</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingRecord ? 'Edit Placement Record' : 'Add Placement Record'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                  <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Job Role *</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Package (LPA) *</label>
                  <input required type="number" step="0.1" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Students Selected *</label>
                  <input required type="number" value={formData.studentsSelected} onChange={e => setFormData({...formData, studentsSelected: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Company Type</label>
                  <select value={formData.companyType} onChange={e => setFormData({...formData, companyType: e.target.value as CompanyType})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500">
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                    <option value="Startup">Startup</option>
                    <option value="MAANG">MAANG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Visit Date</label>
                  <input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                  <input required type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Interview Process</label>
                  <textarea rows={2} placeholder="Online Assessment -> Technical -> HR..." value={formData.process} onChange={e => setFormData({...formData, process: e.target.value})} className="w-full text-input resize-none focus:ring-fuchsia-100 focus:border-fuchsia-500"></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Eligibility Criteria</label>
                  <input type="text" placeholder="e.g. 7.5 CGPA, CSE/IT only" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} className="w-full text-input focus:ring-fuchsia-100 focus:border-fuchsia-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notes / Tips</label>
                  <textarea rows={2} placeholder="Any helpful tips for juniors..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full text-input resize-none focus:ring-fuchsia-100 focus:border-fuchsia-500"></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-end gap-3 z-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 px-8 rounded-xl shadow-md transition-all">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
