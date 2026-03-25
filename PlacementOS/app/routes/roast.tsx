import { useState } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Link } from "react-router";
import { useAppAuthStore } from "~/lib/app-auth";
import { callAIForJSON } from "~/lib/aiHelper";
import { apiFetch } from "~/lib/api";

export default function Roast() {
  const token = useAppAuthStore((s) => s.token);
  
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isRoasting, setIsRoasting] = useState(false);
  const [roastData, setRoastData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Parsing
  const extractTextFromPDF = async (file: File) => {
    setIsParsing(true);
    setError(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      setResumeText(fullText.trim());
    } catch (err: any) {
      setError("Failed to read PDF. Please try another file.");
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      extractTextFromPDF(file);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      extractTextFromPDF(file);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  // AI Roast Request
  const generateRoast = async () => {
    if (!resumeText.trim()) {
      setError("Please upload a resume first.");
      return;
    }
    setIsRoasting(true);
    setError(null);

    const prompt = `You are a brutally honest senior software engineer 
reviewing this SPECIFIC resume. Be savage but helpful.
Point out EXACT problems you see in THIS resume.
Do not give generic advice — be specific to what you read.

RESUME TEXT:
${resumeText.slice(0, 3000)}

Return ONLY valid JSON:
{
  "overallScore": 58,
  "overallVerdict": "This resume needs serious work before any recruiter sees it",
  "categories": {
    "firstImpression": {
      "score": 5,
      "roast": "Write a SPECIFIC roast about what you actually see in this resume"
    },
    "skills": {
      "score": 6,
      "roast": "Specific comment about the ACTUAL skills listed in this resume"
    },
    "experience": {
      "score": 7,
      "roast": "Specific comment about the ACTUAL experience in this resume"
    },
    "projects": {
      "score": 5,
      "roast": "Specific comment about the ACTUAL projects listed"
    },
    "formatting": {
      "score": 4,
      "roast": "Specific comment about formatting issues you see"
    },
    "impact": {
      "score": 6,
      "roast": "Specific comment about the impact statements"
    }
  },
  "brutalPoints": [
    "Specific problem 1 from THIS resume",
    "Specific problem 2 from THIS resume",
    "Specific problem 3 from THIS resume",
    "Specific problem 4 from THIS resume",
    "Specific problem 5 from THIS resume"
  ],
  "fixes": [
    "Specific fix 1 for THIS resume",
    "Specific fix 2 for THIS resume",
    "Specific fix 3 for THIS resume",
    "Specific fix 4 for THIS resume",
    "Specific fix 5 for THIS resume"
  ]
}`;

    try {
      const parsedData = await callAIForJSON(prompt);
      setRoastData(parsedData);

      // Save to backend
      try {
        await apiFetch("/roast/save", {
          method: "POST",
          token,
          body: JSON.stringify({
            resumeText,
            ...parsedData
          })
        });
      } catch (e) {
        console.error("Failed to save roast to history", e);
      }

    } catch (err: any) {
      setError("The AI was too nice and crashed. Just kidding, something went wrong. Try again.");
      console.error(err);
    } finally {
      setIsRoasting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 70) return "text-orange-500";
    return "text-green-500";
  };

  const getBorderColor = (score: number) => {
    if (score < 40) return "border-red-500/30";
    if (score < 70) return "border-orange-500/30";
    return "border-green-500/30";
  };

  const copyToClipboard = () => {
    const text = `🔥 RESUME ROAST 🔥\nScore: ${roastData.overallScore}/100\nVerdict: ${roastData.overallVerdict}\n\nI just got my resume brutally roasted!`;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 pb-20 font-sans selection:bg-red-50 dark:bg-red-900/200/30">
      
      {/* Header */}
      <div className="bg-gradient-to-b from-red-950/40 to-transparent border-b border-red-900/30 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-tight mb-4 animate-fade-in-up">
            Resume Roast Mode 🔥
          </h1>
          <p className="text-xl text-red-200/70 font-medium">
            Your resume, brutally reviewed. No sugar coating.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 animate-fade-in">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!roastData ? (
          <div className="max-w-2xl mx-auto">
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed ${resumeText ? 'border-red-500/50 bg-red-900/10' : 'border-gray-800 hover:border-red-500/40 bg-gray-900/50'} rounded-3xl p-12 text-center transition-all group`}
            >
              <div className="w-20 h-20 mx-auto bg-gray-800 group-hover:bg-red-950/50 rounded-full flex items-center justify-center text-4xl mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg group-hover:shadow-red-500/20">
                📄
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">
                {resumeText ? "Resume Loaded & Ready" : "Upload Resume PDF"}
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                {resumeText ? "Click the button below if you're brave enough." : "Drag & drop your PDF here, or click to browse"}
              </p>
              
              <input type="file" id="pdf-upload" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              
              {!resumeText && (
                <label 
                  htmlFor="pdf-upload" 
                  className="cursor-pointer inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium py-3 px-6 rounded-xl transition-all"
                >
                  Browse Files
                </label>
              )}
            </div>

            {isParsing && (
              <div className="text-center mt-6 text-red-400 font-medium animate-pulse">
                Extracting text from PDF...
              </div>
            )}

            {resumeText && (
              <div className="mt-12 text-center animate-fade-in-up">
                <button
                  onClick={generateRoast}
                  disabled={isRoasting}
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-2xl py-6 px-12 rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed group w-full relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isRoasting ? "PREPARING THE ROAST..." : "ROAST MY RESUME 🔥"}
                  </span>
                  {isRoasting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                  )}
                </button>
                {isRoasting && (
                  <p className="mt-6 text-red-400 font-medium flex items-center justify-center gap-2 animate-pulse text-lg">
                    <span className="text-2xl animate-bounce">🔥</span>
                    Reading your resume... writing savage comments...
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up space-y-8">
            {/* Header Score Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
              
              <p className="text-gray-400 font-bold tracking-widest uppercase mb-4 text-sm">Overall Verdict</p>
              
              <div className="inline-flex items-end gap-2 mb-6">
                <span className={`text-7xl font-black ${getScoreColor(roastData.overallScore)} leading-none`}>
                  {roastData.overallScore}
                </span>
                <span className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">/100</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100 max-w-3xl mx-auto leading-tight mb-8">
                "{roastData.overallVerdict}"
              </h2>

              <button onClick={copyToClipboard} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 font-semibold py-2 px-6 rounded-full transition-colors text-sm">
                Share Roast
              </button>
            </div>

            {/* Categories */}
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(roastData.categories).map(([key, data]: [string, any], index) => {
                const labels: any = {
                  firstImpression: "First Impression", skills: "Skills Section",
                  experience: "Experience", projects: "Projects",
                  formatting: "Formatting & ATS", impact: "Overall Impact"
                };
                return (
                  <div key={key} className={`bg-gray-900/50 border ${getBorderColor(data.score)} rounded-2xl p-6 hover:bg-gray-900 transition-colors`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-300 capitalize">{labels[key]}</h3>
                      <span className={`font-black ${getScoreColor(data.score * 10)} px-2 py-1 bg-gray-950 rounded-md text-sm`}>
                        {data.score}/10
                      </span>
                    </div>
                    <p className="text-red-200/80 leading-relaxed font-medium italic">"{data.roast}"</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
              {/* The Roast */}
              <div>
                <h3 className="text-2xl font-black text-red-500 mb-6 flex items-center gap-2">
                  <span>🔥</span> The Roast
                </h3>
                <div className="space-y-4">
                  {roastData.brutalPoints.map((point: string, i: number) => (
                    <div key={i} className="bg-red-950/20 border border-red-900/40 rounded-xl p-5 shadow-sm">
                      <p className="text-red-100/90 font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Fix */}
              <div>
                <h3 className="text-2xl font-black text-emerald-500 mb-6 flex items-center gap-2">
                  <span>✅</span> The Fix
                </h3>
                <div className="space-y-4">
                  {roastData.fixes.map((fix: string, i: number) => (
                    <div key={i} className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 shadow-sm">
                      <p className="text-emerald-100/90 font-medium">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-12 pb-8">
              <button 
                onClick={() => { setRoastData(null); setResumeText(""); }}
                className="text-gray-400 hover:text-white hover:underline transition-colors"
              >
                Let me try again (I fixed it, I promise)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
