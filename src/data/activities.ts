import type { ActivityEvent } from '../types';
import { daysAgo, hours } from './helpers';

export const activities: ActivityEvent[] = [
  { id: 'act_1', action: 'completed', entity: 'Task', description: 'Completed "Register for FreeCodeCamp AI Workshop"', timestamp: daysAgo(3), icon: 'check-circle', metadata: null },
  { id: 'act_2', action: 'created', entity: 'Task', description: 'Created task "Apply to codeworks Remote Internship"', timestamp: daysAgo(7), icon: 'plus', metadata: null },
  { id: 'act_3', action: 'completed', entity: 'Job', description: 'Applied to AI Intern (Remote) at CodeWorks Pakistan', timestamp: daysAgo(1), icon: 'send', metadata: { jobId: 'job_2' } },
  { id: 'act_4', action: 'updated', entity: 'Skill', description: 'Updated Python skill level to 8/10', timestamp: daysAgo(2), icon: 'trending-up', metadata: null },
  { id: 'act_5', action: 'generated', entity: 'AI Insight', description: 'AI generated 3 new recommendations', timestamp: daysAgo(1), icon: 'sparkles', metadata: null },
  { id: 'act_6', action: 'reviewed', entity: 'Portfolio', description: 'AI reviewed NLP Sentiment Analysis project — score: 75/100', timestamp: daysAgo(2), icon: 'eye', metadata: null },
  { id: 'act_7', action: 'analyzed', entity: 'Career', description: 'Career profile analyzed — 3 skill gaps identified', timestamp: daysAgo(3), icon: 'target', metadata: null },
  { id: 'act_8', action: 'created', entity: 'Task', description: 'AI suggested daily learning task', timestamp: hours(-5), icon: 'bot', metadata: null },
  { id: 'act_9', action: 'completed', entity: 'Task', description: 'Completed "30 min exercise — morning walk"', timestamp: daysAgo(0), icon: 'check-circle', metadata: null },
  { id: 'act_10', action: 'updated', entity: 'Project', description: 'Pushed NLP sentiment analysis code to GitHub', timestamp: daysAgo(1), icon: 'git-branch', metadata: { projectId: 'proj_1' } },
];
