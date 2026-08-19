import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface CountdownProps {
  target: string;
  className?: string;
  compact?: boolean;
}

function diffParts(target: number, now: number) {
  const total = Math.max(0, target - now);
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000 % 24),
    minutes: Math.floor(total / 60_000 % 60),
    seconds: Math.floor(total / 1000 % 60)
  };
}

export function Countdown({ target, className, compact = false }: CountdownProps) {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = diffParts(targetMs, now);
  const items: [string, number][] = [
  ['Jours', parts.days],
  ['Heures', parts.hours],
  ['Min', parts.minutes],
  ['Sec', parts.seconds]];


  if (parts.total === 0) {
    return (
      <div className={twMerge('glass rounded-2xl px-5 py-3 text-sm font-semibold text-sunset', className)}>
        C&apos;est maintenant · les portes sont ouvertes
      </div>);

  }

  return (
    <div className={twMerge('flex items-stretch gap-2 sm:gap-3', className)} role="timer" aria-live="off">
      {items.map(([label, value]) =>
      <div
        key={label}
        className={twMerge(
          'glass flex flex-1 flex-col items-center justify-center rounded-2xl',
          compact ? 'min-w-[58px] px-2 py-2' : 'min-w-[68px] px-3 py-3 sm:px-5'
        )}>
        
          <span
          className={twMerge(
            'font-display font-bold tabular-nums text-white',
            compact ? 'text-xl' : 'text-2xl sm:text-4xl'
          )}>
          
            {String(value).padStart(2, '0')}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {label}
          </span>
        </div>
      )}
    </div>);

}