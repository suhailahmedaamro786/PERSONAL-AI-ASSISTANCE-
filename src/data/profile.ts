import type { Profile } from '../types';
import { daysAgo } from './helpers';

export const profile: Profile = {
  id: 'user_1',
  firstName: 'Suhail',
  lastName: 'Memon',
  email: 'suhail.dev@example.com',
  phone: '+92 300 0000000',
  city: 'Dadu, Sindh, Pakistan',
  bio: 'Aspiring AI Engineer from Dadu, Sindh. I build web apps and AI-powered tools, and I am working to break into production AI work.',
  headline: 'AI Engineer (in the making) · Full-Stack Developer',
  avatarUrl: null,
  education: [
    {
      institution: 'Government Degree College, Dadu',
      degree: 'Intermediate / High School',
      field: 'Computer Science (Pre-Engineering)',
      startYear: 2022,
      endYear: null,
      gpa: null,
    },
  ],
  diploma: 'Diploma in Information Technology (SK Dev Track)',
  skills: [
    'Python',
    'FastAPI',
    'TypeScript',
    'React',
    'Node.js',
    'PostgreSQL',
    'Supabase',
    'AI / LLM APIs',
    'Git / GitHub',
  ],
  certifications: [
    {
      name: 'Python for Data Science',
      issuer: 'Coursera',
      date: daysAgo(120),
      url: 'https://example.com/cert-python',
      expiresAt: null,
    },
    {
      name: 'Full-Stack Web Development',
      issuer: 'SK Dev Track',
      date: daysAgo(90),
      url: null,
      expiresAt: null,
    },
  ],
  courses: [
    'course_python',
    'course_fastapi',
    'course_ai',
    'course_rag',
    'course_agents',
    'course_production',
    'course_web',
    'course_blockchain',
    'course_act',
  ],
  projects: ['prj_1', 'prj_2', 'prj_3', 'prj_4', 'prj_5', 'prj_6'],
  achievements: [
    'Top 10% — Python for Data Science final project',
    'Built the SK Dev WhatsApp agent Phase 1 architecture',
  ],
  experience: [
    {
      title: 'AI Automation Consultant (in progress)',
      company: 'SK Dev Team',
      startDate: daysAgo(14),
      endDate: null,
      description:
        'Owning the WhatsApp voice AI sales agent — architecture, LLM provider abstraction, voice pipeline and project pricing rules.',
      skills: ['Python', 'FastAPI', 'AI / LLM APIs', 'Supabase'],
    },
  ],
  careerGoals: {
    targetRole: 'AI Engineer',
    targetCompany: 'SK Dev Team or a global remote AI team',
    targetTimeline: '6 months',
    topPriorities: [
      'Ship one production-grade AI project',
      'Master RAG and AI agents',
      'Land a remote AI role',
    ],
  },
  cvUrl: null,
  portfolioUrl: 'https://example.com/suhail',
  completionPercentage: 74,
};