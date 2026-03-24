import { useState, useRef, useEffect } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import jsPDF from "jspdf";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Interview Prep — PlacementOS" },
    { name: "description", content: "Generate personalized interview questions using AI" },
  ];
}

interface Question {
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface InterviewData {
  technical: Question[];
  behavioral: Question[];
  projectBased: Question[];
  hr: Question[];
}

export default function InterviewPrep() {
  const token = useAppAuthStore((s) => s.token);
  const [resumeText, setResumeText] = useState("");
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewData | null>(null);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  const ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Frontend Dev",
    "Backend Dev",
    "Full Stack Dev",
    "DevOps",
    "AI/ML Engineer",
  ];

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      if (!window.puter?.ai?.chat) {
        throw new Error("Puter.js AI is not initialized yet. Please wait a moment.");
      }

      const prompt = `You are an expert technical interviewer.
Generate 20 UNIQUE interview questions based on THIS specific resume
and the selected job role.

RESUME: ${resumeText.substring(0, 3000)}
JOB ROLE: ${jobRole}

Make questions SPECIFIC to the skills and projects mentioned
in this resume. Not generic questions.

Return ONLY valid JSON:
{
  "technical": [
    {
      "question": "I see you used React in your project. Explain how you handled state management.",
      "answer": "Detailed answer here...",
      "difficulty": "Medium"
    }
  ],
  "behavioral": [
    {
      "question": "Tell me about the biggest challenge in your [specific project name] project",
      "answer": "Use STAR method...",
      "difficulty": "Easy"
    }
  ],
  "projectBased": [
    {
      "question": "Walk me through the architecture of [actual project from resume]",
      "answer": "Discuss the components...",
      "difficulty": "Hard"
    }
  ],
  "hr": [
    {
      "question": "Why should we hire you for this ${jobRole} role?",
      "answer": "Focus on your specific skills...",
      "difficulty": "Easy"
    }
  ]
}`;

      const parsedData = await callAIForJSON(prompt) as InterviewData;
      setResult(parsedData);

      // Save to backend
      if (token && parsedData.technical && parsedData.technical.length > 0) {
        await apiFetch("/interview/generate", {
          method: "POST",
          token,
          body: JSON.stringify({
            jobRole,
            resumeText: resumeText.substring(0, 1000) + (resumeText.length > 1000 ? "..." : ""),
            questions: parsedData
          }),
        }).catch(err => console.error("Failed to save history:", err));
      }

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (qId: string) => {
    setExpandedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Interview Prep Q&A", 20, 20);
    doc.setFontSize(14);
    doc.text(`Role: ${jobRole}`, 20, 30);
    
    let y = 45;
    
    const addSection = (title: string, questions: Question[]) => {
      if (!questions || questions.length === 0) return;
      if (y > 270) { doc.addPage(); y = 20; }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, y);
      y += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      questions.forEach((q, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        
        doc.setFont("helvetica", "bold");
        const linesQ = doc.splitTextToSize(`Q${idx+1} [${q.difficulty}]: ${q.question}`, 170);
        doc.text(linesQ, 20, y);
        y += (linesQ.length * 6) + 2;
        
        doc.setFont("helvetica", "normal");
        const linesA = doc.splitTextToSize(`A: ${q.answer}`, 170);
        if (y + (linesA.length * 6) > 280) {
           doc.addPage(); y = 20; 
        }
        doc.text(linesA, 20, y);
        y += (linesA.length * 6) + 8;
      });
      y += 5;
    };

    addSection("Technical Questions", result.technical);
    addSection("Behavioral Questions", result.behavioral);
    addSection("Project-based Questions", result.projectBased);
    addSection("HR Questions", result.hr);
    
    doc.save(`Interview_QA_${jobRole.replace(/\s+/g, '_')}.pdf`);
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === "Easy") return "bg-green-100 text-green-700 border-green-200";
    if (diff === "Medium") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const renderSection = (title: string, questions: Question[], badgeColor: string) => {
    if (!questions || questions.length === 0) return null;
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${badgeColor}`}>
            {questions.length} Questions
          </span>
        </div>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const qId = `${title}-${idx}`;
            const isOpen = expandedAnswers[qId];
            return (
              <div key={qId} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-start justify-between">
                  <div className="flex gap-4 items-start flex-1">
                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-sm ${badgeColor}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900 mb-2">{q.question}</h3>
                      {isOpen && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100 leading-relaxed whitespace-pre-wrap animate-fade-in">
                          <span className="font-bold text-gray-900 mr-2">Suggested Answer:</span>
                          {q.answer}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 flex items-center justify-center rounded-lg border ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <button 
                      onClick={() => toggleAnswer(qId)}
                      className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
                    >
                      {isOpen ? 'Hide Answer' : 'Show Answer'}
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Header section */}
      <div className="primary-gradient text-white pb-24 pt-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-sm mb-4 backdrop-blur-sm shadow-sm ring-1 ring-white/30">
            🤖 AI-Powered Mentorship
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Interview Questions Generator
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto font-medium">
            Paste your resume and target role. Our AI will craft 20 personalized questions across technical, behavioral, and HR categories.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8 animate-fade-in-up">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Paste your Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your entire resume content here..."
                className="w-full h-40 p-4 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Target Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full p-3.5 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm font-medium"
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              
              <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <p className="text-xs text-violet-800 font-medium">
                  💡 Tips: A complete resume gives better, more personalized questions.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 animate-fade-in text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all ${
              loading ? "bg-violet-400 cursor-wait" : "btn-primary"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Preparing your interview questions...
              </span>
            ) : "🚀 Generate Questions"}
          </button>
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">Your Custom Q&A</h2>
              <button 
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-5v10H3V11h2v8h14v-8h2z"/></svg>
                Download PDF
              </button>
            </div>

            {renderSection("Technical Questions", result.technical, "bg-blue-100 text-blue-700")}
            {renderSection("Behavioral Questions", result.behavioral, "bg-green-100 text-green-700")}
            {renderSection("Project-based Questions", result.projectBased, "bg-orange-100 text-orange-700")}
            {renderSection("HR Questions", result.hr, "bg-purple-100 text-purple-700")}
            
            <div className="mt-12 text-center">
              <button 
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl shadow-xl hover:-translate-y-1 hover:shadow-2xl font-bold transition-all text-lg"
              >
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-5v10H3V11h2v8h14v-8h2z"/></svg>
                Download All Q&A as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
