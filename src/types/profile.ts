import type { ID, Timestamp } from './common';

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  gpa: string | null;
}

export interface Certification {
  name: string;
  issuer: string;
  date: Timestamp;
  url: string | null;
  expiresAt: Timestamp | null;
}

export interface Experience {
  title: string;
  company: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  description: string;
  skills: string[];
}

export interface CareerGoals {
  targetRole: string;
  targetCompany: string | null;
  targetTimeline: string;
  topPriorities: string[];
}

export interface Profile {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string;
  bio: string;
  headline: string;
  avatarUrl: string | null;
  education: Education[];
  diploma: string | null;
  skills: string[];
  certifications: Certification[];
  courses: ID[];
  projects: ID[];
  achievements: string[];
  experience: Experience[];
  careerGoals: CareerGoals;
  cvUrl: string | null;
  portfolioUrl: string | null;
  completionPercentage: number;
}