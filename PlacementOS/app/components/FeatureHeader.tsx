import React, { useState } from 'react';

export interface FeatureHeaderProps {
  title: string;
  icon: string;
  description: string;
  whatItDoes: string;
  howItWorks: string[];
  whyItMatters: string[];
  aiCapabilities: string[];
  tips: string[];
  gradient?: string;
}

export default function FeatureHeader({
  title,
  icon,
  description,
  whatItDoes,
  howItWorks,
  whyItMatters,
  aiCapabilities,
  tips,
  gradient = "from-blue-600 to-indigo-600"
}: FeatureHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-br ${gradient} text-white pt-12 pb-16 px-6 relative overflow-hidden transition-all duration-300`}>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white dark:bg-gray-900/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-black/10 rounded-full blur-2xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Main Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex gap-2 mb-3">
              {aiCapabilities.length > 0 && (
                <span className="bg-white dark:bg-gray-900/20 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 flex items-center gap-1">
                  ✨ AI Powered
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 flex items-center gap-3 drop-shadow-md tracking-tight">
              <span className="bg-white dark:bg-gray-900/10 p-2 rounded-xl text-3xl shadow-inner backdrop-blur-md">{icon}</span>
              {title}
            </h1>
            <p className="text-white/80 text-lg font-medium max-w-2xl">{description}</p>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-bold py-3 px-6 rounded-xl shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            {isExpanded ? "Hide Details" : "How it Works ℹ️"}
          </button>
        </div>

        {/* Expandable Details Section */}
        {isExpanded && (
          <div className="bg-white dark:bg-gray-900/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 md:p-8 mt-6 animate-fade-in-up grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white mb-2 border-b border-white/20 pb-2">What This Does 🎯</h3>
                <p className="text-sm text-white/90 leading-relaxed font-medium">{whatItDoes}</p>
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2 border-b border-white/20 pb-2">How It Works ⚙️</h3>
                <ol className="space-y-2">
                  {howItWorks.map((step, i) => (
                    <li key={i} className="text-sm text-white/90 flex gap-2 font-medium">
                      <span className="font-black opacity-60">{i+1}.</span> {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white mb-2 border-b border-white/20 pb-2">Why It Matters 🚀</h3>
                <ul className="space-y-2">
                  {whyItMatters.map((point, i) => (
                    <li key={i} className="text-sm text-white/90 flex gap-2 font-medium">
                      <span>✓</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
              {aiCapabilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-white mb-2 border-b border-white/20 pb-2">AI Capabilities 🧠</h3>
                  <ul className="space-y-2">
                    {aiCapabilities.map((point, i) => (
                      <li key={i} className="text-sm text-white/90 flex gap-2 font-medium">
                        <span>✨</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white mb-2 border-b border-white/20 pb-2">Pro Tips 💡</h3>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="text-sm text-white/90 flex gap-2 font-medium">
                      <span className="opacity-80">🔥</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
