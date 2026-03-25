import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "LinkedIn Profile Builder 💼 — PlacementOS" },
    { name: "description", content: "Step-by-step guide to build an impressive LinkedIn profile with AI assistance" },
  ];
}

const STEPS = [
  { id: 1, title: "Profile Photo Tips", icon: "📸" },
  { id: 2, title: "Headline Generator", icon: "✍️" },
  { id: 3, title: "About / Summary", icon: "📝" },
  { id: 4, title: "Experience Section", icon: "💼" },
  { id: 5, title: "Skills Section", icon: "🛠️" },
  { id: 6, title: "Projects Section", icon: "🚀" },
  { id: 7, title: "Education Section", icon: "🎓" },
  { id: 8, title: "Connection Strategy", icon: "🤝" },
];

const PHOTO_TIPS = {
  dos: ["Professional attire (formal or smart casual)", "Plain white/grey/blue background", "Face clearly visible, centered", "Smiling naturally — approachable", "Good lighting (face towards window)"],
  donts: ["Group photos — no other people", "Sunglasses or heavy filters", "Party/casual photos", "Blurry or pixelated image", "Selfies with gym/bedroom in back"],
};

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "Software Dev": ["JavaScript", "React.js", "Node.js", "Python", "SQL", "Git", "REST APIs", "TypeScript", "Java", "AWS", "Docker", "Problem Solving", "Data Structures", "System Design", "Agile"],
  "Data Science": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "TensorFlow", "Scikit-learn", "Data Visualization", "Statistics", "Tableau", "Power BI", "Deep Learning", "NLP", "Computer Vision", "Kaggle"],
  "DevOps": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform", "Jenkins", "Git", "Bash Scripting", "Monitoring", "Ansible", "Python", "Cloud Computing", "Security", "Networking"],
};

const MSG_TEMPLATES = [
  { to: "Senior from Same College", msg: 'Hi [Name],\n\nI\'m a B.Tech CSE student from [Your College], and I noticed you\'re working at [Company]. I\'m very interested in this domain and would love to hear about your journey from college to where you are now.\n\nWould you be open to a brief 15-minute chat? It would mean a lot to me!\n\nThanks,\n[Your Name]' },
  { to: "Recruiter/HR", msg: 'Hi [Name],\n\nI noticed you recruit for [Company]. I\'m a B.Tech CSE final year student passionate about [domain] with experience in [top 2-3 skills].\n\nI\'d love to be considered for any relevant opportunities. I\'ve attached my resume for reference.\n\nThank you for your time!\n\n[Your Name]' },
  { to: "Industry Professional", msg: 'Hi [Name],\n\nI read your post about [topic] and it gave me a great perspective on [something specific]. I\'m a CSE student working towards a career in [domain] and found your experience incredibly inspiring.\n\nI\'d love to connect and occasionally get your perspective on the field!\n\n[Your Name]' },
];

