import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/lib/api";
import { useAppAuthStore } from "~/lib/app-auth";
import Navbar from "~/components/Navbar";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { callAIForJSON } from "~/lib/aiHelper";

// Inline ScoreCircle to avoid Windows casing cycle (Scorecircle.tsx === ScoreCircle.tsx)
function ScoreCircle({ score, size = 140, label = "Match Score" }: { score: number; size?: number; label?: string }) {
  const [disp, setDisp] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const sw = 10, radius = (size - sw) / 2, c = size / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circ - (clamped / 100) * circ;
  const color = clamped < 40 ? "#EF4444" : clamped < 70 ? "#F59E0B" : "#10B981";
  useEffect(() => {
    let start: number | null = null;
    const id = setTimeout(() => {
      const frame = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1200, 1);
        setDisp(Math.round((1 - Math.pow(1 - p, 3)) * clamped));
        if (p < 1) requestAnimationFrame(frame); else setDrawn(true);
      };
      requestAnimationFrame(frame);
    }, 100);
    return () => clearTimeout(id);
  }, [clamped]);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
        <circle cx={c} cy={c} r={radius} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={drawn ? offset : circ}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
        <text x={c} y={c - 4} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "Inter,sans-serif", fontSize: size * 0.22, fontWeight: 700, fill: color }}>{disp}</text>
        <text x={c} y={c + size * 0.14} textAnchor="middle"
          style={{ fontFamily: "Inter,sans-serif", fontSize: size * 0.095, fill: "#6b7280" }}>/ 100</text>
      </svg>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}

export function meta() {
  return [
    { title: "Analyze Resume — PlacementOS" },
    { name: "description", content: "Upload your resume and job description for AI-powered analysis." },
  ];
}

const loadingMessages = [
  "📄 Reading your resume…",
  "🔍 Scanning for keywords…",
  "🤖 Running AI analysis…",
  "🎯 Matching job requirements…",
  "💡 Generating suggestions…",
  "✨ Almost done…",
];

interface AnalysisResult {
  id?: string;
  overallScore: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
    tone: number;
  };
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  atsScore: number;
  jobTitle?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  location: string;
  matchScore: number;
  matchReason: string;
}

