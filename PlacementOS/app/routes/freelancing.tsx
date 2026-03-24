import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Freelancing Guide 💰 — PlacementOS" },
    { name: "description", content: "Start earning as a student through freelancing — complete guide for BTech CSE students" },
  ];
}

const PLATFORMS = [
  { name: "Fiverr", icon: "🟢", best: "Beginners, small projects", start: "Easy", earning: "₹5K-50K/month", tip: "Create specific gigs (not generic). Eg: 'I will build a React landing page' not 'I will do web dev'.", link: "https://www.fiverr.com" },
  { name: "Upwork", icon: "🔵", best: "Experienced, long projects", start: "Medium", earning: "₹20K-2L/month", tip: "Write personalized proposals. Show relevant samples. Start with smaller jobs to get reviews.", link: "https://www.upwork.com" },
  { name: "Freelancer.com", icon: "🟡", best: "Varied projects, bidding", start: "Medium", earning: "₹10K-1L/month", tip: "Bid quickly on new projects. Customize each bid. Don't use templates.", link: "https://www.freelancer.com" },
  { name: "LinkedIn", icon: "🔷", best: "Network-based, high value", start: "Easy", earning: "Varies widely", tip: "Post your work weekly. DM connections who post about needing help. Alumni network is gold.", link: "https://www.linkedin.com" },
  { name: "Local Businesses", icon: "🏪", best: "Offline, easy first client", start: "Very Easy", earning: "₹10K-50K/project", tip: "Walk into shops, restaurants, local businesses. Offer to make their website for ₹5K-15K.", link: "" },
];

const SKILLS = [
  { skill: "React / Full Stack Web Dev", demand: "Very High", hourly: "₹500-2000/hr", project: "₹20K-1.5L/project", icon: "⚛️" },
  { skill: "WordPress Website", demand: "High", hourly: "₹300-800/hr", project: "₹5K-30K/website", icon: "🌐" },
  { skill: "Mobile App (React Native/Flutter)", demand: "High", hourly: "₹800-2500/hr", project: "₹30K-2L/app", icon: "📱" },
  { skill: "Python / Data Science", demand: "High", hourly: "₹600-2000/hr", project: "₹15K-80K/project", icon: "🐍" },
  { skill: "Logo Design (Canva/Figma)", demand: "Very High", hourly: "N/A", project: "₹500-5K/logo", icon: "🎨" },
  { skill: "Video Editing", demand: "Very High", hourly: "N/A", project: "₹300-5000/video", icon: "🎬" },
  { skill: "Content Writing (Tech)", demand: "High", hourly: "N/A", project: "₹2-8/word", icon: "✍️" },
  { skill: "Social Media Management", demand: "Very High", hourly: "N/A", project: "₹5K-20K/month", icon: "📱" },
  { skill: "Data Entry", demand: "Very High", hourly: "₹200-500/hr", project: "₹2K-10K", icon: "📊" },
  { skill: "SEO / Digital Marketing", demand: "High", hourly: "₹400-1500/hr", project: "₹5K-25K/month", icon: "🔍" },
];

const FIRST_CLIENT_STEPS = [
  { step: "1", title: "Build 1-2 sample projects", desc: "Make 2 strong portfolio pieces even if they are fictional. Eg: 'Restaurant website', 'E-commerce app', 'Portfolio site'." },
  { step: "2", title: "Tell your network", desc: "WhatsApp status, LinkedIn post: 'I'm offering web dev services. DM me.' Family/friends are first clients often." },
  { step: "3", title: "Approach 3 local businesses for free", desc: "Offer to make a basic site for free in exchange for testimonial + case study. This builds trust fast." },
  { step: "4", title: "Create gig on Fiverr", desc: "Start with ₹500-1000 gig to get first 5 reviews. Then raise rates. Reviews = trust = more clients." },
  { step: "5", title: "Cold email small businesses", desc: "Find local businesses without websites via Google Maps. Send 10 emails/day with your offer. 5% response = 1 client." },
];

