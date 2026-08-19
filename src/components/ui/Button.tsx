import React from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary:
  'brand-gradient text-white shadow-glow hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-white/80 hover:text-white hover:bg-white/10',
  outline: 'border border-white/20 text-white hover:bg-white/10',
  danger: 'border border-red-400/40 text-red-200 hover:bg-red-500/15',
  light: 'bg-white text-night-900 hover:bg-white/90'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={twMerge(base, variants[variant], sizes[size], className)} {...props} />;
}

export const buttonClasses = (variant: Variant = 'primary', size: Size = 'md', className = '') =>
twMerge(base, variants[variant], sizes[size], className);