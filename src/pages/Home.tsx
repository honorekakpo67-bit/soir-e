import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  MapPinIcon,
  QrCodeIcon,
  ScanLineIcon,
  SearchIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { EventCard } from '../components/public/EventCard';
import { Countdown } from '../components/public/Countdown';
import { CATEGORY_LABELS, formatDate, formatPrice, formatTime } from '../utils/format';
import { EventCategory } from '../types';

const filters: {value: 'all' | EventCategory;label: string;}[] = [
{ value: 'all', label: 'Tout' },
{ value: 'soiree', label: 'Soirées' },
{ value: 'fete', label: 'Fêtes' },
{ value: 'voyage', label: 'Voyages' }];


const steps = [
{
  icon: SearchIcon,
  title: 'Choisis ton événement',
  text: 'Parcours les soirées, fêtes et voyages à venir. Tout est en accès libre, sans créer de compte.'
},
{
  icon: CreditCardIcon,
  title: 'Paie en 30 secondes',
  text: 'Ton prénom, ton email. Paiement sécurisé par fedaPay, confirmation immédiate.'
},
{
  icon: QrCodeIcon,
  title: 'Reçois ton QR code',
  text: 'Ton billet s’affiche à l’écran. Télécharge l’image ou reçois-la par email, c’est tout.'
},
{
  icon: ScanLineIcon,
  title: 'Scan à l’entrée',
  text: 'On scanne ton QR code à la porte. Une seule validation possible par billet.'
}];


const faq = [
{
  q: 'Dois-je créer un compte ?',
  a: 'Non. Tu renseignes uniquement ton nom et ton email au moment du paiement. Aucun mot de passe, aucun compte.'
},
{
  q: 'Comment je reçois mon billet ?',
  a: "Immédiatement après le paiement, ton QR code s'affiche à l'écran. Tu peux télécharger l'image sur ton téléphone et/ou la recevoir par email."
},
{
  q: 'Et si je perds mon QR code ?',
  a: "Il reste accessible via le lien reçu par email. Sinon, contacte-nous avec l'email utilisé lors de l'achat."
},
{
  q: 'Le QR code peut-il servir deux fois ?',
  a: "Non. Chaque QR code est unique et n'est validable qu'une seule fois à l'entrée."
}];


export function Home() {
  const { events, soldCount } = useApp();
  const [filter, setFilter] = useState<'all' | EventCategory>('all');
  const [query, setQuery] = useState('');

  const published = useMemo(
    () =>
    events.
    filter((event) => event.published).
    sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const nextEvent = published[0];

  const visible = useMemo(
    () =>
    published.filter((event) => {
      const matchCategory = filter === 'all' || event.category === filter;
      const matchQuery =
      !query.trim() ||
      `${event.title} ${event.city} ${event.venue}`.toLowerCase().includes(query.trim().toLowerCase());
      return matchCategory && matchQuery;
    }),
    [published, filter, query]
  );

  return (
    <div className="w-full">
      <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:pt-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7">
            
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sunset" />
              Saison été · automne 2026
            </span>

            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Les nuits qu&apos;on
              <br />
              <span className="text-gradient">raconte encore</span>
              <br />
              en septembre.
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
              Soirées rooftop, festivals en plein air et escapades en bateau. Réserve en trente secondes, sans
              compte : ton QR code arrive tout de suite, il est ton billet.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#evenements"
                className="brand-gradient inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:brightness-110">
                
                Voir les événements <ArrowRightIcon className="h-5 w-5" />
              </a>
              <a
                href="#comment"
                className="glass inline-flex h-14 items-center justify-center rounded-full px-8 text-base font-semibold text-white transition hover:bg-white/15">
                
                Comment ça marche
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 text-sm text-white/45">
              <span>Sans inscription</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" />
              <span>Paiement fedaPay</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/25 sm:block" />
              <span>QR code instantané</span>
            </div>
          </motion.div>

          {nextEvent ?
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative overflow-hidden rounded-[2rem] p-2 shadow-glow">
            
              <div className="relative overflow-hidden rounded-[1.6rem]">
                <img
                src={nextEvent.image}
                alt={nextEvent.title}
                className="h-56 w-full object-cover sm:h-64" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-night-900/95 via-night-900/30 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sunset">
                    Prochain rendez-vous
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white">{nextEvent.title}</h2>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-blush" />
                    {formatDate(nextEvent.date)} · {formatTime(nextEvent.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-sunset" />
                    {nextEvent.venue}, {nextEvent.city}
                  </span>
                </div>

                <Countdown target={nextEvent.date} />

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/40">Billet</p>
                    <p className="font-display text-xl font-bold text-white">
                      {formatPrice(nextEvent.price)}
                    </p>
                  </div>
                  <Link
                  to={`/evenements/${nextEvent.id}`}
                  className="brand-gradient inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:brightness-110">
                  
                    Réserver <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div> :
          null}
        </div>
      </section>

      <section id="evenements" className="scroll-mt-24 px-5 py-16">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Tous les <span className="text-gradient">événements</span>
              </h2>
              <p className="mt-2 text-white/55">{published.length} dates à venir · billetterie ouverte</p>
            </div>
            <div className="relative w-full sm:w-72">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une ville, un lieu…"
                aria-label="Rechercher un événement"
                className="glass w-full rounded-full py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-blush/50" />
              
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par catégorie">
            {filters.map((item) =>
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
              filter === item.value ?
              'brand-gradient text-white shadow-glow' :
              'glass text-white/65 hover:text-white'}`
              }>
              
                {item.label}
              </button>
            )}
          </div>

          {visible.length ?
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((event, index) =>
            <EventCard key={event.id} event={event} sold={soldCount(event.id)} index={index} />
            )}
            </div> :

          <div className="glass rounded-3xl px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold text-white">Aucun événement trouvé</p>
              <p className="mt-2 text-sm text-white/55">
                Essaie une autre recherche ou reviens sur la catégorie « Tout ».
              </p>
            </div>
          }
        </div>
      </section>

      <section id="comment" className="scroll-mt-24 px-5 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Quatre étapes, <span className="text-gradient">zéro paperasse</span>
            </h2>
            <p className="mt-3 text-white/55">
              Pas de compte, pas de PDF, pas d&apos;application à installer. Juste un QR code.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) =>
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass relative rounded-3xl p-6">
              
                <span className="brand-gradient mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-glow">
                  <step.icon className="h-5 w-5 text-white" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                  Étape {index + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.text}</p>
              </motion.li>
            )}
          </ol>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 px-5 pb-24 pt-8">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Questions <span className="text-gradient">fréquentes</span>
            </h2>
            <p className="mt-3 text-white/55">
              Une autre question ? Écris-nous, on répond vite.
            </p>
          </div>
          <div className="space-y-3">
            {faq.map((item) =>
            <details key={item.q} className="glass group rounded-2xl px-5 py-4">
                <summary className="cursor-pointer list-none font-display text-base font-semibold text-white marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-xl leading-none text-white/40 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.a}</p>
              </details>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="brand-gradient relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
            <div className="relative space-y-5">
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
                {CATEGORY_LABELS.soiree}, {CATEGORY_LABELS.fete}, {CATEGORY_LABELS.voyage}.
                <br />
                Choisis ta nuit.
              </h2>
              <p className="mx-auto max-w-xl text-white/85">
                Les meilleures dates partent en quelques jours. Réserve maintenant, ton QR code t&apos;attend.
              </p>
              <a
                href="#evenements"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-night-900 transition hover:-translate-y-0.5">
                
                Réserver un billet <ArrowRightIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>);

}