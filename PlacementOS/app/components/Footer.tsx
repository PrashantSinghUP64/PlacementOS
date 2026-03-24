import { Link } from "react-router";
import { Linkedin, Github, Twitter, Youtube, Mail, Link as LinkIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white pt-16 pb-8 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* COLUMN 1 — About */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span>Placement<span className="text-indigo-400">OS</span></span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
            AI-powered career platform for modern job seekers
          </p>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
            Helping students crack placements with AI
          </p>
        </div>

        {/* COLUMN 2 — Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-5 relative inline-block">
            Quick Links
            <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-indigo-500 rounded-full"></span>
          </h3>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
            {[
              { path: "/dashboard", label: "Dashboard" },
              { path: "/upload", label: "Analyze Resume" },
              { path: "/interview", label: "Interview Prep" },
              { path: "/roast", label: "Resume Roast" },
              { path: "/mock-interview", label: "Mock Interview" },
              { path: "/skill-gap", label: "Skill Gap" },
              { path: "/job-tracker", label: "Job Tracker" },
              { path: "/campus", label: "Campus Data" },
            ].map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className="text-gray-400 hover:text-indigo-400 hover:translate-x-1 transition-transform inline-block text-sm font-medium"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3 — Connect with Builder */}
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Built by</h3>
          <p className="text-xl font-black text-white">Prashant Kumar Singh</p>
          <p className="text-sm font-medium text-emerald-400 mb-5">B.Tech CSE (AI/ML)</p>
          
          <div className="space-y-3">
            <a 
              href="https://www.linkedin.com/in/prashant-kumar-singh-51b225230/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <Linkedin className="w-5 h-5 text-[#0077B5] group-hover:bg-[#0077B5] group-hover:text-white p-0.5 rounded transition-colors" />
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            
            <a 
              href="https://github.com/PrashantSinghUP64" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <Github className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">GitHub</span>
            </a>
            
            <a 
              href="https://x.com/prashant_UP_64" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <Twitter className="w-5 h-5 text-[#1DA1F2] group-hover:bg-[#1DA1F2] group-hover:text-white p-0.5 rounded transition-colors" />
              <span className="text-sm font-medium">Twitter / X</span>
            </a>
            
            <a 
              href="https://www.youtube.com/@technicalknowledgehindi1949" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <Youtube className="w-5 h-5 text-[#FF0000] group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium">YouTube</span>
            </a>
            
            <a 
              href="mailto:ps7027804@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <Mail className="w-5 h-5 text-[#EA4335] group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium">Gmail</span>
            </a>
            
            <a 
              href="https://linktr.ee/Prashantsingh64" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all transform hover:translate-x-1"
            >
              <LinkIcon className="w-5 h-5 text-[#43E55E] group-hover:text-green-400 transition-colors" />
              <span className="text-sm font-medium">All Links</span>
            </a>
          </div>
        </div>

      </div>

      {/* ROW 2 — Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium">
        <p className="text-gray-500 text-center md:text-left">
          &copy; 2026 PlacementOS. All rights reserved.
        </p>
        <p className="text-gray-400 text-center">
          Made for students
        </p>
        <p className="text-gray-500 text-center md:text-right">
          Built by <span className="text-gray-300 font-bold">Prashant Kumar Singh</span>
        </p>
      </div>
    </footer>
  );
}
