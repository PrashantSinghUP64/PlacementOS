import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "GitHub Profile Optimizer 🐙 — PlacementOS" },
    { name: "description", content: "Make your GitHub profile stand out to recruiters — with AI README generator" },
  ];
}

const REPO_CHECKLIST = [
  "Has a clear README with project description",
  "Includes screenshots or demo GIF",
  "Has installation and usage instructions",
  "Includes a live demo link",
  "Uses clear commit messages (not 'fix', 'update')",
  "Has no sensitive data (.env committed)",
  "Has a LICENSE file",
  "Has a .gitignore",
];

const CONTRIBUTION_TIPS = [
  { t: "Daily Commit Habit", desc: "Roz kuch commit karo — even documentation edits count. Green graph = active developer signal." },
  { t: "Best Time to Commit", desc: "Commit during day (9AM-6PM) — GitHub activity shows timestamps. Recruiters notice patterns." },
  { t: "Hacktoberfest", desc: "Every October — contribute to open source and get free t-shirt. Use good-first-issue label." },
  { t: "Good First Issues", desc: "goodfirstissue.dev — find beginner-friendly open source issues. Great for portfolio." },
  { t: "Pin Best Repos", desc: "Pin exactly 6 repos — mix of: 1 full stack project, 1 DSA, 1 ML if applicable, 1-3 others." },
];

const SCORE_CRITERIA = [
  { label: "Profile README", key: "readme", max: 20, tips: "Custom README with greeting, about, tech stack, GitHub stats — looks very professional" },
  { label: "Repository Quality", key: "repos", max: 20, tips: "At least 5-6 good repos with proper READMEs, descriptions, live links" },
  { label: "Contribution Activity", key: "activity", max: 20, tips: "Regular commits throughout the year — no big gaps. Quality > quantity" },
  { label: "Project Diversity", key: "diversity", max: 20, tips: "Mix of frontend, backend, ML, tools. Shows range of skills" },
  { label: "Documentation", key: "docs", max: 20, tips: "Every project should have installation steps, screenshots, tech stack mentioned" },
];

