// Represent a job posting with key details
interface Job { 
    title: string; // Title of the job description
    description: string; // Full description of the job responsibilities
    location: string; // Location of the job (City, Remote, Hybrid etc.)
    requiredSkills: string[]; // List of Skills required for the job
    salary: number; // Salary of the job
  }
  
  // Represent a candidate's resume and associated evaluation feedback
  interface Resume {
    id: string; // Unique Identifier for the Resume
    companyName?: string; // Optional - Company Associated with the Resume/Job
    jobTitle?: string; // Optional - Job Title associated with the resume
    imagePath: string; // Path to the candidate's profile Image
    resumePath: string; // Path to the actual resume file (PDF, DOCX, etc.)
    feedback: Feedback; // Detailed feedback after resume evaluation
  }
  
  // Represent detailed evaluation feedback for a resume
  interface Feedback {
    overallScore: number; // Overall score summarizing the resume evaluation
  
    // Section evaluating ATS (Applicant Tracking System) Compatibility
    ATS: { 
      score: number; // ATS score based on keyword matching, formatting
      tips: {
        type: "good" | "improve"; // Indicate if the tip is a strength or an area to improve
        tip: string; // Concise Feedback Tip
      }[]; // Array of tips related to ATS Evaluation
    };
  
    // Section evaluating the Tone and Style of the Resume
    toneAndStyle: {
      score: number; // Score for tone, readability, writing style
      tips: {
        type: "good" | "improve"; // Indicate if the tip is a strength or an area to improve
        tip: string; // Specific feedback for tone/style
        explanation: string; // Detailed reasoning behind the tip
      }[]; // Array of tips related to the tone and style evaluation
    };
  
    // Section evaluating the Content Quality of the Resume
    content: {
      score: number; // Score for clarity, relevance and completeness of content
      tips: {
        type: "good" | "improve"; // Indicate if the tip is a strength or an area to improve
        tip: string; // Specific feedback for content
        explanation: string; // Detailed reasoning behind the tip
      }[]; // Array of tips related to the content evaluation
    };
  
    // Section evaluating Structure and Formatting of the Resume
    structure: {
      score: number; // Score for Organization, Layout and Readability
      tips: {
        type: "good" | "improve"; // Indicate if the tip is a strength or an area to improve
        tip: string; // Specific feedback for Structure
        explanation: string; // Detailed reasoning behind the tip
      }[]; // Array of tips related to the Structure and Formatting
    };
  
    // Section evaluating how well skills are presented in the resume
    skills: {
      score: number; // Score for Skills Relevance and Presentation 
      tips: {
        type: "good" | "improve"; // Indicate if the tip is a strength or an area to improve
        tip: string; // Specific feedback for Skills
        explanation: string; // Detailed reasoning behind the tip
      }[]; // Array of tips related to Skills evaluation
    };
  }
  