export default function Freelancing() {
  const [gig, setGig] = useState({ skills: "", level: "Beginner", niche: "" });
  const [proposal, setProposal] = useState({ project: "", skills: "" });
  const [loading, setLoading] = useState(false);
  const [generatedGig, setGeneratedGig] = useState("");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [income, setIncome] = useState<{ project: string; amount: number }[]>([]);
  const [newProject, setNewProject] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const genGig = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Create Fiverr gig optimization for a ${gig.level} freelancer. Skills: ${gig.skills}. Niche: ${gig.niche || "general"}. 
Give: 1) 3 specific gig title options, 2) Short gig description (100 words), 3) 5 relevant tags, 4) Pricing suggestion (3 packages). Format clearly.`);
      setGeneratedGig(raw);
    } catch { setGeneratedGig("AI busy. Titles should be specific: 'I will build React landing page for your startup' not 'I will do web development'."); }
    setLoading(false);
  };

  const genProposal = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Write a Upwork/Freelancer proposal for: Project: ${proposal.project}. My skills: ${proposal.skills}.
Make it personalized, professional, ~150 words. Start with understanding their problem. Show how I solve it. End with CTA.`);
      setGeneratedProposal(raw);
    } catch { setGeneratedProposal("AI busy. Start with: 'I read your project description carefully...' then show relevant experience."); }
    setLoading(false);
  };

  const totalIncome = income.reduce((a, b) => a + b.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <div className="bg-gradient-to-br from-emerald-600 to-green-500 text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Freelancing Guide 💰</h1>
          <p className="text-emerald-100 text-xl font-medium">Student ho? Kal se earn karte karo — skills hain to clients milenge</p>
          <div className="flex justify-center gap-6 mt-4 text-sm font-bold text-emerald-100 flex-wrap">
            <span>💰 ₹5K-2L/month possible</span>
            <span>📱 Work from hostel</span>
            <span>🎓 No experience needed</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10 space-y-8">

        {/* Platforms */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-5 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-xl font-black text-emerald-900">Platform Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Platform", "Best For", "How to Start", "Earning Potential", "Pro Tip"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PLATFORMS.map(p => (
                  <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.icon}</span>
                        {p.link ? <a href={p.link} target="_blank" rel="noreferrer" className="font-black text-gray-900 hover:text-emerald-600 text-sm">{p.name} ↗</a> : <span className="font-black text-gray-900 text-sm">{p.name}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium max-w-[150px]">{p.best}</td>
                    <td className="px-4 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.start === "Very Easy" || p.start === "Easy" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.start}</span></td>
                    <td className="px-4 py-4 text-sm font-black text-emerald-600">{p.earning}</td>
                    <td className="px-4 py-4 text-xs text-gray-500 font-medium max-w-[200px]">{p.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skills That Sell */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-green-50 border-b border-green-100">
            <h2 className="text-xl font-black text-green-900">Skills That Sell 📈 — Demand & Earning</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {SKILLS.map(s => (
              <div key={s.skill} className="px-5 py-4 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 text-sm">{s.skill}</h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.demand === "Very High" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{s.demand} demand</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{s.project}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* First Client */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-blue-50 border-b border-blue-100">
            <h2 className="text-xl font-black text-blue-900">Get Your First Client 🎯</h2>
            <p className="text-blue-600 text-sm font-medium mt-1">Pehla client sabse mushkil hota hai — but yeh steps follow karo</p>
          </div>
          <div className="divide-y divide-gray-50">
            {FIRST_CLIENT_STEPS.map(s => (
              <div key={s.step} className="flex gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{s.step}</div>
                <div><h3 className="font-black text-gray-900 mb-1">{s.title}</h3><p className="text-sm text-gray-600 font-medium">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tools */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Gig Generator */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-xl font-black text-gray-900 mb-4">Fiverr Gig Generator 🤖</h2>
            <div className="space-y-3 mb-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Your Skills</label><input value={gig.skills} onChange={e => setGig(g => ({ ...g, skills: e.target.value }))} placeholder="React, Node.js, CSS" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Your Niche</label><input value={gig.niche} onChange={e => setGig(g => ({ ...g, niche: e.target.value }))} placeholder="Restaurant websites, SaaS apps..." className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Level</label>
                <select value={gig.level} onChange={e => setGig(g => ({ ...g, level: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                  {["Beginner", "Intermediate", "Experienced"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <button onClick={genGig} disabled={loading || !gig.skills.trim()} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-black rounded-xl text-sm transition-colors">
              {loading ? "Generating..." : "Generate Gig Content 🚀"}
            </button>
            {generatedGig && <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">{generatedGig}</div>}
          </div>

          {/* Proposal Generator */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-xl font-black text-gray-900 mb-4">Proposal Generator ✍️</h2>
            <div className="space-y-3 mb-4">
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Project Description</label><textarea value={proposal.project} onChange={e => setProposal(p => ({ ...p, project: e.target.value }))} rows={3} placeholder="Client needs: React dashboard for sales data with charts..." className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Your Relevant Skills</label><input value={proposal.skills} onChange={e => setProposal(p => ({ ...p, skills: e.target.value }))} placeholder="React, Recharts, REST APIs, 2 similar projects" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" /></div>
            </div>
            <button onClick={genProposal} disabled={loading || !proposal.project.trim()} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-black rounded-xl text-sm transition-colors">
              {loading ? "Writing..." : "Write Proposal ✍️"}
            </button>
            {generatedProposal && <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto">{generatedProposal}</div>}
          </div>
        </div>

        {/* Income Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-2">Income Tracker 📊</h2>
          <p className="text-gray-500 text-sm font-medium mb-4">Track what you earn — motivation boost!</p>
          <div className="flex gap-3 mb-4">
            <input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="Project name" className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
            <input value={newAmount} onChange={e => setNewAmount(e.target.value)} type="number" placeholder="₹ amount" className="w-32 p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
            <button onClick={() => { if (newProject && newAmount) { setIncome(i => [...i, { project: newProject, amount: parseInt(newAmount) }]); setNewProject(""); setNewAmount(""); } }}
              className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors">Add</button>
          </div>
          {income.length > 0 ? (
            <div>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {income.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-green-50 border border-green-100 rounded-xl">
                    <span className="font-bold text-gray-800 text-sm">{item.project}</span>
                    <span className="font-black text-emerald-700">₹{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-emerald-600 text-white rounded-xl text-center">
                <p className="text-sm font-medium">Total earned</p>
                <p className="text-3xl font-black">₹{totalIncome.toLocaleString()}</p>
                <p className="text-emerald-200 text-xs mt-1">Student ho aur yeh earn kar liye — awesome! 🎉</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm font-medium text-center py-4">Add your completed projects to track income</p>
          )}
        </div>

      </div>
    </div>
  );
}
