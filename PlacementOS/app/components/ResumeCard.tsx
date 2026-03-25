import { Link } from "react-router";

// Inline score circle to avoid casing conflict with Scorecircle.tsx on Windows
function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div 
      className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base border-4"
      style={{ color, borderColor: color }}
    >
      {score}
    </div>
  );
}

// Props type: expects a resume object
const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        return "Needs Improvement";
    };

    return (
        <Link 
            to={`/resume/${id}`} 
            className="resume-card group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
            {/* Header section: company name, job title, and score */}
            <div className="resume-card-header">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    {companyName && (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white break-words group-hover:text-blue-600 transition-colors">
                            {companyName}
                        </h2>
                    )}
                    {jobTitle && (
                        <h3 className="text-base text-gray-600 dark:text-gray-400 break-words">
                            {jobTitle}
                        </h3>
                    )}
                    {!companyName && !jobTitle && (
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume</h2>
                    )}
                    <div className="mt-2">
                        <span className={`text-sm font-medium ${getScoreColor(feedback.overallScore)}`}>
                            {getScoreLabel(feedback.overallScore)}
                        </span>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {/* Resume image section */}
            {imagePath && (
                <div className="gradient-border overflow-hidden rounded-xl group-hover:shadow-inner transition-shadow duration-300">
                    <img
                        src={imagePath}
                        alt={`Resume for ${companyName || jobTitle || 'position'}`}
                        className="w-full max-h-[400px] object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Footer with quick stats */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Analyzed
                    </span>
                </div>
                <div className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                    View Details →
                </div>
            </div>
        </Link>
    );
}

export default ResumeCard;
