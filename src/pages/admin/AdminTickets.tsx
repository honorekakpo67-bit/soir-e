import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2Icon,
  DownloadIcon,
  MailIcon,
  QrCodeIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon } from
'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/ui/Button';
import { downloadCsv, toCsv } from '../../utils/csv';
import { downloadDataUrl, ticketQrDataUrl } from '../../utils/ticket';
import { formatDateTime, formatPrice } from '../../utils/format';
import { Ticket } from '../../types';

type StatusFilter = 'all' | 'valid' | 'used';

export function AdminTickets() {
  const { tickets, events, resendEmail, resetTicket } = useApp();
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [preview, setPreview] = useState<Ticket | null>(null);
  const [previewQr, setPreviewQr] = useState('');

  useEffect(() => {
    let active = true;
    if (preview) {
      setPreviewQr('');
      ticketQrDataUrl(preview.code).then((url) => {
        if (active) setPreviewQr(url);
      });
    }
    return () => {
      active = false;
    };
  }, [preview]);

  const filtered = useMemo(
    () =>
    [...tickets].
    sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()).
    filter((ticket) => {
      const matchEvent = eventFilter === 'all' || ticket.eventId === eventFilter;
      const matchStatus = status === 'all' || ticket.status === status;
      const haystack = `${ticket.buyerName} ${ticket.buyerEmail} ${ticket.code}`.toLowerCase();
      const matchQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchEvent && matchStatus && matchQuery;
    }),
    [tickets, eventFilter, status, query]
  );

  const totals = useMemo(
    () => ({
      count: filtered.length,
      revenue: filtered.reduce((sum, ticket) => sum + ticket.amount, 0),
      scanned: filtered.filter((ticket) => ticket.status === 'used').length
    }),
    [filtered]
  );

  function handleExport() {
    const rows = filtered.map((ticket) => {
      const event = events.find((item) => item.id === ticket.eventId);
      return [
      ticket.code,
      event?.title ?? '—',
      ticket.buyerName,
      ticket.buyerEmail,
      ticket.quantity,
      ticket.amount,
      ticket.status === 'used' ? 'Scanné' : 'Valide',
      formatDateTime(ticket.purchasedAt),
      ticket.scannedAt ? formatDateTime(ticket.scannedAt) : '',
      ticket.emailSent ? 'Oui' : 'Non'];

    });
    const csv = toCsv(
      [
      'Code',
      'Événement',
      'Nom',
      'Email',
      'Quantité',
      'Montant',
      'Statut',
      'Acheté le',
      'Scanné le',
      'Email envoyé'],

      rows
    );
    downloadCsv(`billets-josegem-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`${rows.length} billets exportés`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Billets</h1>
          <p className="mt-1 text-sm text-white/50">
            {totals.count} billets · {formatPrice(totals.revenue)} · {totals.scanned} scannés
          </p>
        </div>
        <Button onClick={handleExport} className="self-start">
          <DownloadIcon className="h-4 w-4" /> Exporter en CSV
        </Button>
      </header>

      <div className="glass flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, email ou code billet…"
            aria-label="Rechercher un billet"
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:border-blush/50 focus:outline-none" />
          
        </div>
        <select
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value)}
          aria-label="Filtrer par événement"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-blush/50 focus:outline-none">
          
          <option value="all" className="bg-night-800">
            Tous les événements
          </option>
          {events.map((event) =>
          <option key={event.id} value={event.id} className="bg-night-800">
              {event.title}
            </option>
          )}
        </select>
        <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {(
          [
          ['all', 'Tous'],
          ['valid', 'Valides'],
          ['used', 'Scannés']] as
          [StatusFilter, string][]).
          map(([value, label]) =>
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            status === value ? 'brand-gradient text-white' : 'text-white/55 hover:text-white'}`
            }>
            
              {label}
            </button>
          )}
        </div>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[1.1fr_1.4fr_1.4fr_0.7fr_0.8fr_0.9fr] gap-4 border-b border-white/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 lg:grid">
          <span>Code</span>
          <span>Acheteur</span>
          <span>Événement</span>
          <span>Montant</span>
          <span>Statut</span>
          <span className="text-right">Actions</span>
        </div>

        <ul className="divide-y divide-white/10">
          {filtered.map((ticket) => {
            const event = events.find((item) => item.id === ticket.eventId);
            return (
              <li
                key={ticket.id}
                className="grid gap-3 px-5 py-4 transition hover:bg-white/5 lg:grid-cols-[1.1fr_1.4fr_1.4fr_0.7fr_0.8fr_0.9fr] lg:items-center lg:gap-4">
                
                <button
                  type="button"
                  onClick={() => setPreview(ticket)}
                  className="flex items-center gap-2 text-left font-mono text-sm text-white transition hover:text-sunset">
                  
                  <QrCodeIcon className="h-4 w-4 text-white/40" />
                  {ticket.code}
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{ticket.buyerName}</p>
                  <p className="truncate text-xs text-white/45">{ticket.buyerEmail}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/80">{event?.title ?? 'Événement supprimé'}</p>
                  <p className="truncate text-xs text-white/40">
                    Acheté le {formatDateTime(ticket.purchasedAt)}
                  </p>
                </div>
                <p className="text-sm text-white/80">
                  {formatPrice(ticket.amount)}
                  <span className="ml-1 text-xs text-white/40">×{ticket.quantity}</span>
                </p>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    ticket.status === 'used' ?
                    'bg-white/10 text-white/55' :
                    'bg-emerald-400/15 text-emerald-200'}`
                    }>
                    
                    {ticket.status === 'used' ?
                    <>
                        <CheckCircle2Icon className="h-3 w-3" /> Scanné
                      </> :

                    'Valide'
                    }
                  </span>
                  {ticket.scannedAt ?
                  <p className="mt-1 text-[11px] text-white/35">{formatDateTime(ticket.scannedAt)}</p> :
                  null}
                </div>
                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      resendEmail(ticket.id);
                      toast.success(`Billet renvoyé à ${ticket.buyerEmail}`);
                    }}
                    aria-label="Renvoyer par email"
                    className="rounded-xl border border-white/15 p-2 text-white/65 transition hover:bg-white/10 hover:text-white">
                    
                    <MailIcon className="h-4 w-4" />
                  </button>
                  {ticket.status === 'used' ?
                  <button
                    type="button"
                    onClick={() => {
                      resetTicket(ticket.id);
                      toast.success('Billet réactivé');
                    }}
                    aria-label="Réactiver le billet"
                    className="rounded-xl border border-white/15 p-2 text-white/65 transition hover:bg-white/10 hover:text-white">
                    
                      <RotateCcwIcon className="h-4 w-4" />
                    </button> :
                  null}
                </div>
              </li>);

          })}
        </ul>

        {filtered.length === 0 ?
        <div className="px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold text-white">Aucun billet trouvé</p>
            <p className="mt-1 text-sm text-white/50">Ajuste les filtres ou la recherche.</p>
          </div> :
        null}
      </div>

      {preview ?
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/85 p-5 backdrop-blur-sm">
          <div
          role="dialog"
          aria-modal="true"
          aria-label={`Billet ${preview.code}`}
          className="glass-strong w-full max-w-sm rounded-3xl p-6 text-center">
          
            <div className="flex items-start justify-between">
              <h2 className="font-display text-lg font-bold text-white">Billet</h2>
              <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Fermer"
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
              
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-4">
              {previewQr ?
            <img src={previewQr} alt={`QR code ${preview.code}`} className="h-48 w-48" /> :

            <div className="h-48 w-48 animate-pulse rounded-lg bg-night-900/10" />
            }
            </div>

            <p className="mt-4 font-mono text-lg font-bold tracking-[0.1em] text-white">{preview.code}</p>
            <p className="text-sm text-white/55">
              {preview.buyerName} · {preview.buyerEmail}
            </p>

            <Button
            className="mt-5 w-full"
            onClick={() => {
              if (previewQr) downloadDataUrl(previewQr, `billet-${preview.code}.png`);
            }}
            disabled={!previewQr}>
            
              <DownloadIcon className="h-4 w-4" /> Télécharger le PNG
            </Button>
          </div>
        </div> :
      null}
    </div>);

}