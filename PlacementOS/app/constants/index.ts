// In this file three workflows :
// resumes - store candidate resumes with paths and feedback structure
// AI Response Format - defines the structure strict format that AI should return
// prepareInstructions - generate a prompt for AI to analyze the resume in exact format

export const resumes: Resume[] = [
    { 
      id: "1", // Unique Identifier for the resume 
      companyName: "Google", // Company the resume was submitted to
      jobTitle: "Frontend Developer", // Role the candidate applied for
      imagePath: "/images/resume_01.png", // Thumbnail Image for the Resume
      resumePath: '/resumes/resume-1.pdf', // Path to the full PDF Resume
      feedback: { // Feedback structure for Resume Evaluation
        overallScore: 85, // Overall Score out of 100
        ATS: { // Applicant Tracking System Score (relevant for automatic screening)
          score: 90,
          tips: [], // Tips to Improve ATS compatibility
        },
        toneAndStyle: { // feedback on writing style, tone and readability
          score: 90,
          tips: [], // Tips for improving tone and style
        },
        content: {  // Feedback on content quality and relevance
          score: 90,
          tips: [], // Tips for improving content
        },
        structure: { // Feedback on formatting, layout and organization
          score: 90,
          tips: [], // Tips for improving structure
        },
        skills: { // Feedback on skills listed, relevancy and clarity
          score: 90,
          tips: [], // Tips for improving skills section
        },
      },
    },
    {
      id: "2",
      companyName: "Microsoft",
      jobTitle: 'Cloud Engineer',
      imagePath: "/images/resume_02.png",
      resumePath: '/resumes/resume-2.pdf',
      feedback: {
        overallScore: 50, // Low score to indicate that resume needs improvement
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
      },
    },
    {
      id: "3",
      companyName: "Apple",
      jobTitle: 'iOS Developer',
      imagePath: "/images/resume_03.png",
      resumePath: '/resumes/resume-3.pdf',
      feedback: {
        overallScore: 50, // Low score to indicate that resume needs improvement
        ATS: { score: 90, tips: [] },
        toneAndStyle: { score: 90, tips: [] },
        content: { score: 90, tips: [] },
        structure: { score: 90, tips: [] },
        skills: { score: 90, tips: [] },
      },
    },
  ];
  
  // This is the format in which AI should provide us the feedback on a resume.
  // The AIResponseFormat is a string representing a TypeScript Interface.
  // It tells the AI exactly what structure to use when returning the feedback.
  export const AIResponseFormat = `
  interface Feedback {
    overallScore: number; // max 100 
    ATS: {
      score: number; // rate based on ATS suitability
      tips: {
        type: "good" | "improve"; // indicate if this is a positive point or an improvement
        tip: string; // short feedback tip 
      }[];
    };
    toneAndStyle: {
      score: number; // max 100
      tips: {
        type: "good" | "improve"; // indicate if this is a positive point or an improvement
        tip: string; // short feedback tip 
        explanation: string; // detailed explanation
      }[];
    };
    content: {
      score: number; // max 100
      tips: {
        type: "good" | "improve"; // indicate if this is a positive point or an improvement
        tip: string; // short feedback tip 
        explanation: string; // detailed explanation
      }[];
    };
    structure: {
      score: number; // max 100
      tips: {
        type: "good" | "improve"; // indicate if this is a positive point or an improvement
        tip: string; // short feedback tip 
        explanation: string; // detailed explanation
      }[];
    };
    skills: {
      score: number; // max 100
      tips: {
        type: "good" | "improve"; // indicate if this is a positive point or an improvement
        tip: string; // short feedback tip 
        explanation: string; // detailed explanation
      }[];
    };
  }
  `;
  
  // This function prepares instruction for the AI to analyze a resume
  // It takes the job title, job description and AI response format, and then returns a string prompt
  // that can be sent to the AI model for resume evaluation.
  export const prepareInstructions = ({
    jobTitle,
    jobDescription,
    AIResponseFormat,
  }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
  }) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
    Please analyze and rate this resume and suggest how to improve it. The rating can be low ifthe resume is bad.
    Be thorough and detailed. Don't be afraid to point out any mistages or areas of improvement.
    If there is a lot to improve, don't hesistate to give low scores. This is to help the user improve. 
    If available, use the job description for the job user is applying to give a more detailed feedback.
    If provided, take the job description into consideration before giving a response.
    The Job Title is : ${jobTitle}
    The Job Description is : ${jobDescription}
    Provide the feedback using the following format : ${AIResponseFormat}
    Return the analysis in a JSON object, without any other text and without any backticks.
    Do not Include any other Text or Comments. `;

