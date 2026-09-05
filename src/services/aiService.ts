import type { ChatAction, ChatMessage, Task } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { delay } from './delay';

const now = () => new Date().toISOString();

/** Get the current user's display name for personalization. */
function currentUserName(): string {
  const user = useAuthStore.getState().user;
  return user?.name?.split(' ')[0] || 'there';
}

export interface AIResult {
  reply: string;
  actions?: ChatAction[];
  context?: string | null;
  suggestedTasks?: Array<{
    title: string;
    priority: Task['priority'];
    category: Task['category'];
    estimatedMinutes: number;
  }>;
}

function detectIntent(q: string): string {
  const s = q.toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));
  if (has('overdue')) return 'overdue';
  if (has('plan my day', 'plan today', 'my day', 'today')) return 'plan';
  if (has('job', 'job search', 'find suitable jobs', 'apply')) return 'jobs';
  if (has('workshop', 'workshop in dadu', 'dadu')) return 'workshops';
  if (has('cv', 'resume', 'curriculum')) return 'cv';
  if (has('portfolio', 'improve portfolio')) return 'portfolio';
  if (has('learn', 'what should i learn', 'study')) return 'learn';
  if (has('progress', 'career progress', 'score')) return 'progress';
  if (has('hello', 'hi', 'hey', 'salam')) return 'hello';
  if (has('thank')) return 'thanks';
  return 'fallback';
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const userName = currentUserName();
  const systemInstruction = `You are "AI Coach" inside Suhail AI (a personal AI operating system). You are helping the user ${userName} with their career, tasks, learning, and productivity.
Your goal is to provide concise, actionable, highly intelligent career guidance, task planning, portfolio tips, job advice, and learning recommendations.
Support formatting with clean Markdown (bullet points, bold highlights).
Keep responses relevant, structured, motivating, and directly helpful.
If asked about today's tasks or plans, provide clear actionable steps.`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${systemInstruction}\n\nUser Question: ${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  // Primary model with fallback
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text.trim();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = new Error(errData?.error?.message || `API error (${res.status})`);
      }
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError || new Error('Failed to fetch response from Gemini API');
}

