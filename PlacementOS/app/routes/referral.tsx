import { useState, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";

export function meta() {
  return [
    { title: "Referral Network 🤝 — PlacementOS" },
    { name: "description", content: "Connect with alumni and seniors to get referred to top tech companies" },
  ];
}

export default function ReferralNetwork() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);

  const [mode, setMode] = useState<"need" | "give">("need");
  const [loading, setLoading] = useState(false);

  // --- NEED REFERRAL STATE ---
  const [providers, setProviders] = useState<any[]>([]);
  const [searchCompany, setSearchCompany] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchCollege, setSearchCollege] = useState("");
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [reqForm, setReqForm] = useState({ linkedinUrl: "", resumeUrl: "", targetRole: "", message: "" });
  
  const [myOutgoingRequests, setMyOutgoingRequests] = useState<any[]>([]);

  // --- GIVE REFERRAL STATE ---
  const [isRegisteredProvider, setIsRegisteredProvider] = useState(false);
  const [providerForm, setProviderForm] = useState({
    company: "", role: "", linkedinUrl: "", college: "", rolesReferredFor: "SDE, Frontend, Backend", maxReferralsPerMonth: 3, isActive: true
  });
  const [myIncomingRequests, setMyIncomingRequests] = useState<any[]>([]);

  // Fetch initial data based on mode
  useEffect(() => {
    if (!token) return;
    if (mode === "need") {
      fetchProviders();
      fetchOutgoingRequests();
    } else {
      checkProviderStatus();
      fetchIncomingRequests();
    }
  }, [mode, token]);

  // --- NEED API CALLS ---
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchCompany) query.append("company", searchCompany);
      if (searchRole) query.append("role", searchRole);
      if (searchCollege) query.append("college", searchCollege);
      
      const res = await apiFetch(`/referral/providers?${query.toString()}`, { token });
      if (Array.isArray(res)) setProviders(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const res = await apiFetch("/referral/outgoing-requests", { token });
      if (Array.isArray(res)) setMyOutgoingRequests(res);
    } catch (err) { }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedProvider) return;
    try {
      await apiFetch("/referral/request", {
        method: "POST",
        token,
        body: JSON.stringify({
          toProviderId: selectedProvider._id,
          requesterName: user?.name,
          requesterEmail: user?.email,
          ...reqForm
        })
      });
      setShowRequestModal(false);
      setReqForm({ linkedinUrl: "", resumeUrl: "", targetRole: "", message: "" });
      fetchOutgoingRequests();
      alert("Referral request sent!");
    } catch (err: any) {
      alert(err.message || "Failed to send request");
    }
  };

  // --- GIVE API CALLS ---
  const checkProviderStatus = async () => {
    try {
      const res: any = await apiFetch("/referral/me", { token });
      if (res) {
        setIsRegisteredProvider(true);
        setProviderForm({
          company: res.company,
          role: res.role,
          linkedinUrl: res.linkedinUrl,
          college: res.college,
          rolesReferredFor: res.rolesReferredFor.join(", "),
          maxReferralsPerMonth: res.maxReferralsPerMonth,
          isActive: res.isActive
        });
      }
    } catch (err) { }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await apiFetch("/referral/incoming-requests", { token });
      if (Array.isArray(res)) setMyIncomingRequests(res);
    } catch (err) { }
  };

  const registerProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiFetch("/referral/register-provider", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...providerForm,
          rolesReferredFor: providerForm.rolesReferredFor.split(",").map(r => r.trim())
        })
      });
      setIsRegisteredProvider(true);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const respondToRequest = async (reqId: string, status: "Accepted" | "Declined") => {
    if (!token) return;
    try {
      await apiFetch(`/referral/request/${reqId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ status })
      });
      fetchIncomingRequests();
    } catch (err) {
      alert("Failed to update request");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-[#0f172a] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">Referral Network 🤝</h1>
          <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto mb-8">
            Connect with alumni and professionals. Get referred to top companies, or help juniors break into tech.
          </p>

          <div className="flex bg-white/10 p-1.5 rounded-2xl w-fit mx-auto border border-white/20 backdrop-blur-sm">
            <button 
              onClick={() => setMode("need")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${mode === "need" ? "bg-white text-slate-900 shadow-lg" : "text-white hover:bg-white/10"}`}
            >
              🙋‍♂️ I Need a Referral
            </button>
            <button 
              onClick={() => setMode("give")}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${mode === "give" ? "bg-white text-slate-900 shadow-lg" : "text-white hover:bg-white/10"}`}
            >
              🏢 I Can Give Referrals
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        
        {/* --- MODE: NEED REFERRAL --- */}
        {mode === "need" && (
          <div className="animate-fade-in-up">
            
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Company (e.g. Google)" value={searchCompany} onChange={e=>setSearchCompany(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"/>
              <input type="text" placeholder="Role (e.g. Frontend)" value={searchRole} onChange={e=>setSearchRole(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"/>
              <input type="text" placeholder="Alumni College" value={searchCollege} onChange={e=>setSearchCollege(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"/>
              <button onClick={fetchProviders} className="px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow transition-all">Search</button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="font-black text-xl text-gray-900 mb-4 px-2">Professionals ({providers.length})</h2>
                {loading ? (
                  <div className="p-12 text-center text-gray-400 font-bold">Searching network...</div>
                ) : providers.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <p className="font-bold text-gray-500">No providers found matching your criteria.</p>
                  </div>
                ) : (
                  providers.map(p => (
                    <div key={p._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-xl font-black border border-rose-200">{p.name.charAt(0)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-gray-900 text-lg">{p.name.split(' ')[0]}</h3> {/* Show only first name */}
                            <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded">Response: {p.responseRate}%</span>
                          </div>
                          <p className="text-sm font-bold text-gray-600 mb-1">{p.role} @ <span className="font-black text-gray-900">{p.company}</span></p>
                          <p className="text-xs text-gray-500 font-medium">🏫 {p.college}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-3 text-sm">
                        <div className="flex gap-2">
                           <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2 py-1 rounded">Mentors for:</span>
                           <span className="text-gray-600 font-medium text-xs max-w-[150px] truncate">{p.rolesReferredFor.join(', ')}</span>
                        </div>
                        <button 
                          onClick={() => { setSelectedProvider(p); setShowRequestModal(true); }}
                          className="w-full md:w-auto px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow transition-all"
                        >
                          Request Referral
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* My Outgoing Requests */}
              <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6 h-[600px] flex flex-col">
                   <h2 className="font-black text-xl text-gray-900 mb-4 pb-4 border-b border-gray-100">My Requests</h2>
                   <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                     {myOutgoingRequests.length === 0 ? (
                       <p className="text-sm font-bold text-gray-400 text-center mt-12">You haven't requested any referrals yet.</p>
                     ) : (
                       myOutgoingRequests.map(req => (
                         <div key={req._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                           <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-gray-900 text-sm">{req.toProviderId?.company}</h4>
                             <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                               req.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                               req.status === 'Declined' ? 'bg-red-100 text-red-700' :
                               'bg-amber-100 text-amber-700'
                             }`}>{req.status}</span>
                           </div>
                           <p className="text-xs text-gray-600 font-medium mb-1">Target: {req.targetRole}</p>
                           <p className="text-[10px] text-gray-400">To: {req.toProviderId?.name}</p>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODE: GIVE REFERRAL --- */}
        {mode === "give" && (
          <div className="animate-fade-in-up grid lg:grid-cols-3 gap-8">
            
            {/* Registration/Profile Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-black text-xl text-gray-900 mb-6">{isRegisteredProvider ? 'My Provider Profile' : 'Become a Referrer'}</h2>
                <form onSubmit={registerProvider} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Company</label>
                    <input type="text" value={providerForm.company} onChange={e=>setProviderForm({...providerForm, company:e.target.value})} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Your Role</label>
                    <input type="text" value={providerForm.role} onChange={e=>setProviderForm({...providerForm, role:e.target.value})} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">LinkedIn URL</label>
                    <input type="url" value={providerForm.linkedinUrl} onChange={e=>setProviderForm({...providerForm, linkedinUrl:e.target.value})} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Alumni College</label>
                    <input type="text" value={providerForm.college} onChange={e=>setProviderForm({...providerForm, college:e.target.value})} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Roles you refer for (CSV)</label>
                    <input type="text" value={providerForm.rolesReferredFor} onChange={e=>setProviderForm({...providerForm, rolesReferredFor:e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"/>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-700">Accepting Referrals</label>
                    <input type="checkbox" checked={providerForm.isActive} onChange={e=>setProviderForm({...providerForm, isActive: e.target.checked})} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"/>
                  </div>
                  <button type="submit" className={`w-full py-3 font-bold rounded-xl text-white shadow-md transition-all ${isRegisteredProvider ? 'bg-slate-900 hover:bg-black' : 'bg-rose-600 hover:bg-rose-700'}`}>
                    {isRegisteredProvider ? 'Update Profile' : 'Register as Referrer'}
                  </button>
                </form>
              </div>
            </div>

            {/* Incoming Requests */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col min-h-[600px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h2 className="font-black text-xl text-gray-900">Incoming Requests</h2>
                  {isRegisteredProvider && <span className="text-xs bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full">Available</span>}
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto">
                  {!isRegisteredProvider ? (
                    <div className="text-center py-20">
                       <p className="text-gray-400 font-bold mb-4">Register your profile first to start receiving requests.</p>
                       <div className="text-6xl opacity-30">🔐</div>
                    </div>
                  ) : myIncomingRequests.length === 0 ? (
                    <div className="text-center py-20">
                       <p className="text-gray-400 font-bold mb-4">No pending requests right now.</p>
                       <div className="text-6xl opacity-30">☕</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myIncomingRequests.map(req => (
                        <div key={req._id} className="p-5 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                          {req.status !== 'Pending' && (
                            <div className="absolute top-0 right-0 w-max bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-2 py-1 rounded-bl-lg">Status: {req.status}</div>
                          )}
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <h3 className="text-lg font-black text-gray-900 mb-1">{req.requesterName}</h3>
                              <p className="text-sm font-bold text-rose-600 mb-3">Target: {req.targetRole}</p>
                              
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                <p className="text-xs text-gray-500 uppercase font-black mb-1">Pitch</p>
                                <p className="text-sm text-gray-700 italic">"{req.message}"</p>
                              </div>
                              
                              <div className="flex gap-3 mt-2">
                                <a href={req.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">🔗 LinkedIn</a>
                                <a href={req.resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1">📄 Resume</a>
                              </div>
                            </div>
                            
                            {req.status === 'Pending' && (
                              <div className="flex md:flex-col gap-2 shrink-0 md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                <button onClick={() => respondToRequest(req._id, 'Accepted')} className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors shadow">Accept</button>
                                <button onClick={() => respondToRequest(req._id, 'Declined')} className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600 text-sm font-bold rounded-xl transition-colors">Decline</button>
                                <a href={`mailto:${req.requesterEmail}`} className="flex-1 md:flex-none px-6 py-2 border border-gray-200 text-center text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">Contact</a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* REQUEST MODAL */}
      {showRequestModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Ask for Referral</h2>
            <p className="text-gray-500 text-sm mb-6 font-medium">To {selectedProvider.name.split(' ')[0]} at <span className="font-bold text-gray-900">{selectedProvider.company}</span></p>
            
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Target Role</label>
                <input type="text" required value={reqForm.targetRole} onChange={e=>setReqForm({...reqForm, targetRole: e.target.value})} placeholder="e.g. Frontend Engineer L4" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"/>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn Profile</label>
                   <input type="url" required value={reqForm.linkedinUrl} onChange={e=>setReqForm({...reqForm, linkedinUrl: e.target.value})} placeholder="https://..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"/>
                 </div>
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-700 mb-1">Resume Link (Drive/PDF)</label>
                   <input type="url" required value={reqForm.resumeUrl} onChange={e=>setReqForm({...reqForm, resumeUrl: e.target.value})} placeholder="https://..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium"/>
                 </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quick Pitch (Why should they refer you?)</label>
                <textarea required value={reqForm.message} onChange={e=>setReqForm({...reqForm, message: e.target.value})} maxLength={500} placeholder="I have solved 500+ LeetCode problems and built exactly the type of system your team is hiring for..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium h-24 resize-none"/>
                <p className="text-[10px] text-gray-400 font-bold text-right mt-1">{reqForm.message.length}/500</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-[2] px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors shadow-md">Send Request 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
