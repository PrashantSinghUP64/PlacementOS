import { useState } from "react";
import Navbar from "~/components/Navbar";

export function meta() {
  return [
    { title: "Resume Templates 📄 — PlacementOS" },
    { name: "description", content: "6 ATS-friendly resume templates for BTech CSE students — download as PDF" },
  ];
}

const TEMPLATES = [
  {
    id: "classic", name: "Classic", icon: "📋", best: "TCS, Infosys, traditional companies", atsScore: 95,
    desc: "Clean single-column layout. Maximum ATS compatibility. Works everywhere.",
    color: "border-gray-400", preview: { headerBg: "#1a1a2e", accent: "#6c63ff" },
  },
  {
    id: "modern", name: "Modern", icon: "✨", best: "Product companies, startups, MNCs", atsScore: 88,
    desc: "Two-column layout with sidebar. Stands out while staying professional.",
    color: "border-blue-400", preview: { headerBg: "#0066cc", accent: "#00b4d8" },
  },
  {
    id: "minimal", name: "Minimal", icon: "⚡", best: "Design roles, Google, creative companies", atsScore: 85,
    desc: "Elegant white space design. Clean typography. Makes content shine.",
    color: "border-teal-400", preview: { headerBg: "#2d3748", accent: "#48bb78" },
  },
  {
    id: "technical", name: "Technical", icon: "💻", best: "FAANG, technical roles, SDE positions", atsScore: 92,
    desc: "Skills prominently at top. Dense technical info. Optimized for big tech.",
    color: "border-indigo-400", preview: { headerBg: "#312e81", accent: "#818cf8" },
  },
  {
    id: "fresher", name: "Fresher Focus", icon: "🎓", best: "Fresh graduates, campus placements", atsScore: 90,
    desc: "Education and projects first. Hides limited experience. Best for freshers.",
    color: "border-green-400", preview: { headerBg: "#064e3b", accent: "#34d399" },
  },
  {
    id: "colorful", name: "Colorful Header", icon: "🎨", best: "Startups, modern companies, design-first", atsScore: 80,
    desc: "Purple/blue gradient header strip. Eye-catching but still professional.",
    color: "border-purple-400", preview: { headerBg: "#7c3aed", accent: "#c4b5fd" },
  },
];

const emptyData = {
  name: "", email: "", phone: "", linkedin: "", github: "", location: "",
  summary: "",
  education: [{ degree: "", college: "", year: "", cgpa: "" }],
  skills: { technical: "", tools: "", soft: "" },
  projects: [{ name: "", tech: "", link: "", desc: "" }],
  experience: [{ company: "", role: "", duration: "", desc: "" }],
  achievements: "",
};

