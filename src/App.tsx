import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/Toast';
import { LoadingState } from './components/ui/states';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OAuthCallback } from './components/auth/OAuthCallback';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ClassesPage = lazy(() => import('./pages/ClassesPage'));
const CareerPage = lazy(() => import('./pages/CareerPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AICoachPage = lazy(() => import('./pages/AICoachPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <Suspense fallback={<LoadingState label="Loading Suhail AI…" className="min-h-screen" />}>
          <Routes>
            <Route path="auth/callback" element={<OAuthCallback />} />
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="career" element={<CareerPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="learning" element={<LearningPage />} />
              <Route path="workshops" element={<WorkshopsPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="ai-coach" element={<AICoachPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Route>
          </Routes>
          <Toaster />
        </Suspense>
      </ProtectedRoute>
    </BrowserRouter>
  );
}
