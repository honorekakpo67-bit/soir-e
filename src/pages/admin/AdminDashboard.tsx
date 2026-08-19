import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import {
  ArrowUpRightIcon,
  BanknoteIcon,
  ScanLineIcon,
  TicketIcon,
  TrendingUpIcon,
  UsersIcon } from
'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatDateTime, formatPrice, formatShortDate } from '../../utils/format';

export function AdminDashboard() {
  const { events, tickets } = useApp();

  const stats = useMemo(() => {
    const revenue = tickets.reduce((sum, ticket) => sum + ticket.amount, 0);
    const sold = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const scanned = tickets.filter((ticket) => ticket.status === 'used').length;
    const upcoming = events.filter(
      (event) => event.published && new Date(event.date).getTime() > Date.now()
    ).length;
    return { revenue, sold, scanned, upcoming, orders: tickets.length };
  }, [events, tickets]);

  const salesSeries = useMemo(() => {
    const days: {label: string;ventes: number;revenu: number;}[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day.getTime() + 86_400_000);
      const dayTickets = tickets.filter((ticket) => {
        const at = new Date(ticket.purchasedAt).getTime();
        return at >= day.getTime() && at < next.getTime();
      });
      days.push({
        label: formatShortDate(day.toISOString()).slice(0, 6),
        ventes: dayTickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
        revenu: dayTickets.reduce((sum, ticket) => sum + ticket.amount, 0)
      });
    }
    return days;
  }, [tickets]);

  const byEvent = useMemo(
    () =>
    events.
    map((event) => {
      const list = tickets.filter((ticket) => ticket.eventId === event.id);
      return {
        id: event.id,
        name: event.title.split('·')[0].trim(),
        billets: list.reduce((sum, ticket) => sum + ticket.quantity, 0),
        revenu: list.reduce((sum, ticket) => sum + ticket.amount, 0),
        capacity: event.capacity,
        date: event.date
      };
    }).
    sort((a, b) => b.revenu - a.revenu),
    [events, tickets]
  );

  const recent = useMemo(
    () =>
    [...tickets].
    sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()).
    slice(0, 6),
    [tickets]
  );

  const cards = [
  {
    label: "Chiffre d'affaires",
    value: formatPrice(stats.revenue),
    icon: BanknoteIcon,
    hint: `${stats.orders} commandes`
  },
  { label: 'Billets vendus', value: String(stats.sold), icon: TicketIcon, hint: 'toutes dates confondues' },
  {
    label: 'Billets scannés',
    value: String(stats.scanned),
    icon: ScanLineIcon,
    hint: `${stats.orders ? Math.round(stats.scanned / stats.orders * 100) : 0}% de présence`
  },
  { label: 'Événements à venir', value: String(stats.upcoming), icon: UsersIcon, hint: 'publiés' }];


  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-white/50">Vue d&apos;ensemble des ventes et des entrées.</p>
        </div>
        <Link
          to="/admin/scan"
          className="brand-gradient inline-flex h-11 items-center gap-2 self-start rounded-full px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
          
          <ScanLineIcon className="h-4 w-4" /> Ouvrir le scanner
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) =>
        <div key={card.label} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <card.icon className="h-5 w-5 text-blush" />
              </span>
              <TrendingUpIcon className="h-4 w-4 text-emerald-300/70" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-white/50">{card.label}</p>
            <p className="mt-1 text-xs text-white/35">{card.hint}</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Ventes des 14 derniers jours</h2>
            <span className="text-xs text-white/40">billets / jour</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false} />
                
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false} />
                
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                  contentStyle={{
                    background: 'rgba(19,10,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 14,
                    color: '#fff',
                    fontSize: 12
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="ventes"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fill="url(#salesFill)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="mb-5 font-display text-lg font-bold text-white">Revenu par événement</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byEvent.slice(0, 5)} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={92}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false} />
                
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value: number) => [formatPrice(value), 'Revenu']}
                  contentStyle={{
                    background: 'rgba(19,10,36,0.95)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 14,
                    color: '#fff',
                    fontSize: 12
                  }} />
                
                <Bar dataKey="revenu" fill="#a855f7" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Dernières commandes</h2>
            <Link
              to="/admin/billets"
              className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white">
              
              Tout voir <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-white/10">
            {recent.map((ticket) => {
              const event = events.find((item) => item.id === ticket.eventId);
              return (
                <li key={ticket.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{ticket.buyerName}</p>
                    <p className="truncate text-xs text-white/45">
                      {event?.title ?? 'Événement supprimé'} · {formatDateTime(ticket.purchasedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatPrice(ticket.amount)}</p>
                    <p className="font-mono text-[11px] text-white/40">{ticket.code}</p>
                  </div>
                </li>);

            })}
          </ul>
        </section>

        <section className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-white">Remplissage par événement</h2>
          <ul className="space-y-4">
            {byEvent.slice(0, 5).map((item) => {
              const rate = Math.min(100, Math.round(item.billets / item.capacity * 100));
              return (
                <li key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate pr-3 text-white/80">{item.name}</span>
                    <span className="shrink-0 text-white/45">
                      {item.billets}/{item.capacity} · {rate}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="brand-gradient h-full rounded-full" style={{ width: `${rate}%` }} />
                  </div>
                </li>);

            })}
          </ul>
        </section>
      </div>
    </div>);

}