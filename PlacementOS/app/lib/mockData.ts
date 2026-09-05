export const mockInterviewData = {
  technical: [
    { question: "Can you explain the main difference between React and Angular?", answer: "React is a library focused on UI components using a virtual DOM, whereas Angular is a full-fledged MVC framework.", difficulty: "Easy" },
    { question: "How do you handle state management in a large-scale React application?", answer: "Using tools like Redux, Zustand, or React Context combined with custom hooks.", difficulty: "Medium" },
    { question: "Explain the concept of closures in JavaScript and provide a practical use case.", answer: "A closure is a function that remembers its outer variables. It's often used for data privacy and factory functions.", difficulty: "Medium" }
  ],
  behavioral: [
    { question: "Tell me about a time you had a conflict with a team member.", answer: "Use the STAR method: Situation, Task, Action, Result. Focus on professional resolution.", difficulty: "Medium" },
    { question: "Describe a project that failed and what you learned from it.", answer: "Focus on accountability, the root cause analysis, and how it improved your future work.", difficulty: "Medium" }
  ],
  projectBased: [
    { question: "Walk me through the architecture of the most complex project on your resume.", answer: "Describe the frontend, backend, database choices, and how they communicate.", difficulty: "Hard" }
  ],
  hr: [
    { question: "Why do you want to work here?", answer: "Align your personal career goals with the company's mission and recent achievements.", difficulty: "Easy" },
    { question: "Where do you see yourself in 5 years?", answer: "Focus on growth, leadership, and deepening technical expertise.", difficulty: "Easy" }
  ]
};

export const mockRoadmapData = {
  title: "Full Stack Developer Roadmap — 3 Months",
  phases: [
    {
      phase: 1,
      name: "Foundation & Frontend",
      duration: "Month 1",
      weeks: [
        {
          week: 1,
          theme: "JavaScript Fundamentals",
          hours: 21,
          topics: [
            { name: "ES6+ Features", hours: 4, youtubeLink: "Namaste JavaScript ES6", docLink: "MDN ES6", practice: "Build a counter app", completed: false },
            { name: "Promises & Async/Await", hours: 5, youtubeLink: "Async JS Crash Course", docLink: "MDN Promises", practice: "Fetch data from an API", completed: false }
          ],
          milestone: "Master core JS concepts"
        },
        {
          week: 2,
          theme: "React Basics",
          hours: 20,
          topics: [
            { name: "Components & Props", hours: 5, youtubeLink: "React Crash Course", docLink: "React Docs", practice: "Build a Todo list", completed: false }
          ],
          milestone: "Build your first React app"
        }
      ]
    },
    {
      phase: 2,
      name: "Backend & Database",
      duration: "Month 2",
      weeks: [
        {
          week: 5,
          theme: "Node.js & Express",
          hours: 25,
          topics: [
            { name: "REST APIs", hours: 10, youtubeLink: "Node Express API", docLink: "Express Docs", practice: "Build a CRUD API", completed: false }
          ],
          milestone: "Create a fully functional backend API"
        }
      ]
    }
  ],
  totalWeeks: 12,
  keyMilestones: ["Complete JS Basics", "Build a React frontend", "Connect a Node backend", "Deploy the full app"],
  overallProgress: 0
};

export const mockAnalysisData = {
  overallScore: 72,
  breakdown: {
    skills: 75,
    experience: 68,
    education: 80,
    keywords: 65,
    tone: 72
  },
  missingKeywords: ["Docker", "AWS", "REST API"],
  strengths: [
    "Good React experience mentioned",
    "Projects are relevant to the role"
  ],
  improvements: [
    "Add cloud platform experience",
    "Quantify achievements with numbers"
  ],
  suggestions: [
    "Add Docker containerization to skills section",
    "Mention any AWS or GCP projects you have done",
    "Change worked on to led, built, developed, designed",
    "Add GitHub profile link if not present",
    "Add metrics: increased performance by X%, reduced time by Y%"
  ],
  atsScore: 68,
  jobTitle: "Software Developer"
};

export const mockLinkedInData = {
  overallScore: 65,
  breakdown: {
    headline: 15,
    about: 12,
    skills: 14,
    completeness: 13,
    keywords: 11
  },
  optimizedHeadline: "Full Stack Developer | React & Node.js | Building Scalable Web Apps",
  alternativeHeadlines: [
    "Software Engineer | MERN Stack | Open to New Opportunities",
    "React Developer | 2+ Years Experience | CSE Graduate 2025"
  ],
  improvedAbout: "Passionate software engineer with expertise in...",
  skillsToAdd: ["System Design", "Docker", "AWS"],
  skillsToRemove: ["MS Office", "Typing"],
  trendingSkills: ["Gen AI", "LangChain", "Vector Databases"],
  actionItems: [
    {item: "Add a professional headshot", priority: "High"},
    {item: "Write a compelling headline with keywords", priority: "High"},
    {item: "Add at least 5 featured projects", priority: "Medium"}
  ]
};

