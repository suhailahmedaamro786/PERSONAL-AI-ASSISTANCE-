import { useEffect } from 'react';
import { Briefcase, Download } from 'lucide-react';
import { useJobStore } from '../store/jobStore';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { exportRowsAsCSV, fmtDate } from '../lib/export';
import { JobFilters } from '../components/jobs/JobFilters';
import { JobList } from '../components/jobs/JobList';
import { JobDetail } from '../components/jobs/JobDetail';

export default function JobsPage() {
  const fetchJobs = useJobStore((s) => s.fetchJobs);
  const jobs = useJobStore((s) => s.jobs);

  useEffect(() => {
    if (useJobStore.getState().jobs.length === 0) void fetchJobs();
  }, [fetchJobs]);

  function handleExport() {
    exportRowsAsCSV(
      `jobs-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Title', 'Company', 'Location', 'Mode', 'Match %', 'Status', 'Salary Min', 'Salary Max', 'Deadline', 'URL'],
      jobs.map((j) => [
        j.title,
        j.company,
        j.location,
        j.workMode,
        String(j.matchPercentage),
        j.applicationStatus,
        j.salaryMin ? String(j.salaryMin) : '',
        j.salaryMax ? String(j.salaryMax) : '',
        fmtDate(j.deadline),
        j.url ?? '',
      ]),
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Jobs"
        description="Opportunities matched honestly to your skills and career goals."
        icon={<Briefcase className="h-5 w-5" />}
        actions={
          jobs.length > 0 ? (
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="mb-4">
            <JobFilters />
          </div>
          <JobList />
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <JobDetail />
        </aside>
      </div>
    </PageContainer>
  );
}