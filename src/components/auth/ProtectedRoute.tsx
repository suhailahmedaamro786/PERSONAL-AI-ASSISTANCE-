import { useAuthStore } from '../../store/authStore';
import { LoginPage } from './LoginPage';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
