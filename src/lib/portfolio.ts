import type { Project } from '../types';

export interface PortfolioStats {
  total: number;
  featured: number;
  avgScore: number;
  skills: number;
  withCaseStudy: number;
}

/** Portfolio headline stats derived from the real project list. */
export function portfolioStats(projects: Project[]): PortfolioStats {
  const skills = new Set(projects.flatMap((p) => p.skills));
  return {
    total: projects.length,
    featured: projects.filter((p) => p.featured).length,
    avgScore: projects.length
      ? Math.round(projects.reduce((s, p) => s + p.score, 0) / projects.length)
      : 0,
    skills: skills.size,
    withCaseStudy: projects.filter((p) => p.caseStudy).length,
  };
}
