export type EventCategory = 'soiree' | 'fete' | 'voyage';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  date: string; // ISO
  endDate?: string; // ISO
  venue: string;
  city: string;
  price: number;
  capacity: number;
  image: string;
  lineup: string[];
  published: boolean;
  featured: boolean;
}

export type TicketStatus = 'valid' | 'used';

export interface Ticket {
  id: string;
  code: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  amount: number;
  purchasedAt: string; // ISO
  status: TicketStatus;
  scannedAt?: string; // ISO
  emailSent: boolean;
}

export interface Settings {
  brandName: string;
  contactEmail: string;
  currency: string;
  autoSendEmail: boolean;
  payMode: 'test' | 'live';
  fedapayPublicKey: string;
  fedapaySecretKey: string;
  adminEmail: string;
}

export type ScanOutcome = 'valid' | 'already-used' | 'not-found' | 'wrong-event';

export interface ScanResult {
  outcome: ScanOutcome;
  code: string;
  ticket?: Ticket;
  event?: EventItem;
  at: string;
}