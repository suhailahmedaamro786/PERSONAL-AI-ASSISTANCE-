import { useSettingsStore } from '../store/settingsStore';
import { fetchActionableEmails, type GmailRawEmail } from './gmailService';
import type { Task } from '../types';

export interface ExtractedEmailTask {
  title: string;
  description: string;
  category: Task['category'];
  priority: Task['priority'];
  estimatedMinutes: number;
  deadline: string | null;
  emailSubject: string;
  sender: string;
  emailId: string;
}

interface ScanOptions {
  rawEmailContent?: string;
  useInbox?: boolean;
  maxEmails?: number;
}

/**
 * Scan emails (real Gmail inbox OR pasted text) and use Gemini AI to extract
 * actionable tasks with deadlines, priorities, and categories.
 */
export async function extractTasksFromEmails(
  opts: ScanOptions = {}
): Promise<ExtractedEmailTask[]> {
  const { rawEmailContent, useInbox = true, maxEmails = 20 } = opts;
  const { geminiApiKey, gmailTokens } = useSettingsStore.getState();

  let emailsToScan: GmailRawEmail[] = [];

  // 1. If real inbox requested and we have valid Gmail tokens, fetch real emails.
  if (useInbox && gmailTokens?.access_token) {
    try {
      const fetched = await fetchActionableEmails(maxEmails);
      if (fetched.length > 0) {
        emailsToScan = fetched;
      }
    } catch (e) {
      console.warn('Could not fetch real Gmail inbox:', e);
    }
  }

  // 2. If raw content was pasted, append it as a synthetic email to scan.
  if (rawEmailContent && rawEmailContent.trim()) {
    emailsToScan.push({
      id: 'pasted',
      threadId: 'pasted',
      subject: 'Pasted Email',
      from: 'user',
      body: rawEmailContent,
      date: new Date().toISOString(),
    });
  }

  // 3. If we have nothing to scan, report it clearly (no fake fallback).
  if (emailsToScan.length === 0) {
    return [];
  }

  // 4. Use Gemini AI (via serverless proxy; key is held server-side) to extract tasks.
  {
    try {
      const emailText = emailsToScan
        .map((e) => `[Email ${e.id}]\nSubject: ${e.subject}\nFrom: ${e.from}\nBody:\n${e.body?.slice(0, 2000)}`)
        .join('\n\n---\n\n');

      const prompt = `You are an AI Email Assistant.
Scan the following email(s) and extract actionable tasks: assignment deadlines, interview invitations, workshop attendance, or any action item that requires completing a task.

IMPORTANT RULES:
- Only extract emails that genuinely contain an action item or deadline. Skip newsletters, promotions, notifications, receipts, and pure information emails.
- Provide realistic deadlines relative to today (today is ${new Date().toISOString().slice(0, 10)}). If the email mentions a specific date, use it.
- Return ONLY a valid JSON array. If no actionable tasks, return [].
Each item:
{
  "title": "string (concise actionable title)",
  "description": "string (key details)",
  "category": "learning" | "career" | "job" | "personal" | "portfolio" | "health",
  "priority": "critical" | "high" | "medium" | "low",
  "estimatedMinutes": 60,
  "deadline": "ISO 8601 timestamp string or null",
  "emailSubject": "string",
  "sender": "string",
  "emailId": "string"
}

Emails:
${emailText}`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
          model: 'gemini-1.5-flash',
          apiKey: geminiApiKey.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data?.text;
        if (jsonText) {
          const cleaned = jsonText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('AI Email extraction failed:', e);
    }
  }

  // 5. If AI fails (but we have real emails), extract tasks heuristically.
  return heuristicExtract(emailsToScan);
}

/** Lightweight fallback that converts real emails into tasks without AI. */
function heuristicExtract(emails: GmailRawEmail[]): ExtractedEmailTask[] {
  const results: ExtractedEmailTask[] = [];
  for (const email of emails) {
    const text = `${email.subject} ${email.body ?? ''}`.toLowerCase();
    const isActionable =
      /deadline|due|submit|apply|interview|attend|workshop|assignment|meeting|complete|join|rsvp|confirm|register|schedule/.test(
        text
      );

    if (!isActionable) continue;

    let category: Task['category'] = 'personal';
    let priority: Task['priority'] = 'medium';
    let estimatedMinutes = 45;
    let dayOffset = 3;

    if (/interview|apply|job|hiring|offer|resume/.test(text)) {
      category = 'job';
      priority = /interview|offer/.test(text) ? 'critical' : 'high';
      estimatedMinutes = 60;
    } else if (/workshop|seminar|event|expo|conference/.test(text)) {
      category = 'career';
      priority = 'medium';
      estimatedMinutes = 120;
    } else if (/assignment|exam|course|lecture|class|study|homework/.test(text)) {
      category = 'learning';
      priority = /deadline|due|submit/.test(text) ? 'high' : 'medium';
      estimatedMinutes = 90;
    } else if (/portfolio|project|github|website/.test(text)) {
      category = 'portfolio';
      estimatedMinutes = 60;
    }

    // Try to parse a day mention (Monday, Friday, etc.) relative to today
    const dayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    };
    for (const [day, num] of Object.entries(dayMap)) {
      if (text.includes(day)) {
        const today = new Date().getDay();
        dayOffset = (num - today + 7) % 7 || 7;
        break;
      }
    }

    results.push({
      title: email.subject.replace(/\b(re:|fwd:)\b/gi, '').trim() || 'Action required from email',
      description: `${email.body?.slice(0, 500) || ''}\n[From: ${email.from}]`.trim(),
      category,
      priority,
      estimatedMinutes,
      deadline: new Date(Date.now() + dayOffset * 86400000).toISOString(),
      emailSubject: email.subject,
      sender: email.from,
      emailId: email.id,
    });
  }
  return results;
}

/** Returns true when real, valid Gmail OAuth tokens exist. */
export function isGmailConnected(): boolean {
  const { gmailTokens } = useSettingsStore.getState();
  return !!(gmailTokens && gmailTokens.access_token && gmailTokens.expiry > Date.now());
}