export default function UploadRoute() {
  const token = useAppAuthStore((s) => s.token);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const validateSession = useAppAuthStore((s) => s.validateSession);
  const navigate = useNavigate();

  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { void validateSession(); }, [validateSession]);
  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated, navigate]);

  // Puter.js readiness — listen for event or fall back to 3s timer
  useEffect(() => {
    // Already loaded
    if (typeof window !== "undefined" && (window as any).puter?.ai) {
      setPuterReady(true);
      return;
    }
    // Listen for Puter.js ready event
    const onReady = () => setPuterReady(true);
    window.addEventListener("puter:ready" as any, onReady);
    // Fallback: after 4 seconds just set ready (script is always in root.tsx)
    const fallback = setTimeout(() => setPuterReady(true), 4000);
    return () => {
      window.removeEventListener("puter:ready" as any, onReady);
      clearTimeout(fallback);
    };
  }, []);

  // Rotate loading messages during analysis
  useEffect(() => {
    if (!isAnalyzing) { if (msgIntervalRef.current) clearInterval(msgIntervalRef.current); return; }
    let idx = 0;
    msgIntervalRef.current = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[idx]);
    }, 1800);
    return () => { if (msgIntervalRef.current) clearInterval(msgIntervalRef.current); };
  }, [isAnalyzing]);

  const canAnalyze = useMemo(
    () => Boolean(file && jobDescription.trim() && token),
    [file, jobDescription, token]
  );

  async function extractPdfText(pdfFile: File): Promise<string> {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => ("str" in item ? item.str : "")).join(" "));
    }
    return pages.join("\n").trim();
  }

  async function runAIAnalysis(resumeText: string, jd: string): Promise<AnalysisResult> {
    const prompt = `You are an expert ATS resume analyzer.
Analyze this SPECIFIC resume against this SPECIFIC job description.

RESUME TEXT:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jd.slice(0, 2000)}

Analyze carefully and return ONLY valid JSON (no markdown, no explanation):
{
  "overallScore": 72,
  "breakdown": {
    "skills": 75,
    "experience": 68,
    "education": 80,
    "keywords": 65,
    "tone": 72
  },
  "missingKeywords": ["Docker", "AWS", "REST API"],
  "strengths": [
    "Good React experience mentioned",
    "Projects are relevant to the role"
  ],
  "improvements": [
    "Add cloud platform experience",
    "Quantify achievements with numbers"
  ],
  "suggestions": [
    "Add Docker containerization to skills section",
    "Mention any AWS or GCP projects you have done",
    "Change worked on to led, built, developed, designed",
    "Add GitHub profile link if not present",
    "Add metrics: increased performance by X%, reduced time by Y%"
  ],
  "atsScore": 68,
  "jobTitle": "Software Developer"
}`;

    const parsed = await callAIForJSON(prompt) as AnalysisResult;

    // Validate and normalize fields
    return {
      overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 0)),
      breakdown: {
        skills: Math.min(100, Math.max(0, Number(parsed.breakdown?.skills) || 0)),
        experience: Math.min(100, Math.max(0, Number(parsed.breakdown?.experience) || 0)),
        education: Math.min(100, Math.max(0, Number(parsed.breakdown?.education) || 0)),
        keywords: Math.min(100, Math.max(0, Number(parsed.breakdown?.keywords) || 0)),
        tone: Math.min(100, Math.max(0, Number(parsed.breakdown?.tone) || 0)),
      },
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      atsScore: Math.min(100, Math.max(0, Number(parsed.atsScore) || Number(parsed.overallScore) || 0)),
      jobTitle: String(parsed.jobTitle || jobTitle || ""),
    };
  }

  async function onAnalyze() {
    setError(null);
    setResult(null);
    setJobs([]);

    if (!file) { setError("Please upload a PDF resume."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }

    setIsAnalyzing(true);
    setLoadingMsg(loadingMessages[0]);

    try {
      // Step 1: Extract text from PDF
      let resumeText: string;
      try {
        resumeText = await extractPdfText(file);
        if (!resumeText.trim()) throw new Error("Could not extract text from PDF. Try a different file.");
      } catch (e) {
        throw new Error(e instanceof Error ? e.message : "PDF extraction failed.");
      }

      // Step 2: Call Puter.js AI
      let analysis: AnalysisResult;
      try {
        analysis = await runAIAnalysis(resumeText, jobDescription);
      } catch (e) {
        throw new Error(
          e instanceof Error
            ? `AI Analysis failed: ${e.message}`
            : "AI Analysis failed. Please try again."
        );
      }

      // Step 3: Save to backend MongoDB
      try {
        const res = await apiFetch("/analyze", {
          method: "POST",
          token,
          body: JSON.stringify({
            resumeText,
            jobDescription,
            jobTitle: analysis.jobTitle || jobTitle,
            analysis,
          }),
        });
        if (res.ok) {
          const saved = await res.json().catch(() => ({})) as { id?: string };
          analysis.id = saved.id;
        }
      } catch {
        // Backend save failure is non-critical — still show results
        console.warn("Could not save to backend. Results shown but not persisted.");
      }

      setResult(analysis);

      // Step 4: Load matching jobs
      setLoadingJobs(true);
      const skillsQuery = (analysis.missingKeywords.slice(0, 5).join(",") || "react,node,javascript");
      apiFetch(`/jobs?skills=${encodeURIComponent(skillsQuery)}`, { token })
        .then(async (r) => { if (r.ok) setJobs(await r.json()); })
        .catch(() => {})
        .finally(() => setLoadingJobs(false));

    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error. Please try again.");
      setLoadingJobs(false);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "application/pdf") setFile(f);
    else setError("Please drop a PDF file.");
  }

  async function downloadPdf() {
    if (!result) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 20;
    const addLine = (text: string, fontSize = 11, bold = false) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, y);
      y += lines.length * (fontSize * 0.45) + 3;
    };

    doc.setTextColor(124, 58, 237);
    addLine("PlacementOS Analysis Report", 22, true);
    doc.setTextColor(0, 0, 0);
    addLine(`Date: ${new Date().toLocaleDateString()}  |  Job: ${result.jobTitle || "N/A"}`, 10);
    y += 4;
    addLine(`Overall Score: ${result.overallScore}/100   ATS Score: ${result.atsScore}/100`, 14, true);
    y += 4;

    addLine("Score Breakdown", 13, true);
    for (const [k, v] of Object.entries(result.breakdown)) {
      addLine(`  ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}/100`);
    }
    y += 4;

    addLine("Missing Keywords", 13, true);
    addLine(`  ${result.missingKeywords.join(", ") || "None"}`);
    y += 4;

    addLine("Strengths", 13, true);
    result.strengths.forEach((s) => addLine(`  ✓ ${s}`));
    y += 4;

    addLine("Improvements", 13, true);
    result.improvements.forEach((s) => addLine(`  ⚠ ${s}`));
    y += 4;

    addLine("AI Suggestions", 13, true);
    result.suggestions.forEach((s, i) => addLine(`  ${i + 1}. ${s}`));

    doc.save(`PlacementOS-${new Date().toISOString().split("T")[0]}.pdf`);
  }

  const getColor = (s: number) => s >= 70 ? "#10B981" : s >= 40 ? "#F59E0B" : "#EF4444";
  const getScoreBg = (s: number) => s >= 70 ? "bg-emerald-100 text-emerald-700" : s >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Analyze Resume</h1>
          <p className="text-gray-500 mt-1">
            Upload your PDF, paste a job description, and get instant
            <span className="font-semibold text-violet-700"> real AI analysis</span> via Puter.js.
          </p>
          {!puterReady ? (
            <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg">
              ⏳ Loading Puter.js AI… (may take a few seconds)
            </p>
          ) : (
            <p className="text-sm text-emerald-700 mt-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              ✅ Puter.js AI ready — powered by GPT-4o-mini (free, no API key needed)
            </p>
          )}
        </div>

        <div className="card mb-6 animate-fade-in-up">
          {/* Step 1: PDF Upload */}
          <p className="text-sm font-bold text-violet-600 mb-3">Step 1 — Upload Resume (PDF)</p>
          <div
            ref={dropRef}
            className={`drop-zone mb-6 ${dragging ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("pdf-input")?.click()}
          >
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => { setFile(e.currentTarget.files?.[0] ?? null); e.currentTarget.value = ""; }}
            />
            {file ? (
              <div className="flex items-center justify-between bg-violet-50 p-3 rounded-xl border border-violet-200">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-3">☁️</div>
                <p className="font-semibold text-gray-700">Drag & drop PDF here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
              </>
            )}
          </div>

          {/* Step 2: Job Details */}
          <p className="text-sm font-bold text-violet-600 mb-3">Step 2 — Job Details</p>
          <div className="space-y-4 mb-6">
            <div className="form-group">
              <label className="form-label">Job Title (optional)</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer at Google"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                className="min-h-40 resize-y"
              />
            </div>
          </div>

          {error && <div className="alert-error mb-4"><span className="font-semibold">Error:</span> {error}</div>}

          {/* Analyze Button */}
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 border-4 border-violet-200 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-700 font-medium text-base animate-fade-in">{loadingMsg}</p>
              <p className="text-xs text-gray-400">Powered by Puter.js AI (GPT-4o-mini)</p>
            </div>
          ) : (
            <button
              className="btn-primary w-full py-4 text-base"
              onClick={onAnalyze}
              disabled={!canAnalyze}
            >
              🤖 Analyze with AI
            </button>
          )}
        </div>

        {/* ─── RESULTS ─── */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">

            {/* Score Overview */}
            <div className="card">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center gap-4">
                  <ScoreCircle score={result.overallScore} size={160} label="Overall Match" />
                  <div className={`text-sm font-bold px-4 py-1.5 rounded-full ${getScoreBg(result.atsScore)}`}>
                    ATS Score: {result.atsScore}/100
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {result.jobTitle ? `Analysis for: ${result.jobTitle}` : "Analysis Complete"}
                    </h2>
                    <span className={`hidden md:inline text-sm font-bold px-3 py-1 rounded-full ${getScoreBg(result.overallScore)}`}>
                      {result.overallScore >= 70 ? "✅ Strong" : result.overallScore >= 40 ? "⚠️ Fair" : "❌ Weak"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">
                    {result.overallScore >= 70
                      ? "Great match! Your resume aligns well with this job description."
                      : result.overallScore >= 40
                      ? "Moderate match. The improvements below will boost your chances."
                      : "Low match. Follow the suggestions below to make your resume ATS-friendly."}
                  </p>
                  <button onClick={downloadPdf} className="btn-secondary text-sm">
                    📄 Download PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-5">📊 Score Breakdown</h2>
              <div className="space-y-4">
                {([
                  { label: "Skills Match", key: "skills", icon: "⚡" },
                  { label: "Experience Match", key: "experience", icon: "💼" },
                  { label: "Education Match", key: "education", icon: "🎓" },
                  { label: "Keywords Match", key: "keywords", icon: "🔑" },
                  { label: "Tone & Style", key: "tone", icon: "✍️" },
                ] as const).map((dim) => {
                  const val = result.breakdown[dim.key];
                  return (
                    <div key={dim.key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{dim.icon} {dim.label}</span>
                        <span className="text-sm font-bold" style={{ color: getColor(val) }}>{val}/100</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${val}%`, background: getColor(val) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-2">❌ Missing Keywords</h2>
                <p className="text-sm text-gray-500 mb-3">
                  These terms appear in the job description but not in your resume. Add them naturally:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <span key={kw} className="chip-red">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths + Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-3">✅ Strengths</h2>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 shrink-0 font-bold">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-3">⚠️ Improvements</h2>
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-yellow-500 mt-0.5 shrink-0 font-bold">!</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💡 AI Suggestions</h2>
              <ol className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 primary-gradient rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            {/* Matching Jobs */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💼 Matching Remote Jobs</h2>
              {loadingJobs ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16" />)}</div>
              ) : jobs.length === 0 ? (
                <p className="text-gray-400 text-sm">No jobs found — try again in a moment.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {jobs.slice(0, 6).map((job) => (
                    <div key={job.id} className="p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{job.title}</p>
                        <span className="chip-green ml-2 shrink-0">{job.matchScore}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{job.company} · {job.location}</p>
                      <p className="text-xs text-gray-400 mb-2">{job.matchReason}</p>
                      {job.url !== "#" ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-600 font-semibold hover:underline"
                        >
                          Apply → {job.url.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">Demo listing</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