export default function LinkedinBuilder() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("Software Dev");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [projects, setProjects] = useState("");
  const [experience, setExperience] = useState("");
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (type: string, inputData: string) => {
    setLoading(true);
    setGenerated("");
    try {
      const prompts: Record<string, string> = {
        headline: `Generate 5 LinkedIn headline options for a BTech CSE student with these details: ${inputData}. Each headline should be under 220 characters and include role + skills + value proposition. Format as numbered list.`,
        about: `Write a compelling LinkedIn About/Summary section for: ${inputData}. Should be 250-300 words. Professional but approachable. Include passion for field, key skills, notable projects, and what they're looking for. Write in first person.`,
        experience: `Rewrite this internship/job experience for LinkedIn in professional bullet points format: ${inputData}. Use strong action verbs (Developed, Implemented, Designed, Led, Reduced, Increased). Make it ATS-friendly. 3-4 bullets.`,
        project: `Write a professional LinkedIn project description for: ${inputData}. Include: what it does, tech stack used, key features, impact/metrics. 2-3 sentences. Make it impressive for recruiters.`,
      };
      const raw = await callAI(prompts[type]);
      setGenerated(raw);
    } catch { setGenerated("AI busy hai. Thodi der baad try karo."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(generated); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const completionScore = Math.round((step / 8) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#0A66C2] text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">LinkedIn Profile Builder 💼</h1>
          <p className="text-blue-200 text-xl font-medium">AI se apna LinkedIn 100% complete aur recruiter-ready banao</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-14 relative z-10">

        {/* Progress */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-gray-900 dark:text-white">Your Progress</h2>
            <span className="text-2xl font-black text-blue-600">{completionScore}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#0A66C2] transition-all duration-500" style={{ width: `${completionScore}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {STEPS.map(s => (
              <button key={s.id} onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${step === s.id ? "bg-[#0A66C2] text-white" : s.id < step ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {s.id < step ? "✓" : s.icon} {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">📸 Profile Photo Tips</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl p-5">
                  <h3 className="font-black text-green-800 mb-3">✅ Do's</h3>
                  <ul className="space-y-2">{PHOTO_TIPS.dos.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-green-700 font-medium"><span className="text-green-500 font-black mt-0.5">✓</span>{d}</li>)}</ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-5">
                  <h3 className="font-black text-red-800 mb-3">❌ Don'ts</h3>
                  <ul className="space-y-2">{PHOTO_TIPS.donts.map((d, i) => <li key={i} className="flex items-start gap-2 text-sm text-red-700 font-medium"><span className="text-red-500 font-black mt-0.5">✗</span>{d}</li>)}</ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-xl">
                <p className="text-sm font-bold text-blue-800">💡 Pro tip: <a href="https://www.remove.bg/" target="_blank" rel="noreferrer" className="underline">remove.bg</a> se background free mein remove karo. Phone camera + sunlight = perfect photo!</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">✍️ Headline Generator</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Prashant Kumar Singh" className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Role</label><input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Full Stack Developer" className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Top Skills (comma separated)</label><input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React.js, Node.js, Python, DSA" className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <button onClick={() => generate("headline", `Name: ${name}, Role: ${targetRole}, Skills: ${skills}, College: ${college}`)} disabled={loading}
                className="px-6 py-3 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-xl transition-colors">
                {loading ? "Generating..." : "Generate 5 Headlines 🚀"}
              </button>
              {generated && (
                <div className="mt-4 relative">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl whitespace-pre-wrap text-sm font-medium text-gray-800 dark:text-gray-200">{generated}</div>
                  <button onClick={copy} className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">{copied ? "Copied!" : "Copy"}</button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">📝 About / Summary Writer</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {[["Name", name, setName, "Prashant Kumar"], ["College", college, setCollege, "AKTU, Lucknow"], ["Target Role", targetRole, setTargetRole, "SDE / Full Stack"], ["Skills", skills, setSkills, "React, Node, Python"]].map(([label, val, setter, ph]) => (
                  <div key={label as string}><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{label as string}</label><input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={ph as string} className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500" /></div>
                ))}
                <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Key Projects (1-2 lines each)</label><textarea value={projects} onChange={e => setProjects(e.target.value)} rows={3} placeholder="E-commerce app with React + Node. Resume analyzer with AI." className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 resize-none" /></div>
              </div>
              <button onClick={() => generate("about", `Name: ${name}, College: ${college}, Skills: ${skills}, Target: ${targetRole}, Projects: ${projects}`)} disabled={loading}
                className="px-6 py-3 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-xl">
                {loading ? "Writing..." : "Write My About Section ✍️"}
              </button>
              {generated && (
                <div className="mt-4 relative">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl whitespace-pre-wrap text-sm font-medium text-gray-800 dark:text-gray-200 max-h-60 overflow-y-auto">{generated}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{generated.length} characters</span>
                    <button onClick={copy} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">{copied ? "Copied!" : "Copy"}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">💼 Experience Section</h2>
              <div className="mb-4"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Describe your internship / job experience</label><textarea value={experience} onChange={e => setExperience(e.target.value)} rows={4} placeholder="Company: Tech Mahindra, Role: SDE Intern, Duration: 2 months. I worked on REST APIs using Node.js, fixed bugs in the payment module, wrote unit tests." className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 resize-none" /></div>
              <button onClick={() => generate("experience", experience)} disabled={loading || !experience.trim()}
                className="px-6 py-3 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-xl">
                {loading ? "Rewriting..." : "Rewrite Professionally 💼"}
              </button>
              {generated && (
                <div className="mt-4 relative">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl whitespace-pre-wrap text-sm font-medium text-gray-800 dark:text-gray-200">{generated}</div>
                  <button onClick={copy} className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">{copied ? "Copied!" : "Copy"}</button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🛠️ Skills Section</h2>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Role</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(SKILL_SUGGESTIONS).map(r => (
                    <button key={r} onClick={() => setRole(r)} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${role === r ? "bg-[#0A66C2] text-white border-[#0A66C2]" : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-300"}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 rounded-xl p-4">
                <h3 className="font-black text-blue-800 mb-3">Top 15 skills for {role}:</h3>
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS[role].map(s => (
                    <span key={s} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-blue-200 text-blue-800 rounded-full text-sm font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 font-medium">💡 Put your strongest skills first. LinkedIn prioritizes first 5 skills in search. Get endorsements from college friends for top skills.</p>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🚀 Projects Section</h2>
              <div className="mb-4"><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Describe your project</label><textarea value={projects} onChange={e => setProjects(e.target.value)} rows={3} placeholder="Project: Resume Analyzer. Tech: React, Node, MongoDB, OpenAI. What it does: Analyzes resumes and gives ATS score. Link: github.com/prashant/resume-ai" className="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 resize-none" /></div>
              <button onClick={() => generate("project", projects)} disabled={loading || !projects.trim()}
                className="px-6 py-3 bg-[#0A66C2] hover:bg-blue-700 disabled:bg-gray-300 text-white font-black rounded-xl">
                {loading ? "Writing..." : "Write Project Description 🚀"}
              </button>
              {generated && (
                <div className="mt-4 relative">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl whitespace-pre-wrap text-sm font-medium text-gray-800 dark:text-gray-200">{generated}</div>
                  <button onClick={copy} className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">{copied ? "Copied!" : "Copy"}</button>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🎓 Education Section</h2>
              <div className="space-y-3">
                {[["What to include", ["Degree, branch, years (e.g. B.Tech CSE 2021-2025)", "CGPA — include it (if above 7.0)", "Relevant coursework: DSA, DBMS, OS, CN, ML", "Achievements: Hackathon wins, Dean's list, scholarships", "Activities: Tech clubs, IEEE, coding club lead"]], ["What to skip", ["School (10th/12th) — optional if below 65%", "Irrelevant activities", "CGPA if below 6.5 (just put 'B.Tech CSE')"]]].map(([title, items]) => (
                  <div key={title as string} className={`p-4 rounded-xl border ${title === "What to include" ? "bg-green-50 dark:bg-green-900/20 border-green-200" : "bg-red-50 dark:bg-red-900/20 border-red-200"}`}>
                    <h3 className={`font-black mb-2 ${title === "What to include" ? "text-green-800" : "text-red-800"}`}>{title}</h3>
                    <ul className="space-y-1">{(items as string[]).map((item, j) => <li key={j} className={`text-sm font-medium ${title === "What to include" ? "text-green-700" : "text-red-700"}`}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">🤝 Connection Strategy</h2>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-5 text-sm">First 500 connections are most important. Target: seniors from your college, recruiters in target companies, professionals in your domain.</p>
              <div className="space-y-4">
                {MSG_TEMPLATES.map((t, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100">
                      <h3 className="font-black text-blue-800 text-sm">To: {t.to}</h3>
                    </div>
                    <div className="p-4 relative">
                      <pre className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{t.msg}</pre>
                      <button onClick={() => { navigator.clipboard.writeText(t.msg); }} className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg">Copy</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">← Previous</button>
          {step < 8 ? (
            <button onClick={() => setStep(s => Math.min(8, s + 1))} className="px-6 py-3 bg-[#0A66C2] hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">Next Step →</button>
          ) : (
            <div className="px-6 py-3 bg-green-600 text-white font-black rounded-xl">🎉 LinkedIn Optimized!</div>
          )}
        </div>
      </div>
    </div>
  );
}