export default function GithubOptimizer() {
  const [username, setUsername] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [readmeInputs, setReadmeInputs] = useState({ name: "", role: "", college: "", skills: "", projects: "", fun: "", github: "", linkedin: "" });
  const [readmeOut, setReadmeOut] = useState("");
  const [projectIn, setProjectIn] = useState({ name: "", tech: "", desc: "" });
  const [projectOut, setProjectOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoChecks, setRepoChecks] = useState<boolean[]>(Array(REPO_CHECKLIST.length).fill(false));

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const generateReadme = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Generate a beautiful GitHub profile README for:
Name: ${readmeInputs.name}, Role: ${readmeInputs.role}, College: ${readmeInputs.college}
Skills: ${readmeInputs.skills}, Projects: ${readmeInputs.projects}, Fun fact: ${readmeInputs.fun}
GitHub: ${readmeInputs.github}, LinkedIn: ${readmeInputs.linkedin}

Create a README using markdown with:
1. A cool greeting header with emoji
2. About me section (2-3 lines)  
3. Tech stack as bullet list with emojis
4. Three featured projects with description
5. GitHub stats widget code: ![stats](https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true&theme=radical)
6. Contact section
7. A fun/inspirational quote

Replace USERNAME with actual username. Make it look impressive and professional.`);
      setReadmeOut(raw);
    } catch { setReadmeOut("AI busy. Start with: '# Hi there 👋 I'm [Name]' then add sections for About, Skills, Projects, Contact."); }
    setLoading(false);
  };

  const generateProjectDesc = async () => {
    setLoading(true);
    try {
      const raw = await callAI(`Write a professional GitHub README project description for:
Project: ${projectIn.name}, Tech Stack: ${projectIn.tech}, What it does: ${projectIn.desc}
Give: 2-3 sentence description (what + how + impact), features list (5 bullets), tech stack list. Make it impressive for recruiters.`);
      setProjectOut(raw);
    } catch { setProjectOut("AI busy. Format: What the project does → Key features → Tech stack used."); }
    setLoading(false);
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">GitHub Profile Optimizer 🐙</h1>
          <p className="text-gray-300 text-xl font-medium">Recruiter profile dekhe aur 'Hire karte hain' sochen — yeh goal hai</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-14 relative z-10 space-y-8">

        {/* Score */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">Profile Score</h2>
              <p className="text-sm text-gray-500 font-medium">Rate your GitHub profile honestly</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-black ${totalScore >= 80 ? "text-green-600" : totalScore >= 60 ? "text-yellow-600" : "text-red-600"}`}>{totalScore}/100</div>
              <div className="text-xs font-bold text-gray-500">{totalScore >= 80 ? "Excellent!" : totalScore >= 60 ? "Good — improve" : "Needs work"}</div>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div className={`h-full transition-all duration-500 ${totalScore >= 80 ? "bg-green-500" : totalScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${totalScore}%` }} />
          </div>
          <div className="space-y-4">
            {SCORE_CRITERIA.map(c => (
              <div key={c.key}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-gray-800 text-sm">{c.label}</label>
                  <span className="font-black text-gray-900 text-sm">{scores[c.key] || 0}/{c.max}</span>
                </div>
                <input type="range" min="0" max={c.max} value={scores[c.key] || 0} onChange={e => setScores(s => ({ ...s, [c.key]: parseInt(e.target.value) }))}
                  className="w-full accent-gray-800 mb-1" />
                <p className="text-xs text-gray-400 font-medium">{c.tips}</p>
              </div>
            ))}
          </div>
        </div>

        {/* README Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-1">AI README Generator ✨</h2>
          <p className="text-gray-500 text-sm font-medium mb-5">Info bharo → beautiful GitHub README auto-generate. Copy and paste.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              ["Name", "name", "Prashant Kumar Singh"],
              ["Role", "role", "Full Stack Dev | BTech CSE"],
              ["College", "college", "AKTU Lucknow"],
              ["Skills (comma separated)", "skills", "React, Node, Python, DSA"],
              ["Top Projects (comma separated)", "projects", "PlacementOS, E-commerce App"],
              ["Fun Fact", "fun", "I debug code better after chai ☕"],
              ["GitHub username", "github", "prashant-kumar"],
              ["LinkedIn URL", "linkedin", "linkedin.com/in/prashant"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
                <input value={readmeInputs[key as keyof typeof readmeInputs]} onChange={e => setReadmeInputs(r => ({ ...r, [key]: e.target.value }))}
                  placeholder={ph} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-gray-800 focus:outline-none" />
              </div>
            ))}
          </div>
          <button onClick={generateReadme} disabled={loading || !readmeInputs.name.trim()}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-black rounded-xl transition-colors mb-4">
            {loading ? "Generating..." : "Generate My README 🐙"}
          </button>
          {readmeOut && (
            <div className="relative">
              <div className="bg-gray-900 rounded-xl p-4 text-green-400 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap">{readmeOut}</div>
              <button onClick={() => copy(readmeOut)} className="absolute top-3 right-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-lg transition-colors">Copy All</button>
            </div>
          )}
        </div>

        {/* Repo Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-1">Repository Best Practices ✅</h2>
          <p className="text-gray-500 text-sm mb-4">{repoChecks.filter(Boolean).length}/{REPO_CHECKLIST.length} done — check off as you improve each repo</p>
          <div className="grid md:grid-cols-2 gap-2">
            {REPO_CHECKLIST.map((item, i) => (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${repoChecks[i] ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200 hover:border-green-200"}`}>
                <input type="checkbox" checked={repoChecks[i]} onChange={() => { const r = [...repoChecks]; r[i] = !r[i]; setRepoChecks(r); }} className="w-4 h-4 text-green-600" />
                <span className={`text-sm font-medium ${repoChecks[i] ? "line-through text-gray-400" : "text-gray-700"}`}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Project Description Generator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Project Description Generator 🚀</h2>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name</label><input value={projectIn.name} onChange={e => setProjectIn(p => ({ ...p, name: e.target.value }))} placeholder="PlacementOS" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Tech Stack</label><input value={projectIn.tech} onChange={e => setProjectIn(p => ({ ...p, tech: e.target.value }))} placeholder="React, Node, MongoDB" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1.5">What it does</label><input value={projectIn.desc} onChange={e => setProjectIn(p => ({ ...p, desc: e.target.value }))} placeholder="Analyzes resumes and gives ATS score" className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none" /></div>
          </div>
          <button onClick={generateProjectDesc} disabled={loading || !projectIn.name.trim()} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-black rounded-xl transition-colors">
            {loading ? "Writing..." : "Generate Description 🚀"}
          </button>
          {projectOut && (
            <div className="mt-4 relative">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-gray-800 whitespace-pre-wrap">{projectOut}</div>
              <button onClick={() => copy(projectOut)} className="absolute top-3 right-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg">Copy</button>
            </div>
          )}
        </div>

        {/* Contribution Tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 bg-gray-900 border-b border-gray-800">
            <h2 className="text-xl font-black text-white">Contribution Graph Tips 📈</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 p-0">
            {CONTRIBUTION_TIPS.map(tip => (
              <div key={tip.t} className="p-5 border-b border-r border-gray-100 last:border-r-0">
                <h3 className="font-black text-gray-900 mb-2 text-sm">{tip.t}</h3>
                <p className="text-xs text-gray-600 font-medium">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
