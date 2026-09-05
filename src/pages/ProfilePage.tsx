import { useRef, useState } from 'react';
import {
  Award,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Target,
  User,
  Upload,
  Sparkles,
  QrCode,
  CheckCircle,
  Link,
  LogOut,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, SectionLabel } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import { parseResumeWithAI, type ParsedResumeData } from '../services/resumeScannerService';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import type { Profile } from '../types';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-text-muted">{icon}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
        <p className="text-sm text-text">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore();
  const { toast } = useUIStore();

  const [scanning, setScanning] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = user?.profile || null;
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : user?.name || 'User';
  const hasProfile = !!profile;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStatus('idle');
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        const result = await parseResumeWithAI(text);
        setParsedData(result);
        setScanStatus('success');
        setScanMessage(`Successfully parsed "${file.name}" — extracted ${result.skills.length} skills, ${result.experience.length} experiences, ${result.projects.length} projects, and ${result.qrLinks?.length || 0} portfolio links.`);
      } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const result = await parseResumeWithAI(file, base64, file.type);
          setParsedData(result);
          setScanStatus('success');
          setScanMessage(`Successfully scanned "${file.name}" — extracted ${result.skills.length} skills, ${result.experience.length} experiences, ${result.projects.length} projects, and ${result.qrLinks?.length || 0} portfolio links/QR codes.`);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const result = await parseResumeWithAI(text);
        setParsedData(result);
        setScanStatus('success');
        setScanMessage(`Parsed "${file.name}" successfully.`);
      }
    } catch {
      setScanStatus('error');
      setScanMessage('Failed to parse resume. Try pasting the text manually.');
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTextParse = async () => {
    if (!resumeText.trim()) return;
    setScanning(true);
    setScanStatus('idle');
    try {
      const result = await parseResumeWithAI(resumeText);
      setParsedData(result);
      setScanStatus('success');
      setScanMessage(`Parsed text — extracted ${result.skills.length} skills, ${result.experience.length} experiences, ${result.projects.length} projects, and ${result.qrLinks?.length || 0} portfolio links/QR codes.`);
    } catch {
      setScanStatus('error');
      setScanMessage('Failed to parse text. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleApplyParsedData = () => {
    if (!parsedData) return;
    const newProfile: Profile = {
      id: `profile_${user?.id || Date.now()}`,
      firstName: parsedData.firstName || (user?.name || '').split(' ')[0] || 'User',
      lastName: parsedData.lastName || (user?.name || '').split(' ').slice(1).join(' ') || '',
      email: parsedData.email || user?.email || '',
      phone: parsedData.phone || null,
      city: parsedData.city || '',
      bio: parsedData.bio || '',
      headline: parsedData.headline || 'AI Developer',
      avatarUrl: null,
      education: (parsedData.education || []).map((e) => ({
        ...e,
        gpa: null,
      })),
      diploma: null,
      skills: parsedData.skills || [],
      certifications: [],
      courses: [],
      projects: (parsedData.projects || []).map((_, i) => `proj_${i}`),
      achievements: [],
      experience: (parsedData.experience || []).map((e) => ({
        title: e.title,
        company: e.company,
        description: e.description,
        skills: e.skills,
        startDate: e.startDate,
        endDate: e.endDate,
      })),
      careerGoals: {
        targetRole: parsedData.headline || 'AI Engineer',
        targetCompany: null,
        targetTimeline: '6 months',
        topPriorities: ['Build AI Projects', 'Master RAG & Agents', 'Get Hired'],
      },
      cvUrl: parsedData.portfolioUrl || null,
      portfolioUrl: parsedData.portfolioUrl || parsedData.githubUrl || null,
      completionPercentage: Math.min(
        100,
        40 +
          (parsedData.skills.length > 0 ? 20 : 0) +
          (parsedData.education.length > 0 ? 15 : 0) +
          (parsedData.experience.length > 0 ? 15 : 0) +
          (parsedData.projects.length > 0 ? 10 : 0)
      ),
    };
    updateProfile(newProfile);
    setParsedData(null);
    toast({
      title: 'Profile Created!',
      description: 'Your profile has been auto-populated from your resume.',
      variant: 'success',
    });
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged Out', description: 'You have been signed out.', variant: 'info' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description={hasProfile ? 'Your professional profile — updated from your resume.' : 'Upload your resume to build your professional profile.'}
        actions={
          <div className="flex items-center gap-2">
            {hasProfile && (
              <Button variant="danger" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
              </Button>
            )}
          </div>
        }
      />

      {/* No profile state — prompt to upload resume */}
      {!hasProfile && scanStatus !== 'success' && (
        <Card className="mb-6 border-brand/30 bg-brand-subtle/30">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 text-center max-w-lg mx-auto">
              <div className="rounded-2xl bg-brand/10 p-4">
                <Sparkles className="h-10 w-10 text-brand" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Build Your Professional Profile</h3>
                <p className="text-sm text-text-muted mt-1">
                  Upload your resume (PDF, image, or paste text) — our AI will scan it and build your complete professional profile with skills, experience, education, projects, and portfolio links.
                </p>
              </div>
              <Button variant="primary" size="lg" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Upload Resume to Build Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Scanner — always visible */}
      <Card className="mb-6">
        <CardHeader>
          <SectionLabel icon={<Sparkles className="h-4 w-4 text-brand" />} title={hasProfile ? 'Re-Scan Resume (Update Profile)' : 'AI Resume Scanner'} />
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-text-muted">
            Upload your resume (PDF, image, or text) — AI will extract your profile, skills, projects, and portfolio/QR links.
          </p>

          {/* File upload */}
          <div
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface-hover p-4 text-center transition-colors hover:border-brand/50 hover:bg-brand/5 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-brand" />
            <p className="text-xs font-medium text-text-secondary">Click to upload Resume</p>
            <p className="text-[11px] text-text-muted">PDF, PNG, JPG, TXT</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Toggle text paste */}
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="w-full text-left text-[11px] font-medium text-brand hover:underline"
          >
            {showTextInput ? 'Hide text box' : 'Or paste resume text instead'}
          </button>

          {showTextInput && (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-text placeholder:text-text-muted focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <Button
                size="sm"
                variant="primary"
                loading={scanning}
                onClick={handleTextParse}
                disabled={!resumeText.trim()}
                className="w-full"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Parse with AI
              </Button>
            </div>
          )}

          {scanning && (
            <div className="flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/10 p-3 text-sm text-brand">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">Scanning resume with AI... extracting skills, experience, education, and portfolio links...</span>
            </div>
          )}

          {/* Scan results — ready to apply */}
          {scanStatus === 'success' && parsedData && (
            <div className="space-y-3">
              <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-medium">{scanMessage}</p>
                </div>

                {parsedData.portfolioUrl && (
                  <div className="flex items-center gap-1.5 pl-6 text-text-secondary">
                    <Link className="h-3 w-3 text-brand" />
                    <span>Portfolio: <a href={parsedData.portfolioUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">{parsedData.portfolioUrl}</a></span>
                  </div>
                )}
                {parsedData.githubUrl && (
                  <div className="flex items-center gap-1.5 pl-6 text-text-secondary">
                    <ExternalLink className="h-3 w-3 text-brand" />
                    <span>GitHub: <a href={parsedData.githubUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">{parsedData.githubUrl}</a></span>
                  </div>
                )}
                {parsedData.linkedinUrl && (
                  <div className="flex items-center gap-1.5 pl-6 text-text-secondary">
                    <ExternalLink className="h-3 w-3 text-brand" />
                    <span>LinkedIn: <a href={parsedData.linkedinUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">{parsedData.linkedinUrl}</a></span>
                  </div>
                )}
                {parsedData.qrLinks && parsedData.qrLinks.length > 0 && (
                  <div className="flex items-start gap-1.5 pl-6 text-text-secondary">
                    <QrCode className="h-3 w-3 text-warning shrink-0 mt-0.5" />
                    <span>QR/Portfolio Links: {parsedData.qrLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noreferrer" className="text-brand hover:underline block">{link}</a>
                    ))}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pl-6 pt-1">
                  {parsedData.skills.slice(0, 10).map((s) => (
                    <Badge key={s} tone="brand" className="text-[10px]">{s}</Badge>
                  ))}
                  {parsedData.skills.length > 10 && (
                    <Badge tone="neutral" className="text-[10px]">+{parsedData.skills.length - 10} more</Badge>
                  )}
                </div>
              </div>

              <Button variant="success" size="md" className="w-full" onClick={handleApplyParsedData}>
                <CheckCircle className="h-4 w-4 mr-1.5" /> Apply to My Profile
              </Button>
            </div>
          )}

          {scanStatus === 'error' && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              {scanMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile content — only shown after profile is built */}
      {hasProfile && profile && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Identity card */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Avatar name={fullName} size="xl" />
                  <div>
                    <h2 className="text-base font-semibold text-text">{fullName}</h2>
                    <p className="text-sm text-text-muted">{profile.headline}</p>
                  </div>
                  {profile.completionPercentage < 100 && (
                    <div className="w-full">
                      <div className="mb-1 flex justify-between text-[11px] text-text-muted">
                        <span>Profile completeness</span>
                        <span>{profile.completionPercentage}%</span>
                      </div>
                      <Progress value={profile.completionPercentage} className="h-1.5" />
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="City" value={profile.city} />
                </div>

                {(profile.cvUrl || profile.portfolioUrl) && (
                  <div className="mt-4 flex flex-col gap-2">
                    {profile.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Portfolio
                      </a>
                    )}
                    {profile.cvUrl && (
                      <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View CV
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <SectionLabel icon={<User className="h-4 w-4 text-brand" />} title="Skills" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s) => (
                      <Badge key={s} tone="brand">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {profile.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <SectionLabel icon={<Award className="h-4 w-4 text-brand" />} title="Achievements" />
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {profile.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right columns (2-col span) */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-text-secondary">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <Card>
                <CardHeader>
                  <SectionLabel icon={<GraduationCap className="h-4 w-4 text-brand" />} title="Education" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education.map((ed, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-text">{ed.institution}</p>
                        <span className="shrink-0 text-xs text-text-muted">
                          {ed.startYear} – {ed.endYear ?? 'Present'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{ed.degree} · {ed.field}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {profile.experience.length > 0 && (
              <Card>
                <CardHeader>
                  <SectionLabel icon={<Briefcase className="h-4 w-4 text-brand" />} title="Experience" />
                </CardHeader>
                <CardContent className="space-y-5">
                  {profile.experience.map((ex, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text">{ex.title}</p>
                          <p className="text-sm text-text-secondary">{ex.company}</p>
                        </div>
                        <span className="shrink-0 text-xs text-text-muted">
                          {new Date(ex.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {' – '}
                          {ex.endDate ? new Date(ex.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-text-muted">{ex.description}</p>
                      {ex.skills && ex.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ex.skills.map((s) => (
                            <Badge key={s} tone="neutral" className="text-[11px]">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Career Goals */}
            {profile.careerGoals && (
              <Card>
                <CardHeader>
                  <SectionLabel icon={<Target className="h-4 w-4 text-brand" />} title="Career Goals" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-surface-hover p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Target Role</p>
                      <p className="mt-0.5 text-sm font-semibold text-text">{profile.careerGoals.targetRole}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-hover p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Timeline</p>
                      <p className="mt-0.5 text-sm font-semibold text-text">{profile.careerGoals.targetTimeline}</p>
                    </div>
                  </div>
                  {profile.careerGoals.topPriorities && profile.careerGoals.topPriorities.length > 0 && (
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-muted">Top Priorities</p>
                      <ul className="space-y-1.5">
                        {profile.careerGoals.topPriorities.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-text">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                              {i + 1}
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
