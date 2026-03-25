import { useState } from "react";
import Navbar from "~/components/Navbar";
import { callAIForJSON } from "~/lib/aiHelper";

export function meta() {
  return [
    { title: "Free Resources Finder 📚 — PlacementOS" },
    { name: "description", content: "Find free alternatives to any paid course — curated resources for BTech CSE students" },
  ];
}

interface Resource {
  name: string;
  platform: string;
  type: string;
  rating: number;
  isFree: boolean;
  link: string;
  description: string;
  whyGood: string;
}

const CURATED = [
  {
    category: "DSA & Algorithms", icon: "💻", color: "indigo",
    items: [
      { name: "Striver's A2Z DSA Sheet", platform: "TakeUForward", type: "Practice Sheet", rating: 5, isFree: true, link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/", whyGood: "Best structured DSA sheet for placements — 455 problems in order" },
      { name: "Neetcode 150", platform: "Neetcode.io", type: "Problem Set", rating: 5, isFree: true, link: "https://neetcode.io/practice", whyGood: "Curated 150 LeetCode problems with video explanations" },
      { name: "Abdul Bari Algorithms", platform: "YouTube", type: "Video Course", rating: 5, isFree: true, link: "https://www.youtube.com/results?search_query=Abdul+Bari+algorithms", whyGood: "Best algorithm explanations on YouTube — crystal clear" },
      { name: "Love Babbar DSA Sheet", platform: "YouTube + Sheet", type: "Video + Practice", rating: 4, isFree: true, link: "https://450dsa.com/", whyGood: "450 problems in Hindi — great for beginners" },
      { name: "GeeksForGeeks DSA", platform: "GeeksForGeeks", type: "Article + Practice", rating: 4, isFree: true, link: "https://www.geeksforgeeks.org/data-structures/", whyGood: "Theory + 1000s of practice problems with solutions" },
    ],
  },
  {
    category: "Full Stack Development", icon: "🌐", color: "emerald",
    items: [
      { name: "The Odin Project", platform: "theodinproject.com", type: "Full Curriculum", rating: 5, isFree: true, link: "https://www.theodinproject.com/", whyGood: "Complete free web dev curriculum from scratch to advanced" },
      { name: "freeCodeCamp", platform: "freeCodeCamp.org", type: "Video + Certificate", rating: 5, isFree: true, link: "https://www.freecodecamp.org/", whyGood: "Free certifications + 3000+ hours of coding challenges" },
      { name: "Apna College MERN Stack", platform: "YouTube", type: "Video Course", rating: 5, isFree: true, link: "https://www.youtube.com/@ApnaCollegeOfficial", whyGood: "Best Hindi MERN stack course for beginners" },
      { name: "Chai aur Code", platform: "YouTube", type: "Video Course", rating: 4, isFree: true, link: "https://www.youtube.com/@chaiaurcode", whyGood: "Modern React + Node with real project approach" },
      { name: "Traversy Media", platform: "YouTube", type: "Video Course", rating: 5, isFree: true, link: "https://www.youtube.com/@TraversyMedia", whyGood: "Project-based learning — builds real world skills fast" },
    ],
  },
  {
    category: "AI / Machine Learning", icon: "🤖", color: "violet",
    items: [
      { name: "Andrew Ng ML Course", platform: "Coursera (Audit)", type: "Video Course", rating: 5, isFree: true, link: "https://www.coursera.org/learn/machine-learning", whyGood: "Gold standard ML course — audit for free, skip certificate" },
      { name: "CampusX", platform: "YouTube", type: "Video Course", rating: 5, isFree: true, link: "https://www.youtube.com/@campusx-official", whyGood: "Best Hindi ML/DS course with projects — very in depth" },
      { name: "Krish Naik ML", platform: "YouTube", type: "Video Course", rating: 4, isFree: true, link: "https://www.youtube.com/@krishnaik06", whyGood: "Applied ML with real interview questions covered" },
      { name: "Fast.ai", platform: "fast.ai", type: "Video Course", rating: 5, isFree: true, link: "https://www.fast.ai/", whyGood: "Top-down practical deep learning — loved by researchers" },
      { name: "Kaggle Learn", platform: "Kaggle", type: "Micro-courses", rating: 4, isFree: true, link: "https://www.kaggle.com/learn", whyGood: "Free hands-on courses with free GPU — 30 min each" },
    ],
  },
  {
    category: "System Design", icon: "🏗️", color: "orange",
    items: [
      { name: "Gaurav Sen System Design", platform: "YouTube", type: "Video Course", rating: 5, isFree: true, link: "https://www.youtube.com/@gkcs", whyGood: "Best free system design videos — interview focused" },
      { name: "ByteByteGo Newsletter", platform: "ByteByteGo", type: "Newsletter + Videos", rating: 5, isFree: false, link: "https://bytebytego.com/", whyGood: "Best visuals for system design — free YouTube channel" },
      { name: "High Scalability Blog", platform: "highscalability.com", type: "Articles", rating: 4, isFree: true, link: "http://highscalability.com/", whyGood: "Real case studies of how big companies scale" },
      { name: "System Design Primer", platform: "GitHub", type: "Text Guide", rating: 5, isFree: true, link: "https://github.com/donnemartin/system-design-primer", whyGood: "250K+ stars GitHub repo — complete system design guide" },
    ],
  },
  {
    category: "Free Certifications", icon: "🏅", color: "amber",
    items: [
      { name: "Google IT Automation Python", platform: "Coursera (Audit)", type: "Certificate", rating: 5, isFree: true, link: "https://www.coursera.org/professional-certificates/google-it-automation", whyGood: "Google certification on Python automation — audit for free" },
      { name: "Meta Frontend Developer", platform: "Coursera (Audit)", type: "Certificate", rating: 4, isFree: true, link: "https://www.coursera.org/professional-certificates/meta-front-end-developer", whyGood: "Meta's official frontend certification — recognized by employers" },
      { name: "IBM Data Science", platform: "Coursera (Audit)", type: "Certificate", rating: 4, isFree: true, link: "https://www.coursera.org/professional-certificates/ibm-data-science", whyGood: "10 courses covering data science end to end" },
      { name: "AWS Cloud Practitioner Prep", platform: "AWS Skill Builder", type: "Exam Prep", rating: 5, isFree: true, link: "https://explore.skillbuilder.aws/", whyGood: "Official free AWS training before taking the ₹8K exam" },
      { name: "GitHub Learning Lab", platform: "GitHub", type: "Hands-on", rating: 4, isFree: true, link: "https://skills.github.com/", whyGood: "Learn Git/GitHub through real practice — free certificate" },
    ],
  },
];

const QUICK_SEARCHES = ["DSA Course", "Full Stack", "Machine Learning", "System Design", "React Course", "Python Basics", "DevOps", "Android Dev"];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  violet: { bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700", badge: "bg-violet-100 text-violet-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  amber: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
};

export default function FreeResources() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Resource[] | null>(null);
  const [tip, setTip] = useState("");
  const [error, setError] = useState("");

  const findFreeAlternatives = async (query: string) => {
    if (!query.trim()) return;
    setSearch(query);
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const prompt = `User is looking for free alternatives to: ${query}
They are a BTech CSE student with limited budget.

Use this JSON structure:
{
  "results": [
    {
      "name": "freeCodeCamp React Course",
      "platform": "YouTube/freeCodeCamp",
      "type": "Video Course",
      "rating": 5,
      "isFree": true,
      "link": "https://freecodecamp.org",
      "description": "Complete React course, 8 hours, project-based",
      "whyGood": "Best free React course with real projects"
    }
  ],
  "tip": "Also check: The Odin Project for full curriculum"
}
Give 4-6 real, accurate results. Only include real working links.`;

      const parsed: any = await callAIForJSON(prompt);
      setResults(parsed.results || []);
      setTip(parsed.tip || "");
    } catch (e) {
      setError("Couldn't fetch AI results. Scroll down for curated resources!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #818cf8 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Free Resources Finder 📚</h1>
          <p className="text-indigo-200 text-xl font-medium mb-10">Koi bhi paid course ka free alternative dhundho — instantly</p>

          {/* Search */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 flex gap-2 shadow-2xl max-w-2xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && findFreeAlternatives(search)}
              placeholder="Search any course... eg React course, DSA bootcamp"
              className="flex-1 px-4 py-3 text-gray-800 dark:text-gray-200 font-medium focus:outline-none text-base rounded-xl"
            />
            <button
              onClick={() => findFreeAlternatives(search)}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-colors disabled:bg-gray-300"
            >
              {loading ? "Finding..." : "Find Free 🔍"}
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_SEARCHES.map(q => (
              <button key={q} onClick={() => findFreeAlternatives(q)}
                className="px-3 py-1.5 bg-white dark:bg-gray-900/20 hover:bg-white dark:bg-gray-900/30 border border-white/30 text-white text-sm font-bold rounded-full transition-all">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 space-y-8">

        {/* AI Results */}
        {(loading || results || error) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">🤖 AI Found These Free Alternatives</h2>
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
              </div>
            )}
            {error && <p className="text-amber-600 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">{error}</p>}
            {results && (
              <>
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-black text-gray-900 dark:text-white">{r.name}</h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:text-gray-400">{r.platform}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.isFree ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.isFree ? "✓ FREE" : "Freemium"}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{r.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{r.whyGood}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{"⭐".repeat(r.rating)}</p>
                      </div>
                      <a href={r.link} target="_blank" rel="noreferrer"
                        className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors">
                        Open ↗
                      </a>
                    </div>
                  ))}
                </div>
                {tip && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-sm font-bold text-indigo-800">{tip}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Curated Resources */}
        {CURATED.map(cat => {
          const c = COLOR_MAP[cat.color];
          return (
            <div key={cat.category} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className={`p-5 ${c.bg} border-b ${c.border}`}>
                <h2 className={`font-black text-lg flex items-center gap-2 ${c.text}`}>{cat.icon} {cat.category}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.items.map(item => (
                  <div key={item.name} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:bg-gray-950 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.platform}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.isFree ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{item.isFree ? "FREE" : "Freemium"}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">{item.whyGood}</p>
                    </div>
                    <a href={item.link} target="_blank" rel="noreferrer"
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-bold border border-gray-200 dark:border-gray-800 hover:border-indigo-400 hover:text-indigo-600 rounded-lg transition-all">
                      Visit ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
