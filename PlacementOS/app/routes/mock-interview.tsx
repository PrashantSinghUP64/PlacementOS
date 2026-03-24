import { useState, useEffect, useRef } from "react";
import { usePuterStore } from "~/lib/puter";
import { useAppAuthStore } from "~/lib/app-auth";
import jsPDF from "jspdf";
import { callAIForJSON } from "~/lib/aiHelper";
import { apiFetch } from "~/lib/api";

type Difficulty = "Easy" | "Medium" | "Hard";
type InterviewType = "Technical" | "HR" | "Mixed";

interface QnA {
  question: string;
  category: string;
  userAnswer: string;
  idealAnswer: string;
  feedback: string;
  score: number;
}

export default function MockInterview() {
  const puterReady = usePuterStore((s) => s.puterReady);
  const token = useAppAuthStore((s) => s.token);
  const user = useAppAuthStore((s) => s.user);

  const [phase, setPhase] = useState<"setup" | "interview" | "results">("setup");
  
  // Setup State
  const [jobRole, setJobRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [type, setType] = useState<InterviewType>("Mixed");
  const [totalQuestions, setTotalQuestions] = useState(5);

  // Interview State
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 mins per question
  const [allQnA, setAllQnA] = useState<QnA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results State
  const [resultsData, setResultsData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start Interview
  const startInterview = async () => {
    if (!puterReady || !(window as any).puter?.ai?.chat) {
      setError("AI is not ready. Please wait.");
      return;
    }
    const chat = (window as any).puter.ai.chat;
    
    setIsLoading(true);
    setError(null);

    const startPrompt = `You are a ${difficulty} level interviewer for ${jobRole} position. Ask the first interview question. The interview type is ${type}. Return ONLY JSON:
{
  "question": "string",
  "category": "string"
}`;

    try {
      const parsed = await callAIForJSON(startPrompt);
      
      setCurrentQuestion(parsed.question);
      setCurrentCategory(parsed.category);
      setAllQnA([]);
      setQuestionNum(1);
      setUserAnswer("");
      setTimeLeft(120);
      setPhase("interview");
    } catch (err) {
      setError("Failed to start interview. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (phase === "interview") {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSkip(); // auto skip when time is up
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentQuestion]);

  const handleSkip = () => {
    submitAnswer(true);
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    submitAnswer(false);
  };

  const submitAnswer = async (skipped: boolean) => {
    if (!(window as any).puter?.ai?.chat) return;
    const chat = (window as any).puter.ai.chat;
    
    setIsLoading(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const answerToEval = skipped ? "[CANDIDATE SKIPPED QUESTION]" : userAnswer;

    const evalPrompt = `You are interviewing for ${jobRole}.
Previous question: ${currentQuestion}
Candidate answer: ${answerToEval}
This is question ${questionNum} of ${totalQuestions}. The difficulty is ${difficulty}.

Return ONLY JSON:
{
  "feedback": "string",
  "score": number (0-10, if skipped give 0),
  "idealAnswer": "string",
  "nextQuestion": "string (or null if it was the last question)",
  "nextCategory": "string"
}`;

    try {
      const parsed = await callAIForJSON(evalPrompt);

      const newQnA: QnA = {
        question: currentQuestion,
        category: currentCategory,
        userAnswer: answerToEval,
        idealAnswer: parsed.idealAnswer,
        feedback: parsed.feedback,
        score: skipped ? 0 : parsed.score // penalty handled inherently or explicit
      };

      const updatedQnA = [...allQnA, newQnA];
      setAllQnA(updatedQnA);

      if (questionNum < totalQuestions) {
        setQuestionNum(prev => prev + 1);
        setCurrentQuestion(parsed.nextQuestion || "Could you tell me more about your recent projects?");
        setCurrentCategory(parsed.nextCategory || "General");
        setUserAnswer("");
        setTimeLeft(120);
      } else {
        await generateFinalResults(updatedQnA);
      }
    } catch (err) {
      console.error(err);
      alert("Error evaluating answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateFinalResults = async (finalQnA: QnA[]) => {
    if (!(window as any).puter?.ai?.chat) return;
    const chat = (window as any).puter.ai.chat;
    setIsLoading(true);
    
    const finalPrompt = `Evaluate this complete mock interview.
Job Role: ${jobRole}
Difficulty: ${difficulty}
All Q&A: ${JSON.stringify(finalQnA)}

Return ONLY JSON:
{
  "overallScore": number (0-100),
  "performance": {
    "communication": number (0-10),
    "technicalAccuracy": number (0-10),
    "confidence": number (0-10),
    "answerStructure": number (0-10),
    "problemSolving": number (0-10)
  },
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "verdict": "string"
}`;

    try {
      const parsed = await callAIForJSON(finalPrompt);
      setResultsData(parsed);
      setPhase("results");

      // Save to backend
      try {
        await apiFetch("/mock-interview/save", {
          method: "POST",
          token,
          body: JSON.stringify({
            jobRole,
            difficulty,
            interviewType: type,
            totalQuestions,
            qna: finalQnA,
            finalScore: parsed.overallScore,
            ...parsed
          })
        });
      } catch (err) {
        console.error("Failed to save to history", err);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating final report.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Mock Interview Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Role: ${jobRole} | Difficulty: ${difficulty}`, 20, 30);
    doc.text(`Overall Score: ${resultsData.overallScore}/100`, 20, 38);
    doc.text(`Verdict: ${resultsData.verdict}`, 20, 46);

    let yPos = 60;
    allQnA.forEach((q, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`Q${i + 1}: ${doc.splitTextToSize(q.question, 170)}`, 20, yPos);
      yPos += 10;
      doc.setFont("helvetica", "normal");
      doc.text(`Your Answer: ${doc.splitTextToSize(q.userAnswer, 170)}`, 20, yPos);
      yPos += 15;
      doc.setTextColor(0, 100, 0);
      doc.text(`Ideal Answer: ${doc.splitTextToSize(q.idealAnswer, 170)}`, 20, yPos);
      yPos += 15;
      doc.setTextColor(100, 0, 0);
      doc.text(`Feedback: ${doc.splitTextToSize(q.feedback, 170)}`, 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 20;
    });

    doc.save(`Mock_Interview_${jobRole.replace(/\s+/g, '_')}.pdf`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-indigo-900 text-white pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Mock Interview Simulator 🗣️</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Practice real interviews with our AI interviewer. Get instant feedback and actionable insights.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100">
            {error}
          </div>
        )}

        {/* ================= SETUP PHASE ================= */}
        {phase === "setup" && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Setup Your Interview</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Job Role</label>
                <input 
                  type="text" 
                  value={jobRole} 
                  onChange={e => setJobRole(e.target.value)}
                  className="w-full text-input"
                  placeholder="e.g. Senior React Developer"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty Level</label>
                  <select 
                    value={difficulty} 
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full text-input"
                  >
                    <option value="Easy">Easy (Intern/Fresher)</option>
                    <option value="Medium">Medium (Junior/Mid)</option>
                    <option value="Hard">Hard (Senior/Staff)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Interview Type</label>
                  <select 
                    value={type} 
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full text-input"
                  >
                    <option value="Technical">Technical Only</option>
                    <option value="HR">HR / Behavioral</option>
                    <option value="Mixed">Mixed (Technical + HR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Number of Questions</label>
                <div className="flex gap-4">
                  {[5, 10, 15].map(num => (
                    <button
                      key={num}
                      onClick={() => setTotalQuestions(num)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${totalQuestions === num ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={isLoading}
                className="w-full btn-primary py-4 text-lg mt-8"
              >
                {isLoading ? "Preparing Interview..." : "Start Interview 🚀"}
              </button>
            </div>
          </div>
        )}

        {/* ================= INTERVIEW PHASE ================= */}
        {phase === "interview" && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-[700px] max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                  Question {questionNum} of {totalQuestions}
                </span>
                <span className="ml-3 text-sm font-medium text-gray-500">{currentCategory}</span>
              </div>
              <div className={`font-mono text-lg font-bold flex items-center gap-2 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5">
              <div className="bg-indigo-500 h-1.5 transition-all duration-500" style={{ width: `${((questionNum - 1) / totalQuestions) * 100}%` }}></div>
            </div>

            <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
              {/* Left Side: AI Interviewer */}
              <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center text-6xl shadow-inner mb-6 relative">
                  🤖
                  {isLoading && <span className="absolute -top-2 -right-2 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-indigo-500"></span>
                  </span>}
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 text-left w-full relative">
                  <div className="absolute -right-3 top-1/2 -mt-3 w-6 h-6 bg-white border-r border-b border-gray-200 transform -rotate-45 hidden md:block"></div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {isLoading ? "Thinking..." : currentQuestion}
                  </p>
                </div>
              </div>

              {/* Right Side: User Answer */}
              <div className="w-full md:w-2/3 p-6 flex flex-col">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between items-center">
                  Your Answer
                  {allQnA.length > 0 && questionNum > 1 && !isLoading && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded text-right max-w-[200px] truncate">
                      Last Q Score: {allQnA[allQnA.length - 1].score}/10
                    </span>
                  )}
                </label>
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  disabled={isLoading}
                  placeholder="Type your detailed answer here... (Tip: Use the STAR method for behavioral questions)"
                  className="flex-1 w-full text-input resize-none p-4 font-medium text-gray-800 disabled:bg-gray-50"
                ></textarea>
                
                <div className="mt-4 flex gap-4">
                  <button 
                    onClick={handleSkip} 
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Skip (-5 pts)
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !userAnswer.trim()}
                    className="flex-1 btn-primary py-3"
                  >
                    {isLoading ? "Evaluating..." : questionNum === totalQuestions ? "Submit & Finish" : "Submit Answer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= RESULTS PHASE ================= */}
        {phase === "results" && resultsData && (
          <div className="animate-fade-in-up space-y-8">
            {/* Top Score Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Interview Score</h2>
              <div className="flex justify-center items-end gap-2 mb-4">
                <span className={`text-6xl font-black leading-none ${resultsData.overallScore >= 70 ? 'text-green-500' : resultsData.overallScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {resultsData.overallScore}
                </span>
                <span className="text-3xl font-bold text-gray-400 mb-1">/100</span>
              </div>
              <p className="text-xl font-medium text-gray-800 max-w-2xl mx-auto">
                "{resultsData.verdict}"
              </p>

              <div className="flex justify-center gap-4 mt-8">
                <button onClick={() => setPhase("setup")} className="btn-secondary">Practice Again</button>
                <button onClick={downloadReport} className="btn-primary">Download Report</button>
              </div>
            </div>

            {/* Performance Badges */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(resultsData.performance).map(([key, score]: [string, any]) => {
                const names: any = { communication: "Communication", technicalAccuracy: "Tech Accuracy", confidence: "Confidence", answerStructure: "Structure", problemSolving: "Problem Solving" };
                return (
                  <div key={key} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-2">{names[key]}</p>
                    <div className="text-2xl font-black text-indigo-900">{score}/10</div>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-green-50/50 border border-green-100 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">⭐ Strengths</h3>
                <ul className="space-y-3">
                  {resultsData.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 text-green-900"><span className="text-green-500">✓</span> {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">📈 Areas to Improve</h3>
                <ul className="space-y-3">
                  {resultsData.improvements.map((s: string, i: number) => (
                    <li key={i} className="flex gap-2 text-red-900"><span className="text-red-500">↗</span> {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Q&A Breakdown */}
            <h3 className="text-2xl font-black text-gray-900 mt-12 mb-6">Question by Question Breakdown</h3>
            <div className="space-y-6">
              {allQnA.map((q, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="md:w-16 flex-shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-lg">Q{i + 1}</span>
                    <span className={`font-black text-xl ${q.score >= 7 ? 'text-green-500' : q.score >= 4 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {q.score}/10
                    </span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{q.question}</h4>
                      <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-1 rounded">{q.category}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Your Answer</span>
                      <p className="text-gray-800">{q.userAnswer}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider block mb-1">Ideal Answer</span>
                      <p className="text-green-900">{q.idealAnswer}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Feedback</span>
                      <p className="text-gray-700 font-medium">{q.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
