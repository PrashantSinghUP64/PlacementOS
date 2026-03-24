import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Certification Roadmap 🏅 — PlacementOS" },
    { name: "description", content: "Which certifications are actually worth it for BTech CSE students" },
  ];
}

const CERTS: Record<string, { priority: string; name: string; provider: string; cost: string; time: string; value: number; impact: string; free: string[]; worth: boolean }[]> = {
  "Software Dev": [
    { priority: "1 — Do First", name: "Meta Frontend Developer", provider: "Coursera", cost: "Free (audit)", time: "6 months (part-time)", value: 8, impact: "Strong for frontend roles", free: ["Audit all 9 courses free", "YouTube Meta React course"], worth: true },
    { priority: "1 — Do First", name: "Google IT Automation with Python", provider: "Coursera", cost: "Free (audit)", time: "6 months", value: 7, impact: "Python skills validated by Google", free: ["Audit for free on Coursera", "freeCodeCamp Python course"], worth: true },
    { priority: "1 — Do First", name: "freeCodeCamp Certifications", provider: "freeCodeCamp", cost: "100% Free", time: "300 hrs/cert", value: 6, impact: "Good for building skills, shows effort", free: ["freecodecamp.org — all free"], worth: true },
    { priority: "2 — Worth Paying", name: "AWS Cloud Practitioner", provider: "Amazon", cost: "₹8,000", time: "1 month prep", value: 9, impact: "15-20% salary bump, very recognized", free: ["AWS Skill Builder (free)", "freeCodeCamp AWS course", "Tutorials Dojo practice"], worth: true },
    { priority: "2 — Worth Paying", name: "Microsoft Azure Fundamentals (AZ-900)", provider: "Microsoft", cost: "₹3,300", time: "2 weeks prep", value: 7, impact: "Entry-level cloud role + salary bump", free: ["Microsoft Learn (free content)", "YouTube John Savill course"], worth: true },
    { priority: "3 — Advanced", name: "AWS Developer Associate", provider: "Amazon", cost: "₹12,000", time: "2-3 months", value: 9, impact: "Major salary jump for cloud roles", free: ["AWS Skill Builder free content"], worth: true },
  ],
  "Data Science": [
    { priority: "1 — Do First", name: "IBM Data Science Professional", provider: "Coursera", cost: "Free (audit)", time: "4 months", value: 8, impact: "Strong foundation + project portfolio", free: ["Audit all courses free on Coursera"], worth: true },
    { priority: "1 — Do First", name: "Google Data Analytics", provider: "Coursera", cost: "Free (audit)", time: "6 months", value: 7, impact: "Recognized by employers, SQL + visualization", free: ["Coursera audit mode"], worth: true },
    { priority: "1 — Do First", name: "Kaggle Learn Certifications", provider: "Kaggle", cost: "100% Free", time: "30 hrs total", value: 6, impact: "Shows hands-on ML skills", free: ["kaggle.com/learn — 100% free"], worth: true },
    { priority: "2 — Worth Paying", name: "Google Professional ML Engineer", provider: "Google", cost: "₹20,000", time: "3-6 months", value: 9, impact: "Premium ML role, 20%+ salary", free: ["Google Cloud Skills Boost (some free)"], worth: true },
    { priority: "3 — Advanced", name: "TensorFlow Developer Certificate", provider: "Google", cost: "₹8,000", time: "2-3 months", value: 8, impact: "Recognized specifically for DL roles", free: ["Coursera TensorFlow course (audit free)"], worth: true },
  ],
  "DevOps & Cloud": [
    { priority: "1 — Do First", name: "AWS Cloud Practitioner", provider: "Amazon", cost: "₹8,000", time: "1 month", value: 9, impact: "Entry point to all AWS certs", free: ["AWS Skill Builder (free)", "freeCodeCamp AWS"], worth: true },
    { priority: "1 — Do First", name: "Google Cloud Associate Engineer", provider: "Google", cost: "₹15,000", time: "2-3 months", value: 8, impact: "GCP roles, startup ecosystem", free: ["Google Cloud Skills Boost (free labs)"], worth: true },
    { priority: "2 — Worth Paying", name: "CKA — Kubernetes Admin", provider: "CNCF", cost: "₹25,000", time: "3 months", value: 9, impact: "Major DevOps salary boost — very in demand", free: ["KodeKloud free tier", "Kubernetes docs"], worth: true },
    { priority: "2 — Worth Paying", name: "GitHub Actions / GitLab CI", provider: "GitHub", cost: "Free", time: "2 weeks", value: 7, impact: "Every company uses CI/CD now", free: ["GitHub Skills (free)", "YouTube tutorials"], worth: true },
  ],
};

const AVOID = [
  "Random Udemy/Udacity certificates — not recognized by employers",
  "10+ certificates without actual projects",
  "Paid bootcamp certificates (₹50K+) — projects better ROI",
  "Certificates before building skills — employers test, not just certify",
  "Expired certifications (AWS certs expire in 3 years)",
];