export const mockCompanyData = {
  name: "Google",
  type: "MAANG",
  packageRange: "20-45 LPA",
  difficulty: "Very Hard",
  rating: 5,
  about: "Brief intro",
  techStack: ["Python", "Go"],
  indiaOffices: ["Bangalore"],
  interviewProcess: [
    {round: 1, name: "Online Assessment", duration: "90 min", difficulty: "Medium"}
  ],
  dsaTopics: ["Arrays"],
  csTopics: ["OS"],
  sampleQuestions: ["Question 1"],
  salary: {
    fresher: "X-Y LPA",
    twoToThree: "X-Y LPA",
    fivePlus: "X-Y LPA",
    joiningBonus: "X LPA",
    stockOptions: "Details"
  },
  culture: {
    workLifeBalance: 4,
    growth: 5,
    tips: ["Tip 1"],
    dosDonts: {
      dos: ["Do this"],
      donts: ["Don't do this"]
    }
  },
  preparationChecklist: ["Study X"]
};

export const mockRoastData = {
  overallScore: 58,
  overallVerdict: "This resume needs serious work before any recruiter sees it",
  categories: {
    firstImpression: {
      score: 5,
      roast: "Write a SPECIFIC roast about what you actually see in this resume"
    },
    skills: {
      score: 6,
      roast: "Specific comment about the ACTUAL skills listed in this resume"
    },
    experience: {
      score: 7,
      roast: "Specific comment about the ACTUAL experience in this resume"
    },
    projects: {
      score: 5,
      roast: "Specific comment about the ACTUAL projects listed"
    },
    formatting: {
      score: 4,
      roast: "Specific comment about formatting issues you see"
    },
    impact: {
      score: 6,
      roast: "Specific comment about the impact statements"
    }
  },
  brutalPoints: [
    "Specific problem 1 from THIS resume",
    "Specific problem 2 from THIS resume"
  ],
  fixes: [
    "Specific fix 1 for THIS resume",
    "Specific fix 2 for THIS resume"
  ]
};

export const mockSalaryData = {
  minSalary: 800000,
  maxSalary: 1400000,
  avgSalary: 1100000,
  currency: "INR",
  marketDemand: "High",
  entryLevel: 600000,
  midLevel: 1100000,
  seniorLevel: 2000000,
  topCompanies: [
    {name: "Google", avgSalary: 2500000},
    {name: "Microsoft", avgSalary: 2200000},
    {name: "Target", avgSalary: 1800000}
  ],
  skillsToAdd: ["System Design", "AWS", "Kubernetes"],
  negotiationTips: ["Research market rates before negotiating", "Highlight scale of past projects"],
  insight: "React developers in Bangalore command premium salaries due to startup boom."
};

export const mockSkillGapData = {
  readinessScore: 65,
  matchingSkills: ["React", "JavaScript"],
  missingSkills: [
    {skill: "Node.js", priority: "Must Have", reason: "Required for backend", howToLearn: "Build a REST API"}
  ],
  skillsToImprove: [
    {skill: "React", currentLevel: "Intermediate", targetLevel: "Advanced", tip: "Learn Redux"}
  ],
  learningPlan: {
    week1: [{topic: "Node.js Basics", resource: "MDN", hours: 10}],
    week2: [{topic: "Express framework", resource: "Express Docs", hours: 10}],
    week3: [{topic: "Database integration", resource: "MongoDB Docs", hours: 10}],
    week4: [{topic: "Full stack project", resource: "Build a project", hours: 10}]
  },
  companyInsights: {
    interviewProcess: "3 rounds of technical interviews",
    focusTopics: ["Data Structures", "System Design"],
    difficulty: "High",
    tips: ["Practice LeetCode", "Review fundamentals"]
  }
};

export const mockResourcesData = {
  results: [
    {
      name: "freeCodeCamp React Course",
      platform: "YouTube/freeCodeCamp",
      type: "Video Course",
      rating: 5,
      isFree: true,
      link: "https://freecodecamp.org",
      description: "Complete React course, 8 hours, project-based",
      whyGood: "Best free React course with real projects"
    }
  ],
  tip: "Also check: The Odin Project for full curriculum"
};

export const mockMockInterviewStartData = {
  question: "Can you explain the difference between processes and threads?",
  category: "Operating Systems"
};

export const mockMockInterviewEvalData = {
  feedback: "Good answer, but you could have mentioned shared memory.",
  score: 7,
  idealAnswer: "Processes have separate memory spaces, threads share memory.",
  nextQuestion: "What is a deadlock?",
  nextCategory: "Operating Systems"
};

export const mockMockInterviewFinalData = {
  overallScore: 75,
  performance: {
    communication: 8,
    technicalAccuracy: 7,
    confidence: 8,
    answerStructure: 7,
    problemSolving: 7
  },
  strengths: ["Clear communication", "Good understanding of concepts"],
  improvements: ["Go deeper into technical details", "Structure answers better"],
  verdict: "Good performance, keep practicing!"
};

export const getMockFallback = (type: string) => {
  switch(type) {
    case 'interview': return mockInterviewData;
    case 'roadmap': return mockRoadmapData;
    case 'upload': return mockAnalysisData;
    case 'linkedin': return mockLinkedInData;
    case 'company': return mockCompanyData;
    case 'roast': return mockRoastData;
    case 'salary': return mockSalaryData;
    case 'skill-gap': return mockSkillGapData;
    case 'resources': return mockResourcesData;
    case 'mock-start': return mockMockInterviewStartData;
    case 'mock-eval': return mockMockInterviewEvalData;
    case 'mock-final': return mockMockInterviewFinalData;
    default: return { fallback: true, message: "Mock data not defined for this type" };
  }
};
