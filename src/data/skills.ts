import type { Skill } from '../types';

export const skills: Skill[] = [
  // Technical
  { id: 'sk_1', name: 'Python', category: 'technical', level: 8, targetLevel: 9, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_2', name: 'NLP', category: 'technical', level: 5, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-01', isVerified: false },
  { id: 'sk_3', name: 'TensorFlow', category: 'technical', level: 3, targetLevel: 7, endorsements: 0, lastUsed: '2026-08-28', isVerified: false },
  { id: 'sk_4', name: 'FastAPI', category: 'technical', level: 6, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-02', isVerified: false },
  { id: 'sk_5', name: 'HTML/CSS', category: 'technical', level: 7, targetLevel: 8, endorsements: 0, lastUsed: '2026-08-25', isVerified: true },
  { id: 'sk_6', name: 'JavaScript', category: 'technical', level: 5, targetLevel: 7, endorsements: 0, lastUsed: '2026-08-20', isVerified: false },
  { id: 'sk_7', name: 'React', category: 'technical', level: 4, targetLevel: 7, endorsements: 0, lastUsed: '2026-09-03', isVerified: false },
  { id: 'sk_8', name: 'SQL', category: 'technical', level: 3, targetLevel: 6, endorsements: 0, lastUsed: '2026-08-15', isVerified: false },
  { id: 'sk_9', name: 'Scikit-learn', category: 'technical', level: 4, targetLevel: 7, endorsements: 0, lastUsed: '2026-08-30', isVerified: false },

  // Tools
  { id: 'sk_10', name: 'Git', category: 'tool', level: 7, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_11', name: 'VS Code', category: 'tool', level: 8, targetLevel: 9, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_12', name: 'Linux CLI', category: 'tool', level: 6, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-02', isVerified: false },
  { id: 'sk_13', name: 'ChatGPT / Gemini', category: 'tool', level: 7, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_14', name: 'Tailwind CSS', category: 'tool', level: 5, targetLevel: 7, endorsements: 0, lastUsed: '2026-09-03', isVerified: false },

  // Soft skills
  { id: 'sk_15', name: 'Problem Solving', category: 'soft', level: 7, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-03', isVerified: false },
  { id: 'sk_16', name: 'Self-Learning', category: 'soft', level: 8, targetLevel: 9, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_17', name: 'Communication', category: 'soft', level: 5, targetLevel: 7, endorsements: 0, lastUsed: '2026-09-01', isVerified: false },

  // Languages
  { id: 'sk_18', name: 'Sindhi', category: 'language', level: 10, targetLevel: 10, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_19', name: 'Urdu', category: 'language', level: 9, targetLevel: 10, endorsements: 0, lastUsed: '2026-09-03', isVerified: true },
  { id: 'sk_20', name: 'English', category: 'language', level: 6, targetLevel: 8, endorsements: 0, lastUsed: '2026-09-03', isVerified: false },
];

export const mySkillNames = skills.map((s) => s.name);