export async function askAI(q: string): Promise<AIResult> {
  const { geminiApiKey, useLiveAI } = useSettingsStore.getState();

  // If live AI is enabled and we have an API key, call Gemini API
  if (useLiveAI && geminiApiKey && geminiApiKey.trim().length > 10) {
    try {
      const liveReply = await callGeminiAPI(q, geminiApiKey.trim());
      const intent = detectIntent(q);

      const result: AIResult = {
        reply: liveReply,
        context: intent !== 'fallback' ? intent : 'Live AI',
      };

      if (intent === 'jobs') {
        result.actions = [{ label: 'Explore Jobs', type: 'navigate', payload: { to: '/jobs' } }];
      } else if (intent === 'workshops') {
        result.actions = [{ label: 'View Workshops', type: 'navigate', payload: { to: '/workshops' } }];
      } else if (intent === 'cv' || intent === 'portfolio') {
        result.actions = [{ label: 'View Profile', type: 'navigate', payload: { to: '/profile' } }];
      } else if (intent === 'learn') {
        result.actions = [{ label: 'Learning Roadmap', type: 'navigate', payload: { to: '/learning' } }];
      } else if (intent === 'plan') {
        result.actions = [
          { label: 'Create today’s tasks', type: 'create_task', payload: { plan: 'today' } },
          { label: 'Open dashboard', type: 'navigate', payload: { to: '/' } },
        ];
        result.suggestedTasks = [
          { title: 'Complete online web class', priority: 'high', category: 'learning', estimatedMinutes: 120 },
          { title: 'Apply to 2 matching jobs', priority: 'high', category: 'job', estimatedMinutes: 45 },
          { title: '45 minutes of Python practice', priority: 'medium', category: 'learning', estimatedMinutes: 45 },
          { title: 'Improve one portfolio project', priority: 'medium', category: 'portfolio', estimatedMinutes: 60 },
        ];
      }

      return result;
    } catch (err) {
      console.warn('Gemini Live API failed, falling back to local engine:', err);
    }
  }

  // Fallback to offline rule-based demo engine
  await delay(720);
  const intent = detectIntent(q);

  switch (intent) {
    case 'overdue':
      return {
        reply:
          `You have 1 overdue task: **AI assignment draft** (submitted yesterday, still open).\n\n` +
          `Suggestion: finish it today before your 2:00 PM class — it blocks the next learning module.`,
        actions: [{ label: 'See tasks', type: 'navigate', payload: { to: '/tasks?v=overdue' } }],
        context: 'Overdue tasks',
      };
    case 'plan':
      return {
        reply:
          `TODAY'S CAREER PLAN\n\n1. Complete the 2:00 PM web class\n2. Finish the ACT-AI Paper 2 (8:00 PM)\n3. Apply to 2 matching jobs\n4. Spend 45 minutes on Python\n5. Improve one portfolio project\n\nThis fits inside ~7 focused hours with 2 breaks.`,
        actions: [
          { label: 'Create today’s tasks', type: 'create_task', payload: { plan: 'today' } },
          { label: 'Open dashboard', type: 'navigate', payload: { to: '/' } },
        ],
        suggestedTasks: [
          { title: 'Complete online web class', priority: 'high', category: 'learning', estimatedMinutes: 120 },
          { title: 'Apply to 2 matching jobs', priority: 'high', category: 'job', estimatedMinutes: 45 },
          { title: '45 minutes of Python practice', priority: 'medium', category: 'learning', estimatedMinutes: 45 },
          { title: 'Improve one portfolio project', priority: 'medium', category: 'portfolio', estimatedMinutes: 60 },
        ],
        context: 'Today’s plan',
      };
    case 'jobs':
      return {
        reply:
          `Best matches right now:\n\n• **AI Developer** — SK Dev Team · 87% match\n• **Junior AI Engineer** — NeuraSoft (remote, USD) · 11% gap = RAG\n• **AI Automation Consultant** — SK Dev Team · applied\n\nYour biggest-wins come from closing the RAG gap.`,
        actions: [{ label: 'Find suitable jobs', type: 'navigate', payload: { to: '/jobs' } }],
        context: 'Job recommendations',
      };
    case 'workshops':
      return {
        reply:
          `In near Dadu:\n\n• **Career Guidance & Freelancing Expo** — Dadu, in 4 days, free\n• **AI for Youth — Intro to ML** — Hyderabad, in a week\n• **Prompt Engineering Masterclass** — online, free\n\nThe Dadu expo is your best networking value this week.`,
        actions: [{ label: 'Explore workshops', type: 'navigate', payload: { to: '/workshops' } }],
        context: 'Workshops in Dadu',
      };
    case 'cv':
      return {
        reply:
          `Quick CV scan: strong on projects, weak on outcome numbers.\n\n1. Add “3.2× more practice questions” to Study Buddy AI\n2. Add the WhatsApp voice-agent architecture under experience\n3. Move AI skills to the top of the skill list\n\nI can draft the edit if you navigate to Profile.`,
        actions: [{ label: 'Analyze my CV', type: 'navigate', payload: { to: '/profile' } }],
        context: 'CV analysis',
      };
    case 'portfolio':
      return {
        reply:
          `Portfolio score is 74. Fastest wins:\n\n1. Rewrite About with measurable outcomes (+6)\n2. Add a Study Buddy AI case study (+5)\n3. Add 1 more screenshot or result per project (+4)\n\nNothing is published automatically — you approve each change.`,
        actions: [{ label: 'Review portfolio', type: 'navigate', payload: { to: '/portfolio' } }],
        context: 'Portfolio advice',
      };
    case 'learn':
      return {
        reply:
          `Based on your gap analysis, learn **RAG next** (gap 4/10 → 8/10).\n\nRoadmap: RAG in Production → Building AI Agents → Production AI Systems.\n\nThat path unlocks the NeuraSoft and Automation Consultant roles.`,
        actions: [{ label: 'Open Learning', type: 'navigate', payload: { to: '/learning' } }],
        context: 'Learning roadmap',
      };
    case 'progress':
      return {
        reply:
          `Your career readiness is **69/100**.\n\n• Skills: strong (8/10 core)\n• Projects: 2 production-grade AI items\n• Gaps: RAG, AI Agents, Docker\n\nProjection: reach 82 in ~8 weeks if you finish the RAG and Agents courses.`,
        actions: [{ label: 'Show career progress', type: 'navigate', payload: { to: '/career' } }],
        context: 'Career progress',
      };
    case 'hello': {
      const name = currentUserName();
      return {
        reply: `Hello${name !== 'there' ? `, ${name}` : ''}! 👋 I’m your AI Coach. Ask me to “plan my day”, “review jobs”, “find workshops”, or “analyze my CV”.`,
        context: 'Greeting',
      };
    }
    case 'thanks':
      return { reply: `Anytime. Tell me what to tackle next. ✨`, context: null };
    default:
      return {
        reply:
          `I can help you plan days, review jobs, find workshops, check career progress, or improve your portfolio and CV. Try one of the suggested prompts below — or ask me in plain words like “show overdue tasks”.`,
        context: null,
      };
  }
}

export function initialMessages(): ChatMessage[] {
  const name = currentUserName();
  return [
    {
      id: 'chat_0',
      role: 'assistant',
      content:
        `Hello${name !== 'there' ? `, ${name}` : ''}! 👋 I’m your AI Coach — a personal AI operating system for your career, tasks, and learning.\n\n` +
        `Ask me anything about your day, jobs, career, learning or portfolio. I can answer in real-time using Google Gemini.`,
      timestamp: now(),
      actions: null,
      context: null,
    },
  ];
}

export const suggestedPrompts = [
  { id: 'sp_1', label: 'Plan my day', icon: 'calendar-check', prompt: 'Plan my day' },
  { id: 'sp_2', label: 'Show overdue tasks', icon: 'alert-circle', prompt: 'Show overdue tasks' },
  { id: 'sp_3', label: 'Find suitable jobs', icon: 'briefcase', prompt: 'Find suitable jobs' },
  { id: 'sp_4', label: 'Analyze my CV', icon: 'file-text', prompt: 'Analyze my CV' },
  { id: 'sp_5', label: 'Improve my portfolio', icon: 'sparkles', prompt: 'Improve my portfolio' },
  { id: 'sp_6', label: 'What should I learn today?', icon: 'book-open', prompt: 'What should I learn today?' },
  { id: 'sp_7', label: 'Find workshops in Dadu', icon: 'map-pin', prompt: 'Find workshops in Dadu' },
  { id: 'sp_8', label: 'Show my career progress', icon: 'trending-up', prompt: 'Show my career progress' },
];
