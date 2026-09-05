import { classes as seedClasses } from '../data/classes';
import { jobs as seedJobs } from '../data/jobs';
import { workshops as seedWorkshops } from '../data/workshops';
import { courses as seedCourses } from '../data/courses';
import { skills as seedSkills } from '../data/skills';
import { projects as seedProjects } from '../data/projects';
import { notifications as seedNotifications } from '../data/notifications';
import { activities as seedActivities } from '../data/activities';
import { aiInsights as seedInsights } from '../data/ai-insights';
import { profile as seedProfile } from '../data/profile';
import { load, save, loadObj, saveObj } from './storage';
import type {
  ActivityEvent,
  AIInsight,
  ApplicationStatus,
  ClassSession,
  Course,
  Job,
  Notification,
  Profile,
  Project,
  Skill,
  Workshop,
} from '../types';
import { delay } from './delay';
import { uid } from '../lib/utils';

// Data sources — each is a localStorage-backed, seeded array.
const dataClasses = load<ClassSession>('classes', seedClasses);
const dataJobs = load<Job>('jobs', seedJobs);
const dataWorkshops = load<Workshop>('workshops', seedWorkshops);
const dataCourses = load<Course>('courses', seedCourses);
const dataSkills = load<Skill>('skills', seedSkills);
const dataProjects = load<Project>('projects', seedProjects);
const dataNotifications = load<Notification>('notifications', seedNotifications);
const dataActivities = load<ActivityEvent>('activities', seedActivities);
const dataInsights = load<AIInsight>('ai-insights', seedInsights);
const dataProfile = loadObj<Profile>('profile', seedProfile);

export const dashboardService = {
  async getWeeklyTasks() {
    await delay(280);
    const { getWeeklyTaskData, getCategorySplit, getWeeklyLearningHours } = await import('../lib/dashboard');
    const tasks = await loadTasks();
    return {
      weeklyTaskData: getWeeklyTaskData(tasks),
      categorySplit: getCategorySplit(tasks),
      weeklyLearningHours: getWeeklyLearningHours(tasks),
    };
  },
};

// Tasks now live in Supabase (per-user). Always read the real task list so the
// dashboard reflects actual user data — never seeded demo tasks.
async function loadTasks(): Promise<import('../types').Task[]> {
  const { getTasks } = await import('./taskService');
  return getTasks();
}

export const classService = {
  async getClasses(): Promise<ClassSession[]> {
    await delay(260);
    return structuredClone(dataClasses);
  },
  async createClass(input: Omit<ClassSession, 'id'>): Promise<ClassSession> {
    await delay(180);
    const cls: ClassSession = { ...input, id: uid('cls') };
    dataClasses.push(cls);
    save('classes', dataClasses);
    return structuredClone(cls);
  },
  async updateClass(id: string, patch: Partial<ClassSession>): Promise<ClassSession> {
    await delay(160);
    const c = dataClasses.find((x) => x.id === id);
    if (!c) throw new Error(`Class ${id} not found`);
    Object.assign(c, patch);
    save('classes', dataClasses);
    return structuredClone(c);
  },
  async deleteClass(id: string): Promise<void> {
    await delay(140);
    const i = dataClasses.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataClasses.splice(i, 1);
      save('classes', dataClasses);
    }
  },
};

export const jobService = {
  async getJobs(): Promise<Job[]> {
    await delay(300);
    return structuredClone(dataJobs);
  },
  async getJob(id: string) {
    await delay(180);
    return structuredClone(dataJobs.find((j) => j.id === id) ?? null);
  },
  async createJob(input: Omit<Job, 'id'>): Promise<Job> {
    await delay(200);
    const job: Job = { ...input, id: uid('job') };
    dataJobs.unshift(job);
    save('jobs', dataJobs);
    return structuredClone(job);
  },
  async updateJob(id: string, patch: Partial<Job>): Promise<Job> {
    await delay(160);
    const job = dataJobs.find((j) => j.id === id);
    if (!job) throw new Error(`Job ${id} not found`);
    Object.assign(job, patch);
    save('jobs', dataJobs);
    return structuredClone(job);
  },
  async deleteJob(id: string): Promise<void> {
    await delay(140);
    const i = dataJobs.findIndex((j) => j.id === id);
    if (i >= 0) {
      dataJobs.splice(i, 1);
      save('jobs', dataJobs);
    }
  },
  async saveJob(id: string) {
    await delay(160);
    const job = dataJobs.find((j) => j.id === id);
    if (job) {
      job.applicationStatus = 'saved';
      save('jobs', dataJobs);
    }
    return structuredClone(job);
  },
  async setJobStatus(id: string, status: ApplicationStatus) {
    await delay(160);
    const job = dataJobs.find((j) => j.id === id);
    if (job) {
      job.applicationStatus = status;
      save('jobs', dataJobs);
    }
    return structuredClone(job);
  },
};

export const workshopService = {
  async getWorkshops(): Promise<Workshop[]> {
    await delay(300);
    return structuredClone(dataWorkshops);
  },
  async createWorkshop(input: Omit<Workshop, 'id'>): Promise<Workshop> {
    await delay(200);
    const w: Workshop = { ...input, id: uid('ws') };
    dataWorkshops.unshift(w);
    save('workshops', dataWorkshops);
    return structuredClone(w);
  },
  async updateWorkshop(id: string, patch: Partial<Workshop>): Promise<Workshop> {
    await delay(160);
    const w = dataWorkshops.find((x) => x.id === id);
    if (!w) throw new Error(`Workshop ${id} not found`);
    Object.assign(w, patch);
    save('workshops', dataWorkshops);
    return structuredClone(w);
  },
  async deleteWorkshop(id: string): Promise<void> {
    await delay(140);
    const i = dataWorkshops.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataWorkshops.splice(i, 1);
      save('workshops', dataWorkshops);
    }
  },
};

