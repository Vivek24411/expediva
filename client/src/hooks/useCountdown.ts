import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the deadline has passed. */
  expired: boolean;
}

function diff(target: number): Countdown {
  const ms = target - Date.now();

  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    expired: false,
  };
}

/** Ticks once a second until the deadline, then stops. */
export function useCountdown(deadline: string | Date | undefined): Countdown | null {
  const target = deadline ? new Date(deadline).getTime() : NaN;
  const [value, setValue] = useState<Countdown | null>(() =>
    Number.isNaN(target) ? null : diff(target),
  );

  useEffect(() => {
    if (Number.isNaN(target)) {
      setValue(null);
      return;
    }

    setValue(diff(target));

    const id = window.setInterval(() => {
      const next = diff(target);
      setValue(next);
      if (next.expired) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [target]);

  return value;
}
