import { motion } from 'framer-motion';
import { Award, Briefcase, FolderGit2, Star, TrendingUp } from 'lucide-react';
import { useCareerStore } from '../../store/careerStore';
import { careerReadiness } from '../../lib/computation';
import { ScoreRing } from '../ui/ScoreRing';
import { Skeleton } from '../ui/Progress';

export function CareerOverview() {
  const { profile, skills, projects, loading } = useCareerStore();

  if (loading || !profile) {
    return <Skeleton className="h-56" />;
  }

  const readiness = careerReadiness(profile, skills, projects);
  const ratified = skills.filter((s) => s.isVerified);

  const stats = [
    { label: 'Verified skills', value: ratified.length, icon: Star },
    { label: 'Projects', value: projects.length, icon: FolderGit2 },
    { label: 'Certifications', value: profile.certifications.length, icon: Award },
    { label: 'Experience', value: profile.experience.length, icon: Briefcase },
  ];

  return (
    <section aria-labelledby="career-overview-title">
      <h2 id="career-overview-title" className="sr-only">
        Career readiness overview
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Readiness score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface p-6 text-center shadow-xs md:row-span-2"
        >
          <ScoreRing value={readiness.score} size={128} stroke={10} label="readiness" />
          <div>
            <p className="text-[15px] font-semibold text-text">Career readiness</p>
            <p className="mt-0.5 text-[13px] text-text-muted">
              Target: {profile.careerGoals.targetRole} · {profile.careerGoals.targetTimeline}
            </p>
          </div>
        </motion.div>

        {/* Next best step */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-border bg-surface p-5 shadow-xs md:col-span-2"
        >
          <div className="flex items-center gap-2 text-[13px] font-semibold text-text">
            <TrendingUp className="h-4 w-4 text-brand" aria-hidden />
            Next best step
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Your weakest area is <span className="font-semibold text-text">{readiness.weakest.label.toLowerCase()}</span> (
            {readiness.weakest.score}/100). Closing this gap moves your readiness score most.
          </p>
          <p className="mt-1 text-[13px] text-text-muted">
            Strongest: {readiness.strongest.label} ({readiness.strongest.score}/100).
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
          className="grid grid-cols-2 gap-3 md:col-span-2"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle">
                <s.icon className="h-4 w-4 text-brand" aria-hidden />
              </div>
              <div>
                <p className="tabular-nums text-xl font-bold text-text">{s.value}</p>
                <p className="text-[12px] text-text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}