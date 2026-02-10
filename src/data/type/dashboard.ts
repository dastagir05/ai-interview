// data/type/dashboard.ts

export const ROLE_SECTIONS = [
  "FRONTEND",
  "BACKEND_NODE",
  "BACKEND_JAVA",
  "BACKEND_PYTHON",
  "BACKEND_DOTNET",
  "FULLSTACK",
  "SYSTEM_DESIGN",
] as const;

export const SECTION_LABELS: Record<string, string> = {
  FRONTEND: "Frontend Engineer",
  BACKEND_NODE: "Node.js Backend",
  BACKEND_JAVA: "Java Backend",
  BACKEND_PYTHON: "Python Backend",
  BACKEND_DOTNET: ".NET Backend",
  FULLSTACK: "Full Stack Engineer",
  SYSTEM_DESIGN: "System Design",
};

export const SECTION_ICONS: Record<string, string> = {
  FRONTEND: "layout",
  BACKEND_NODE: "server",
  BACKEND_JAVA: "coffee",
  BACKEND_PYTHON: "code",
  BACKEND_DOTNET: "box",
  FULLSTACK: "layers",
  SYSTEM_DESIGN: "briefcase",
};

// Map sub_category prefixes to sections
export const SUB_CATEGORY_TO_SECTION: Record<string, string> = {
  // Frontend
  FRONTEND_BASICS: "FRONTEND",
  FRONTEND_REACT: "FRONTEND",
  FRONTEND_NEXTJS: "FRONTEND",
  
  // Node.js Backend
  BACKEND_NODE_EXPRESS: "BACKEND_NODE",
  BACKEND_NODE_NESTJS: "BACKEND_NODE",
  
  // Java Backend
  BACKEND_JAVA_SPRING: "BACKEND_JAVA",
  BACKEND_JAVA_EE: "BACKEND_JAVA",
  
  // Python Backend
  BACKEND_PYTHON_FLASK: "BACKEND_PYTHON",
  BACKEND_PYTHON_DJANGO: "BACKEND_PYTHON",
  BACKEND_PYTHON_FASTAPI: "BACKEND_PYTHON",
  
  // .NET Backend
  BACKEND_DOTNET_CORE: "BACKEND_DOTNET",
  
  // System Design
  SYSTEM_DESIGN: "SYSTEM_DESIGN",
};
  
//  export const LANGUAGE_SECTIONS = [
//     "JAVA",
//     "PYTHON",
//     "JAVASCRIPT",
//     "RUST",
//     "GO",
//     "C",
//     "CPP",
//     "CSHARP",
//     "DOTNET",
//     "SCALA",
//     "RUBY",
//     "DART",
//     "SWIFT",
//     "SHELL",
//     "PHP",
//     "KOTLIN",
//   ];
  
//  export const LABEL_MAP: Record<string, string> = {
//     JAVA: "Java",
//     PYTHON: "Python",
//     JAVASCRIPT: "JavaScript",
//     RUST: "Rust",
//     GO: "Go",
//     C: "C",
//     CPP: "C++",
//     CSHARP: "C#",
//     DOTNET: ".NET",
//     SCALA: "Scala",
//     RUBY: "Ruby",
//     DART: "Dart",
//     SWIFT: "Swift",
//     SHELL: "Shell",
//     PHP: "PHP",
//     KOTLIN: "Kotlin",
//   };