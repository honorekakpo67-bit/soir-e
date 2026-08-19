import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarIcon,
  CheckCircle2Icon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TicketIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { downloadDataUrl, ticketQrDataUrl } from '../utils/ticket';
import { formatDate, formatPrice, formatTime } from '../utils/format';

export function TicketPage() {
  const { code = '' } = useParams();
  const location = useLocation();
  const isFresh = Boolean((location.state as {fresh?: boolean;} | null)?.fresh);
  const { getTicketByCode, getEvent, resendEmail, settings } = useApp();

  const ticket = getTicketByCode(code);
  const event = ticket ? getEvent(ticket.eventId) : undefined;
  const [qr, setQr] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (ticket) {
      ticketQrDataUrl(ticket.code).then((url) => {
        if (active) setQr(url);
      });
    }
    return () => {
      active = false;
    };
  }, [ticket]);

  if (!ticket || !event) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-5 py-32 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Billet introuvable</h1>
        <p className="text-white/55">
          Ce code ne correspond à aucun billet. Vérifie le lien reçu par email.
        </p>
        <Link
          to="/"
          className="brand-gradient inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white">
          
          Retour à l&apos;accueil
        </Link>
      </div>);

  }

  const used = ticket.status === 'used';

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      {isFresh ?
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4">
        
          <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-300" />
          <p className="text-sm text-emerald-100">
            Paiement confirmé. Ton billet est prêt
            {ticket.emailSent ? ` et une copie part vers ${ticket.buyerEmail}.` : '.'}
          </p>
        </motion.div> :
      null}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong overflow-hidden rounded-[2rem] shadow-glow">
        
        <div className="brand-gradient relative px-6 py-6 text-center">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
            {settings.brandName} Events · Billet électronique
          </p>
          <h1 className="relative mt-2 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {event.title}
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6 px-6 py-9 sm:px-10 sm:py-12">
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-blush/25 blur-3xl"
              aria-hidden="true" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6">
              
              {qr ?
              <img
                src={qr}
                alt={`QR code du billet ${ticket.code}`}
                className={`h-56 w-56 sm:h-72 sm:w-72 ${used ? 'opacity-30 grayscale' : ''}`} /> :


              <div className="h-56 w-56 animate-pulse rounded-xl bg-night-900/10 sm:h-72 sm:w-72" />
              }
              {used ?
              <span className="absolute inset-0 flex items-center justify-center">
                  <span className="-rotate-12 rounded-xl border-4 border-red-500/70 px-5 py-2 font-display text-2xl font-extrabold uppercase tracking-widest text-red-500/80">
                    Déjà utilisé
                  </span>
                </span> :
              null}
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Code du billet</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(ticket.code);
                toast.success('Code copié');
              }}
              className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold tracking-[0.12em] text-white transition hover:text-sunset">
              
              {ticket.code}
              <CopyIcon className="h-4 w-4 text-white/40" />
            </button>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (!qr) return;
                downloadDataUrl(qr, `billet-${ticket.code}.png`);
                toast.success('Image du QR code téléchargée');
              }}
              disabled={!qr}
              className="brand-gradient flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
              
              <DownloadIcon className="h-5 w-5" /> Télécharger le QR code
            </button>
            <button
              type="button"
              onClick={() => {
                resendEmail(ticket.id);
                toast.success(`Billet envoyé à ${ticket.buyerEmail}`);
              }}
              className="glass flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition hover:bg-white/15">
              
              <MailIcon className="h-5 w-5" /> Recevoir par email
            </button>
          </div>

          <p className="flex items-center gap-2 text-center text-xs text-white/45">
            <ShieldCheckIcon className="h-4 w-4 text-sunset" />
            Ce QR code est unique et ne peut être validé qu&apos;une seule fois à l&apos;entrée.
          </p>
        </div>

        <div className="relative border-t border-dashed border-white/20 bg-white/5 px-6 py-6 sm:px-10">
          <span className="absolute -left-3.5 -top-3.5 h-7 w-7 rounded-full bg-night-900" aria-hidden="true" />
          <span className="absolute -right-3.5 -top-3.5 h-7 w-7 rounded-full bg-night-900" aria-hidden="true" />
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-white/40">Titulaire</dt>
              <dd className="mt-1 font-medium text-white">{ticket.buyerName}</dd>
              <dd className="text-sm text-white/50">{ticket.buyerEmail}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-white/40">Entrées</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-white">
                <TicketIcon className="h-4 w-4 text-blush" />
                {ticket.quantity} {ticket.quantity > 1 ? 'personnes' : 'personne'} ·{' '}
                {formatPrice(ticket.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-white/40">Date</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium capitalize text-white">
                <CalendarIcon className="h-4 w-4 text-blush" />
                {formatDate(event.date)} · {formatTime(event.date)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-white/40">Lieu</dt>
              <dd className="mt-1 flex items-center gap-2 font-medium text-white">
                <MapPinIcon className="h-4 w-4 text-sunset" />
                {event.venue}, {event.city}
              </dd>
            </div>
          </dl>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-white/45">
          Garde cette page en favori : elle reste accessible avec ton code billet.
        </p>
        <Link
          to="/"
          className="glass inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white transition hover:bg-white/15">
          
          Découvrir d&apos;autres événements
        </Link>
      </div>
    </div>);

}