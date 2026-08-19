import { EventCategory } from '../types';

export function formatPrice(amount: number, currency = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return `${formatShortDate(iso)} · ${formatTime(iso)}`;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  soiree: 'Soirée',
  fete: 'Fête',
  voyage: 'Voyage'
};

export const CATEGORY_STYLES: Record<EventCategory, string> = {
  soiree: 'bg-grape/20 text-purple-200 border-grape/40',
  fete: 'bg-blush/20 text-pink-200 border-blush/40',
  voyage: 'bg-sunset/20 text-orange-200 border-sunset/40'
};

export function initials(name: string): string {
  return name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((part) => part[0]?.toUpperCase() ?? '').
  join('');
}