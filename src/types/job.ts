import type { ID, Timestamp, Priority } from './common';

export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type ApplicationStatus =
  | 'not_applied'
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected';

export interface Job {
  id: ID;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string; // 'PKR' | 'USD'
  description: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  source: string;
  url: string | null;
  deadline: Timestamp | null;
  postedAt: Timestamp;
  applicationStatus: ApplicationStatus;
  priority: Priority;
  notes: string;
}