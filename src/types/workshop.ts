import type { ID, Timestamp } from './common';

export type City = 'Dadu' | 'Hyderabad' | 'Karachi' | 'Sindh' | 'Pakistan' | 'Online';
export type WorkshopCategory =
  | 'AI'
  | 'IT'
  | 'Training'
  | 'Workshop'
  | 'Scholarship'
  | 'Career'
  | 'Youth';

export interface Workshop {
  id: ID;
  title: string;
  description: string;
  organization: string;
  city: City;
  category: WorkshopCategory;
  date: Timestamp;
  deadline: Timestamp | null;
  location: string;
  isOnline: boolean;
  isFree: boolean;
  url: string | null;
  relevance: number; // 0-100
}