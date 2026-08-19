import React from 'react';
import { twMerge } from 'tailwind-merge';

export const inputClasses =
'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 transition focus:border-blush/60 focus:bg-white/10 focus:outline-none';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, htmlFor, className, children }: FieldProps) {
  return (
    <div className={twMerge('space-y-2', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        {label}
      </label>
      {children}
      {error ?
      <p className="text-xs text-red-300">{error}</p> :
      hint ?
      <p className="text-xs text-white/40">{hint}</p> :
      null}
    </div>);

}