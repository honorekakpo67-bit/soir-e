import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EventItem, ScanResult, Settings, Ticket } from '../types';
import { seedEvents } from '../data/events';
import { seedTickets } from '../data/tickets';
import { generateId, generateTicketCode } from '../utils/ticket';

const STORAGE_KEY = 'josegem-events-state-v2';

const defaultSettings: Settings = {
  brandName: 'JOSEGEM',
  contactEmail: 'hello@josegem.fr',
  currency: 'XOF',
  autoSendEmail: true,
  payMode: 'test',
  fedapayPublicKey: 'pk_sandbox_SSQ64NsbdCp5aqrXbkCWiFBK',
  fedapaySecretKey: 'sk_sandbox_VT6I8V0RnNZSV_SEujyRecTY',
  adminEmail: 'admin@josegem.fr'
};

interface PersistedState {
  events: EventItem[];
  tickets: Ticket[];
  settings: Settings;
}

interface PurchaseInput {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  sendEmail: boolean;
}

interface AppContextValue {
  events: EventItem[];
  tickets: Ticket[];
  settings: Settings;
  isAdmin: boolean;
  getEvent: (id: string) => EventItem | undefined;
  ticketsForEvent: (id: string) => Ticket[];
  soldCount: (id: string) => number;
  getTicketByCode: (code: string) => Ticket | undefined;
  createEvent: (event: Omit<EventItem, 'id'>) => EventItem;
  updateEvent: (id: string, patch: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  purchase: (input: PurchaseInput) => Ticket;
  resendEmail: (ticketId: string) => void;
  scanCode: (code: string, eventId?: string) => ScanResult;
  resetTicket: (ticketId: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState(): PersistedState {
  if (typeof window === 'undefined') {
    return { events: seedEvents, tickets: seedTickets, settings: defaultSettings };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error('empty');
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      events: parsed.events?.length ? parsed.events : seedEvents,
      tickets: parsed.tickets ?? seedTickets,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) }
    };
  } catch {
    return { events: seedEvents, tickets: seedTickets, settings: defaultSettings };
  }
}

export function AppProvider({ children }: {children: React.ReactNode;}) {
  const initial = useMemo(loadState, []);
  const [events, setEvents] = useState<EventItem[]>(initial.events);
  const [tickets, setTickets] = useState<Ticket[]>(initial.tickets);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem('josegem-admin') === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, tickets, settings }));
  }, [events, tickets, settings]);

  const getEvent = useCallback((id: string) => events.find((event) => event.id === id), [events]);

  const ticketsForEvent = useCallback(
    (id: string) => tickets.filter((ticket) => ticket.eventId === id),
    [tickets]
  );

  const soldCount = useCallback(
    (id: string) =>
    tickets.filter((ticket) => ticket.eventId === id).reduce((sum, ticket) => sum + ticket.quantity, 0),
    [tickets]
  );

  const getTicketByCode = useCallback(
    (code: string) => tickets.find((ticket) => ticket.code.toUpperCase() === code.trim().toUpperCase()),
    [tickets]
  );

  const createEvent = useCallback((event: Omit<EventItem, 'id'>) => {
    const created: EventItem = { ...event, id: generateId('evt') };
    setEvents((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<EventItem>) => {
    setEvents((prev) => prev.map((event) => event.id === id ? { ...event, ...patch } : event));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
    setTickets((prev) => prev.filter((ticket) => ticket.eventId !== id));
  }, []);

  const purchase = useCallback((input: PurchaseInput) => {
    const event = events.find((item) => item.id === input.eventId);
    const ticket: Ticket = {
      id: generateId('tkt'),
      code: generateTicketCode(),
      eventId: input.eventId,
      buyerName: input.buyerName.trim(),
      buyerEmail: input.buyerEmail.trim().toLowerCase(),
      quantity: input.quantity,
      amount: (event?.price ?? 0) * input.quantity,
      purchasedAt: new Date().toISOString(),
      status: 'valid',
      emailSent: input.sendEmail
    };
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  }, [events]);

  const resendEmail = useCallback((ticketId: string) => {
    setTickets((prev) =>
    prev.map((ticket) => ticket.id === ticketId ? { ...ticket, emailSent: true } : ticket)
    );
  }, []);

  const scanCode = useCallback(
    (code: string, eventId?: string): ScanResult => {
      const normalized = code.trim().toUpperCase();
      const at = new Date().toISOString();
      const ticket = tickets.find((item) => item.code.toUpperCase() === normalized);
      if (!ticket) return { outcome: 'not-found', code: normalized, at };
      const event = events.find((item) => item.id === ticket.eventId);
      if (eventId && ticket.eventId !== eventId) {
        return { outcome: 'wrong-event', code: normalized, ticket, event, at };
      }
      if (ticket.status === 'used') {
        return { outcome: 'already-used', code: normalized, ticket, event, at };
      }
      setTickets((prev) =>
      prev.map((item) => item.id === ticket.id ? { ...item, status: 'used', scannedAt: at } : item)
      );
      return { outcome: 'valid', code: normalized, ticket: { ...ticket, status: 'used', scannedAt: at }, event, at };
    },
    [events, tickets]
  );

  const resetTicket = useCallback((ticketId: string) => {
    setTickets((prev) =>
    prev.map((ticket) =>
    ticket.id === ticketId ? { ...ticket, status: 'valid', scannedAt: undefined } : ticket
    )
    );
  }, []);

  const login = useCallback((email: string, password: string) => {
    const ok = email.trim().toLowerCase() === 'admin@josegem.fr' && password === 'josegem2026';
    if (ok) {
      setIsAdmin(true);
      window.sessionStorage.setItem('josegem-admin', 'true');
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    window.sessionStorage.removeItem('josegem-admin');
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDemoData = useCallback(() => {
    setEvents(seedEvents);
    setTickets(seedTickets);
    setSettings(defaultSettings);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      events,
      tickets,
      settings,
      isAdmin,
      getEvent,
      ticketsForEvent,
      soldCount,
      getTicketByCode,
      createEvent,
      updateEvent,
      deleteEvent,
      purchase,
      resendEmail,
      scanCode,
      resetTicket,
      login,
      logout,
      updateSettings,
      resetDemoData
    }),
    [
    events,
    tickets,
    settings,
    isAdmin,
    getEvent,
    ticketsForEvent,
    soldCount,
    getTicketByCode,
    createEvent,
    updateEvent,
    deleteEvent,
    purchase,
    resendEmail,
    scanCode,
    resetTicket,
    login,
    logout,
    updateSettings,
    resetDemoData]

  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}