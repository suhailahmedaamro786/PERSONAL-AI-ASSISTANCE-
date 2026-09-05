import { motion } from 'framer-motion';
import { Sparkles, Plus, FileText, FolderGit2, GraduationCap } from 'lucide-react';
import { useCareerStore } from '../../store/careerStore';
import { useTaskStore } from '../../store/taskStore';
import { skillGap } from '../../lib/computation';
import { type LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Progress';
import { uid } from '../../lib/utils';

interface Rec {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  taskTitle: string;
  tag: string;
}

export function CareerRecs() {
  const { profile, skills, projects, loading } = useCareerStore();
  const addTask = useTaskStore((s) => s.addTask);

  if (loading || !profile) {
    return (
      <section aria-labelledby="recs-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <Skeleton className="mb-4 h-5 w-36" />
        <div className="space-y-3">{[0, 1].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}</div>
      </section>
    );
  }

  const gaps = skillGap(skills).filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap);
  const biggest = gaps[0];
  const noCaseStudy = projects.filter((p) => p.featured && !p.caseStudy);

  const recs: Rec[] = [];
  if (!profile.cvUrl) {
    recs.push({
      id: 'cv',
      icon: FileText,
      title: 'Add your CV',
      description: 'No CV is linked to your profile — recruiters can’t see your work yet.',
      taskTitle: 'Upload CV to profile',
      tag: 'Profile',
    });
  }
  if (biggest) {
    recs.push({
      id: 'skill',
      icon: GraduationCap,
      title: `Close the ${biggest.name} gap`,
      description: `You’re at ${biggest.current}/10, target ${biggest.target}/10. A focused course or project would move it fastest.`,
      taskTitle: `Study ${biggest.name} fundamentals`,
      tag: 'Learning',
    });
  }
  if (noCaseStudy.length > 0) {
    recs.push({
      id: 'case-study',
      icon: FolderGit2,
      title: `Write a case study for ${noCaseStudy[0].title}`,
      description: 'Featured projects with case studies stand out far more to hiring managers.',
      taskTitle: `Write case study: ${noCaseStudy[0].title}`,
      tag: 'Portfolio',
    });
  }

  function handleAdd(rec: Rec) {
    void addTask({
      id: uid('task'),
      title: rec.taskTitle,
      description: rec.description,
      priority: 'medium',
      category: 'career',
      deadline: null,
      estimatedMinutes: 60,
      actualMinutes: null,
      recurrence: null,
      tags: ['career', rec.tag.toLowerCase()],
      source: 'ai',
      linkedJobId: null,
      linkedCourseId: null,
    });
  }

  return (
    <section aria-labelledby="recs-title" className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand" aria-hidden />
        <h2 id="recs-title" className="text-[15px] font-semibold text-text">
          AI recommendations
        </h2>
      </div>

      <ul className="space-y-3">
        {recs.map((rec, i) => (
          <motion.li
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface-hover/40 p-3.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle">
              <rec.icon className="h-4 w-4 text-brand" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[13px] font-semibold text-text">{rec.title}</p>
                <span className="rounded-full bg-surface-active px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {rec.tag}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-text-muted">{rec.description}</p>
            </div>
            <Button variant="brand-soft" size="sm" onClick={() => handleAdd(rec)} className="shrink-0">
              <Plus className="h-3.5 w-3.5" /> Add task
            </Button>
          </motion.li>
        ))}
      </ul>

      {recs.length === 0 && (
        <p className="text-[13px] text-text-muted">Nothing to flag — you’re in great shape.</p>
      )}
    </section>
  );
}