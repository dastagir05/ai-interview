import {
    ZapIcon,
    CodeIcon,
    MicIcon,
    FileTextIcon,
    PencilIcon,
  } from "lucide-react";
  
export const options = [
    {
      label: "Quick Quiz",
      description:
        "Sharpen your problem-solving skills with tailored quiz tests.",
      href: "quiz",
      icon: ZapIcon,
    },
    {
      label: "Answer Technical Questions",
      description:
        "Challenge yourself with practice questions tailored to your job description.",
      href: "questions",
      icon: CodeIcon,
    },
    {
      label: "Practice Interviewing",
      description: "Simulate a real interview with AI-powered mock interviews.",
      href: "interviews",
      icon: MicIcon,
    },
    {
      label: "Refine Your Resume",
      description:
        "Get expert feedback on your resume and improve your chances of landing an interview.",
      href: "resume",
      icon: FileTextIcon,
    },
    {
      label: "Update Job Description",
      description: "This should only be used for minor updates.",
      href: "edit",
      icon: PencilIcon,
    },
  ];