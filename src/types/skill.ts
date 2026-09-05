export type SkillCategory = 'technical' | 'soft' | 'tool' | 'language';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1-10
  targetLevel: number;
  endorsements: number;
  lastUsed: string | null;
  isVerified: boolean;
}