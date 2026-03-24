import { useState } from "react";
import { Link } from "react-router";
import Navbar from "~/components/Navbar";

export function meta() {
  return [
    { title: "BTech CSE Career Guide 🎓 — PlacementOS" },
    { name: "description", content: "Complete career guide for Tier 3 BTech CSE students in India — job, GATE, PSU, YouTube, MBA, MS abroad" },
  ];
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const CAREER_PATHS = [
  {
    id: "swe",
    icon: "💻",
    title: "Software Engineering (Private)",
    tagline: "Most popular path for CSE students",
    stats: ["4-50 LPA range", "High demand in 2025", "Freshers: 4-8 LPA avg"],
    color: "blue",
    content: {
      roadmap: ["Master one language (Java/Python/JS)", "Learn DSA — Striver's A2Z sheet", "Build 2-3 GitHub projects", "Create strong resume", "Apply on Naukri, LinkedIn, company portals"],
      timeline: "3-6 months focused prep → first job",
      companies: {
        "Service (Easy to get)": "TCS, Infosys, Wipro, Cognizant, HCL",
        "Mid-tier (Good salary)": "Capgemini, L&T, Mphasis, Hexaware",
        "Product (Dream)": "Zoho, Freshworks, PhonePe, Razorpay, Postman",
      },
      youtubeChannels: ["Striver (DSA)", "Apna College (Full Stack)", "Code With Harry", "Kunal Kushwaha", "Raj Vikramaditya"],
      reality: "Tier 3 se possible hai — but extra effort needed. Off-campus aur referrals ka use karo.",
    },
  },
  {
    id: "gate",
    icon: "🎓",
    title: "GATE + PSU / Higher Studies",
    tagline: "Government jobs with great benefits",
    stats: ["PSU: 8-20 LPA", "IIT MTech possible", "2 year serious prep"],
    color: "green",
    content: {
      roadmap: ["Start GATE prep after 3rd year", "Focus on 5-6 core subjects", "Practice PYQs (last 10 years)", "Give GATE in final year", "Apply to PSUs based on score"],
      timeline: "1-2 years consistent preparation",
      companies: {
        "Top PSUs (GATE)": "BHEL, NTPC, ONGC, IOCL, PGCIL (8-15 LPA)",
        "Good PSUs": "GAIL, BEL, BSNL, AAI, BPCL (6-12 LPA)",
        "IIT/NIT MTech": "GATE score 600+ needed for good colleges",
      },
      youtubeChannels: ["Gate Smashers (Theory)", "Knowledge Gate", "Love Babbar (CS subjects)", "Unacademy GATE", "NPTEL lectures"],
      reality: "GATE worth it if financially stable for 1-2 years. PSU jo result aate hain woh bahut achhe hote hain — job security + good salary.",
    },
  },
  {
    id: "govt",
    icon: "🏛️",
    title: "Govt Jobs (Non-PSU)",
    tagline: "Job security + stable income",
    stats: ["6-12 LPA package", "1-3 year prep", "Pension + benefits"],
    color: "amber",
    content: {
      roadmap: ["Identify target exam (SSC CGL / State IT / NIC)", "Study GK + Quantitative Aptitude + English", "Practice mock tests daily", "Appear in multiple exams parallelly", "Don't neglect technical prep"],
      timeline: "1-2 years serious preparation",
      companies: {
        "Central Govt": "SSC CGL, DRDO, ISRO, NIC, RRB JE",
        "State Govt": "State PSCs, NIC State units, PWD",
        "Defence IT": "DRDO Scientist, Indian Navy IT (52K salary)",
      },
      youtubeChannels: ["Unacademy SSC", "Adda247", "Grade Up", "Khan Sir Patna", "Wifistudy"],
      reality: "UPSC bahut mushkil hai — realistic goal set karo. SSC CGL + State jobs are more achievable for CS grads.",
    },
  },
  {
    id: "aiml",
    icon: "🤖",
    title: "Data Science / AI-ML",
    tagline: "Hottest field in 2025",
    stats: ["8-40 LPA", "Python mandatory", "6-12 months to ready"],
    color: "violet",
    content: {
      roadmap: ["Python mastery (pandas, numpy)", "Statistics & Probability", "Machine Learning (scikit-learn)", "Deep Learning (TensorFlow/PyTorch)", "Portfolio: 3 end-to-end projects on Kaggle/GitHub"],
      timeline: "6-12 months serious study",
      companies: {
        "Service AI teams": "TCS AI, Infosys AI labs (6-10 LPA)",
        "Product AI": "Razorpay, Meesho, Flipkart AI (15-30 LPA)",
        "Startups": "Many AI startups hiring freshers (10-20 LPA)",
      },
      youtubeChannels: ["Krish Naik", "CampusX (Hindi)", "StatQuest", "Sentdex", "Ken Jee (career advice)"],
      reality: "Highly competitive. Kaggle competitions + strong GitHub = better than any certification.",
    },
  },
  {
    id: "youtube",
    icon: "📺",
    title: "YouTube / Content Creation",
    tagline: "Build passive income alongside job",
    stats: ["Part-time option", "18-24 months for income", "Low startup cost"],
    color: "red",
    content: {
      roadmap: ["Choose niche (DSA, projects, Hindi tech)", "Start with just phone + free editing app", "Post 2 videos per week consistently", "Optimize SEO — thumbnails matter 60%", "Monetize at 1000 subs + 4000 hours"],
      timeline: "6-12 months for 1K subs, 18-24 months for good income",
      companies: {
        "Best niches (less competition)": "Hindi DSA tutorials, Project walkthroughs",
        "Good niches": "Placement prep, Interview experience, College vlogs",
        "Hard niches": "English full tutorials (very crowded)",
      },
      youtubeChannels: ["Striver", "Apna College", "Code With Harry", "Kunal Kushwaha", "Raj Vikramaditya", "Akshay Saini (JS)", "Neetcode", "Abdul Bari"],
      reality: "Job + YouTube = perfect combo. Bahut log dono karte hain. Phone se start karo — equipment baad mein.",
    },
  },
  {
    id: "mba",
    icon: "📊",
    title: "MBA / Management",
    tagline: "Tech + Business = high value",
    stats: ["IIM: 20-50 LPA", "2 years duration", "Best after 3 years exp"],
    color: "emerald",
    content: {
      roadmap: ["Work 2-3 years first", "Prepare for CAT (12-18 months)", "Target IIM A/B/C or good Tier 2 MBA", "Leverage tech background in interviews", "Focus on PM / consulting roles post MBA"],
      timeline: "3-4 years plan (2-3 work + 2 MBA)",
      companies: {
        "Post MBA roles": "Product Manager, Strategy Consultant, VC analyst",
        "IIM: 20-50 LPA CTC": "McKinsey, BCG, Google PM, Amazon PM",
        "Tier 2 MBA: 8-15 LPA": "Still good if right specialization",
      },
      youtubeChannels: ["2IIM CAT", "Unacademy CAT", "Career Anna", "IMS Learning Resources"],
      reality: "Freshers ko MBA mat karo — work experience MBA ki value 3x kar deta hai. CAT is tough but manageable.",
    },
  },
  {
    id: "startup",
    icon: "🚀",
    title: "Startup / Entrepreneurship",
    tagline: "High risk, high reward path",
    stats: ["High risk", "Best after 2-3 yrs exp", "Equity can be huge"],
    color: "orange",
    content: {
      roadmap: ["Join a startup first to learn", "Identify a problem you understand well", "Build MVP with minimal cost", "Validate with 10 real users", "Seek funding only after validation"],
      timeline: "2-3 years minimum runway needed",
      companies: {
        "Join a startup": "Look for Series A/B startups — good learning + equity",
        "Incubators": "IIT/IIM incubators, Startup India, Y Combinator India",
        "Funding sources": "Friends/family → Angels → Seed → VC",
      },
      youtubeChannels: ["Ankur Warikoo", "Nikhil Kamath clips", "Y Combinator lectures", "StartupTalks Hindi"],
      reality: "College mein startup? Possible but rare success. Better: job → learn → startup. Equity math samjho pehle.",
    },
  },
  {
    id: "ms",
    icon: "✈️",
    title: "Higher Studies Abroad (MS)",
    tagline: "US/Canada/Germany route",
    stats: ["50-150 LPA after MS", "GRE needed for USA", "3 year planning"],
    color: "cyan",
    content: {
      roadmap: ["Maintain CGPA 7.5+ (critical!)", "GRE 315+ for good US universities", "IELTS 7+ or TOEFL 100+", "Research project / internship essential", "Apply to 10-12 universities (safety to dream)"],
      timeline: "3 years planning (2nd year onwards)",
      companies: {
        "Target for avg profile": "ASU, UTD, Northeastern, Stevens, USC",
        "Dream universities": "CMU, Stanford, UT Austin, UIUC (tough for tier 3)",
        "Funding": "TA/RA positions — apply aggressively",
      },
      youtubeChannels: ["Khariya Jatt", "StudyAbroad IND", "Yash Mittra", "US Abroad guidance channels"],
      reality: "Tier 3 se US MS possible hai — CGPA + GRE + SOP quality bahut matter karta hai. Cost: 40-60L but ROI is good.",
    },
  },
];

const DILEMMAS = [
  {
    q: "GATE dena chahiye ya seedha job?",
    tag: "Most asked",
    tagColor: "bg-purple-100 text-purple-700",
    answers: [
      { title: "GATE lo agar:", points: ["PSU mein interest hai (BHEL, NTPC, ONGC)", "Research/IIT MTech chahiye", "Financially 1-2 years wait kar sakte ho", "Core CS subjects strong hain"] },
      { title: "Seedha job lo agar:", points: ["Financial pressure hai ghar par", "Already 2+ backlogs hain", "Software engineering passionate hona", "1-2 years job karke decision le sakte ho"] },
    ],
    recommendation: "Agar confused ho — pehle placement lo, phir GATE give karo while working. Both possible hai!",
  },
  {
    q: "Tier 3 se FAANG possible hai kya?",
    tag: "Reality check",
    tagColor: "bg-blue-100 text-blue-700",
    answers: [
      { title: "Haan, possible hai — but:", points: ["Extra 1-2 years preparation needed", "300-500 LeetCode problems solve karne honge", "System design strong karna hoga", "Off-campus + referral route se aana hoga"] },
      { title: "Success ke examples:", points: ["Many IIT/NIT rejects in FAANG from tier 3", "Striver himself tier 3 se hai", "Skills matter more than college", "LinkedIn pe search karo — bhaut milenge"] },
    ],
    recommendation: "Start with Zoho/Freshworks/mid-tier product companies. Wahan se experience lo, phir FAANG try karo. Tier 3 se direct MAANG rare but possible.",
  },
  {
    q: "Backlog hai to placement hoga?",
    tag: "Honest answer",
    tagColor: "bg-amber-100 text-amber-700",
    answers: [
      { title: "Service companies (TCS, Wipro):", points: ["Maximum 1-2 active backlogs allow karte hain", "Cleared backlogs usually fine hain", "AMCAT/eLitmus se apply karo", "Off-campus mein koi nahi poochta sometimes"] },
      { title: "Product companies:", points: ["Most have strict no-backlog policy", "Skills se compensate karo (strong GitHub)", "Startups generally flexible hain", "Freelancing bhi ek option hai"] },
    ],
    recommendation: "Priority: Backlogs clear karo ASAP. Ek ek karke clear. Iske saath skills build karte raho.",
  },
  {
    q: "Low CGPA (below 6.5) to kya karein?",
    tag: "Don't panic",
    tagColor: "bg-green-100 text-green-700",
    answers: [
      { title: "Companies without CGPA cutoff:", points: ["Startups (most don't care)", "AMCAT/eLitmus based companies", "Referral based applications", "Freelancing & remote work"] },
      { title: "Compensate karo isse:", points: ["Strong GitHub (5+ projects)", "Certifications (AWS, Google, Microsoft)", "Open source contributions", "Strong DSA skills (LeetCode problems)"] },
    ],
    recommendation: "CGPA sirf door kholta hai — andar skills jaate hain. 2 strong projects + good communication = low CGPA cover ho jaata hai.",
  },
];

const RESOURCES = [
  {
    category: "DSA / Coding", icon: "💻", color: "blue",
    items: [
      { name: "Striver's A2Z Sheet", link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", tag: "Most recommended" },
      { name: "Neetcode 150", link: "https://neetcode.io/practice", tag: "For interviews" },
      { name: "Love Babbar DSA Sheet", link: "https://450dsa.com/", tag: "450 problems" },
      { name: "GeeksForGeeks DSA", link: "https://www.geeksforgeeks.org/data-structures/", tag: "Theory + practice" },
    ],
  },
  {
    category: "Full Stack Dev", icon: "🌐", color: "emerald",
    items: [
      { name: "Apna College MERN", link: "https://www.youtube.com/@ApnaCollegeOfficial", tag: "Hindi, free" },
      { name: "Chai aur Code", link: "https://www.youtube.com/@chaiaurcode", tag: "Modern stack" },
      { name: "Traversy Media", link: "https://www.youtube.com/@TraversyMedia", tag: "English, great" },
      { name: "The Odin Project", link: "https://www.theodinproject.com/", tag: "Free curriculum" },
    ],
  },
  {
    category: "AI / ML", icon: "🤖", color: "violet",
    items: [
      { name: "CampusX (Hindi)", link: "https://www.youtube.com/@campusx-official", tag: "Best Hindi ML" },
      { name: "Krish Naik", link: "https://www.youtube.com/@krishnaik06", tag: "Interview + projects" },
      { name: "Fast.ai", link: "https://www.fast.ai/", tag: "Practical DL" },
      { name: "Andrew Ng Coursera", link: "https://www.coursera.org/learn/machine-learning", tag: "Foundation" },
    ],
  },
  {
    category: "System Design", icon: "🏗️", color: "orange",
    items: [
      { name: "Gaurav Sen", link: "https://www.youtube.com/@gkcs", tag: "Best channel" },
      { name: "ByteByteGo", link: "https://www.youtube.com/@ByteByteGo", tag: "Alex Xu" },
      { name: "Tech Dummies", link: "https://www.youtube.com/@TechDummiesNarendraL", tag: "In depth" },
      { name: "System Design Primer", link: "https://github.com/donnemartin/system-design-primer", tag: "GitHub resource" },
    ],
  },
  {
    category: "Interview Prep", icon: "🎯", color: "rose",
    items: [
      { name: "InterviewBit", link: "https://www.interviewbit.com/", tag: "Free + structured" },
      { name: "Pramp", link: "https://www.pramp.com/", tag: "Peer mock interviews" },
      { name: "LeetCode", link: "https://leetcode.com/", tag: "Industry standard" },
      { name: "GeeksForGeeks Interview", link: "https://www.geeksforgeeks.org/company-interview-corner/", tag: "Company-wise" },
    ],
  },
  {
    category: "GATE Prep", icon: "🎓", color: "teal",
    items: [
      { name: "Gate Smashers", link: "https://www.youtube.com/@GateSmashers", tag: "Best for GATE CS" },
      { name: "Knowledge Gate", link: "https://www.youtube.com/@KnowledgeGATE", tag: "Conceptual" },
      { name: "Made Easy Books", link: "https://www.made-easy.in/", tag: "Standard books" },
      { name: "GATE PYQs", link: "https://gateoverflow.in/", tag: "All PYQs free" },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200 hover:border-blue-400", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  green: { bg: "bg-green-50", border: "border-green-200 hover:border-green-400", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200 hover:border-amber-400", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200 hover:border-violet-400", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  red: { bg: "bg-red-50", border: "border-red-200 hover:border-red-400", text: "text-red-700", badge: "bg-red-100 text-red-700" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200 hover:border-emerald-400", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200 hover:border-orange-400", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200 hover:border-cyan-400", text: "text-cyan-700", badge: "bg-cyan-100 text-cyan-700" },
  teal: { bg: "bg-teal-50", border: "border-teal-200 hover:border-teal-400", text: "text-teal-700", badge: "bg-teal-100 text-teal-700" },
  rose: { bg: "bg-rose-50", border: "border-rose-200 hover:border-rose-400", text: "text-rose-700", badge: "bg-rose-100 text-rose-700" },
};

// ─── DECISION WIZARD ─────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  {
    q: "What matters most to you?",
    options: [
      { label: "Job security above all 🛡️", path: "govt" },
      { label: "High salary as fast as possible 💰", path: "product" },
      { label: "Work-life balance 🏖️", path: "service" },
      { label: "Be my own boss 🚀", path: "startup" },
      { label: "Research / academics 🔬", path: "gate" },
    ],
  },
  {
    q: "Your current CGPA?",
    options: [
      { label: "8.0 and above 🌟", path: "high" },
      { label: "7.0 to 7.9 ✅", path: "med" },
      { label: "6.0 to 6.9 ⚠️", path: "low" },
      { label: "Below 6.0 😬", path: "vlow" },
    ],
  },
  {
    q: "Any financial pressure at home?",
    options: [
      { label: "Yes, need to earn ASAP 💸", path: "pressure" },
      { label: "No, can prepare 1-2 years 🧘", path: "nopressure" },
    ],
  },
];

const WIZARD_RESULTS: Record<string, { path: string; college: string; action: string[] }> = {
  "govt+high+nopressure": { path: "GATE + PSU / IIT MTech", college: "Perfect for you!", action: ["Start GATE prep now (Gate Smashers)", "Target GATE score 700+ for top PSU", "Keep backup: also apply for private jobs"] },
  "govt+high+pressure": { path: "Government jobs (SSC/NIC) + Private", college: "Balanced approach", action: ["Apply for campus placements first", "Start SSC CGL / NIC prep alongside", "Service job mein khush rahoge initially"] },
  "govt+med+nopressure": { path: "GATE (realistic target)", college: "Achievable with effort", action: ["Target GATE score 500-600 for mid-tier PSU", "Simultaneously appear in service company placements", "Give yourself 12-18 months"] },
  "govt+med+pressure": { path: "Service company + Govt part time", college: "Smart path", action: ["Secure service job first (TCS/Wipro)", "While working, prepare for GATE/SSC", "Many people crack exams while employed"] },
  "govt+low+nopressure": { path: "GATE (will need extra work)", college: "Possible, needs discipline", action: ["First clear all backlogs — critical!", "Start with SSC CGL (easier than GATE)", "1 year focused prep minimum"] },
  "govt+low+pressure": { path: "Service company job", college: "Most realistic", action: ["Focus on placement — TCS/Wipro don't care much about CGPA", "Clear backlogs fast", "AMCAT/eLitmus score = entry to many companies"] },
  "govt+vlow+nopressure": { path: "Skills first → then decide", college: "Build foundation", action: ["Don't apply anywhere yet", "First 3 months: Python / JavaScript basics", "Clear backlogs + build 1 project", "Then reassess options"] },
  "govt+vlow+pressure": { path: "Service company immediately", college: "Practical approach", action: ["AMCAT/eLitmus dedo — open companies", "Apply off-campus aggressively", "Freelancing as side income now"] },
};

function getWizardResult(choices: string[]) {
  const key = choices.join("+");
  return WIZARD_RESULTS[key] || {
    path: "Software Engineering (Private)",
    college: "Good all-round path!",
    action: [
      "Build DSA skills (Striver A2Z sheet)",
      "Make 2-3 GitHub projects",
      "Apply on LinkedIn + Naukri off-campus",
      "Chat with our Career Guide AI for personalized advice",
    ],
  };
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function CareerGuide() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedDilemma, setExpandedDilemma] = useState<number | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardChoices, setWizardChoices] = useState<string[]>([]);
  const [wizardDone, setWizardDone] = useState(false);

  const handleWizardChoice = (path: string) => {
    const newChoices = [...wizardChoices, path];
    if (wizardStep + 1 >= WIZARD_STEPS.length) {
      setWizardChoices(newChoices);
      setWizardDone(true);
    } else {
      setWizardChoices(newChoices);
      setWizardStep(s => s + 1);
    }
  };

  const resetWizard = () => {
    setWizardStep(0);
    setWizardChoices([]);
    setWizardDone(false);
  };

  const wizardResult = wizardDone ? getWizardResult(wizardChoices) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <Navbar />

      {/* ─── HERO ─── */}
      <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4C1D95] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #818cf8 0%, transparent 50%), radial-gradient(circle at 75% 20%, #c084fc 0%, transparent 50%)" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-bold text-indigo-200 mb-6">
            🎓 Career Guidance Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">BTech CSE Career Guide</h1>
          <p className="text-xl text-indigo-200 font-medium max-w-2xl mx-auto mb-8">
            Tier 3 college se bhi <span className="text-white font-black">top career possible hai</span> — sahi plan ke saath
          </p>
          <div className="flex justify-center gap-6 flex-wrap text-sm font-bold text-indigo-200">
            <span>✅ 10,000+ students helped</span>
            <span>✅ 50+ career paths covered</span>
            <span>✅ 100% free guidance</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20 space-y-12">

        {/* ─── CAREER PATH EXPLORER ─── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Career Path Explorer 🗺️</h2>
            <p className="text-gray-500 font-medium">Click any card to explore that path in detail</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CAREER_PATHS.map((cp) => {
              const c = COLOR_MAP[cp.color];
              const isExp = expandedCard === cp.id;
              return (
                <div key={cp.id} className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${c.border} ${isExp ? "md:col-span-2 lg:col-span-3 xl:col-span-4" : ""}`}>
                  <button
                    onClick={() => setExpandedCard(isExp ? null : cp.id)}
                    className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{cp.icon}</span>
                      <div>
                        <h3 className="font-black text-gray-900 text-base leading-tight">{cp.title}</h3>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{cp.tagline}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {cp.stats.map(s => (
                            <span key={s} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`text-lg transition-transform mt-1 flex-shrink-0 font-bold ${c.text} ${isExp ? "rotate-180" : ""}`}>▾</span>
                  </button>

                  {isExp && (
                    <div className={`p-5 border-t border-gray-100 ${c.bg}`}>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <h4 className={`font-black text-sm uppercase tracking-widest mb-3 ${c.text}`}>📍 Roadmap</h4>
                          <ol className="space-y-2">
                            {cp.content.roadmap.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${c.badge} mt-0.5`}>{i + 1}</span>
                                {r}
                              </li>
                            ))}
                          </ol>
                          <div className="mt-3 bg-white rounded-xl p-3 border border-gray-200">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Timeline</p>
                            <p className="text-sm font-bold text-gray-800">{cp.content.timeline}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-black text-sm uppercase tracking-widest mb-3 ${c.text}`}>🏢 Companies / Paths</h4>
                          <div className="space-y-3">
                            {Object.entries(cp.content.companies).map(([tier, names]) => (
                              <div key={tier} className="bg-white rounded-xl p-3 border border-gray-200">
                                <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">{tier}</p>
                                <p className="text-sm font-medium text-gray-800">{names}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-black text-sm uppercase tracking-widest mb-3 ${c.text}`}>📺 YouTube Channels</h4>
                          <div className="space-y-2">
                            {cp.content.youtubeChannels.map((yt, i) => (
                              <a
                                key={i}
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(yt)}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-red-600 transition-colors bg-white p-2.5 rounded-xl border border-gray-200 hover:border-red-200"
                              >
                                <span className="text-red-500">▶</span> {yt}
                              </a>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-black text-sm uppercase tracking-widest mb-3 ${c.text}`}>💡 Reality Check</h4>
                          <div className={`p-4 rounded-xl border-2 ${c.border} bg-white`}>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">{cp.content.reality}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── COMMON DILEMMAS ─── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Common Dilemmas 🤔</h2>
            <p className="text-gray-500 font-medium">Honest answers to the questions every tier 3 student has</p>
          </div>
          <div className="space-y-4">
            {DILEMMAS.map((d, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedDilemma(expandedDilemma === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-300">Q{i + 1}</span>
                    <div>
                      <h3 className="font-black text-gray-900 text-base">{d.q}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${d.tagColor}`}>{d.tag}</span>
                    </div>
                  </div>
                  <span className={`text-gray-400 font-bold text-xl flex-shrink-0 transition-transform ${expandedDilemma === i ? "rotate-180" : ""}`}>▾</span>
                </button>
                {expandedDilemma === i && (
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {d.answers.map((a, j) => (
                        <div key={j} className="bg-white rounded-xl p-4 border border-gray-200">
                          <h4 className="font-black text-gray-800 mb-2 text-sm">{a.title}</h4>
                          <ul className="space-y-1.5">
                            {a.points.map((p, k) => (
                              <li key={k} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                                <span className="text-green-500 font-black mt-0.5">✓</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-xs font-black text-purple-700 uppercase tracking-wider mb-1">Recommendation</p>
                        <p className="text-sm font-bold text-gray-800">{d.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── RESOURCE LIBRARY ─── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Free Resource Library 📚</h2>
            <p className="text-gray-500 font-medium">100% free, handpicked resources for tier 3 students</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESOURCES.map((r) => {
              const c = COLOR_MAP[r.color];
              return (
                <div key={r.category} className={`bg-white rounded-2xl border ${c.border} overflow-hidden`}>
                  <div className={`p-4 ${c.bg} border-b border-gray-100`}>
                    <h3 className={`font-black text-base flex items-center gap-2 ${c.text}`}><span>{r.icon}</span>{r.category}</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {r.items.map(item => (
                      <a
                        key={item.name}
                        href={item.link}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                      >
                        <span className="font-bold text-sm text-gray-800 group-hover:text-gray-900">{item.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.badge} flex-shrink-0 ml-2`}>{item.tag}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── DECISION WIZARD ─── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Help Me Choose My Path 🧭</h2>
            <p className="text-gray-500 font-medium">3 quick questions → personalized career recommendation</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
            {!wizardDone ? (
              <div className="p-8">
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                  {WIZARD_STEPS.map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= wizardStep ? "bg-purple-500" : "bg-gray-100"}`} />
                  ))}
                </div>
                <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Step {wizardStep + 1} of {WIZARD_STEPS.length}</p>
                <h3 className="text-xl font-black text-gray-900 mb-6">{WIZARD_STEPS[wizardStep].q}</h3>
                <div className="space-y-3">
                  {WIZARD_STEPS[wizardStep].options.map(opt => (
                    <button
                      key={opt.path}
                      onClick={() => handleWizardChoice(opt.path)}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 font-bold text-gray-700 transition-all text-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Your Recommended Path</p>
                <h3 className="text-2xl font-black text-gray-900 mb-1">{wizardResult!.path}</h3>
                <p className="text-purple-600 font-bold mb-6">{wizardResult!.college}</p>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 text-left mb-6">
                  <p className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">Your 3-Month Action Plan</p>
                  <ol className="space-y-2">
                    {wizardResult!.action.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-bold text-gray-800">
                        <span className="w-5 h-5 bg-purple-100 rounded-full text-purple-700 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {a}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={resetWizard} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">
                    Try Again
                  </button>
                  <Link to="/roadmap" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors">
                    Generate Roadmap 🗺️
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-3xl font-black mb-3">Still Confused? Chat with AI! 🎓</h2>
          <p className="text-purple-200 font-medium mb-6 max-w-2xl mx-auto">
            Hamara Career Guide AI 24/7 available hai. Koi bhi sawaal poochho — Hindi ya English mein — aur personalized advice pao.
          </p>
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('[aria-label="Open Career Guide Chatbot"]');
              btn?.click();
            }}
            className="px-8 py-4 bg-white text-purple-700 font-black rounded-2xl shadow-xl text-lg hover:scale-105 transition-transform"
          >
            Open Career Guide Chatbot 🎓
          </button>
        </section>

      </div>
    </div>
  );
}
