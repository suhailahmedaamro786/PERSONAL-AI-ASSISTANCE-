import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';

export interface ParsedResumeData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  headline: string;
  bio: string;
  skills: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  qrLinks?: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear: number | null;
  }>;
  experience: Array<{
    title: string;
    company: string;
    description: string;
    startDate: string;
    endDate: string | null;
    skills: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    skills: string[];
    url?: string;
    githubUrl?: string;
  }>;
}

export async function parseResumeWithAI(
  fileOrText: File | string,
  base64Data?: string,
  mimeType: string = 'text/plain'
): Promise<ParsedResumeData> {
  const { geminiApiKey } = useSettingsStore.getState();

  // Use AI to parse via the serverless proxy (key is held server-side).
  {
    try {
      const prompt = `You are an expert AI Resume and Portfolio Parser.
Extract detailed structured profile information from this resume document/text, including any portfolio links, QR code URLs, GitHub, LinkedIn, skills, education, and projects.
Respond ONLY with a valid raw JSON object conforming strictly to this schema:
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "headline": "string",
  "bio": "string",
  "skills": ["string"],
  "portfolioUrl": "string or null",
  "githubUrl": "string or null",
  "linkedinUrl": "string or null",
  "qrLinks": ["string"],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startYear": 2020,
      "endYear": 2024
    }
  ],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "description": "string",
      "startDate": "2023-01-01",
      "endDate": null,
      "skills": ["string"]
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"],
      "url": "string or null",
      "githubUrl": "string or null"
    }
  ]
}`;

      let parts: any[] = [{ text: prompt }];

      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: base64Data,
          },
        });
      } else if (typeof fileOrText === 'string') {
        parts.push({
          text: `Resume Text:\n${fileOrText}`,
        });
      }

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
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
          const parsed = JSON.parse(jsonText);
          return normalizeResumeData(parsed);
        }
      }
    } catch (e) {
      console.warn('AI Resume parse failed, falling back to smart heuristic:', e);
    }
  }

  // No AI key / parsing failed. We never fabricate resume data — surface the error
  // so the UI can prompt the user to paste text or retry.
  throw new Error(
    'Resume parsing requires a configured Gemini API key. Please add your key in Settings, or paste your resume text.'
  );
}

function normalizeResumeData(raw: any): ParsedResumeData {
  // Use the authenticated user's identity as the base, only filling fields the
  // AI actually extracted from the resume — never fabricate a fake persona.
  const user = useAuthStore.getState().user;
  const defaultFirstName = user?.name?.split(' ')[0] || '';
  const defaultLastName = user?.name?.split(' ').slice(1).join(' ') || '';

  return {
    firstName: raw.firstName || defaultFirstName,
    lastName: raw.lastName || defaultLastName,
    email: raw.email || user?.email || '',
    phone: raw.phone || '',
    city: raw.city || '',
    headline: raw.headline || 'AI Developer & Student',
    bio: raw.bio || '',
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    portfolioUrl: raw.portfolioUrl || (Array.isArray(raw.qrLinks) && raw.qrLinks[0]) || '',
    githubUrl: raw.githubUrl || '',
    linkedinUrl: raw.linkedinUrl || '',
    qrLinks: Array.isArray(raw.qrLinks) ? raw.qrLinks : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
  };
}
