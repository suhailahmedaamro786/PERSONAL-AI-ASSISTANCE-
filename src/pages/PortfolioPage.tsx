import { useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { PortfolioStats } from '../components/portfolio/PortfolioStats';
import { PortfolioGrid } from '../components/portfolio/PortfolioGrid';
import { usePortfolioStore } from '../store/portfolioStore';

export default function PortfolioPage() {
  const fetch = usePortfolioStore((s) => s.fetch);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <PageContainer>
      <PageHeader
        title="Portfolio"
        description="Your portfolio command center — flag the projects you want on your profile."
        icon={<FolderOpen className="h-5 w-5" />}
      />

      <div className="space-y-5">
        <PortfolioStats />
        <PortfolioGrid />
      </div>
    </PageContainer>
  );
}