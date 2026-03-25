import { useState, useRef } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import jsPDF from "jspdf";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "AI Resume Builder — PlacementOS" },
    { name: "description", content: "Build an ATS-friendly resume with AI" },
  ];
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  isEnhancing?: boolean;
}

interface Education {
  id: string;
  degree: string;
  college: string;
  year: string;
  cgpa: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string;
  githubUrl: string;
  isEnhancing?: boolean;
}

export default function ResumeBuilder() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // State
  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
  });
  
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", company: "", role: "", duration: "", description: "" }
  ]);
  
  const [educations, setEducations] = useState<Education[]>([
    { id: "1", degree: "", college: "", year: "", cgpa: "" }
  ]);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "", description: "", techStack: "", githubUrl: "" }
  ]);

  // AI Functions
  const enhanceDescription = async (type: 'experience' | 'project', id: string, text: string) => {
    if (!text.trim()) return;
    
    // Set loading state
    if (type === 'experience') {
      setExperiences(prev => prev.map(e => e.id === id ? { ...e, isEnhancing: true } : e));
    } else {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, isEnhancing: true } : p));
    }

    try {
      const prompt = `Rewrite this ${type.replace('project', 'project description').replace('experience', 'job description')} to be ATS-friendly and impactful. Use strong action verbs and quantify achievements if possible.
Original: ${text}
Return ONLY the improved description, formatted as 2-3 short bullet points starting with '•'. No extra text.`;

      const content = await callAI(prompt);
      
      if (type === 'experience') {
        setExperiences(prev => prev.map(e => e.id === id ? { ...e, description: content.trim() } : e));
      } else {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, description: content.trim() } : p));
      }
    } catch (err) {
      console.error("Enhance error:", err);
      alert("Failed to enhance description with AI.");
    } finally {
      if (type === 'experience') {
        setExperiences(prev => prev.map(e => e.id === id ? { ...e, isEnhancing: false } : e));
      } else {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, isEnhancing: false } : p));
      }
    }
  };

  const suggestSkills = async () => {
    const context = experiences.map(e => `${e.role} at ${e.company}: ${e.description}`).join("\n");
    if (!context.trim()) {
      alert("Please add some work experience first so AI can suggest skills.");
      return;
    }
    
    setSuggestingSkills(true);
    try {
      const prompt = `Based on this experience, suggest 5-8 relevant technical and hard skills.
EXPERIENCE: ${context}
Return ONLY a comma-separated list of skills. No extra text, no bullet points.`;

      const content = await callAI(prompt);
      
      const newSkills = content.split(",").map((s: string) => s.trim()).filter((s: string) => s && !skills.includes(s));
      setSkills(prev => [...prev, ...newSkills]);
    } catch (err) {
      console.error("Skill suggest error:", err);
    } finally {
      setSuggestingSkills(false);
    }
  };

  const saveResumeData = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiFetch("/resume-builder/save", {
        method: "POST",
        token,
        body: JSON.stringify({
          personalInfo: personal,
          experience: experiences.map(e => ({ company: e.company, role: e.role, duration: e.duration, description: e.description })),
          education: educations.map(e => ({ degree: e.degree, college: e.college, year: e.year, cgpa: e.cgpa })),
          skills,
          projects: projects.map(p => ({ name: p.name, description: p.description, techStack: p.techStack, githubUrl: p.githubUrl }))
        })
      });
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handlers for lists
  const addExperience = () => setExperiences([...experiences, { id: Date.now().toString(), company: "", role: "", duration: "", description: "" }]);
  const removeExperience = (id: string) => setExperiences(experiences.filter(e => e.id !== id));
  
  const addEducation = () => setEducations([...educations, { id: Date.now().toString(), degree: "", college: "", year: "", cgpa: "" }]);
  const removeEducation = (id: string) => setEducations(educations.filter(e => e.id !== id));
  
  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter(i => i !== s));

  const addProject = () => setProjects([...projects, { id: Date.now().toString(), name: "", description: "", techStack: "", githubUrl: "" }]);
  const removeProject = (id: string) => setProjects(projects.filter(p => p.id !== id));


  // PDF Generation
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(personal.fullName || "Your Name", 105, y, { align: "center" });
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const contactInfo = [
      personal.email,
      personal.phone,
      personal.location,
      personal.linkedin ? "LinkedIn" : "",
      personal.github ? "GitHub" : ""
    ].filter(Boolean).join("  •  ");
    doc.text(contactInfo, 105, y, { align: "center" });
    y += 15;

    const checkPageBreak = (spaceNeeded: number) => {
      if (y + spaceNeeded > 280) {
        doc.addPage();
        y = 20;
      }
    };

    const drawSectionHeader = (title: string) => {
      checkPageBreak(15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 20, y);
      y += 2;
      doc.setDrawColor(200);
      doc.line(20, y, 190, y);
      y += 8;
      doc.setFont("helvetica", "normal");
    };

    // Experience
    if (experiences.some(e => e.company || e.role)) {
      drawSectionHeader("Professional Experience");
      experiences.forEach(e => {
        if (!e.company && !e.role) return;
        checkPageBreak(20);
        
        doc.setFont("helvetica", "bold");
        doc.text(e.role || "Role", 20, y);
        doc.text(e.duration || "Duration", 190, y, { align: "right" });
        y += 5;
        
        doc.setFont("helvetica", "italic");
        doc.text(e.company || "Company", 20, y);
        y += 6;
        
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(e.description || "", 170);
        checkPageBreak(lines.length * 5);
        doc.text(lines, 20, y);
        y += (lines.length * 5) + 5;
      });
    }

    // Projects
    if (projects.some(p => p.name)) {
      drawSectionHeader("Projects");
      projects.forEach(p => {
        if (!p.name) return;
        checkPageBreak(15);
        
        doc.setFont("helvetica", "bold");
        doc.text(`${p.name} ${p.techStack ? `| ${p.techStack}` : ''}`, 20, y);
        y += 5;
        
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(p.description || "", 170);
        checkPageBreak(lines.length * 5);
        doc.text(lines, 20, y);
        y += (lines.length * 5) + 5;
      });
    }

    // Education
    if (educations.some(e => e.degree)) {
      drawSectionHeader("Education");
      educations.forEach(e => {
        if (!e.degree) return;
        checkPageBreak(12);
        
        doc.setFont("helvetica", "bold");
        doc.text(e.degree || "Degree", 20, y);
        doc.text(e.year || "Year", 190, y, { align: "right" });
        y += 5;
        
        doc.setFont("helvetica", "normal");
        doc.text(`${e.college || "College"} ${e.cgpa ? `(CGPA: ${e.cgpa})` : ''}`, 20, y);
        y += 8;
      });
    }

    // Skills
    if (skills.length > 0) {
      drawSectionHeader("Skills");
      checkPageBreak(10);
      const lines = doc.splitTextToSize(skills.join(", "), 170);
      doc.text(lines, 20, y);
    }

    doc.save(`${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    saveResumeData(); // save history when downloading
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="bg-emerald-600 text-white flex-shrink-0 pt-8 pb-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl font-black mb-2">AI Resume Builder</h1>
          <p className="text-emerald-100 font-medium">Build an ATS-friendly resume from scratch with AI enhancements.</p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 -mt-24 pb-20 flex gap-8 flex-col lg:flex-row items-stretch relative z-10">
        
        {/* LEFT COLUMN: Form Steps */}
        <div className="flex-1 w-full lg:w-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
          
          {/* Form Header / Progress */}
          <div className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 p-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {["Personal", "Experience", "Education", "Skills", "Projects", "Preview"].map((name, i) => (
               <button
                 key={name}
                 onClick={() => setStep(i + 1)}
                 className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                   step === i + 1 
                     ? "bg-emerald-600 text-white shadow-md" 
                     : step > i + 1 
                       ? "bg-emerald-50 text-emerald-700" 
                       : "text-gray-500 hover:bg-gray-100"
                 }`}
               >
                 {i + 1}. {name}
               </button>
            ))}
          </div>

          {/* Form Body */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="animate-fade-in space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-gray-500">FULL NAME</label><input value={personal.fullName} onChange={e=>setPersonal({...personal, fullName:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"/></div>
                  <div><label className="text-xs font-bold text-gray-500">EMAIL</label><input type="email" value={personal.email} onChange={e=>setPersonal({...personal, email:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                  <div><label className="text-xs font-bold text-gray-500">PHONE</label><input value={personal.phone} onChange={e=>setPersonal({...personal, phone:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                  <div><label className="text-xs font-bold text-gray-500">LOCATION</label><input value={personal.location} onChange={e=>setPersonal({...personal, location:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                  <div><label className="text-xs font-bold text-gray-500">LINKEDIN URL</label><input value={personal.linkedin} onChange={e=>setPersonal({...personal, linkedin:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                  <div><label className="text-xs font-bold text-gray-500">GITHUB URL</label><input value={personal.github} onChange={e=>setPersonal({...personal, github:e.target.value})} className="mt-1 w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"/></div>
                </div>
              </div>
            )}

            {/* STEP 2: Experience */}
            {step === 2 && (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
                  <button onClick={addExperience} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">+ Add Job</button>
                </div>
                {experiences.map((exp, idx) => (
                  <div key={exp.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/50 relative group">
                    {experiences.length > 1 && (
                      <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><label className="text-xs font-bold text-gray-500">COMPANY</label><input value={exp.company} onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, company:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">ROLE</label><input value={exp.role} onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, role:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div className="col-span-2"><label className="text-xs font-bold text-gray-500">DURATION</label><input placeholder="e.g. Jan 2020 - Present" value={exp.duration} onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, duration:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1 mt-2">
                        <label className="text-xs font-bold text-gray-500">DESCRIPTION</label>
                        <button 
                          onClick={() => enhanceDescription('experience', exp.id, exp.description)}
                          disabled={!exp.description.trim() || exp.isEnhancing}
                          className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${exp.isEnhancing ? 'text-gray-400' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {exp.isEnhancing ? '✨ Enhancing...' : '✨ Enhance with AI'}
                        </button>
                      </div>
                      <textarea 
                        value={exp.description} 
                        onChange={e => setExperiences(experiences.map(x => x.id === exp.id ? {...x, description:e.target.value} : x))}
                        placeholder="What did you do? AI will make it sound better."
                        className="w-full h-32 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: Education */}
            {step === 3 && (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                  <button onClick={addEducation} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">+ Add Education</button>
                </div>
                {educations.map((edu, idx) => (
                  <div key={edu.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/50 relative group">
                    {educations.length > 1 && (
                      <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><label className="text-xs font-bold text-gray-500">DEGREE</label><input placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => setEducations(educations.map(x => x.id === edu.id ? {...x, degree:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">INSTITUTION</label><input value={edu.college} onChange={e => setEducations(educations.map(x => x.id === edu.id ? {...x, college:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">YEAR / DURATION</label><input value={edu.year} onChange={e => setEducations(educations.map(x => x.id === edu.id ? {...x, year:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">CGPA / GRADE</label><input value={edu.cgpa} onChange={e => setEducations(educations.map(x => x.id === edu.id ? {...x, cgpa:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 4: Skills */}
            {step === 4 && (
              <div className="animate-fade-in space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
                  <button 
                    onClick={suggestSkills} 
                    disabled={suggestingSkills}
                    className={`text-sm font-bold flex items-center gap-1 ${suggestingSkills ? 'text-gray-400' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    {suggestingSkills ? '✨ Thinking...' : '✨ Suggest based on XP'}
                  </button>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter..."
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium mb-4"
                  />
                  <div className="flex flex-wrap gap-2">
                    {skills.map(s => (
                      <span key={s} className="pl-3 pr-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
                        {s}
                        <button onClick={() => removeSkill(s)} className="w-5 h-5 rounded-full hover:bg-emerald-200 flex items-center justify-center transition-colors">×</button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-sm text-gray-500 italic w-full text-center py-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        No skills added yet. Press Enter to add.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Projects */}
            {step === 5 && (
              <div className="animate-fade-in space-y-6">
                 <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
                  <button onClick={addProject} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">+ Add Project</button>
                </div>
                {projects.map((proj, idx) => (
                  <div key={proj.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950/50 relative group">
                    {projects.length > 1 && (
                      <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2"><label className="text-xs font-bold text-gray-500">PROJECT NAME</label><input value={proj.name} onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, name:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">TECH STACK</label><input placeholder="React, Node..." value={proj.techStack} onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, techStack:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                      <div><label className="text-xs font-bold text-gray-500">LINK</label><input placeholder="GitHub URL" value={proj.githubUrl} onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, githubUrl:e.target.value} : x))} className="mt-1 w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"/></div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1 mt-2">
                        <label className="text-xs font-bold text-gray-500">DESCRIPTION</label>
                        <button 
                          onClick={() => enhanceDescription('project', proj.id, proj.description)}
                          disabled={!proj.description.trim() || proj.isEnhancing}
                          className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${proj.isEnhancing ? 'text-gray-400' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        >
                          {proj.isEnhancing ? '✨ Enhancing...' : '✨ Enhance Description'}
                        </button>
                      </div>
                      <textarea 
                        value={proj.description} 
                        onChange={e => setProjects(projects.map(x => x.id === proj.id ? {...x, description:e.target.value} : x))}
                        className="w-full h-32 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 6: Actions/Preview Trigger */}
            {step === 6 && (
              <div className="flex flex-col items-center justify-center p-10 h-full text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-4xl shadow-sm border-4 border-white mb-2">🎉</div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Resume Ready!</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Your resume data is compiled. Check the live preview on the right. You can download it as PDF or send it directly for deeper ATS analysis.
                </p>
                <div className="flex flex-col w-full max-w-xs gap-3 mt-4">
                  <button onClick={downloadPDF} className="btn-primary py-3.5 shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                    ⬇️ Download PDF
                  </button>
                  <button 
                    onClick={async () => {
                      await saveResumeData();
                      navigate("/upload");
                    }} 
                    className="px-4 py-3 bg-white dark:bg-gray-900 border-2 border-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                  >
                    🤖 Analyze this Resume
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Form Footer / Nav */}
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950 flex justify-between items-center rounded-b-2xl">
            <button 
              onClick={() => setStep(step - 1)} 
              disabled={step === 1}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${step === 1 ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
            >
              ← Back
            </button>
            <div className="text-xs font-bold text-gray-400">Step {step} of 6</div>
            <button 
              onClick={() => setStep(step + 1)} 
              disabled={step === 6}
              className={`px-6 py-2 text-sm font-bold rounded-lg transition-colors ${step === 6 ? 'bg-gray-200 text-gray-400' : 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'}`}
            >
              Next →
            </button>
          </div>
        </div>


        {/* RIGHT COLUMN: Live Preview */}
        <div className="flex-[1.5] bg-gray-200 p-4 sm:p-8 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-800 flex flex-col h-[700px] lg:h-auto lg:min-h-[800px] overflow-y-auto custom-scrollbar relative">
          
          <div className="absolute top-4 right-8 z-10">
             <span className="bg-gray-900/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               Live Preview
             </span>
          </div>

          <div className="w-full max-w-[800px] mx-auto bg-white dark:bg-gray-900 shadow-2xl min-h-[1056px] flex flex-col p-10 md:p-14 mb-10 transition-all font-sans">
            
            {/* Header */}
            <header className="border-b-2 border-gray-900 pb-4 mb-6">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-2">
                {personal.fullName || "YOUR NAME"}
              </h1>
              <div className="flex flex-wrap text-sm text-gray-700 dark:text-gray-300 gap-x-4 gap-y-1 font-medium">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.location && <span>• {personal.location}</span>}
                {personal.linkedin && <span>• {personal.linkedin}</span>}
                {personal.github && <span>• {personal.github}</span>}
              </div>
            </header>

            {/* Experience */}
            {experiences.some(e => e.company || e.role) && (
              <section className="mb-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Experience</h2>
                <div className="space-y-4">
                  {experiences.map(e => {
                    if (!e.company && !e.role) return null;
                    return (
                      <div key={e.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{e.role}</h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{e.duration}</span>
                        </div>
                        <h4 className="italic text-sm text-gray-800 dark:text-gray-200 mb-2">{e.company}</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-[90%] whitespace-pre-wrap">
                          {e.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.some(p => p.name) && (
              <section className="mb-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Projects</h2>
                <div className="space-y-4">
                  {projects.map(p => {
                    if (!p.name) return null;
                    return (
                      <div key={p.id}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{p.name}</h3>
                          {p.techStack && <span className="text-xs px-1.5 py-0.5 border border-gray-200 dark:border-gray-800 rounded text-gray-600 dark:text-gray-400 font-medium">{p.techStack}</span>}
                          {p.githubUrl && <span className="text-xs text-blue-600 ml-auto">{p.githubUrl}</span>}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-[90%] whitespace-pre-wrap">
                          {p.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Education */}
            {educations.some(e => e.degree || e.college) && (
              <section className="mb-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Education</h2>
                <div className="space-y-3">
                  {educations.map(e => {
                    if (!e.degree && !e.college) return null;
                    return (
                      <div key={e.id} className="flex justify-between items-baseline">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">{e.degree}</h3>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{e.college} {e.cgpa ? ` • CGPA: ${e.cgpa}` : ''}</div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{e.year}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Skills</h2>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {skills.join(" • ")}
                </p>
              </section>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
