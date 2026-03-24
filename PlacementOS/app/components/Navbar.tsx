import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAppAuthStore } from "~/lib/app-auth";

export default function Navbar() {
  const user = useAppAuthStore((s) => s.user);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const clearSession = useAppAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Close tools dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // Main visible nav links LEFT of dropdown
  const navLinksLeft = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/upload", label: "Analyze" },
    { href: "/interview", label: "Interview Prep" },
  ];

  // Main visible nav links RIGHT of dropdown
  const navLinksRight = [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/dsa", label: "DSA Tracker" },
    { href: "/referral", label: "Referrals" },
    { href: "/history", label: "History" },
    { href: "/profile", label: "Profile" },
  ];

  // Tools dropdown items (Old + New features)
  const toolsLinks = [
    { href: "/cover-letter", label: "✉️ Cover Letter" },
    { href: "/resume-builder", label: "📝 Resume Builder" },
    { href: "/salary", label: "💰 Salary Predictor" },
    { href: "/linkedin", label: "🔗 LinkedIn Optimizer" },
    { href: "/roast", label: "🔥 Resume Roast" },
    { href: "/roadmap", label: "🗺️ AI Roadmap" },
    { href: "/company-research", label: "🏢 Company Intel" },
    { href: "/templates", label: "📄 Resume Templates" },
    { href: "/linkedin-builder", label: "💼 LinkedIn Builder" },
    { href: "/github-optimizer", label: "🐙 GitHub Optimizer" },
    { href: "/free-resources", label: "📚 Free Resources" },
    { href: "/certifications", label: "🏅 Certifications" },
    { href: "/freelancing", label: "💸 Freelancing Guide" },
    { href: "/hackathons", label: "🏆 Hackathons" },
    { href: "/career-guide", label: "🎓 Career Guide" },
    { href: "/wellness", label: "💚 Wellness" },
    { href: "/job-tracker", label: "📋 Job Tracker" },
    { href: "/jobs", label: "🎯 Job Aggregator" },
    { href: "/campus", label: "🏫 Campus Data" },
  ];

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-xl font-bold flex-shrink-0">
        <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="text-gradient">PlacementOS</span>
      </Link>

      {/* Desktop Nav */}
      {isAuthenticated && (
        <div className="hidden lg:flex items-center gap-1 flex-1 mx-4 lg:justify-center">
          {navLinksLeft.map((link) => (
            <Link key={link.href} to={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${isActive(link.href) ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              {link.label}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div className="relative flex-shrink-0" ref={toolsRef}>
            <button onClick={() => setToolsOpen(!toolsOpen)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${toolsLinks.some((t) => isActive(t.href)) ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              Tools
              <svg className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {toolsLinks.map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setToolsOpen(false)}
                    className={`block px-4 py-2.5 text-sm ${isActive(link.href) ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Remaining nav links */}
          {navLinksRight.map((link) => (
            <Link key={link.href} to={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${isActive(link.href) ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Dark Mode Toggle */}
        <button onClick={toggleDark} title={dark ? "Switch to Light" : "Switch to Dark"}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600 flex-shrink-0">
          {dark ? (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200">
              <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[90px] truncate">{user.name}</span>
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg animate-slide-down z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile Settings</Link>
                <Link to="/history" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">History</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl border-t border-gray-100">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login"
            className="text-sm py-2 px-4 rounded-full text-white font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(to bottom, #8e98ff, #606beb)" }}>
            Sign In
          </Link>
        )}

        {/* Mobile menu toggle */}
        {isAuthenticated && (
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen((v) => !v)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && isAuthenticated && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden animate-slide-down z-50">
          <div className="max-h-[75vh] overflow-y-auto pb-4">
            <div className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-wider mt-2">Navigation</div>
            {[...navLinksLeft, ...navLinksRight].map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}
                className={`block px-6 py-3 text-sm font-medium ${isActive(link.href) ? "text-violet-700 bg-violet-50" : "text-gray-700 hover:bg-gray-50"}`}>
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2 text-xs font-black text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">Tools</div>
            {toolsLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setMenuOpen(false)}
                className={`block px-6 py-2.5 text-sm ${isActive(link.href) ? "text-violet-700 bg-violet-50 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-3 border-t border-gray-100">
              <button onClick={toggleDark} className="flex items-center gap-2 text-sm text-gray-600 font-medium w-full">
                {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
            <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100">Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  );
}
