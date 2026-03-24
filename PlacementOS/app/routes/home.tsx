import { Link } from "react-router";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { UploadCloud, Briefcase, Trophy } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PlacementOS — Crack Every Drive" },
    { name: "description", content: "PlacementOS — AI-powered placement preparation platform for college students. Resume analyzer, mock interviews, DSA tracker & 15+ tools to crack campus placements." },
  ];
}

const features = [
  { icon: "📊", title: "ATS Score Analysis", desc: "See exactly how your resume scores against ATS systems used by top companies." },
  { icon: "🎯", title: "Keyword Matching", desc: "Identify missing keywords from the job description and know what to add." },
  { icon: "💡", title: "AI Suggestions", desc: "Get specific, actionable suggestions to improve every section of your resume." },
  { icon: "📈", title: "Progress Tracking", desc: "Track your improvement over time with charts and historical analysis data." },
  { icon: "💼", title: "Job Matching", desc: "Find remote jobs that match your skills, sourced from Remotive in real-time." },
  { icon: "📄", title: "PDF Reports", desc: "Download a professional PDF report of your complete resume analysis." },
];

const steps = [
  { step: "01", icon: <UploadCloud className="w-7 h-7" />, title: "Build Your Profile", desc: "Upload your resume or enter your details. Our AI instantly analyzes your strengths & weaknesses." },
  { step: "02", icon: <Briefcase className="w-7 h-7" />, title: "Match & Apply", desc: "Discover and apply to curated on-campus and off-campus drives that perfectly fit your profile." },
  { step: "03", icon: <Trophy className="w-7 h-7" />, title: "Crack the Interview", desc: "Prepare with company-specific insights, ATS-optimized resumes, and tailored mock interviews." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)" }}>
        {/* Glow orbs */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />

        <style>{`
          @keyframes slideFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-fade { opacity: 0; animation: slideFadeIn 0.8s ease-out forwards; }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .gradient-border-chip {
            background: linear-gradient(#1a1040, #1a1040) padding-box,
                        linear-gradient(to right, #a78bfa, #60a5fa) border-box;
            border: 1px solid transparent;
          }
        `}</style>
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gradient-border-chip text-sm text-violet-200 mb-8 animate-slide-fade">
            🎓 India's #1 Placement Companion
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight text-white animate-slide-fade delay-100">
            Your Placement.<br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #3b82f6)" }}>
              Powered by AI.
            </span>
          </h1>

          <p className="text-2xl text-gray-400 max-w-2xl mx-auto mb-4 font-medium animate-slide-fade delay-200">
            From Campus to Career
          </p>

          <p className="text-xl max-w-2xl mx-auto mb-10 font-bold animate-slide-fade delay-300">
            <span className="text-gray-300">Crack </span><span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Every Drive</span><span className="text-gray-300">. Own </span><span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">Every Offer</span><span className="text-gray-300">.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-fade delay-300">
            <Link to="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-violet-500/30"
              style={{ background: "linear-gradient(to bottom, #8e98ff, #606beb)" }}>
              🚀 Analyze My Resume
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all duration-200 text-lg font-semibold backdrop-blur">
              Sign Up Free
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-20 border-t border-white/10 pt-12">
            {[["500+", "Resumes Analyzed"], ["85%", "Avg. Improvement"], ["100%", "Free & Private"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black text-white">{num}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Everything you need to{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #60a5fa)" }}>
                get hired
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Powerful AI tools to make your resume stand out.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title}
                className="bg-gray-800/60 border border-gray-700/60 rounded-2xl p-6 hover:border-violet-500/60 hover:bg-gray-800 transition-all duration-200 group cursor-default">
                <div className="w-12 h-12 bg-violet-900/50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 relative" style={{ background: "linear-gradient(180deg, #111827 0%, #0f0c29 100%)", overflow: "hidden" }}>
        {/* Decorative background blur */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20 md:mb-28">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How PlacementOS{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #60a5fa)" }}>
                works
              </span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">Three simple steps to launch your career.</p>
          </div>
          
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 mt-10">
              {steps.map((s, i) => (
                <div key={s.step} className="text-center group relative w-full flex justify-center">
                  {/* Glassmorphism Card Wrapper */}
                  <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-[2rem] p-8 pt-16 relative transition-all duration-300 group-hover:-translate-y-2 group-hover:border-violet-500/50 group-hover:bg-gray-800/60 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col items-center w-full max-w-sm">
                    
                    {/* Icon floating above */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-all duration-300 relative"
                           style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)" }}>
                        <div className="absolute inset-0 rounded-2xl border border-white/20"></div>
                        <div className="text-violet-200 group-hover:text-white transition-colors duration-300 flex items-center justify-center">{s.icon}</div>
                      </div>
                    </div>

                    <div className="text-violet-400/50 font-black text-6xl absolute top-6 right-6 opacity-10 pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-400/30">
                      {s.step}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 mt-2">{s.title}</h3>
                    <p className="text-gray-400 text-base leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to get your dream job?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of job seekers using AI to improve their resumes.</p>
          <Link to="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-violet-500/30"
            style={{ background: "linear-gradient(to bottom, #8e98ff, #606beb)" }}>
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-sm text-gray-500 bg-gray-950">
        <p>PlacementOS — Powered by Puter.js AI &middot; Built with React + Node.js</p>
      </footer>
    </div>
  );
}