function generateHtml(template: string, data: typeof emptyData): string {
  const t = TEMPLATES.find(t => t.id === template);
  const accent = t?.preview.accent || "#6c63ff";
  const headerBg = t?.preview.headerBg || "#1a1a2e";

  const skillsArr = [data.skills.technical, data.skills.tools].filter(Boolean).join(", ");

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #222; background: white; }
  .header { background: ${headerBg}; color: white; padding: 20px 24px; }
  .header h1 { font-size: 22pt; font-weight: 900; letter-spacing: 0.5px; }
  .header p { font-size: 9pt; margin-top: 4px; opacity: 0.85; }
  .contact-row { display:flex; gap: 16px; margin-top: 8px; font-size: 8.5pt; flex-wrap: wrap; }
  .contact-row span { display: flex; align-items: center; gap: 4px; }
  .body { padding: 18px 24px; }
  .section { margin-bottom: 14px; }
  .section-title { font-size: 10pt; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: ${accent}; border-bottom: 1.5px solid ${accent}; padding-bottom: 3px; margin-bottom: 8px; }
  .item { margin-bottom: 8px; }
  .item-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .item-title { font-weight: 700; font-size: 10pt; }
  .item-sub { font-size: 9pt; color: #555; }
  .item-date { font-size: 8.5pt; color: #888; flex-shrink: 0; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 4px; }
  .skill-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 8.5pt; }
  .summary-text { font-size: 9.5pt; line-height: 1.5; color: #444; }
  ul { padding-left: 14px; }
  li { font-size: 9pt; margin-bottom: 3px; color: #444; }
  @media print { @page { margin: 10mm; } }
</style></head><body>
<div class="header">
  <h1>${data.name || "Your Name"}</h1>
  <div class="contact-row">
    ${data.email ? `<span>✉ ${data.email}</span>` : ""}
    ${data.phone ? `<span>📱 ${data.phone}</span>` : ""}
    ${data.location ? `<span>📍 ${data.location}</span>` : ""}
    ${data.linkedin ? `<span>🔗 ${data.linkedin}</span>` : ""}
    ${data.github ? `<span>🐙 ${data.github}</span>` : ""}
  </div>
</div>
<div class="body">
  ${data.summary ? `<div class="section"><div class="section-title">Summary</div><p class="summary-text">${data.summary}</p></div>` : ""}
  ${data.education[0].degree ? `<div class="section"><div class="section-title">Education</div>${data.education.map(e => `<div class="item"><div class="item-header"><div><div class="item-title">${e.degree}</div><div class="item-sub">${e.college}</div></div><div class="item-date">${e.year}${e.cgpa ? ` | CGPA: ${e.cgpa}` : ""}</div></div></div>`).join("")}</div>` : ""}
  ${skillsArr ? `<div class="section"><div class="section-title">Technical Skills</div><div class="skills-grid">${skillsArr.split(",").map(s => `<span class="skill-tag">${s.trim()}</span>`).join("")}</div></div>` : ""}
  ${data.projects[0].name ? `<div class="section"><div class="section-title">Projects</div>${data.projects.map(p => `<div class="item"><div class="item-header"><div><div class="item-title">${p.name}${p.link ? ` <span style="font-weight:400;font-size:8pt;color:#666">(${p.link})</span>` : ""}</div><div class="item-sub">${p.tech}</div></div></div>${p.desc ? `<ul><li>${p.desc}</li></ul>` : ""}</div>`).join("")}</div>` : ""}
  ${data.experience[0].company ? `<div class="section"><div class="section-title">Experience</div>${data.experience.map(e => `<div class="item"><div class="item-header"><div><div class="item-title">${e.role}</div><div class="item-sub">${e.company}</div></div><div class="item-date">${e.duration}</div></div>${e.desc ? `<ul><li>${e.desc}</li></ul>` : ""}</div>`).join("")}</div>` : ""}
  ${data.achievements ? `<div class="section"><div class="section-title">Achievements</div><ul>${data.achievements.split("\n").filter(Boolean).map(a => `<li>${a}</li>`).join("")}</ul></div>` : ""}
</div></body></html>`;
}

export default function Templates() {
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState(emptyData);
  const [preview, setPreview] = useState(false);

  const update = (key: string, val: string) => setData(d => ({ ...d, [key]: val }));
  const updateEd = (i: number, key: string, val: string) => setData(d => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, [key]: val } : e) }));
  const updateProj = (i: number, key: string, val: string) => setData(d => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, [key]: val } : p) }));
  const updateExp = (i: number, key: string, val: string) => setData(d => ({ ...d, experience: d.experience.map((e, j) => j === i ? { ...e, [key]: val } : e) }));

  const downloadPdf = () => {
    if (!selected) return;
    const html = generateHtml(selected, data);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const inp = "w-full p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none font-medium";
  const label = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      <div className="bg-gradient-to-br from-violet-700 to-purple-600 text-white pt-16 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Resume Templates 📄</h1>
          <p className="text-violet-200 text-xl font-medium">6 ATS-optimized templates — choose, fill, download PDF</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10">

        {/* Template Selection */}
        {!selected ? (
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5">Choose Your Template</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {TEMPLATES.map(t => (
                  <div key={t.id} className={`border-2 ${t.color} rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group`} onClick={() => setSelected(t.id)}>
                    {/* Mini preview */}
                    <div style={{ backgroundColor: t.preview.headerBg }} className="h-16 flex items-center px-4">
                      <div>
                        <div className="h-3 w-24 rounded" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
                        <div className="h-2 w-16 rounded mt-1.5" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-900">
                      {[40, 55, 40, 70, 45].map((w, i) => (
                        <div key={i} className="h-1.5 rounded mb-1.5" style={{ width: `${w}%`, backgroundColor: i === 0 ? t.preview.accent : "#e5e7eb" }} />
                      ))}
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-1">{t.icon} {t.name}</h3>
                        <span className="text-xs font-black text-green-600">ATS {t.atsScore}%</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-1">{t.desc}</p>
                      <p className="text-[10px] text-gray-400 font-bold">Best for: {t.best}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Back + Template info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-5 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => { setSelected(null); setPreview(false); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm transition-colors">← Back</button>
                <div>
                  <h2 className="font-black text-gray-900 dark:text-white">{TEMPLATES.find(t => t.id === selected)?.icon} {TEMPLATES.find(t => t.id === selected)?.name} Template</h2>
                  <p className="text-xs text-gray-500 font-medium">Fill the form below → Download PDF</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPreview(!preview)} className="px-4 py-2 border border-gray-200 dark:border-gray-800 hover:border-violet-400 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm transition-colors">{preview ? "Edit" : "Preview"}</button>
                <button onClick={downloadPdf} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors">Download PDF 📥</button>
              </div>
            </div>

            {preview ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <iframe srcDoc={generateHtml(selected, data)} className="w-full" style={{ height: "800px" }} title="Resume Preview" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Personal Info */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4">Personal Info</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[["Full Name", "name", "Prashant Kumar Singh"], ["Email", "email", "prashant@gmail.com"], ["Phone", "phone", "+91 98765 43210"], ["LinkedIn", "linkedin", "linkedin.com/in/prashant"], ["GitHub", "github", "github.com/prashant"], ["Location", "location", "Lucknow, UP"]].map(([l, k, p]) => (
                      <div key={k}><label className={label}>{l}</label><input value={data[k as keyof typeof data] as string} onChange={e => update(k, e.target.value)} placeholder={p} className={inp} /></div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4">Professional Summary</h3>
                  <textarea value={data.summary} onChange={e => update("summary", e.target.value)} rows={3} placeholder="BTech CSE student specializing in Full Stack Development with expertise in React, Node.js, and MongoDB. Strong DSA foundation with 300+ LeetCode problems solved..." className={inp + " resize-none"} />
                </div>

                {/* Education */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-gray-900 dark:text-white">Education</h3>
                    <button onClick={() => setData(d => ({ ...d, education: [...d.education, { degree: "", college: "", year: "", cgpa: "" }] }))} className="text-xs font-bold text-violet-600 hover:text-violet-800">+ Add</button>
                  </div>
                  {data.education.map((e, i) => (
                    <div key={i} className="grid md:grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-950 rounded-xl">
                      {[["Degree / Programme", "degree", "B.Tech CSE"], ["College", "college", "AKTU, Lucknow"], ["Year", "year", "2021-2025"], ["CGPA", "cgpa", "7.8"]].map(([l, k, p]) => (
                        <div key={k}><label className={label}>{l}</label><input value={e[k as keyof typeof e]} onChange={el => updateEd(i, k, el.target.value)} placeholder={p} className={inp} /></div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4">Skills</h3>
                  <div className="space-y-3">
                    {[["Technical Skills", "technical", "React.js, Node.js, Python, SQL, Java"], ["Tools & Technologies", "tools", "Git, Docker, MongoDB, AWS, Figma"], ["Soft Skills", "soft", "Problem Solving, Team Leadership, Communication"]].map(([l, k, p]) => (
                      <div key={k}><label className={label}>{l}</label><input value={data.skills[k as keyof typeof data.skills]} onChange={e => setData(d => ({ ...d, skills: { ...d.skills, [k]: e.target.value } }))} placeholder={p} className={inp} /></div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-gray-900 dark:text-white">Projects</h3>
                    <button onClick={() => setData(d => ({ ...d, projects: [...d.projects, { name: "", tech: "", link: "", desc: "" }] }))} className="text-xs font-bold text-violet-600">+ Add</button>
                  </div>
                  {data.projects.map((p, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl mb-3">
                      <div className="grid md:grid-cols-3 gap-3 mb-2">
                        {[["Project Name", "name", "PlacementOS"], ["Tech Stack", "tech", "React, Node.js, MongoDB"], ["Link (optional)", "link", "github.com/..."]].map(([l, k, ph]) => (
                          <div key={k}><label className={label}>{l}</label><input value={p[k as keyof typeof p]} onChange={e => updateProj(i, k, e.target.value)} placeholder={ph} className={inp} /></div>
                        ))}
                      </div>
                      <div><label className={label}>Description (what you built + impact)</label><textarea value={p.desc} onChange={e => updateProj(i, "desc", e.target.value)} rows={2} placeholder="Built AI-powered resume analyzer that scored resumes on ATS compatibility. 500+ users in first month." className={inp + " resize-none"} /></div>
                    </div>
                  ))}
                </div>

                {/* Experience */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-gray-900 dark:text-white">Experience (Internship / Part-time)</h3>
                    <button onClick={() => setData(d => ({ ...d, experience: [...d.experience, { company: "", role: "", duration: "", desc: "" }] }))} className="text-xs font-bold text-violet-600">+ Add</button>
                  </div>
                  {data.experience.map((e, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl mb-3">
                      <div className="grid md:grid-cols-3 gap-3 mb-2">
                        {[["Company", "company", "Infosys"], ["Role", "role", "SDE Intern"], ["Duration", "duration", "June - Aug 2024"]].map(([l, k, p]) => (
                          <div key={k}><label className={label}>{l}</label><input value={e[k as keyof typeof e]} onChange={el => updateExp(i, k, el.target.value)} placeholder={p} className={inp} /></div>
                        ))}
                      </div>
                      <div><label className={label}>Key Contributions</label><textarea value={e.desc} onChange={el => updateExp(i, "desc", el.target.value)} rows={2} placeholder="Developed REST APIs using Spring Boot, reduced API response time by 30%..." className={inp + " resize-none"} /></div>
                    </div>
                  ))}
                </div>

                {/* Achievements */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="font-black text-gray-900 dark:text-white mb-4">Achievements & Certifications</h3>
                  <textarea value={data.achievements} onChange={e => update("achievements", e.target.value)} rows={4} placeholder="Winner — Smart India Hackathon 2024&#10;AWS Cloud Practitioner Certified (2024)&#10;Solved 300+ LeetCode problems (Top 15%)&#10;Academic Excellence Award — AKTU 2023" className={inp + " resize-none"} />
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setPreview(true)} className="px-6 py-3 border border-gray-200 dark:border-gray-800 hover:border-violet-400 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors">Preview Resume 👁️</button>
                  <button onClick={downloadPdf} className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl transition-colors">Download PDF 📥</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
