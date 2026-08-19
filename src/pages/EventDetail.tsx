import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  MusicIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  TicketIcon,
  UsersIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Countdown } from '../components/public/Countdown';
import { CATEGORY_LABELS, CATEGORY_STYLES, formatDate, formatPrice, formatTime } from '../utils/format';

export function EventDetail() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const { getEvent, soldCount } = useApp();
  const event = getEvent(eventId);

  if (!event) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-5 py-32 text-center">
        <h1 className="font-display text-3xl font-bold text-white">Cet événement n&apos;existe plus</h1>
        <p className="text-white/55">Il a peut-être été retiré. Découvre les autres dates à venir.</p>
        <Link
          to="/"
          className="brand-gradient inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white">
          
          Retour aux événements
        </Link>
      </div>);

  }

  const sold = soldCount(event.id);
  const remaining = Math.max(0, event.capacity - sold);
  const soldOut = remaining === 0;

  return (
    <div className="w-full">
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden sm:h-[52vh]">
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/50 to-night-900/20" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-6xl px-5 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition hover:text-white">
              
              <ArrowLeftIcon className="h-4 w-4" /> Retour
            </button>
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[event.category]}`}>
              
              {CATEGORY_LABELS[event.category]}
            </span>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.35fr_0.65fr] lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8">
          
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <CalendarIcon className="mb-2 h-5 w-5 text-blush" />
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">Date</p>
              <p className="mt-1 text-sm font-medium capitalize text-white">{formatDate(event.date)}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <ClockIcon className="mb-2 h-5 w-5 text-grape" />
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">Horaires</p>
              <p className="mt-1 text-sm font-medium text-white">
                {formatTime(event.date)}
                {event.endDate ? ` → ${formatTime(event.endDate)}` : ''}
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <MapPinIcon className="mb-2 h-5 w-5 text-sunset" />
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">Lieu</p>
              <p className="mt-1 text-sm font-medium text-white">
                {event.venue}
                <span className="block text-white/50">{event.city}</span>
              </p>
            </div>
          </div>

          <section className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">L&apos;ambiance</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-white/65">
              {event.description}
            </p>
          </section>

          {event.lineup.length ?
          <section className="glass rounded-3xl p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                <MusicIcon className="h-5 w-5 text-blush" /> Line-up
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {event.lineup.map((artist) =>
              <li
                key={artist}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
                
                    {artist}
                  </li>
              )}
              </ul>
            </section> :
          null}

          <section className="glass rounded-3xl p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">Infos pratiques</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li className="flex gap-3">
                <QrCodeIcon className="mt-0.5 h-4 w-4 shrink-0 text-sunset" />
                Ton billet est un QR code unique, présenté sur ton téléphone ou imprimé.
              </li>
              <li className="flex gap-3">
                <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sunset" />
                Événement réservé aux personnes majeures. Pièce d&apos;identité demandée à l&apos;entrée.
              </li>
              <li className="flex gap-3">
                <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-sunset" />
                Capacité limitée à {event.capacity} personnes.
              </li>
            </ul>
          </section>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:sticky lg:top-28 lg:self-start">
          
          <div className="glass-strong space-y-5 rounded-3xl p-6 shadow-glow">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Ouverture des portes dans
              </p>
              <Countdown target={event.date} className="mt-3" compact />
            </div>

            <div className="flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/40">Prix du billet</p>
                <p className="font-display text-3xl font-extrabold text-white">{formatPrice(event.price)}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                {remaining} restants
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="brand-gradient h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, sold / event.capacity * 100)}%` }} />
                
              </div>
              <p className="text-xs text-white/45">{sold} billets déjà vendus</p>
            </div>

            {soldOut ?
            <p className="rounded-2xl bg-white/5 px-4 py-4 text-center text-sm text-white/60">
                Complet — inscris-toi à la newsletter pour les prochaines dates.
              </p> :

            <Link
              to={`/paiement/${event.id}`}
              className="brand-gradient flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition hover:brightness-110">
              
                <TicketIcon className="h-5 w-5" /> Acheter mon billet
              </Link>
            }

            <p className="text-center text-xs text-white/40">
              Sans compte · paiement fedaPay · QR code immédiat
            </p>
          </div>
        </motion.aside>
      </div>
    </div>);

}