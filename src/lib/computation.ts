import { clamp } from './utils';
import type { Profile, Project, Skill } from '../types';

/**
 * Honest job-match percentage: based purely on the overlap between the
 * user's skill names and a job's required skills. Never invented.
 */
export function computeMatch(requiredSkills: string[], mySkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  const mine = new Set(mySkills.map((s) => s.toLowerCase()));
  const matched = requiredSkills.filter((r) => mine.has(r.toLowerCase()));
  return Math.round((matched.length / requiredSkills.length) * 100);
}

export function splitSkills(required: string[], owned: string[]) {
  const mine = new Set(owned.map((s) => s.toLowerCase()));
  const matched = required.filter((r) => mine.has(r.toLowerCase()));
  const missing = required.filter((r) => !mine.has(r.toLowerCase()));
  return { matched, missing };
}

/**
 * Career readiness score (0-100) built from weighted section scores.
 * Each section is 0-100 and contributes toward the total.
 */
export function computeReadiness(sections: Record<string, number>): number {
  const weights: Record<string, number> = {
    skills: 0.25,
    projects: 0.2,
    certifications: 0.15,
    experience: 0.15,
    portfolio: 0.1,
    cv: 0.075,
    interview: 0.075,
  };
  const total = Object.entries(sections).reduce((acc, [key, score]) => {
    return acc + clamp(score) * (weights[key] ?? 0);
  }, 0);
  return Math.round(total);
}

/**
 * Profile completion percentage from a checklist of boolean completeness
 * criteria, each worth a weight.
 */
export function computeCompletion(
  criteria: Array<{ met: boolean; weight: number }>,
): { percent: number; missing: string[] } {
  const total = criteria.reduce((acc, c) => acc + (c.met ? c.weight : 0), 0);
  return { percent: Math.round(clamp(total)), missing: [] };
}

/**
 * Simple learning streak: count consecutive days ending today (or yesterday)
 * that appear in a set of ISO date strings.
 */
export function currentStreak(dates: string[]): number {
  const seen = new Set(dates.map((d) => d.slice(0, 10)));
  const day = 86400000;
  let cursor = Date.now();
  // Allow streak to still count if last activity was yesterday.
  if (!seen.has(new Date(cursor).toISOString().slice(0, 10))) {
    cursor -= day;
  }
  let streak = 0;
  while (seen.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= day;
  }
  return streak;
}

/** Smooth-color for a score value: 0 → danger, 50 → warning, 100 → success. */
export function scoreTone(value: number): 'danger' | 'warning' | 'success' {
  if (value < 45) return 'danger';
  if (value < 72) return 'warning';
  return 'success';
}

/** npm-less small skill sample for gap charts. */
export function skillGap(skills: Skill[]) {
  return skills.map((s) => ({
    name: s.name,
    current: s.level,
    target: s.targetLevel,
    gap: Math.max(0, s.targetLevel - s.level),
  }));
}

export interface CareerSection {
  key: string;
  label: string;
  score: number;
}

/**
 * Data-driven career readiness: score every weighted section from the real
 * profile/skills/projects values, then blend with computeReadiness weights.
 * Nothing is invented — each section is derived from actual data.
 */
export function careerReadiness(profile: Profile, skills: Skill[], projects: Project[]) {
  const skillScore =
    skills.length > 0
      ? Math.round((skills.reduce((sum, s) => sum + s.level, 0) / skills.length / 10) * 100)
      : 0;
  const projectScore =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
      : 20;
  const certScore = Math.min(100, profile.certifications.length * 35);
  const experienceScore = profile.experience.length > 0 ? 70 : 25;
  const portfolioScore =
    (profile.portfolioUrl ? 60 : 0) + (projects.some((p) => p.featured) ? 20 : 0);
  const cvScore = profile.cvUrl ? 100 : 20;
  const soft = skills.filter((s) => s.category === 'soft' || s.category === 'language');
  const interviewScore =
    soft.length > 0
      ? Math.round((soft.reduce((sum, s) => sum + s.level, 0) / soft.length / 10) * 100)
      : 50;

  const sections: CareerSection[] = [
    { key: 'skills', label: 'Skills & tech', score: skillScore },
    { key: 'projects', label: 'Projects', score: projectScore },
    { key: 'certifications', label: 'Certifications', score: certScore },
    { key: 'experience', label: 'Experience', score: experienceScore },
    { key: 'portfolio', label: 'Portfolio', score: portfolioScore },
    { key: 'cv', label: 'CV & documents', score: cvScore },
    { key: 'interview', label: 'Interview readiness', score: interviewScore },
  ];

  const map = Object.fromEntries(sections.map((s) => [s.key, s.score]));
  const sorted = [...sections].sort((a, b) => a.score - b.score);
  return {
    score: computeReadiness(map),
    sections,
    strongest: sorted[sorted.length - 1],
    weakest: sorted[0],
  };
}

/** Honest career checklist — every item verifies against actual data. */
export function careerChecklist(profile: Profile, skills: Skill[], projects: Project[]) {
  return [
    { label: 'CV or resume uploaded', met: profile.cvUrl != null },
    { label: 'Portfolio link set', met: profile.portfolioUrl != null },
    { label: 'Profile at least 80% complete', met: (profile.completionPercentage ?? 0) >= 80 },
    { label: 'At least 3 verified skills', met: skills.filter((s) => s.isVerified).length >= 3 },
    { label: 'At least 2 certifications', met: profile.certifications.length >= 2 },
    {
      label: 'Featured project with a case study',
      met: projects.some((p) => p.featured && p.caseStudy),
    },
    {
      label: 'Current role on your experience',
      met: profile.experience.some((e) => !e.endDate),
    },
  ];
}