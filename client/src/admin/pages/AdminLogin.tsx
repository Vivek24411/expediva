import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Seo } from '@/components/layout/Seo';
import { useToast } from '@/components/ui/Toast';
import { api, queryKeys } from '@/lib/api';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('That email address looks wrong'),
  password: z.string().min(1, 'Enter your password'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const login = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (admin) => {
      queryClient.setQueryData(queryKeys.session, admin);
      toast.success(`Signed in as ${admin.email}`);
      navigate(from, { replace: true });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = schema.safeParse({ email, password });

    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }

    setErrors({});
    login.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-5 py-16">
      <Seo title="Admin sign in" noIndex />

      <div className="w-full max-w-sm">
        <p className="font-display text-2xl tracking-tight text-ink">Expediva</p>
        <h1 className="mt-8 font-display text-3xl tracking-tight text-ink">Sign in</h1>
        <p className="mt-3 text-sm text-ink-soft">Trip management for the Expediva team.</p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="eyebrow mb-2 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="w-full border border-hairline bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:outline-none"
            />
            {errors.email ? (
              <p id="email-error" className="mt-2 text-xs text-ember">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="eyebrow mb-2 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="w-full border border-hairline bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:outline-none"
            />
            {errors.password ? (
              <p id="password-error" className="mt-2 text-xs text-ember">
                {errors.password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-ink py-4 text-sm font-medium tracking-wide text-paper transition-colors hover:bg-ember disabled:opacity-55"
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