export default function Certifications() {
  const [tab, setTab] = useState("Software Dev");
  const [aiIn, setAiIn] = useState({ role: "", skills: "", budget: "", time: "" });
  const [aiOut, setAiOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [tracker, setTracker] = useState<{ name: string; status: string; date: string }[]>([]);
  const [newCert, setNewCert] = useState({ name: "", status: "In Progress" });

  const getAiRec = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Recommend certifications for: Target role: ${aiIn.role}, Skills: ${aiIn.skills}, Budget: ${aiIn.budget || "limited"}, Timeline: ${aiIn.time || "6 months"}
Give top 3 certifications in priority order with: name, cost, time needed, value rating, why first, free resources.
Be specific for Indian BTech CSE students. Mention what to AVOID too. Format as numbered recommendation.`);
      setAiOut(raw);
    } catch { setAiOut("AWS Cloud Practitioner → IBM Data Science → freeCodeCamp certifications. Projects > Certs for freshers."); }
    setLoading(false);
  };

  const tabs = Object.keys(CERTS);
  const priorityColors: Record<string, string> = {
    "1 — Do First": "bg-green-100 text-green-800 border-green-200",
    "2 — Worth Paying": "bg-blue-100 text-blue-800 border-blue-200",
    "3 — Advanced": "bg-purple-100 text-purple-800 border-purple-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Certification Roadmap 🏅</h1>
          <p className="text-amber-100 text-xl font-medium">Kaun se certs actually kaam aate hain — aur kaunse waste of time hain</p>
          <div className="mt-4 p-3 bg-white/20 rounded-xl inline-block">
            <p className="text-sm font-black">💡 Rule: Projects &gt; Certifications. Certs complement skills, not replace them.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10 space-y-8">

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Cert List */}
        <div className="space-y-4">
          {CERTS[tab]?.map((cert, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 p-5">
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-black text-gray-900">{cert.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${priorityColors[cert.priority] || "bg-gray-100 text-gray-700"}`}>{cert.priority}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm mb-3">
                    <span className="text-gray-500 font-medium">By {cert.provider}</span>
                    <span className={`font-black ${cert.cost.includes("Free") ? "text-green-600" : "text-orange-600"}`}>{cert.cost}</span>
                    <span className="text-gray-500 font-medium">⏱ {cert.time}</span>
                    <span className="text-blue-600 font-bold">Impact: {cert.impact}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Free Resources</p>
                    <div className="flex flex-wrap gap-1">{cert.free.map((f, j) => <span key={j} className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-lg">{f}</span>)}</div>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-black text-amber-500">{cert.value}/10</div>
                  <div className="text-[10px] text-gray-400 font-bold">value</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Avoid Section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h2 className="text-lg font-black text-red-900 mb-3">⚠️ Certifications to AVOID (Honest Truth)</h2>
          <ul className="space-y-2">{AVOID.map((a, i) => <li key={i} className="flex items-start gap-2 text-sm text-red-800 font-medium"><span className="text-red-500 font-black mt-0.5">✗</span>{a}</li>)}</ul>
        </div>

        {/* AI Recommendation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">AI Personalized Cert Path 🤖</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {[["Target Role", "role", "Full Stack Dev / Data Scientist"], ["Current Skills", "skills", "React, Python, basic AWS"], ["Budget", "budget", "₹5000 or 'limited'"], ["Timeline", "time", "3 months / 6 months"]].map(([l, k, p]) => (
              <div key={k}><label className="block text-sm font-bold text-gray-700 mb-1">{l}</label><input value={aiIn[k as keyof typeof aiIn]} onChange={e => setAiIn(a => ({ ...a, [k]: e.target.value }))} placeholder={p} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" /></div>
            ))}
          </div>
          <button onClick={getAiRec} disabled={loading || !aiIn.role.trim()} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-black rounded-xl transition-colors">
            {loading ? "Getting recommendations..." : "Get My Cert Path 🏅"}
          </button>
          {aiOut && <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm font-medium text-gray-800 whitespace-pre-wrap">{aiOut}</div>}
        </div>

        {/* Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Certification Tracker 📋</h2>
          <div className="flex gap-3 mb-4">
            <input value={newCert.name} onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))} placeholder="Certificate name" className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none" />
            <select value={newCert.status} onChange={e => setNewCert(c => ({ ...c, status: e.target.value }))} className="p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none">
              {["In Progress", "Completed", "Planned"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => { if (newCert.name) { setTracker(t => [...t, { name: newCert.name, status: newCert.status, date: new Date().toLocaleDateString("en-IN") }]); setNewCert({ name: "", status: "In Progress" }); } }}
              className="px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors">Add</button>
          </div>
          {tracker.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">Add certifications you're working on</p> : (
            <div className="space-y-2">
              {tracker.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.status === "Completed" ? "bg-green-100 text-green-700" : c.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                  <span className="flex-1 font-medium text-gray-800 text-sm">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
