import { useState } from "react";
import { useAppAuthStore } from "~/lib/app-auth";
import { apiFetch } from "~/lib/api";
import Navbar from "~/components/Navbar";
import jsPDF from "jspdf";
import { callAI } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Cover Letter Generator — PlacementOS" },
    { name: "description", content: "Write a personalized cover letter in seconds using AI" },
  ];
}

export default function CoverLetterGenerator() {
  const user = useAppAuthStore((s) => s.user);
  const token = useAppAuthStore((s) => s.token);
  
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [candidateName, setCandidateName] = useState(user?.name || "");
  const [tone, setTone] = useState("Professional");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const TONES = ["Professional", "Enthusiastic", "Creative"];

  const handleGenerate = async (isRegenerate = false) => {
    if (!resumeText.trim() || !jobDescription.trim() || !companyName.trim() || !candidateName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);
    if (!isRegenerate) setResult(null);

    try {


      const prompt = `Write a professional cover letter.

CANDIDATE NAME: ${candidateName}
RESUME/BACKGROUND: ${resumeText.slice(0, 3000)}
JOB DESCRIPTION: ${jobDescription.slice(0, 2000)}
COMPANY NAME: ${companyName}
TONE: ${tone}

Write a compelling 3-paragraph cover letter:
- Paragraph 1: Strong opening mentioning the specific role and company
- Paragraph 2: Match specific skills from resume to specific requirements in JD
- Paragraph 3: Confident closing with call to action

Make it SPECIFIC to this person and this job.
Do NOT use generic phrases like "I am writing to express my interest".
Start with: "Dear Hiring Manager,"
Return ONLY the cover letter text.`;

      let content = await callAI(prompt);
      content = content.trim();
      
      // Calculate stats
      const words = content.split(/\s+/).filter((w: string) => w.length > 0).length;
      setWordCount(words);
      setCharCount(content.length);
      setResult(content);
      setCopied(false);

      // Save to backend
      if (token) {
        await apiFetch("/cover-letter/save", {
          method: "POST",
          token,
          body: JSON.stringify({
            companyName,
            jobDescription: jobDescription.substring(0, 1000),
            resumeText: resumeText.substring(0, 1000),
            content,
            tone,
            wordCount: words
          }),
        }).catch(err => console.error("History save failed", err));
      }

    } catch (err: any) {
      console.error("Cover letter error:", err);
      setError(err.message || "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.setFont("times", "normal"); // Traditional font for cover letters
    
    // Add date
    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    doc.text(date, 20, 20);
    
    const lines = doc.splitTextToSize(result, 170);
    doc.text(lines, 20, 40);
    
    doc.save(`Cover_Letter_${companyName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Navbar />

      <div className="bg-blue-600 text-white pb-24 pt-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white dark:bg-gray-900/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-gray-900/20 text-white font-semibold text-sm mb-4">
            ✍️ AI Writing Assistant
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Cover Letter Generator
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto font-medium">
            Generate a personalized, highly effective cover letter perfectly tailored to the job description and your resume.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
              <input
                type="text"
                placeholder="E.g., Google, Microsoft, Startup Inc"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full p-3 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job requirements here..."
                className="w-full h-32 p-3 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Your Resume text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume..."
                className="w-full h-32 p-3 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Writing Tone</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      tone === t ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-auto ${
                loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading && !result ? "Crafting your perfect cover letter..." : "✨ Generate Cover Letter"}
            </button>
          </div>

          {/* Results View */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex flex-col min-h-[600px]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" /></svg>
              Your Cover Letter
            </h2>

            {result ? (
              <div className="flex flex-col h-full animate-fade-in">
                {/* Stats row */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold text-gray-500">
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg">{wordCount} Words</span>
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg">{charCount} Characters</span>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 px-3 py-1.5 rounded-lg">Tone: {tone}</span>
                </div>

                {/* The Letter */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-xl p-6 border border-gray-100 dark:border-gray-800 overflow-y-auto font-serif text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap shadow-inner text-[15px]">
                  {result}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <button 
                    onClick={copyToClipboard}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      copied ? "bg-green-100 text-green-700 border-green-200" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-950"
                    }`}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button 
                    onClick={downloadPDF}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-950 transition-all"
                  >
                   📕 PDF
                  </button>
                  <button 
                    onClick={() => handleGenerate(true)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 hover:bg-blue-100 rounded-xl text-sm font-bold transition-all"
                  >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-3xl mb-4">
                  📝
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ready to Write</h3>
                <p className="text-gray-500 text-sm max-w-[250px]">
                  Fill out the form on the left and click generate to create your custom cover letter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
