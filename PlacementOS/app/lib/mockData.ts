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

export const getMockFallback = (type: string) => {
  switch(type) {
    case 'interview': return mockInterviewData;
    case 'roadmap': return mockRoadmapData;
    default: return { fallback: true, message: "Mock data not defined for this type" };
  }
};