export const courseService = {
  async getCourses(): Promise<Course[]> {
    await delay(280);
    return structuredClone(dataCourses);
  },
  async createCourse(input: Omit<Course, 'id'>): Promise<Course> {
    await delay(200);
    const c: Course = { ...input, id: uid('course') };
    dataCourses.push(c);
    save('courses', dataCourses);
    return structuredClone(c);
  },
  async updateCourse(id: string, patch: Partial<Course>): Promise<Course> {
    await delay(160);
    const c = dataCourses.find((x) => x.id === id);
    if (!c) throw new Error(`Course ${id} not found`);
    Object.assign(c, patch);
    save('courses', dataCourses);
    return structuredClone(c);
  },
  async deleteCourse(id: string): Promise<void> {
    await delay(140);
    const i = dataCourses.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataCourses.splice(i, 1);
      save('courses', dataCourses);
    }
  },
};

export const skillService = {
  async getSkills(): Promise<Skill[]> {
    await delay(240);
    return structuredClone(dataSkills);
  },
  async createSkill(input: Omit<Skill, 'id'>): Promise<Skill> {
    await delay(160);
    const s: Skill = { ...input, id: uid('sk') };
    dataSkills.push(s);
    save('skills', dataSkills);
    return structuredClone(s);
  },
  async updateSkill(id: string, patch: Partial<Skill>): Promise<Skill> {
    await delay(140);
    const s = dataSkills.find((x) => x.id === id);
    if (!s) throw new Error(`Skill ${id} not found`);
    Object.assign(s, patch);
    save('skills', dataSkills);
    return structuredClone(s);
  },
  async deleteSkill(id: string): Promise<void> {
    await delay(120);
    const i = dataSkills.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataSkills.splice(i, 1);
      save('skills', dataSkills);
    }
  },
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    await delay(260);
    return structuredClone(dataProjects);
  },
  async createProject(input: Omit<Project, 'id'>): Promise<Project> {
    await delay(200);
    const project: Project = { ...input, id: uid('prj') };
    dataProjects.unshift(project);
    save('projects', dataProjects);
    return structuredClone(project);
  },
  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    await delay(160);
    const p = dataProjects.find((x) => x.id === id);
    if (!p) throw new Error(`Project ${id} not found`);
    Object.assign(p, patch);
    save('projects', dataProjects);
    return structuredClone(p);
  },
  async deleteProject(id: string): Promise<void> {
    await delay(140);
    const i = dataProjects.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataProjects.splice(i, 1);
      save('projects', dataProjects);
    }
  },
};

export const profileService = {
  async getProfile(): Promise<Profile> {
    await delay(300);
    return structuredClone(dataProfile);
  },
  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    await delay(240);
    Object.assign(dataProfile, patch);
    saveObj('profile', dataProfile);
    return structuredClone(dataProfile);
  },
};

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(220);
    return structuredClone(dataNotifications);
  },
  async createNotification(input: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await delay(80);
    const n: Notification = { ...input, id: uid('notif'), createdAt: new Date().toISOString() };
    dataNotifications.unshift(n);
    save('notifications', dataNotifications);
    return structuredClone(n);
  },
  async markAllRead(): Promise<void> {
    await delay(120);
    dataNotifications.forEach((n) => (n.read = true));
    save('notifications', dataNotifications);
  },
  async markRead(id: string): Promise<void> {
    await delay(80);
    const n = dataNotifications.find((x) => x.id === id);
    if (n) {
      n.read = true;
      save('notifications', dataNotifications);
    }
  },
  async deleteNotification(id: string): Promise<void> {
    await delay(80);
    const i = dataNotifications.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataNotifications.splice(i, 1);
      save('notifications', dataNotifications);
    }
  },
};

export const activityService = {
  async getActivities(): Promise<ActivityEvent[]> {
    await delay(240);
    return structuredClone(dataActivities);
  },
  async logActivity(input: Omit<ActivityEvent, 'id' | 'timestamp'>): Promise<ActivityEvent> {
    await delay(60);
    const a: ActivityEvent = { ...input, id: uid('act'), timestamp: new Date().toISOString() };
    dataActivities.unshift(a);
    save('activities', dataActivities);
    return structuredClone(a);
  },
};

export const insightService = {
  async getInsights(): Promise<AIInsight[]> {
    await delay(260);
    return structuredClone(dataInsights);
  },
  async createInsight(input: Omit<AIInsight, 'id' | 'createdAt'>): Promise<AIInsight> {
    await delay(120);
    const ins: AIInsight = { ...input, id: uid('ins'), createdAt: new Date().toISOString() };
    dataInsights.unshift(ins);
    save('ai-insights', dataInsights);
    return structuredClone(ins);
  },
  async dismissInsight(id: string): Promise<void> {
    await delay(100);
    const i = dataInsights.findIndex((x) => x.id === id);
    if (i >= 0) {
      dataInsights.splice(i, 1);
      save('ai-insights', dataInsights);
    }
  },
};

export const learningLog = {
  async getStudyDays(): Promise<string[]> {
    await delay(120);
    const { useTaskStore } = await import('../store/taskStore');
    const doneLearning = useTaskStore
      .getState()
      .tasks.filter(
        (t) => t.status === 'done' && (t.category === 'learning' || t.category === 'career'),
      );
    const daySet = new Set<string>();
    for (const t of doneLearning) {
      const day = new Date(t.updatedAt).toDateString();
      daySet.add(day);
    }
    return Array.from(daySet).map((d) => new Date(d).toISOString());
  },
};
