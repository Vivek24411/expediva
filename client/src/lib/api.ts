import type { Trip, TripInput } from '@shared/types';

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

/** Thrown by every failed request so callers get a status alongside the message. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE}${path}`, {
      // Cookie auth is cross-site in production.
      credentials: 'include',
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return payload as T;
}

/* ------------------------------------------------------------------ public */

export interface TripFilters {
  status?: 'upcoming' | 'past';
  category?: string;
  difficulty?: string;
  month?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export function tripQueryString(filters: TripFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  listTrips: (filters: TripFilters = {}) => request<Trip[]>(`/api/trips${tripQueryString(filters)}`),

  getTrip: (slug: string) => request<Trip>(`/api/trips/${encodeURIComponent(slug)}`),

  /* --------------------------------------------------------------- auth */

  login: (email: string, password: string) =>
    request<{ email: string; name: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  me: () => request<{ email: string; name: string }>('/api/auth/me'),

  /* -------------------------------------------------------------- admin */

  createTrip: (body: Partial<TripInput>) =>
    request<Trip>('/api/trips', { method: 'POST', body: JSON.stringify(body) }),

  updateTrip: (id: string, body: Partial<TripInput>) =>
    request<Trip>(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  setEnrollment: (id: string, enrollmentOpen: boolean) =>
    request<Trip>(`/api/trips/${id}/enrollment`, {
      method: 'PATCH',
      body: JSON.stringify({ enrollmentOpen }),
    }),

  setSeats: (id: string, seatsLeft: number) =>
    request<Trip>(`/api/trips/${id}/seats`, {
      method: 'PATCH',
      body: JSON.stringify({ seatsLeft }),
    }),

  deleteTrip: (id: string) => request<{ ok: true; id: string }>(`/api/trips/${id}`, { method: 'DELETE' }),

  uploadImages: (files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('images', file);
    return request<{ urls: string[] }>('/api/upload', { method: 'POST', body: form });
  },
};

/** Query keys, centralised so invalidation can't drift from fetching. */
export const queryKeys = {
  trips: (filters: TripFilters = {}) => ['trips', filters] as const,
  trip: (slug: string) => ['trip', slug] as const,
  session: ['session'] as const,
};
