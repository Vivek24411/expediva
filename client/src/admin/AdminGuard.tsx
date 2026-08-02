import { useQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Seo } from '@/components/layout/Seo';
import { useToast } from '@/components/ui/Toast';
import { ApiError, api, queryKeys } from '@/lib/api';

/**
 * Wraps every /admin route. Probes the session once, then either renders the
 * admin chrome or bounces to the login screen carrying the intended path.
 */
export function AdminGuard() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();

  const session = useQuery({
    queryKey: queryKeys.session,
    queryFn: () => api.me(),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const logout = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Signed out.');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-hairline border-t-ember" />
      </div>
    );
  }

  // 401 → send them to login and remember where they were headed.
  if (session.isError) {
    const unauthenticated = session.error instanceof ApiError && session.error.status === 401;

    if (unauthenticated) {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl text-ink">Can&apos;t reach the server</h1>
          <p className="mt-3 text-sm text-ink-soft">{session.error.message}</p>
          <button
            type="button"
            onClick={() => session.refetch()}
            className="mt-7 bg-ink px-7 py-3.5 text-sm text-paper hover:bg-ember"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Seo title="Admin" noIndex />

      <header className="sticky top-0 z-30 border-b border-hairline bg-ivory/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[92rem] items-center justify-between px-5 sm:px-8">
          <div className="flex items-baseline gap-4">
            <Link to="/admin" className="font-display text-xl tracking-tight text-ink">
              Expediva
            </Link>
            <span className="eyebrow text-ink-muted">Admin</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/" className="hidden text-sm text-ink-soft hover:text-ink sm:block">
              View site
            </Link>
            <span className="hidden text-sm text-ink-muted md:block">{session.data.email}</span>
            <button
              type="button"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="inline-flex items-center gap-2 border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-ink disabled:opacity-50"
            >
              <LogOut size={14} strokeWidth={1.6} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[92rem] px-5 py-10 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
