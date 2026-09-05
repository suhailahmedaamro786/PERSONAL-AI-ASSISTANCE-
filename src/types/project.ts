import type { ID, Timestamp } from './common';

export interface Project {
  id: ID;
  title: string;
  description: string;
  skills: string[];
  url: string | null;
  githubUrl: string | null;
  imageUrl: string | null;
  completedAt: Timestamp | null;
  featured: boolean;
  caseStudy: string | null;
  score: number; // 0-100 portfolio quality
}