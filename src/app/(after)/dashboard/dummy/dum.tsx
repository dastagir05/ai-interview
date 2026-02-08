"use client"
import React, { useState, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Clock, TrendingUp, Code, Briefcase, LucideIcon } from 'lucide-react';

// Type definitions
type JobLevel = 'JUNIOR' | 'SENIOR';
type JobCategory = 'PROGRAMMING' | 'SYSTEM_DESIGN' | 'FRAMEWORK';

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  tech: string[];
  time: number;
  level: JobLevel;
  category: JobCategory;
  subCategory: string;
  progress: number;
}

interface JobCardProps {
  job: Job;
}

interface SectionProps {
  title: string;
  jobs: Job[];
  icon?: LucideIcon;
}

// Dummy job data
const DUMMY_JOBS: Job[] = [
  // Java Jobs
  { id: 1, title: 'Backend Engineer', company: 'TechCorp', logo: '🏢', tech: ['Java', 'Spring Boot', 'MySQL'], time: 45, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVA', progress: 0 },
  { id: 2, title: 'Java Developer', company: 'StartupXYZ', logo: '🚀', tech: ['Java', 'Microservices'], time: 60, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVA', progress: 0 },
  { id: 3, title: 'Junior Java Dev', company: 'CodeBase', logo: '💼', tech: ['Java', 'REST API'], time: 30, level: 'JUNIOR', category: 'PROGRAMMING', subCategory: 'JAVA', progress: 65 },
  { id: 4, title: 'Java Engineer', company: 'DataFlow', logo: '📊', tech: ['Java', 'Kafka'], time: 50, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVA', progress: 0 },
  { id: 5, title: 'Entry Level Java', company: 'LearnTech', logo: '🎓', tech: ['Java', 'OOP'], time: 25, level: 'JUNIOR', category: 'PROGRAMMING', subCategory: 'JAVA', progress: 0 },
  
  // Python Jobs
  { id: 6, title: 'Python Developer', company: 'AI Labs', logo: '🤖', tech: ['Python', 'Django'], time: 40, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'PYTHON', progress: 0 },
  { id: 7, title: 'Data Engineer', company: 'BigData Inc', logo: '📈', tech: ['Python', 'Pandas'], time: 55, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'PYTHON', progress: 0 },
  { id: 8, title: 'Junior Python Dev', company: 'WebStart', logo: '🌐', tech: ['Python', 'Flask'], time: 35, level: 'JUNIOR', category: 'PROGRAMMING', subCategory: 'PYTHON', progress: 30 },
  { id: 9, title: 'ML Engineer', company: 'Neural Net', logo: '🧠', tech: ['Python', 'TensorFlow'], time: 70, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'PYTHON', progress: 0 },
  
  // JavaScript Jobs
  { id: 10, title: 'Frontend Engineer', company: 'UIDesigns', logo: '🎨', tech: ['JavaScript', 'React'], time: 45, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVASCRIPT', progress: 0 },
  { id: 11, title: 'Full Stack Dev', company: 'WebWorks', logo: '⚡', tech: ['JavaScript', 'Node.js'], time: 60, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVASCRIPT', progress: 0 },
  { id: 12, title: 'Junior Frontend', company: 'PixelPerfect', logo: '✨', tech: ['JavaScript', 'HTML/CSS'], time: 30, level: 'JUNIOR', category: 'PROGRAMMING', subCategory: 'JAVASCRIPT', progress: 80 },
  { id: 13, title: 'React Developer', company: 'Modern Apps', logo: '⚛️', tech: ['JavaScript', 'React'], time: 50, level: 'SENIOR', category: 'PROGRAMMING', subCategory: 'JAVASCRIPT', progress: 0 },
  
  // Spring Boot Jobs
  { id: 14, title: 'Spring Boot Dev', company: 'Enterprise Co', logo: '🏭', tech: ['Spring Boot', 'Java'], time: 55, level: 'SENIOR', category: 'FRAMEWORK', subCategory: 'SPRING_BOOT', progress: 0 },
  { id: 15, title: 'Microservices Dev', company: 'CloudNative', logo: '☁️', tech: ['Spring Boot', 'Docker'], time: 65, level: 'SENIOR', category: 'FRAMEWORK', subCategory: 'SPRING_BOOT', progress: 0 },
  { id: 16, title: 'Backend Developer', company: 'ServerSide', logo: '🖥️', tech: ['Spring Boot', 'PostgreSQL'], time: 50, level: 'SENIOR', category: 'FRAMEWORK', subCategory: 'SPRING_BOOT', progress: 0 },
  
  // MERN Stack Jobs
  { id: 17, title: 'MERN Developer', company: 'FullStack Co', logo: '📱', tech: ['MongoDB', 'Express', 'React'], time: 70, level: 'SENIOR', category: 'FRAMEWORK', subCategory: 'MERN', progress: 0 },
  { id: 18, title: 'Full Stack Engineer', company: 'WebApps', logo: '🌟', tech: ['MERN Stack', 'AWS'], time: 75, level: 'SENIOR', category: 'FRAMEWORK', subCategory: 'MERN', progress: 0 },
  { id: 19, title: 'Junior MERN Dev', company: 'StartCoding', logo: '🚦', tech: ['MongoDB', 'React'], time: 40, level: 'JUNIOR', category: 'FRAMEWORK', subCategory: 'MERN', progress: 45 },
  
  // System Design Jobs
  { id: 20, title: 'System Design - URL Shortener', company: 'ScaleUp', logo: '🔗', tech: ['Architecture', 'Scalability'], time: 60, level: 'SENIOR', category: 'SYSTEM_DESIGN', subCategory: 'ARCHITECTURE', progress: 0 },
  { id: 21, title: 'Design Twitter Clone', company: 'SocialTech', logo: '🐦', tech: ['Distributed Systems'], time: 90, level: 'SENIOR', category: 'SYSTEM_DESIGN', subCategory: 'ARCHITECTURE', progress: 0 },
  { id: 22, title: 'Cache Design', company: 'Performance Inc', logo: '⚡', tech: ['Caching', 'Redis'], time: 50, level: 'SENIOR', category: 'SYSTEM_DESIGN', subCategory: 'ARCHITECTURE', progress: 0 },
  { id: 23, title: 'Basics - Load Balancer', company: 'Learn System', logo: '⚖️', tech: ['Fundamentals'], time: 35, level: 'JUNIOR', category: 'SYSTEM_DESIGN', subCategory: 'BASICS', progress: 0 },
  { id: 24, title: 'Database Design', company: 'DataMasters', logo: '💾', tech: ['SQL', 'NoSQL'], time: 40, level: 'JUNIOR', category: 'SYSTEM_DESIGN', subCategory: 'BASICS', progress: 20 },
];

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const levelColors: Record<JobLevel, string> = {
    JUNIOR: 'bg-green-500',
    SENIOR: 'bg-orange-500'
  };

  return (
    <div className="flex-shrink-0 w-64 bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
      <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-5xl">
        {job.logo}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{job.title}</h3>
        <p className="text-gray-400 text-sm mb-3">{job.company}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {job.tech.slice(0, 2).map((tech, i) => (
            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {tech}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock size={14} className="mr-1" />
            {job.time}min
          </div>
          <span className={`text-xs px-2 py-1 rounded text-white ${levelColors[job.level]}`}>
            {job.level}
          </span>
        </div>
        
        {job.progress > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full" 
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{job.progress}% complete</p>
          </div>
        )}
        
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm">
          {job.progress > 0 ? 'Continue' : 'Start'} →
        </button>
      </div>
    </div>
  );
};

const Section: React.FC<SectionProps> = ({ title, jobs, icon: Icon }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (jobs.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center mb-4">
        {Icon && <Icon size={24} className="mr-2 text-gray-400" />}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="ml-3 text-gray-400 text-sm">({jobs.length})</span>
      </div>
      
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="text-white" />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </div>
  );
};

const InterviewDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterOptions: string[] = [
    'All', 'Junior', 'Senior', 'Programming', 'Framework', 'System Design',
    'Java', 'Python', 'JavaScript', 'Spring Boot', 'MERN'
  ];

  const toggleFilter = (filter: string): void => {
    if (filter === 'All') {
      setActiveFilters([]);
      return;
    }
    
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getFilteredJobs = (): Job[] => {
    let filtered = DUMMY_JOBS;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Active filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(job => {
        return activeFilters.every(filter => {
          if (filter === 'Junior') return job.level === 'JUNIOR';
          if (filter === 'Senior') return job.level === 'SENIOR';
          if (filter === 'Programming') return job.category === 'PROGRAMMING';
          if (filter === 'Framework') return job.category === 'FRAMEWORK';
          if (filter === 'System Design') return job.category === 'SYSTEM_DESIGN';
          if (filter === 'Java') return job.subCategory === 'JAVA';
          if (filter === 'Python') return job.subCategory === 'PYTHON';
          if (filter === 'JavaScript') return job.subCategory === 'JAVASCRIPT';
          if (filter === 'Spring Boot') return job.subCategory === 'SPRING_BOOT';
          if (filter === 'MERN') return job.subCategory === 'MERN';
          return true;
        });
      });
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  // Generate sections dynamically
  const sections: SectionProps[] = [
    {
      title: 'Continue Practicing',
      jobs: filteredJobs.filter(j => j.progress > 0),
      icon: TrendingUp
    },
    {
      title: 'Java Interviews - Senior',
      jobs: filteredJobs.filter(j => j.subCategory === 'JAVA' && j.level === 'SENIOR'),
      icon: Code
    },
    {
      title: 'Java Interviews - Junior',
      jobs: filteredJobs.filter(j => j.subCategory === 'JAVA' && j.level === 'JUNIOR'),
      icon: Code
    },
    {
      title: 'Python Interviews - Senior',
      jobs: filteredJobs.filter(j => j.subCategory === 'PYTHON' && j.level === 'SENIOR'),
      icon: Code
    },
    {
      title: 'Python Interviews - Junior',
      jobs: filteredJobs.filter(j => j.subCategory === 'PYTHON' && j.level === 'JUNIOR'),
      icon: Code
    },
    {
      title: 'JavaScript Interviews - Senior',
      jobs: filteredJobs.filter(j => j.subCategory === 'JAVASCRIPT' && j.level === 'SENIOR'),
      icon: Code
    },
    {
      title: 'JavaScript Interviews - Junior',
      jobs: filteredJobs.filter(j => j.subCategory === 'JAVASCRIPT' && j.level === 'JUNIOR'),
      icon: Code
    },
    {
      title: 'Spring Boot Practice',
      jobs: filteredJobs.filter(j => j.subCategory === 'SPRING_BOOT'),
      icon: Briefcase
    },
    {
      title: 'MERN Stack Practice',
      jobs: filteredJobs.filter(j => j.subCategory === 'MERN'),
      icon: Briefcase
    },
    {
      title: 'System Design - Senior Level',
      jobs: filteredJobs.filter(j => j.category === 'SYSTEM_DESIGN' && j.level === 'SENIOR'),
      icon: Briefcase
    },
    {
      title: 'System Design - Junior Level',
      jobs: filteredJobs.filter(j => j.category === 'SYSTEM_DESIGN' && j.level === 'JUNIOR'),
      icon: Briefcase
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search: Spring Boot, Java Senior, MERN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(filter => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === 'All' && activeFilters.length === 0
                    ? 'bg-blue-600 text-white'
                    : activeFilters.includes(filter)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {sections.map((section, index) => (
          <Section key={index} {...section} />
        ))}
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No interviews found matching your criteria</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveFilters([]); }}
              className="mt-4 text-blue-500 hover:text-blue-400"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDashboard;